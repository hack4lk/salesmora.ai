import { aiBudgetError, captureIdSchema } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';
import { claimGmailMailbox, commitGmailHistoryPage, failGmailMailbox, beginGmailRecovery, claimGmailMessage, finishGmailMessage, type GmailWorkerScope, type GmailMessageLease } from '@salesmora/data/lead-capture/gmail-sync-store';
import { GmailSyncError, type GmailSyncProvider } from '@salesmora/data/lead-capture/gmail-sync-provider';
import { gmailMessageExample, CaptureGmailMessageError } from '@salesmora/data/lead-capture/gmail-message';
import { commitGmailIntake, gmailRuleMatches, type GmailExtraction } from '@salesmora/data/lead-capture/gmail-ingestion';
import type { CaptureGmailMessagesProvider } from '@salesmora/data/lead-capture/gmail-messages-provider';
export type GmailCaptureDependencies = {
  beforeTick?(): Promise<void>;
  beforeScope?(scope: GmailWorkerScope): Promise<void>;
  grant(workspaceId: string, accountId: string): Promise<string>;
  sync: GmailSyncProvider;
  messages(): CaptureGmailMessagesProvider;
  /** Host must supply the approved tracked/budgeted extraction adapter. No fallback model client. */
  extract(lease: GmailMessageLease, example: ReturnType<typeof gmailMessageExample>): Promise<GmailExtraction>;
};
function failure(error: unknown): GmailSyncError['kind'] { return error instanceof GmailSyncError ? error.kind : 'provider'; }
/** One bounded page per tick. A committed page is the only authority to advance the cursor. */
export async function pollGmailCapture(db: Knex, scope: GmailWorkerScope, dependencies: GmailCaptureDependencies) {
  const lease = await claimGmailMailbox(db, scope); if (!lease) return false;
  try {
    const token = await dependencies.grant(scope.workspaceId, lease.accountId);
    if (lease.recoveryStartedAt && lease.recoveryUntil) {
      const page = await dependencies.sync.recovery(token, lease.recoveryStartedAt, lease.recoveryUntil, lease.pageToken);
      return await commitGmailHistoryPage(db, scope, lease, page);
    }
    try {
      const page = await dependencies.sync.history(token, lease.historyId, lease.pageToken);
      return await commitGmailHistoryPage(db, scope, lease, page);
    } catch (error) {
      if (!(error instanceof GmailSyncError) || error.kind !== 'cursor-expired') throw error;
      const baseline = await dependencies.sync.profile(token);
      return await beginGmailRecovery(db, scope, lease, baseline.historyId);
    }
  } catch (error) { await failGmailMailbox(db, scope, lease, failure(error)); return false; }
}
/** No source can create leads here: every match creates a supervised intake proposal only. */
export async function processGmailCapture(db: Knex, scope: GmailWorkerScope, dependencies: GmailCaptureDependencies) {
  const lease = await claimGmailMessage(db, scope); if (!lease) return false;
  let phase: 'provider' | 'content' | 'extraction' = 'provider';
  try {
    const token = await dependencies.grant(scope.workspaceId, lease.accountId), raw = await dependencies.messages().message(token, lease.messageId);
    phase = 'content';
    const labels = raw && typeof raw === 'object' && 'labelIds' in raw ? raw.labelIds : null;
    if (!Array.isArray(labels) || labels.some(label => typeof label !== 'string')) throw new CaptureGmailMessageError();
    const example = gmailMessageExample(raw);
    if (example.id !== lease.messageId) throw new CaptureGmailMessageError();
    if (labels.some(label => ['SENT', 'DRAFT', 'SPAM', 'TRASH'].includes(label)) || new Date(example.receivedAt) < lease.startedAt || lease.configuration.type !== 'gmail' || !gmailRuleMatches(lease.configuration.rules, example)) {
      await finishGmailMessage(db, scope, lease, { state: 'ignored', failure: null }); return true;
    }
    phase = 'extraction';
    const extraction = await dependencies.extract(lease, example);
    return await commitGmailIntake(db, scope, lease, raw, extraction) !== null;
  } catch (error) {
    if (aiBudgetError(error)) {
      await finishGmailMessage(db, scope, lease, { state: 'retry', failure: 'unavailable', deferUntilBudgetReset: true });
      return false;
    }
    await finishGmailMessage(db, scope, lease, { state: error instanceof CaptureGmailMessageError ? 'failed' : 'retry', failure: error instanceof GmailSyncError ? error.kind === 'cursor-expired' || error.kind === 'recovery-required' ? 'provider' : error.kind : phase });
    return false;
  }
}
/** Dedicated loop selected only by the Gmail worker task. */
export function startGmailCapture(db: Knex, scopes: readonly GmailWorkerScope[], dependencies: GmailCaptureDependencies) {
  if (!scopes.length || scopes.length > 100 || new Set(scopes.map(scope => scope.workspaceId)).size !== scopes.length || scopes.some(scope => !captureIdSchema.safeParse(scope.workspaceId).success || !scope.sourceIds.length || scope.sourceIds.length > 1000 || new Set(scope.sourceIds).size !== scope.sourceIds.length || scope.sourceIds.some(id => !captureIdSchema.safeParse(id).success))) throw Error('Explicit Gmail workspace/source scope required.');
  let stopped = false, running: Promise<void> | undefined;
  const tick = () => {
    if (stopped || running) return;
    running = (async () => {
      await dependencies.beforeTick?.();
      for (const scope of scopes) {
        if (stopped) break;
        try { await dependencies.beforeScope?.(scope); }
        catch { console.error(JSON.stringify({ event: 'worker.gmail_activation_retry' })); }
        if (!stopped) await pollGmailCapture(db, scope, dependencies);
        if (!stopped) await processGmailCapture(db, scope, dependencies);
      }
    })().catch(() => {
      console.error(JSON.stringify({ event: 'worker.gmail_capture_error' }));
    }).finally(() => { running = undefined; });
  };
  const timer = setInterval(tick, 5000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
