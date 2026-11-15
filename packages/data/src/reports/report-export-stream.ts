import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { AuthorizationContext, PermissionId } from '@salesmora/contracts';
import type { WorkspaceIdentity } from '../authorization/store';
import { csvLine } from '../leads/csv';
import { ReportExportLimitError, reportExportLimits, withReportExportSnapshot, writeReportExportAudit } from './lead-export';

type Preview = {
  count: number; policyRevision: number; asOf: string; columns: string[];
};
type AuditScopes = { scope: 'workspace' | 'assigned' | 'own'; outputScopes: string };

/** Success is withheld until snapshot generation and durable audit finalization both complete. */
export async function createReportCSVStream<P extends Preview, G>(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  options: {
    report: 'sources' | 'calendar' | 'jobs' | 'team' | 'estimates' | 'activity' | 'financial' | 'overview';
    label: string; dataset: string; selection: string;
    prepare: (trx: Knex.Transaction, context: AuthorizationContext, limits: ReturnType<typeof reportExportLimits>) =>
      Promise<{ preview: P; rows: (signal?: AbortSignal) => AsyncGenerator<readonly (string | number | null)[]> }>;
    auditScopes: (preview: P) => AuditScopes;
    generation: (preview: P, id: string) => G;
  },
  requestSignal?: AbortSignal,
) {
  const limits = reportExportLimits(), id = randomUUID(), cancelled = new AbortController();
  const signal = AbortSignal.any([cancelled.signal, AbortSignal.timeout(limits.durationMs),
    ...(requestSignal ? [requestSignal] : [])]);
  signal.throwIfAborted();
  const initial = await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context) =>
    (await options.prepare(trx, context, limits)).preview);
  signal.throwIfAborted();
  await writeReportExportAudit(db, trx => trx('reportExportAudit').insert({
    id, workspaceId: identity.workspaceId, actorId: identity.userId, report: options.report, dataset: options.dataset,
    ...options.auditScopes(initial), selection: options.selection, policyRevision: initial.policyRevision,
    count: initial.count, limits: JSON.stringify(limits), snapshotAt: initial.asOf,
    outcome: initial.count > limits.rows ? 'rejected' : 'started',
    finishedAt: initial.count > limits.rows ? new Date() : null,
  }));
  if (initial.count > limits.rows) throw new ReportExportLimitError();

  let streamController!: ReadableStreamDefaultController<Uint8Array>;
  let demand = false, resolveDemand: (() => void) | undefined, rejectDemand: ((error: Error) => void) | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { streamController = controller; },
    pull() { demand = true; resolveDemand?.(); },
    cancel() { cancelled.abort(); },
  }, { highWaterMark: 0 });
  let resolveReady!: (value: { preview: P; generation: G }) => void, rejectReady!: (error: unknown) => void;
  const ready = new Promise<{ preview: P; generation: G }>((resolve, reject) => {
    resolveReady = resolve; rejectReady = reject;
  });
  let rowsSent = 0, bytesSent = 0, checked = initial;
  const failureMessage = `${options.label} CSV export could not be completed.`;
  const onAbort = () => {
    const error = new Error(failureMessage);
    rejectDemand?.(error);
    streamController.error(error);
  };
  signal.addEventListener('abort', onAbort, { once: true });
  const encoder = new TextEncoder();
  const write = async (text: string) => {
    signal.throwIfAborted();
    const bytes = encoder.encode(text);
    if (bytesSent + bytes.byteLength > limits.bytes) throw new ReportExportLimitError();
    if (!demand) await new Promise<void>((resolve, reject) => { resolveDemand = resolve; rejectDemand = reject; });
    resolveDemand = undefined; rejectDemand = undefined;
    signal.throwIfAborted();
    demand = false;
    streamController.enqueue(bytes);
    bytesSent += bytes.byteLength;
  };
  const completion = (async () => {
    try {
      await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context) => {
        signal.throwIfAborted();
        const projection = await options.prepare(trx, context, limits);
        checked = projection.preview;
        if (checked.count > limits.rows) throw new ReportExportLimitError();
        resolveReady({ preview: checked, generation: options.generation(checked, id) });
        await write('\uFEFF' + csvLine(checked.columns));
        for await (const row of projection.rows(signal)) {
          if (rowsSent >= checked.count || row.length !== checked.columns.length) {
            throw new Error(`${options.label} CSV rows do not match the reviewed projection.`);
          }
          await write(csvLine(row));
          rowsSent++;
        }
        if (rowsSent !== checked.count) throw new Error(`${options.label} CSV row count is incomplete.`);
      });
      signal.throwIfAborted();
      const updated = await writeReportExportAudit(db, async trx => {
        const count = await trx('reportExportAudit').where({ id, outcome: 'started' }).update({
          ...options.auditScopes(checked), policyRevision: checked.policyRevision, count: checked.count,
          snapshotAt: checked.asOf, rowsSent, bytesSent, outcome: 'completed', finishedAt: new Date(),
        });
        signal.throwIfAborted();
        return count;
      });
      if (updated !== 1) throw new Error(`${options.label} CSV audit could not be finalized.`);
      signal.throwIfAborted();
      streamController.close();
      return { outcome: 'completed' as const, rowsSent, bytesSent };
    } catch (error) {
      const outcome = error instanceof ReportExportLimitError ? 'rejected' as const : 'failed' as const;
      try {
        const updated = await writeReportExportAudit(db, trx => trx('reportExportAudit').where({ id, outcome: 'started' }).update({
          ...options.auditScopes(checked), policyRevision: checked.policyRevision, count: checked.count,
          snapshotAt: checked.asOf, rowsSent, bytesSent, outcome, finishedAt: new Date(),
        }));
        if (updated !== 1) console.error(`${options.label} CSV failure audit could not be finalized.`);
      } catch {
        console.error(`${options.label} CSV failure audit could not be stored; started evidence is retained.`);
      }
      rejectReady(error);
      streamController.error(new Error(failureMessage));
      return { outcome, rowsSent, bytesSent };
    } finally { signal.removeEventListener('abort', onAbort); }
  })();
  const metadata = await ready;
  return { ...metadata.preview, generation: metadata.generation, id, stream, completion };
}
