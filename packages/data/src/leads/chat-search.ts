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
  return leadSearchSnapshotSchema.parse({ filters, result: { id, scope, filterLabels: labels, includeArchived: filters.archived, total: Number(count?.count ?? 0), rows: rows.map(row => ({
    id: row.id, number: `LD-${String(row.leadNumber).padStart(4, '0')}`, name: String(row.name).slice(0, 200), service: String(row.service).slice(0, 200), stage: row.stage, ownerName: row.memberId ? String(row.ownerName ?? '').slice(0, 200) : row.ownerId ? copy.former : null, archived: !!row.archivedAt,
  })) }, versions: rows.map(row => ({ id: row.id, version: row.version })) });
}

/** Includes empty results and totals: changed membership, filters, top window or count invalidates text too. */
export async function chatSearchSnapshotAllowed(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const parsed = leadSearchSnapshotSchema.safeParse(raw);
  if (!parsed.success) return false;
  try { return JSON.stringify(await searchChatLeads(trx, context, parsed.data.result.id, parsed.data.filters)) === JSON.stringify(parsed.data); }
  catch { return false; }
}

/** Shared by streaming, retained history and every proposal/confirmation boundary. */
export async function leadChatTurnEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turn: { leadEvidence: unknown; leadSearchEvidence: unknown }) {
  if (!await leadChatEvidenceAllowed(trx, context, turn.leadEvidence)) return false;
  return leadSearchEvidenceAllowed(trx, context, turn.leadSearchEvidence);
}
export async function leadSearchEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const parsed = leadSearchEvidenceSchema.safeParse(raw);
  if (!parsed.success) return false;
  for (const id of parsed.data) {
    const source = await trx('chatTurns').where({ id, userId: context.userId, workspaceId: context.workspaceId }).first('leadSearchSnapshot');
    if (!source || !await chatSearchSnapshotAllowed(trx, context, source.leadSearchSnapshot)) return false;
  }
  return true;
}
