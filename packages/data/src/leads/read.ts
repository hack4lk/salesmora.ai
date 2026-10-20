import { relatedCustomerForLead } from '../customers/store';
import { resolveExportScope } from './export-access';
import { scopedLeadQuery, filteredLeadQuery, workspaceTimezone } from './query';
import { leadOrigin } from './origin';
import type { Knex } from 'knex';
import { leadListQuerySchema, leadEditableFields, leadNoteActivitySchema, leadStages, type AuthorizationContext, type LeadListQuery, type LeadListResult, type LeadReadRecord, type PermissionId } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
type Row = Omit<LeadReadRecord, 'canMove' | 'canEdit' | 'canAssign' | 'canArchive' | 'canRestore' | 'canDelete' | 'origin' | 'leadNumber' | 'owner' | 'archived' | 'createdAt' | 'updatedAt' | 'lastActivityAt'> & {
  creationChanges: unknown; leadNumber: number; ownerId: string | null; ownerName: string | null; memberId: string | null; archivedAt: Date | null;
  createdAt: Date; updatedAt: Date; lastActivityAt: Date;
};
const fields = ['id', 'leadNumber', 'version', 'name', 'service', 'email', 'phone', 'address', 'details', 'notes', 'stage', 'source', 'ownerId', 'createdAt', 'updatedAt', 'lastActivityAt', 'archivedAt'].map(field => `l.${field}`);
// These record permissions have workspace-only scope. This projects the grant for read UI/roster
// availability, not permission to mutate any particular lead (writes must load that lead again).
function workspaceGrant(context: AuthorizationContext, permission: 'leads.archive' | 'leads.assign' | 'leads.delete') {
  return authorize(context, { permission, resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed;
}
function canArchive(context: AuthorizationContext) { return workspaceGrant(context, 'leads.archive'); }
function select(query: Knex.QueryBuilder, trx: Knex.Transaction) {
  return query.leftJoin('leadActivity as c', function () { this.on('c.id', 'l.id').andOn('c.workspaceId', 'l.workspaceId'); }).leftJoin('users as u', 'u.id', 'l.ownerId').leftJoin('workspaceMemberships as m', function () { this.on('m.userId', 'l.ownerId').andOn('m.workspaceId', 'l.workspaceId'); })
    .select(...fields, 'c.changes as creationChanges', trx.raw('coalesce(u.name,l."ownerName") as "ownerName"'), 'm.userId as memberId', trx.raw(`((l."ownerId" IS NULL OR m."userId" IS NULL) OR l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days') as "needsAttention"`));
}
function dto(row: Row, context: AuthorizationContext): LeadReadRecord {
  return { id: row.id, leadNumber: `LD-${String(row.leadNumber).padStart(4, '0')}`, version: row.version, name: row.name, service: row.service, email: row.email, phone: row.phone, address: row.address, details: row.details, notes: row.notes,
    canDelete: workspaceGrant(context, 'leads.delete'), canArchive: !row.archivedAt && canArchive(context), canRestore: !!row.archivedAt && canArchive(context), canAssign: !row.archivedAt && workspaceGrant(context, 'leads.assign'), origin: leadOrigin(row.creationChanges), canEdit: !row.archivedAt && authorize(context, { permission: 'leads.update', fields: [...leadEditableFields], resource: { kind: 'lead', id: row.id, workspaceId: context.workspaceId, ownerId: row.ownerId } }).allowed, stage: row.stage, source: row.source, owner: row.ownerId ? { id: row.ownerId, name: row.ownerName ?? '', former: !row.memberId } : null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), lastActivityAt: row.lastActivityAt.toISOString(), archived: !!row.archivedAt, needsAttention: row.needsAttention, canMove: !row.archivedAt && authorize(context, { permission: 'leads.stage.update', resource: { kind: 'lead', id: row.id, workspaceId: context.workspaceId, ownerId: row.ownerId } }).allowed };
}
function ordered(query: Knex.QueryBuilder, input: LeadListQuery) {
  if (input.sort === 'stage') query.orderByRaw(`CASE l.stage WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'estimate-sent' THEN 2 WHEN 'won' THEN 3 ELSE 4 END ${input.direction}`);
  else if (input.sort === 'owner') query.orderByRaw(`u.name ${input.direction} NULLS LAST`);
  else query.orderBy(input.sort === 'created' ? 'l.createdAt' : `l.${input.sort}`, input.direction);
  return query.orderBy('l.id', input.direction);
}
async function assignmentRoster(trx: Knex.Transaction, context: AuthorizationContext, scope: string) {
  if (scope !== 'workspace' || !workspaceGrant(context, 'leads.assign')) return [];
  const rows = await trx('workspaceMemberships as wm').join('users as u','u.id','wm.userId').where('wm.workspaceId',context.workspaceId).whereNull('u.deletionRequestedAt').orderBy('u.name').orderBy('u.id')
    .select('u.id','u.name',trx.raw(`(SELECT count(*)::int FROM leads ol WHERE ol."workspaceId" = wm."workspaceId" AND ol."ownerId" = wm."userId" AND ol."archivedAt" IS NULL AND ol.stage IN ('new','contacted','estimate-sent')) AS "openLeadCount"`));
  return rows as {id:string;name:string;openLeadCount:number}[];
}
export async function readLeads(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadListQuery): Promise<LeadListResult> {
  const input = leadListQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { query, scope } = scopedLeadQuery(trx, context);
    if (input.archived && !canArchive(context)) throw new AuthorizationAccessError();
    if (scope === 'assigned' && input.ownerIds.some(id => !['me', identity.userId].includes(id))) throw new AuthorizationAccessError();
    const timezone = await workspaceTimezone(trx, identity.workspaceId);
    const base = filteredLeadQuery(query, input, identity, timezone);
    const count = await base.clone().count<{ count: string }[]>({ count: 'l.id' }).first(), total = Number(count?.count ?? 0);
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
    const rows: Row[] = input.view === 'list' ? await ordered(select(base.clone(), trx), input).offset((page - 1) * input.pageSize).limit(input.pageSize) : [];
    const grouped = await base.clone().select('l.stage').count<{ stage: string; count: string }[]>({ count: 'l.id' }).groupBy('l.stage');
    const columns: LeadListResult['columns'] = [];
    if (input.view === 'pipeline') for (const stage of leadStages) {
      if (input.column && input.column !== stage) continue;
      const columnPage = input.column ? input.columnPage : 1;
      const leads: Row[] = await ordered(select(base.clone().where('l.stage', stage), trx), input).offset((columnPage - 1) * 20).limit(20);
      const count = Number(grouped.find(row => row.stage === stage)?.count ?? 0);
      columns.push({ stage, total: count, leads: leads.map(row => dto(row, context)), page: columnPage, hasMore: columnPage * 20 < count });
    }
    const owners = await assignmentRoster(trx, context, scope);
    return { rows: rows.map(row => dto(row, context)), total, page, pageSize: input.pageSize, timezone, columns, owners, scope, canExport: resolveExportScope(context) !== null, exportScope: resolveExportScope(context) ?? scope, canAssign: scope === 'workspace' && workspaceGrant(context, 'leads.assign'), canCreate: authorize(context, { permission: 'leads.create' }).allowed, canShowArchived: canArchive(context), policyRevision: context.policy.revision };
  });
}
/** Exact-reference record reader shared by the manual detail page and assistant. No activity/roster reads. */
export async function readLeadRecordInTransaction(trx: Knex.Transaction, context: AuthorizationContext, ref: string) {
  const { query, scope } = scopedLeadQuery(trx, context);
  if (/^LD-\d{1,12}$/i.test(ref) && Number(ref.slice(3)) > 0 && Number(ref.slice(3)) <= 2147483647) query.andWhere('l.leadNumber', Number(ref.slice(3)));
  else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('l.id', ref);
  else throw new AuthorizationAccessError();
  const row: Row | undefined = await select(query, trx).timeout(5000, { cancel: true }).first();
  if (!row) throw new AuthorizationAccessError();
  return { lead: dto(row, context), scope };
}
export async function readLead(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string, activityPage = 1, notesPage = 1) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !Number.isInteger(activityPage) || activityPage < 1 || activityPage > 100000 || !Number.isInteger(notesPage) || notesPage < 1 || notesPage > 100000) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { lead, scope } = await readLeadRecordInTransaction(trx, context, id);
    const history = await readLeadHistoryInTransaction(trx, context, lead.id, 'activity', 20, activityPage);
    const noteHistory = await readLeadHistoryInTransaction(trx, context, lead.id, 'notes', 20, notesPage);
    const activity = history.rows, notes = noteHistory.rows;
    const teamNotes = notes.map(note => ({ id: note.id as string, ...leadNoteActivitySchema.parse(note.changes), authorName: note.actorName ?? '', viaAssistant: note.actorType === 'assistant-confirmed', createdAt: note.createdAt.toISOString() }));
    return { relatedCustomer: await relatedCustomerForLead(trx, context, lead.id), owners: await assignmentRoster(trx, context, scope), canExport: resolveExportScope(context) !== null, exportScope: resolveExportScope(context) ?? scope, canAssign: scope === 'workspace' && workspaceGrant(context, 'leads.assign'), lead, teamNotes, notesTotal: noteHistory.total, activity: activity.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })), activityTotal: history.total, timezone: await workspaceTimezone(trx, identity.workspaceId), scope, canCreate: authorize(context, { permission: 'leads.create' }).allowed, canShowArchived: canArchive(context), policyRevision: context.policy.revision };
  });
}

/** Caller must first load this exact lead through the scoped record reader in the same authorized transaction. */
export async function readLeadHistoryInTransaction(trx: Knex.Transaction, context: AuthorizationContext, leadId: string, mode: 'activity' | 'notes', limit = 10, page = 1) {
  if (![10, 20].includes(limit) || !Number.isInteger(page) || page < 1 || page > 100000) throw new AuthorizationAccessError();
  // Recheck record scope as a defensive boundary even for internal callers.
  const { query: permitted } = scopedLeadQuery(trx, context);
  if (!await permitted.where('l.id', leadId).first('l.id')) throw new AuthorizationAccessError();
  const query = trx('leadActivity').where({ workspaceId: context.workspaceId, leadId });
  if (mode === 'notes') query.andWhere('type', 'note');
  const count = await query.clone().count<{ count: string }[]>({ count: '*' }).timeout(5000, { cancel: true }).first();
  const rows = await query.clone().orderBy('createdAt', 'desc').orderBy('id', 'desc').limit(limit).offset((page - 1) * limit).select('id', 'actorName', 'actorType', 'type', 'changes', 'createdAt').timeout(5000, { cancel: true });
  return { rows, total: Number(count?.count ?? 0) };
}
