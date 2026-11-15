import 'server-only';
import { chatPageContextSchema, leadSearchInputSchema, leadExportSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, searchChatLeads } from '@salesmora/data';
import type { ChatToolHandler } from '../tools/types';
import { stageChatEvidence } from '../request-context';

export const searchLeads: ChatToolHandler = async (context, raw) => {
  const input = leadSearchInputSchema.parse(raw);
  const { db: trx, authority: current, turn } = context;
  if (turn.leadSearchSnapshot) throw new AuthorizationAccessError();
  const page = chatPageContextSchema.parse(turn.pageContext);
  if (input.mode === 'current_filters' && (context.surface !== 'leads.list' || !page.uiState)) return { evidence: { type: 'lead-search-needs-filters', message: 'Current filters are unavailable. Ask for explicit search filters; do not broaden the search.' } };
  const filters = input.mode === 'current_filters' ? page.uiState!.filters : input.filters;
  if (!leadExportSchema.safeParse({ workspaceId: current.workspaceId, filters }).success || filters.query.length === 1) return { evidence: { type: 'lead-search-invalid-filters', message: 'Use at least two search characters and valid ordered dates. Do not drop a requested filter.' } };
  const snapshot = await searchChatLeads(trx, current, context.turnId, filters);
  const ids = [...new Set([...turn.leadSearchEvidence, context.turnId])];
  if (ids.length > 8) throw new AuthorizationAccessError();
  if (!stageChatEvidence(context.identity, context.turnId, { leadSearchSnapshot: snapshot, leadSearchEvidence: ids }))
    await trx('chatTurns').where({ id: context.turnId }).update({ leadSearchSnapshot: JSON.stringify(snapshot), leadSearchEvidence: JSON.stringify(ids) });
  return { searchResult: snapshot.result, evidence: { type: 'authorized-lead-search', result: snapshot.result, notice: 'Read-only point-in-time snapshot as of result.asOf, not a live list. Only the displayed rows were retrieved; no contact details, notes or other fields. Use the app card to open a lead or refresh the matching list. Do not generate URLs.' } };
};
