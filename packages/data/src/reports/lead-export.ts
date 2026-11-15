import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { leadReportExportInputSchema, leadReportExportPreviewSchema,
  type AuthorizationContext, type LeadReportExportInput, type LeadReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { csvLine } from '../leads/csv';
import { prepareLeadReportCSVProjectionInTransaction } from './lead-export-projection';

export class ReportExportLimitError extends Error {
  constructor() { super('This report exceeds the technical CSV limit. Narrow the filters and try again.'); }
}
type Limits = LeadReportExportPreview['limits'];
export function reportExportLimits(): Limits {
  const read = (name: string, fallback: number, maximum: number) => {
    const raw = process.env[name] ?? String(fallback), value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > maximum) {
      throw new Error('Invalid report export limit configuration.');
    }
    return value;
  };
  return { rows: read('REPORT_EXPORT_ROW_LIMIT', 50000, 1000000),
    bytes: read('REPORT_EXPORT_BYTE_LIMIT', 32 * 1024 * 1024, 256 * 1024 * 1024),
    durationMs: read('REPORT_EXPORT_DURATION_MS', 30000, 120000) };
}
function validate(identity: WorkspaceIdentity, raw: LeadReportExportInput) {
  const input = leadReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareLeadReportCSVProjectionInTransaction>>;
const snapshotSlots = new WeakMap<Knex, { active: number; waiting: Set<() => void> }>();
function preview(projection: Projection, limits: Limits) {
  return leadReportExportPreviewSchema.parse({
    input: projection.input, workspaceId: projection.workspaceId, viewerId: projection.viewerId,
    policyRevision: projection.policyRevision, scope: projection.scope, archiveVisibility: projection.archiveVisibility,
    asOf: projection.asOf, today: projection.today, timezone: projection.timezone,
    dateBasis: projection.dateBasis, coverage: projection.coverage, count: projection.count, columns: projection.columns, limits,
  });
}

/** Acquire current authority before the repeatable-read generation snapshot starts. */
export async function withReportExportSnapshot<T>(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  signal: AbortSignal, run: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>) {
  // Reserve two connections per snapshot and leave one for durable audits. Do not
  // let concurrent exports fill the pool with locks waiting for snapshot connections.
  const capacity = Math.floor((db.client.pool.max - 1) / 2);
  if (capacity < 1) throw new Error('Report exports require a database pool with at least three connections.');
  let slots = snapshotSlots.get(db);
  if (!slots) { slots = { active: 0, waiting: new Set() }; snapshotSlots.set(db, slots); }
  const state = slots;
  try {
    while (state.active >= capacity) {
      signal.throwIfAborted();
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => { state.waiting.delete(wake); signal.removeEventListener('abort', abort); };
        const wake = () => { cleanup(); resolve(); };
        const abort = () => { cleanup(); reject(signal.reason); };
        state.waiting.add(wake); signal.addEventListener('abort', abort, { once: true });
      });
    }
    signal.throwIfAborted();
  } catch (error) {
    if (state.active < capacity) state.waiting.values().next().value?.();
    throw error;
  }
  state.active++;
  try {
    return await db.transaction(async lock => {
      signal.throwIfAborted();
      await lock.raw("SET LOCAL lock_timeout = '5s'");
      await lock.raw("SET LOCAL statement_timeout = '10s'");
      return withWorkspaceAuthorization(lock, identity, enabled, false, async () => {
        signal.throwIfAborted();
        return db.transaction(async generation => {
          await generation.raw('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
          await generation.raw("SET LOCAL lock_timeout = '5s'");
          await generation.raw("SET LOCAL statement_timeout = '10s'");
          return withWorkspaceAuthorization(generation, identity, enabled, false, async (trx, context) => {
            signal.throwIfAborted();
            const result = await run(trx, context);
            signal.throwIfAborted();
            return result;
          });
        });
      });
    });
  } finally { state.active--; state.waiting.values().next().value?.(); }
}
export async function previewLeadReportExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  raw: LeadReportExportInput): Promise<LeadReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context) =>
    preview(await prepareLeadReportCSVProjectionInTransaction(trx, context, input), limits));
}
function auditSelection(input: LeadReportExportInput) {
  const { filters, ...query } = input.query;
  const fingerprint = (value: string) => createHash('sha256').update(value).digest('hex');
  const selection = { ...query, filters: { ...filters, owners: filters.owners.map(fingerprint) } };
  if ('currentFilters' in selection) {
    selection.currentFilters = { ...selection.currentFilters, owners: selection.currentFilters.owners.map(fingerprint) };
  }
  return selection;
}
export async function writeReportExportAudit<T>(db: Knex, write: (trx: Knex.Transaction) => PromiseLike<T>) {
  return db.transaction(async trx => {
    await trx.raw("SET LOCAL lock_timeout = '5s'");
    await trx.raw("SET LOCAL statement_timeout = '10s'");
    return write(trx);
  });
}

/** Consumers must drain or cancel the stream; success is withheld until generation and audit finalize. */
export async function createLeadReportCSVExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  raw: LeadReportExportInput, requestSignal?: AbortSignal) {
  const input = validate(identity, raw), limits = reportExportLimits(), id = randomUUID();
  const cancelled = new AbortController();
  const signal = AbortSignal.any([cancelled.signal, AbortSignal.timeout(limits.durationMs),
    ...(requestSignal ? [requestSignal] : [])]);
  signal.throwIfAborted();
  const initial = await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context) =>
    preview(await prepareLeadReportCSVProjectionInTransaction(trx, context, input), limits));
  signal.throwIfAborted();
  await writeReportExportAudit(db, trx => trx('reportExportAudit').insert({
    id, workspaceId: identity.workspaceId, actorId: identity.userId, report: 'leads', dataset: input.dataset,
    scope: initial.scope, selection: JSON.stringify(auditSelection(input)), policyRevision: initial.policyRevision,
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
  let resolveReady!: (metadata: LeadReportExportPreview) => void, rejectReady!: (error: unknown) => void;
  const ready = new Promise<LeadReportExportPreview>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  let rowsSent = 0, bytesSent = 0, checked = initial;
  const onAbort = () => {
    const error = new Error('Report CSV export could not be completed.');
    rejectDemand?.(error); streamController.error(error);
  };
  signal.addEventListener('abort', onAbort, { once: true });
  const write = async (text: string) => {
    signal.throwIfAborted();
    const bytes = new TextEncoder().encode(text);
    if (bytesSent + bytes.byteLength > limits.bytes) throw new ReportExportLimitError();
    if (!demand) await new Promise<void>((resolve, reject) => { resolveDemand = resolve; rejectDemand = reject; });
    resolveDemand = undefined; rejectDemand = undefined;
    signal.throwIfAborted();
    demand = false; streamController.enqueue(bytes);
    bytesSent += bytes.byteLength;
  };
  const completion = (async () => {
    try {
      await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context) => {
        signal.throwIfAborted();
        const projection = await prepareLeadReportCSVProjectionInTransaction(trx, context, input);
        checked = preview(projection, limits);
        if (checked.count > limits.rows) throw new ReportExportLimitError();
        resolveReady(checked);
        await write('\uFEFF' + csvLine(projection.columns));
        for await (const row of projection.rows(signal)) { await write(csvLine(row)); rowsSent++; }
      });
      signal.throwIfAborted();
      const updated = await writeReportExportAudit(db, async trx => {
        const count = await trx('reportExportAudit').where({ id, outcome: 'started' }).update({
          scope: checked.scope, policyRevision: checked.policyRevision, count: checked.count, snapshotAt: checked.asOf,
          rowsSent, bytesSent, outcome: 'completed', finishedAt: new Date(),
        });
        signal.throwIfAborted();
        return count;
      });
      if (updated !== 1) throw new Error('Report CSV audit could not be finalized.');
      signal.throwIfAborted();
      streamController.close();
      return { outcome: 'completed' as const, rowsSent, bytesSent };
    } catch (error) {
      const outcome = error instanceof ReportExportLimitError ? 'rejected' as const : 'failed' as const;
      try {
        const updated = await writeReportExportAudit(db, trx => trx('reportExportAudit').where({ id, outcome: 'started' }).update({
          scope: checked.scope, policyRevision: checked.policyRevision, count: checked.count, snapshotAt: checked.asOf,
          rowsSent, bytesSent, outcome, finishedAt: new Date(),
        }));
        if (updated !== 1) console.error('Report CSV failure audit could not be finalized.');
      } catch { console.error('Report CSV failure audit could not be stored; started evidence is retained.'); }
      rejectReady(error);
      streamController.error(new Error('Report CSV export could not be completed.'));
      return { outcome, rowsSent, bytesSent };
    } finally { signal.removeEventListener('abort', onAbort); }
  })();
  const metadata = await ready;
  return { ...metadata, id, stream, completion };
}
