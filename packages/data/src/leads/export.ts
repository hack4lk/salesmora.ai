import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { PassThrough, Readable } from 'node:stream';
import type { Knex } from 'knex';
import { leadExportSchema, leadExportQuery, type AuthorizationContext, type LeadExportInput, type LeadExportPreview, type PermissionId } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { scopedLeadQuery, filteredLeadQuery, workspaceTimezone } from './query';
import { resolveExportScope } from './export-access';
import { csvLine, leadCSVHeaders } from './csv';

export class LeadExportLimitError extends Error {}
export class LeadExportEmptyError extends Error {}
export function leadExportRowLimit() {
  const raw = process.env.LEAD_EXPORT_ROW_LIMIT ?? '50000';
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > 1_000_000) throw new Error('Invalid export row limit configuration.');
  return Number(raw);
}
async function withExportAuthorization<T>(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], use: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>) {
  return db.transaction(async trx => {
    // Set deadlines before the authorization lock, including time waiting for a writer.
    await trx.raw("SET LOCAL lock_timeout = '5s'");
    await trx.raw("SET LOCAL statement_timeout = '10s'");
    return withWorkspaceAuthorization(trx, identity, enabled, false, use);
  });
}
function validate(identity: WorkspaceIdentity, raw: LeadExportInput) {
  const input = leadExportSchema.parse(raw);
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return input;
}
async function exportQuery(trx: Knex.Transaction, context: AuthorizationContext, identity: WorkspaceIdentity, input: LeadExportInput) {
  const scope = resolveExportScope(context);
  if (!scope) throw new AuthorizationAccessError();
  const parsed = leadExportQuery(input);
  if (parsed.archived && !authorize(context, { permission: 'leads.archive', resource: { kind: 'lead', id: identity.workspaceId, workspaceId: identity.workspaceId, ownerId: null } }).allowed) throw new AuthorizationAccessError();
  if (scope === 'assigned' && parsed.ownerIds.some(id => !['me', identity.userId].includes(id))) throw new AuthorizationAccessError();
  const { query } = scopedLeadQuery(trx, context);
  if (scope === 'assigned') query.andWhere('l.ownerId', identity.userId);
  return { query: filteredLeadQuery(query, parsed, identity, await workspaceTimezone(trx, identity.workspaceId)), scope };
}
function filterAudit(input: LeadExportInput) {
  const { query, ownerIds, ...filters } = input.filters;
  // Search can contain customer/contact text. Retain a fingerprint, never that text.
  return { ...filters, ownerCount: ownerIds.length, ownerHashes: ownerIds.map(id => createHash('sha256').update(id).digest('hex')), ...(query ? { searchHash: createHash('sha256').update(query).digest('hex') } : {}) };
}
export async function previewLeadExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadExportInput): Promise<LeadExportPreview> {
  const input = validate(identity, raw);
  return withExportAuthorization(db, identity, enabled, async (trx, context) => {
    return previewLeadExportInTransaction(trx, context, input);
  });
}

/** Reuses the manual query and permission intersection inside an already authorized transaction. */
export async function previewLeadExportInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: LeadExportInput): Promise<LeadExportPreview> {
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  const input = validate(identity, raw);
  const { query, scope } = await exportQuery(trx, context, identity, input);
  const result = await query.count('* as count').first();
  return { count: Number(result?.count ?? 0), scope, rowLimit: leadExportRowLimit() };
}
/** Optional app-owned gate runs under the same current authority and cursor transaction. */
export interface LeadExportGate {
  beforeRead: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<void>;
  onSnapshot: (trx: Knex.Transaction, context: AuthorizationContext, preview: LeadExportPreview) => Promise<void>;
}

/** Bounded-memory CSV stream. A shared workspace lock and database cursor snapshot
 * keep authority, count and rows consistent until generation finishes or is cancelled. */
export async function createLeadCSVExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadExportInput, requestSignal?: AbortSignal, gate?: LeadExportGate) {
  const input = validate(identity, raw), rowLimit = leadExportRowLimit(), id = randomUUID();
  const signal = AbortSignal.any([AbortSignal.timeout(30_000), ...(requestSignal ? [requestSignal] : [])]);
  const initial = await withExportAuthorization(db, identity, enabled, async (trx, context) => {
    signal.throwIfAborted(); await trx.raw("SET LOCAL statement_timeout = '10s'");
    await gate?.beforeRead(trx, context);
    const { query, scope } = await exportQuery(trx, context, identity, input);
    const result = await query.count('* as count').first(), count = Number(result?.count ?? 0);
    await trx('leadExportAudit').insert({ id, workspaceId: identity.workspaceId, actorId: identity.userId, dataset: 'leads', scope, filters: JSON.stringify(filterAudit(input)), count, outcome: count === 0 || count > rowLimit ? 'rejected' : 'started', finishedAt: count === 0 || count > rowLimit ? new Date() : null });
    return { count, scope };
  });
  if (!initial.count) throw new LeadExportEmptyError();
  if (initial.count > rowLimit) throw new LeadExportLimitError();
  const output = new PassThrough({ highWaterMark: 64 * 1024 });
  output.on('error', () => { /* Transport receives a generic stream error; no query/content logging. */ });
  const onAbort = () => output.destroy(new Error('Export cancelled.'));
  signal.addEventListener('abort', onAbort, { once: true });
  let resolveReady!: (value: LeadExportPreview) => void, rejectReady!: (reason: unknown) => void;
  const ready = new Promise<LeadExportPreview>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  let rowsSent = 0, checked = initial;
  async function write(text: string) {
    signal.throwIfAborted();
    if (output.destroyed) throw new Error('Export cancelled.');
    if (!output.write(text, 'utf8')) await once(output, 'drain', { signal });
  }
  const generation = withExportAuthorization(db, identity, enabled, async (trx, context) => {
    await trx.raw("SET LOCAL statement_timeout = '10s'"); signal.throwIfAborted();
    await gate?.beforeRead(trx, context);
    const { query, scope } = await exportQuery(trx, context, identity, input);
    const selection = query.leftJoin('users as u', 'u.id', 'l.ownerId').orderBy('l.id')
      .select('l.id', 'l.leadNumber', 'l.name', 'l.email', 'l.phone', 'l.service', 'l.address', 'l.details', 'l.notes', 'l.source', 'l.stage', 'l.ownerId', 'l.createdAt', 'l.updatedAt', 'l.archivedAt', trx.raw('CASE WHEN l."ownerId" IS NULL THEN NULL ELSE coalesce(u.name,l."ownerName") END as "ownerName"'), trx.raw('count(*) OVER ()::int as "__exportCount"')).toSQL();
    // The cursor fixes one SELECT snapshot without freezing authorization before
    // acquiring the workspace lock. All user values remain parameter bindings.
    await trx.raw('DECLARE lead_export_cursor NO SCROLL CURSOR FOR ' + selection.sql, [...selection.bindings]);
    type ExportRow = { id: string; leadNumber: number; name: string; email: string; phone: string; service: string; address: string; details: string; notes: string; source: string; stage: string; ownerName: string | null; ownerId: string | null; createdAt: Date; updatedAt: Date; archivedAt: Date | null; __exportCount: number };
    let rows = (await trx.raw<{ rows: ExportRow[] }>('FETCH FORWARD 100 FROM lead_export_cursor')).rows;
    const count = Number(rows[0]?.__exportCount ?? 0);
    checked = { count, scope };
    if (!count) throw new LeadExportEmptyError();
    if (count > rowLimit) throw new LeadExportLimitError();
    await gate?.onSnapshot(trx, context, { count, scope, rowLimit });
    resolveReady({ count, scope, rowLimit });
    await write('\uFEFF' + csvLine(leadCSVHeaders));
    while (rows.length) {
      for (const row of rows) {
        await write(csvLine([row.id, `LD-${String(row.leadNumber).padStart(4, '0')}`, row.name, row.email, row.phone, row.service, row.address, row.details, row.notes, row.source, row.stage, row.ownerName, row.ownerId, row.createdAt.toISOString(), row.updatedAt.toISOString(), row.archivedAt ? 'true' : 'false']));
        rowsSent++;
      }
      signal.throwIfAborted();
      rows = (await trx.raw<{ rows: ExportRow[] }>('FETCH FORWARD 100 FROM lead_export_cursor')).rows;
    }
    await trx.raw('CLOSE lead_export_cursor');
    if (rowsSent !== count) throw new Error('Export snapshot changed.');
    return { count, scope };
  });
  void generation.then(async result => {
    signal.throwIfAborted();
    await db('leadExportAudit').where({ id, outcome: 'started' }).update({ ...result, rowsSent, outcome: 'completed', finishedAt: new Date() });
    output.end();
  }).catch(async error => {
    // The durable started record survives transaction rollback and process interruption.
    try { await db('leadExportAudit').where({ id, outcome: 'started' }).update({ ...checked, rowsSent, outcome: error instanceof LeadExportLimitError || error instanceof LeadExportEmptyError ? 'rejected' : 'failed', finishedAt: new Date() }); } catch { /* Leave started evidence if audit storage is unavailable. */ }
    rejectReady(error); output.destroy(new Error('CSV export could not be completed.'));
  }).finally(() => signal.removeEventListener('abort', onAbort));
  const metadata = await ready;
  return { ...metadata, stream: Readable.toWeb(output) as ReadableStream<Uint8Array> };
}
