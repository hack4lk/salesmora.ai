import { chatLeadSearchData as copy } from './chat-search.data';
import type { Knex } from 'knex';
import { leadExportSchema, leadExportQuery, leadSearchSnapshotSchema, leadSearchEvidenceSchema, type AuthorizationContext, type LeadExportInput } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { leadChatEvidenceAllowed } from './chat-context';
import { scopedLeadQuery, filteredLeadQuery, workspaceTimezone } from './query';

/** Same app scope and filter semantics as Leads. Workspace authorization lock covers the snapshot. */
export async function searchChatLeads(trx: Knex.Transaction, context: AuthorizationContext, id: string, raw: LeadExportInput['filters']) {
  const { filters } = leadExportSchema.parse({ workspaceId: context.workspaceId, filters: raw });
  if (filters.query.length === 1) throw Error('Search text must contain at least two characters.');
  const { query, scope } = scopedLeadQuery(trx, context);
  if (scope === 'assigned' && filters.ownerIds.some(owner => !['me', context.userId].includes(owner))) throw new AuthorizationAccessError();
  if (filters.archived && !authorize(context, { permission: 'leads.archive', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed) throw new AuthorizationAccessError();
  const labels: string[] = [];
  // Resolve every owner against this workspace; never echo unknown identities or silently drop filters.
  for (const owner of filters.ownerIds) {
    if (owner === 'me' || owner === context.userId) labels.push(copy.owner(copy.me));
    else if (owner === 'unassigned') labels.push(copy.owner(copy.unassigned));
    else {
      // Manual owner choices load a roster only with assignment/picker access.
      if (!authorize(context, { permission: 'leads.assign', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed) throw new AuthorizationAccessError();
      const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': context.workspaceId, 'm.userId': owner }).whereNull('u.deletionRequestedAt').first('u.name');
      if (!member) throw new AuthorizationAccessError();
      labels.push(copy.owner(String(member.name).slice(0, 200)));
    }
  }
  if (filters.query) labels.push(copy.query(filters.query));
  if (filters.stages.length) labels.push(copy.stages(filters.stages.map(stage => copy.stagesMap[stage]).join(', ')));
  if (filters.sources.length) labels.push(copy.sources(filters.sources.map(source => copy.sourcesMap[source]).join(', ')));
  if (filters.created !== 'any') labels.push(copy.created(filters.created === 'custom' ? copy.custom(filters.from, filters.to) : copy.dates[filters.created]));
  if (filters.attention) labels.push(copy.attention);
  const base = filteredLeadQuery(query, leadExportQuery({ workspaceId: context.workspaceId, filters }), context, await workspaceTimezone(trx, context.workspaceId));
  const count = await base.clone().count<{ count: string }[]>({ count: 'l.id' }).timeout(5000, { cancel: true }).first();
  const rows: { id: string; version: number; leadNumber: number; name: string; service: string; stage: string; archivedAt: Date | null; ownerId: string | null; memberId: string | null; ownerName: string | null }[] = await base.clone().leftJoin('users as u', 'u.id', 'l.ownerId').leftJoin('workspaceMemberships as m', function () { this.on('m.userId', 'l.ownerId').andOn('m.workspaceId', 'l.workspaceId'); })
    .orderBy('l.createdAt', 'desc').orderBy('l.id', 'desc').limit(10).timeout(5000, { cancel: true })
    .select('l.id', 'l.version', 'l.leadNumber', 'l.name', 'l.service', 'l.stage', 'l.archivedAt', 'l.ownerId', 'm.userId as memberId', trx.raw('coalesce(u.name,l."ownerName") as "ownerName"'));
  return leadSearchSnapshotSchema.parse({ filters,
    ownerIds: [...new Set(rows.flatMap(row => row.memberId ? [row.memberId] : []))],
    result: { id, scope, asOf: new Date().toISOString(), filterLabels: labels, includeArchived: filters.archived, total: Number(count?.count ?? 0), rows: rows.map(row => ({
    id: row.id, number: `LD-${String(row.leadNumber).padStart(4, '0')}`, name: String(row.name).slice(0, 200), service: String(row.service).slice(0, 200), stage: row.stage, ownerName: row.memberId ? String(row.ownerName ?? '').slice(0, 200) : row.ownerId ? copy.former : null, archived: !!row.archivedAt,
  })) }, versions: rows.map(row => ({ id: row.id, version: row.version })) });
}

/** Timestamped facts may age; current scope and access to their source records must still hold. */
export async function chatSearchSnapshotAllowed(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const parsed = leadSearchSnapshotSchema.safeParse(raw);
  if (!parsed.success) return false;
  const snapshot = parsed.data;
  try {
    if (!snapshot.result.asOf) return false;
    const { query, scope } = scopedLeadQuery(trx, context);
    if (scope !== snapshot.result.scope) return false;
    const archiveAccess = authorize(context, { permission: 'leads.archive', resource: {
      kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null,
    } }).allowed;
    if (snapshot.result.includeArchived && !archiveAccess) return false;
    const namedOwners = snapshot.filters.ownerIds.filter(owner => !['me', 'unassigned', context.userId].includes(owner));
    if (namedOwners.length) {
      if (!authorize(context, { permission: 'leads.assign', resource: {
        kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null,
      } }).allowed) return false;
    }
    if (!snapshot.ownerIds) return false;
    const visibleOwners = [...new Set([...namedOwners, ...snapshot.ownerIds])]
      .filter(id => id !== context.userId);
    if (visibleOwners.length) {
      const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
        .where('m.workspaceId', context.workspaceId).whereIn('m.userId', visibleOwners)
        .whereNull('u.deletionRequestedAt').select('m.userId');
      if (members.length !== visibleOwners.length) return false;
    }
    // A truncated assigned population cannot prove that every original counted source is still readable.
    if (scope === 'assigned' && snapshot.result.total !== snapshot.result.rows.length) return false;
    if (!snapshot.result.rows.length) return true;
    if (!archiveAccess) query.whereNull('l.archivedAt');
    const rows: { id: string }[] = await query.whereIn('l.id', snapshot.result.rows.map(row => row.id)).select('l.id');
    return rows.length === snapshot.result.rows.length;
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

/** Shared by streaming, retained history and every proposal/confirmation boundary. */
export async function leadChatTurnEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turn: { leadEvidence: unknown; leadSearchEvidence: unknown }) {
  if (!await leadChatEvidenceAllowed(trx, context, turn.leadEvidence)) return false;
  return leadSearchEvidenceAllowed(trx, context, turn.leadSearchEvidence);
}
export async function leadSearchEvidenceAllowed(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
  current?: { id: string; leadSearchSnapshot: unknown },
  // Only share within one authorized read transaction; later requests must use a new map.
  validated?: Map<string, boolean>,
) {
  const parsed = leadSearchEvidenceSchema.safeParse(raw);
  if (!parsed.success) return false;
  if (parsed.data.some(id => validated?.get(id) === false)) return false;
  const ids = [...new Set(parsed.data)].filter(id => !validated?.has(id));
  const otherIds = ids.filter(id => id !== current?.id);
  const sources: { id: string; leadSearchSnapshot: unknown }[] = otherIds.length
    ? await trx('chatTurns').where({ userId: context.userId, workspaceId: context.workspaceId })
      .whereIn('id', otherIds).select('id', 'leadSearchSnapshot') : [];
  if (current) sources.push(current);
  for (const id of ids) {
    const source = sources.find(item => item.id === id);
    const allowed = !!source && await chatSearchSnapshotAllowed(trx, context, source.leadSearchSnapshot);
    validated?.set(id, allowed);
    if (!allowed) return false;
  }
  return true;
}
