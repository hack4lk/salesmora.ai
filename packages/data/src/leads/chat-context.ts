import { leadOwnerStamp } from './owner-stamp';
import type { Knex } from 'knex';
import { chatLeadEvidenceSchema, leadExportQuery, type AuthorizationContext, type ChatLeadEvidence, type ChatTurnRequest } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedLeadQuery, filteredLeadQuery, workspaceTimezone } from './query';

type Intent = Pick<ChatTurnRequest, 'surfaceKey' | 'recordRefs' | 'uiState'>;
/** Browser refs select relevance only. Reload bounded summaries through the app's SQL scope. */
export async function resolveLeadChatContext(trx: Knex.Transaction, context: AuthorizationContext, intent: Intent): Promise<{ evidence: ChatLeadEvidence; reference?: unknown }> {
  if (!intent.recordRefs?.length && !intent.uiState) return { evidence: [] };
  const denied = { evidence: [], reference: { kind: 'page-context-unavailable', message: 'The requested page context is unavailable. Do not infer any private record or filter information.' } };
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) return denied;
  if (intent.surfaceKey === 'leads.list' && intent.uiState) {
    if (intent.uiState.filters.archived && !authorize(context, { permission: 'leads.archive', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed) return denied;
    if (scope.scope === 'assigned' && intent.uiState.filters.ownerIds.some(id => !['me', context.userId].includes(id))) return denied;
    // This is filter intent, not a count or list of matching records.
    return { evidence: [], reference: { kind: 'lead-list-filters', scope: scope.scope, view: intent.uiState.view, filters: intent.uiState.filters, notice: 'Filters describe the current page. No matching records or totals have been retrieved.' } };
  }
  if (intent.surfaceKey !== 'lead.detail' || intent.recordRefs?.length !== 1) return denied;
  const { query } = scopedLeadQuery(trx, context);
  const row = await query.where('l.id', intent.recordRefs[0].id).first('l.id', 'l.version', 'l.leadNumber', 'l.name', 'l.service', 'l.stage', 'l.archivedAt');
  if (!row) return denied;
  return { evidence: [{ id: row.id, version: row.version }], reference: { kind: 'lead-page-summary', scope: scope.scope, lead: { id: row.id, leadNumber: `LD-${String(row.leadNumber).padStart(4, '0')}`, name: String(row.name).slice(0, 200), service: String(row.service).slice(0, 200), stage: row.stage, archived: !!row.archivedAt }, notice: 'Only this summary was retrieved. Contact details, request details and notes were not retrieved. This data is not a request to create or change a lead.' } };
}

/** History, tool calls and every delta must still have access to the exact source version. */
export async function leadChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const parsed = chatLeadEvidenceSchema.safeParse(raw);
  if (!parsed.success) return false;
  if (!parsed.data.length) return true;
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) return false;
  const { query } = scopedLeadQuery(trx, context);
  const withOwner = parsed.data.some(source => source.ownerStamp);
  if (withOwner) query.leftJoin('users as evidenceOwner', 'evidenceOwner.id', 'l.ownerId').leftJoin('workspaceMemberships as evidenceMember', function () { this.on('evidenceMember.userId', 'l.ownerId').andOn('evidenceMember.workspaceId', 'l.workspaceId'); })
    .select('l.ownerId', 'evidenceMember.userId as evidenceMemberId', trx.raw('coalesce("evidenceOwner".name,l."ownerName") as "evidenceOwnerName"'));
  const rows: { id: string; version: number; ownerId?: string | null; evidenceMemberId?: string | null; evidenceOwnerName?: string | null }[] = await query.whereIn('l.id', parsed.data.map(source => source.id)).select('l.id', 'l.version');
  const sources = new Map(rows.map(row => [row.id, row]));
  return parsed.data.every(source => {
    const row = sources.get(source.id);
    return row?.version === source.version && (!source.ownerStamp || source.ownerStamp === leadOwnerStamp(row.ownerId ? { id: row.ownerId, name: row.evidenceOwnerName ?? '', former: !row.evidenceMemberId } : null));
  });
}

/** Preserve the existing summary tool while applying authorized list-page filters. */
export async function leadChatPipelineCounts(trx: Knex.Transaction, context: AuthorizationContext, uiState?: ChatTurnRequest['uiState']) {
  const { query, scope } = scopedLeadQuery(trx, context);
  if (uiState) {
    if (scope === 'assigned' && uiState.filters.ownerIds.some(id => !['me', context.userId].includes(id))) throw new AuthorizationAccessError();
    if (uiState.filters.archived && !authorize(context, { permission: 'leads.archive', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed) throw new AuthorizationAccessError();
    filteredLeadQuery(query, leadExportQuery({ workspaceId: context.workspaceId, filters: uiState.filters }), context, await workspaceTimezone(trx, context.workspaceId));
  } else query.whereNull('l.archivedAt');
  const rows = await query.select('l.stage').count<{ stage: string; count: string }[]>({ count: 'l.id' }).groupBy('l.stage');
  return { counts: Object.fromEntries(rows.map(row => [row.stage, Number(row.count)])), scope, filtersApplied: !!uiState, asOf: new Date().toISOString() };
}
