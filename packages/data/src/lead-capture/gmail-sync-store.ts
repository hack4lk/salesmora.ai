import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureConfigurationSchema, type CaptureConfiguration } from '@salesmora/contracts';
import { workspaceEntitlements } from '../billing/entitlements';
import { captureDraftFingerprint } from './store';
import { gmailClock } from './gmail-connections';
import { GmailSyncError, type GmailHistoryPage, type GmailRecoveryPage } from './gmail-sync-provider';
export type GmailWorkerScope = { workspaceId: string; sourceIds: readonly string[] };
export type GmailMailboxLease = { id: string; workspaceId: string; accountId: string; leaseId: string; generation: number; historyId: string; pageToken?: string; scanPages: number; recoveryStartedAt: Date | null; recoveryUntil: Date | null; recoveryHistoryId: string | null };
async function lock(trx: Knex.Transaction, workspaceId: string) {
  return !!await trx('workspaces').where({ id: workspaceId }).whereNull('suspendedAt').whereNull('deletionRequestedAt').forUpdate().first('id');
}
type ActiveWindow = { id: string; sourceId: string; accountId: string; configurationVersion: number; startHistoryId: string; startedAt: Date; credentialGeneration: number; configuration: CaptureConfiguration };
async function windows(trx: Knex.Transaction, scope: GmailWorkerScope, accountId?: string) {
  const rows = await trx('captureGmailEligibilityWindows as w').join('captureSources as s', function () { this.on('w.sourceId', 's.id').andOn('w.workspaceId', 's.workspaceId').andOn('w.configurationVersion', 's.approvedVersion'); }).join('captureSourceVersions as v', function () { this.on('w.sourceId', 'v.sourceId').andOn('w.workspaceId', 'v.workspaceId').andOn('w.configurationVersion', 'v.configurationVersion'); }).join('captureGmailAccounts as a', function () { this.on('w.accountId', 'a.id').andOn('w.workspaceId', 'a.workspaceId'); }).where('w.workspaceId', scope.workspaceId).whereIn('w.sourceId', [...scope.sourceIds]).whereNull('w.endedAt').where({ 's.status': 'active', 's.block': 'none', 'a.status': 'connected' }).modify(q => { if (accountId) q.where('w.accountId', accountId); }).select<ActiveWindow[]>('w.*', 'a.credentialGeneration', 'v.configuration');
  return rows.filter(row => row.configuration.type === 'gmail' && row.configuration.connectionId === row.accountId);
}
/** Publication integration must call this INSIDE its authorized source-activation transaction,
 * after obtaining a fresh provider baseline OUTSIDE any DB transaction. Not an activation endpoint. */
export async function openGmailEligibilityWindow(trx: Knex.Transaction, scope: GmailWorkerScope, sourceId: string, baseline: { accountId: string; generation: number; historyId: string }) {
  if (!scope.sourceIds.includes(sourceId) || !/^[0-9]{1,30}$/.test(baseline.historyId) || !await lock(trx, scope.workspaceId)) throw new GmailSyncError('unavailable');
  const source = await trx('captureSources').where({ workspaceId: scope.workspaceId, id: sourceId, type: 'gmail', status: 'active', block: 'none' }).first();
  const account = await trx('captureGmailAccounts').where({ workspaceId: scope.workspaceId, id: baseline.accountId, status: 'connected', credentialGeneration: baseline.generation }).first('id');
  const version = source ? await trx('captureSourceVersions').where({ workspaceId: scope.workspaceId, sourceId, configurationVersion: source.approvedVersion }).first('configuration') : null;
  const parsed = captureConfigurationSchema.safeParse(version?.configuration);
  if (!source || !account || !parsed.success || parsed.data.type !== 'gmail' || parsed.data.connectionId !== baseline.accountId || (await workspaceEntitlements(trx, scope.workspaceId)).plan.id === 'free') throw new GmailSyncError('unavailable');
  const now = await gmailClock(trx), id = randomUUID();
  await trx('captureGmailEligibilityWindows').where({ workspaceId: scope.workspaceId, sourceId }).whereNull('endedAt').update({ endedAt: now });
  await trx('captureGmailEligibilityWindows').insert({ id, workspaceId: scope.workspaceId, accountId: baseline.accountId, sourceId, configurationVersion: source.approvedVersion, startHistoryId: baseline.historyId, startedAt: now });
  const prior = await trx('captureGmailMailboxState').where({ workspaceId: scope.workspaceId, accountId: baseline.accountId }).first();
  const sibling = await trx('captureGmailEligibilityWindows').where({ workspaceId: scope.workspaceId, accountId: baseline.accountId }).whereNot('sourceId', sourceId).whereNull('endedAt').first('id');
  const historyId = sibling && prior?.historyId && BigInt(prior.historyId) < BigInt(baseline.historyId) ? prior.historyId : baseline.historyId;
  // A new source must not discard another open window's recovery or pagination.
  if (sibling && prior) return id;
  const values = { credentialGeneration: baseline.generation, historyId, nextSyncAt: now, pageToken: null, scanPages: 0, recoveryStartedAt: null, recoveryUntil: null, recoveryHistoryId: null, failure: null, leaseId: null, leaseUntil: null };
  if (prior) await trx('captureGmailMailboxState').where({ id: prior.id }).update({ ...values, version: prior.version + 1 });
  else await trx('captureGmailMailboxState').insert({ id: randomUUID(), workspaceId: scope.workspaceId, accountId: baseline.accountId, ...values });
  return id;
}
export async function claimGmailMailbox(db: Knex, scope: GmailWorkerScope): Promise<GmailMailboxLease | null> {
  return db.transaction(async trx => {
    if (!scope.sourceIds.length || !await lock(trx, scope.workspaceId) || (await workspaceEntitlements(trx, scope.workspaceId)).plan.id === 'free') return null;
    const eligible = await windows(trx, scope); if (!eligible.length) return null;
    const accountIds: string[] = [];
    for (const accountId of new Set(eligible.map(window => window.accountId))) if (await completeAccountScope(trx, scope, accountId)) accountIds.push(accountId);
    if (!accountIds.length) return null;
    const now = await gmailClock(trx);
    const row = await trx('captureGmailMailboxState').where({ workspaceId: scope.workspaceId }).whereIn('accountId', accountIds).where('nextSyncAt', '<=', now).where(q => q.whereNull('failure').orWhereNot('failure', 'recovery-required')).where(q => q.whereNull('leaseUntil').orWhere('leaseUntil', '<=', now)).orderBy('nextSyncAt').orderBy('id').forUpdate().skipLocked().first();
    if (!row?.historyId || !await completeAccountScope(trx, scope, row.accountId)) return null;
    const generation = eligible.find(w => w.accountId === row.accountId)!.credentialGeneration, leaseId = randomUUID();
    await trx('captureGmailMailboxState').where({ id: row.id }).update({ leaseId, leaseUntil: new Date(now.getTime() + 60000), credentialGeneration: generation });
    return { id: row.id, workspaceId: scope.workspaceId, accountId: row.accountId, leaseId, generation, historyId: row.historyId, pageToken: row.pageToken ?? undefined, scanPages: row.scanPages, recoveryStartedAt: row.recoveryStartedAt, recoveryUntil: row.recoveryUntil, recoveryHistoryId: row.recoveryHistoryId };
  });
}
async function completeAccountScope(trx: Knex.Transaction, scope: GmailWorkerScope, accountId: string) {
  // One mailbox cursor fans out to every active source on that mailbox. A narrower worker must
  // never advance the shared cursor and silently strand another source's eligible messages.
  return !await trx('captureGmailEligibilityWindows').where({ workspaceId: scope.workspaceId, accountId }).whereNull('endedAt').whereNotIn('sourceId', [...scope.sourceIds]).first('id');
}
async function currentLease(trx: Knex.Transaction, scope: GmailWorkerScope, lease: GmailMailboxLease) {
  if (lease.workspaceId !== scope.workspaceId || !await lock(trx, scope.workspaceId)) return null;
  const row = await trx('captureGmailMailboxState').where({ workspaceId: scope.workspaceId, id: lease.id, accountId: lease.accountId, leaseId: lease.leaseId, credentialGeneration: lease.generation }).where('leaseUntil', '>', await gmailClock(trx)).first();
  const account = await trx('captureGmailAccounts').where({ workspaceId: scope.workspaceId, id: lease.accountId, status: 'connected', credentialGeneration: lease.generation }).first('id');
  return row && account && await completeAccountScope(trx, scope, lease.accountId) && (await workspaceEntitlements(trx, scope.workspaceId)).plan.id !== 'free' ? row : null;
}
/** Queue each page and its continuation atomically. Never advance the history cursor across unqueued work. */
export async function commitGmailHistoryPage(db: Knex, scope: GmailWorkerScope, lease: GmailMailboxLease, page: GmailHistoryPage | GmailRecoveryPage) {
  return db.transaction(async trx => {
    const row = await currentLease(trx, scope, lease); if (!row) return false;
    const active = await windows(trx, scope, lease.accountId), recovery = !!row.recoveryHistoryId;
    const messages = recovery ? (page as GmailRecoveryPage).messages?.map(message => ({ id: message.id, historyId: null })) ?? [] : (page as GmailHistoryPage).history?.flatMap(record => (record.messagesAdded ?? []).filter(added => !added.message.labelIds?.some(label => ['SENT', 'DRAFT', 'SPAM', 'TRASH'].includes(label))).map(added => ({ id: added.message.id, historyId: record.id }))) ?? [];
    // Bound the retained queue independently of subscription lead capacity. Pending intake must survive a full CRM.
    const queued = Number((await trx('captureGmailMessageJobs').where({ workspaceId: scope.workspaceId }).whereIn('state', ['pending', 'processing', 'retry']).count('* as n').first())?.n ?? 0);
    if (queued + messages.length * active.length > 10000 || row.scanPages >= 99 && page.nextPageToken) {
      await trx('captureGmailMailboxState').where({ id: row.id }).update({ leaseId: null, leaseUntil: null, failure: 'recovery-required' }); return false;
    }
    for (const window of active) for (const message of messages) {
      if (message.historyId && BigInt(message.historyId) <= BigInt(window.startHistoryId)) continue;
      await trx('captureGmailMessageJobs').insert({ id: randomUUID(), workspaceId: scope.workspaceId, accountId: lease.accountId, sourceId: window.sourceId, windowId: window.id, configurationVersion: window.configurationVersion, messageId: message.id, observedHistoryId: message.historyId }).onConflict(['workspaceId', 'sourceId', 'accountId', 'messageId']).ignore();
    }
    const now = await gmailClock(trx);
    await trx('captureGmailMailboxState').where({ id: row.id }).update({ leaseId: null, leaseUntil: null, version: row.version + 1, attempts: 0, failure: null, nextSyncAt: new Date(now.getTime() + (page.nextPageToken ? 0 : 30000)), pageToken: page.nextPageToken ?? null, scanPages: page.nextPageToken ? row.scanPages + 1 : 0,
      ...(!page.nextPageToken ? { historyId: recovery ? row.recoveryHistoryId : (page as GmailHistoryPage).historyId, lastSuccessAt: now, recoveryStartedAt: null, recoveryUntil: null, recoveryHistoryId: null } : {}) });
    return true;
  });
}
export async function failGmailMailbox(db: Knex, scope: GmailWorkerScope, lease: GmailMailboxLease, kind: GmailSyncError['kind']) {
  return db.transaction(async trx => { const row = await currentLease(trx, scope, lease); if (!row) return;
    await trx('captureGmailMailboxState').where({ id: row.id }).update({ leaseId: null, leaseUntil: null, failure: kind === 'unavailable' ? 'provider' : kind, attempts: row.attempts + 1, nextSyncAt: new Date((await gmailClock(trx)).getTime() + Math.min(900000, 30000 * 2 ** Math.min(row.attempts, 5))) });
  });
}
/** A fresh profile is captured before this call. Rescan is bounded, then history continues from that
 * profile, so mail arriving DURING the rescan cannot be skipped. Overflow requires operator recovery. */
export async function beginGmailRecovery(db: Knex, scope: GmailWorkerScope, lease: GmailMailboxLease, baseline: string) {
  if (!/^[0-9]{1,30}$/.test(baseline)) throw new GmailSyncError('provider');
  return db.transaction(async trx => { const row = await currentLease(trx, scope, lease); if (!row) return false;
    if (BigInt(baseline) < BigInt(row.historyId)) throw new GmailSyncError('provider');
    const active = await windows(trx, scope, lease.accountId), until = await gmailClock(trx);
    const earliest = active.reduce((date, window) => window.startedAt < date ? window.startedAt : date, until);
    const tooOld = earliest >= until || until.getTime() - earliest.getTime() > 7 * 86400000;
    await trx('captureGmailMailboxState').where({ id: row.id }).update({ leaseId: null, leaseUntil: null, pageToken: null, scanPages: 0, failure: tooOld ? 'recovery-required' : 'cursor-expired', nextSyncAt: until, ...(!tooOld ? { recoveryStartedAt: earliest, recoveryUntil: until, recoveryHistoryId: baseline } : {}) });
    return !tooOld;
  });
}
export type GmailMessageLease = { id: string; workspaceId: string; accountId: string; sourceId: string; windowId: string; configurationVersion: number; generation: number; messageId: string; leaseId: string; startedAt: Date; configuration: CaptureConfiguration };
export async function claimGmailMessage(db: Knex, scope: GmailWorkerScope): Promise<GmailMessageLease | null> {
  return db.transaction(async trx => {
    if (!await lock(trx, scope.workspaceId) || (await workspaceEntitlements(trx, scope.workspaceId)).plan.id === 'free') return null;
    const active = await windows(trx, scope), now = await gmailClock(trx); if (!active.length) return null;
    const row = await trx('captureGmailMessageJobs').where({ workspaceId: scope.workspaceId }).whereIn('windowId', active.map(w => w.id)).where(q => q.whereIn('state', ['pending', 'retry']).where('retryAt', '<=', now).orWhere(s => s.where('state', 'processing').where('leaseUntil', '<=', now))).orderBy('retryAt').orderBy('id').forUpdate().skipLocked().first();
    if (!row) return null;
    const window = active.find(w => w.id === row.windowId)!, leaseId = randomUUID();
    await trx('captureGmailMessageJobs').where({ id: row.id }).update({ state: 'processing', leaseId, leaseUntil: new Date(now.getTime() + 180000), attempts: row.attempts + 1 });
    return { id: row.id, workspaceId: scope.workspaceId, accountId: row.accountId, sourceId: row.sourceId, windowId: row.windowId, configurationVersion: row.configurationVersion, messageId: row.messageId, leaseId, generation: window.credentialGeneration, startedAt: window.startedAt, configuration: captureConfigurationSchema.parse(window.configuration) };
  });
}
/** All provider/model work occurs outside this transaction. The immutable version and lease are
 * checked again here, so a pause, revision, disconnect or downgrade wins over in-flight work. */
export async function withGmailMessageLease<T>(db: Knex, scope: GmailWorkerScope, lease: GmailMessageLease, use: (trx: Knex.Transaction, row: Record<string, unknown>) => Promise<T>) {
  return db.transaction(async trx => {
    if (scope.workspaceId !== lease.workspaceId || !scope.sourceIds.includes(lease.sourceId) || !await lock(trx, scope.workspaceId) || (await workspaceEntitlements(trx, scope.workspaceId)).plan.id === 'free') return null;
    const active = (await windows(trx, scope, lease.accountId)).find(w => w.id === lease.windowId && w.configurationVersion === lease.configurationVersion && w.credentialGeneration === lease.generation);
    const row = await trx('captureGmailMessageJobs').where({ id: lease.id, workspaceId: scope.workspaceId, accountId: lease.accountId, sourceId: lease.sourceId, windowId: lease.windowId, configurationVersion: lease.configurationVersion, messageId: lease.messageId, leaseId: lease.leaseId, state: 'processing' }).where('leaseUntil', '>', await gmailClock(trx)).first();
    if (!active || !row || captureDraftFingerprint(active.configuration) !== captureDraftFingerprint(lease.configuration)) return null;
    return use(trx, row);
  });
}
export async function finishGmailMessage(db: Knex, scope: GmailWorkerScope, lease: GmailMessageLease, outcome: { state: 'ignored' | 'failed' | 'retry'; failure: 'authorization' | 'rate-limit' | 'provider' | 'content' | 'extraction' | 'unavailable' | null; deferUntilBudgetReset?: boolean }) {
  return withGmailMessageLease(db, scope, lease, async (trx, row) => {
    const now = await gmailClock(trx);
    const retryAt = outcome.deferUntilBudgetReset
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
      : new Date(now.getTime() + Math.min(900000, 30000 * 2 ** Math.min(Number(row.attempts), 5)));
    await trx('captureGmailMessageJobs').where({ id: lease.id }).update({ state: outcome.state === 'retry' && outcome.failure !== 'unavailable' && Number(row.attempts) >= 8 ? 'failed' : outcome.state, failure: outcome.failure, leaseId: null, leaseUntil: null, retryAt });
    return true;
  });
}
