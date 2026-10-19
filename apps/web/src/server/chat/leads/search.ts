import 'server-only';
import { authorizeLeadOperation } from '@salesmora/agent';
import { chatPageContextSchema, leadSearchInputSchema, leadExportSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, searchChatLeads } from '@salesmora/data';
import { authorizedWorkspace } from '../../authorization/permissions';
import { validateTurnEvidence } from '../store';
import type { ChatToolHandler } from '../tools/types';

export const searchLeads: ChatToolHandler = async (context, raw) => {
  const input = leadSearchInputSchema.parse(raw);
  await context.authorize('leads_query', 'search');
  const result = await authorizedWorkspace(context.identity.userId, context.identity.workspaceId, true, async (trx, current) => {
    if (!authorizeLeadOperation(current, context.surface, 'search').allowed) throw new AuthorizationAccessError();
    const turn = await trx('chatTurns').where({ ...context.identity, id: context.turnId }).first();
    if (!turn || !['accepted', 'running'].includes(turn.state) || turn.leadSearchSnapshot) throw new AuthorizationAccessError();
    const page = chatPageContextSchema.parse(turn.pageContext);
    if (input.mode === 'current_filters' && (context.surface !== 'leads.list' || !page.uiState)) return { evidence: { type: 'lead-search-needs-filters', message: 'Current filters are unavailable. Ask for explicit search filters; do not broaden the search.' } };
    const filters = input.mode === 'current_filters' ? page.uiState!.filters : input.filters;
    if (!leadExportSchema.safeParse({ workspaceId: current.workspaceId, filters }).success || filters.query.length === 1) return { evidence: { type: 'lead-search-invalid-filters', message: 'Use at least two search characters and valid ordered dates. Do not drop a requested filter.' } };
    const snapshot = await searchChatLeads(trx, current, context.turnId, filters);
    const ids = [...new Set([...turn.leadSearchEvidence, context.turnId])];
    if (ids.length > 8) throw new AuthorizationAccessError();
    await trx('chatTurns').where({ id: context.turnId }).update({ leadSearchSnapshot: JSON.stringify(snapshot), leadSearchEvidence: JSON.stringify(ids) });
    return { searchResult: snapshot.result, evidence: { type: 'authorized-lead-search', result: snapshot.result, notice: 'Read-only search, newest first. Only the displayed rows were retrieved; no contact details, notes or other fields. Use the app card to open a lead or the matching list. Do not generate URLs.' } };
  });
  // Freeze and recheck the collection before any model answer or browser release.
  context.signal.throwIfAborted();
  await validateTurnEvidence(context.identity, context.turnId);
  return result;
};
