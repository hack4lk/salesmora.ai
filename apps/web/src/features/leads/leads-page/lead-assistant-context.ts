import type { LeadListQuery } from '@salesmora/contracts';
import type { AssistantPageContext } from '../../assistant/workspace-assistant/workspace-assistant';
import { leadsReadRouteData as copy } from './leads-read-route.data';

export function leadAssistantContext(query: LeadListQuery, lead?: { id: string; leadNumber: string; name: string }): AssistantPageContext {
  if (lead) return { key: `lead:${lead.id}`, label: copy.leadContext(lead), recordRefs: [{ type: 'lead', id: lead.id }] };
  const filters = { query: query.q, stages: query.stages, sources: query.sources, ownerIds: query.ownerIds, created: query.created, from: query.from ?? '', to: query.to ?? '', attention: query.attention, archived: query.archived };
  return { key: `lead-filters:${JSON.stringify(filters)}`, label: copy.filterContext, uiState: { view: query.view, filters } };
}
