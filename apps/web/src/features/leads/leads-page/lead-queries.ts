import { queryOptions, type QueryClient } from '@tanstack/react-query';
import {
  leadDetailResultSchema, leadListResultSchema, leadNotesResultSchema, leadQueryToURL,
  type LeadListQuery, type LeadListResult, type LeadDetailResult,
} from '@salesmora/contracts';
import { apiQueryKeys, type ApiQueryScope } from '../../api/api-query';
import { apiRequest, ApiContractError } from '../../api/api-request';
import { leadsReadRouteData as copy } from './leads-read-route.data';

export function leadListOptions(scope: ApiQueryScope, query: LeadListQuery) {
  if (query.workspaceId !== scope.workspaceId) {
    throw new ApiContractError(copy.failure, new Error('The list filters do not match the current workspace.'));
  }
  return queryOptions({
    queryKey: apiQueryKeys.list(scope, 'leads', query),
    queryFn: ({ signal }) => apiRequest(`/api/leads?${leadQueryToURL(query)}`, {
      signal, parse: raw => leadListResultSchema.parse(raw), failureMessage: copy.failure,
    }),
  });
}

export function leadDetailOptions(scope: ApiQueryScope, id: string, activityPage = 1) {
  return queryOptions({
    queryKey: [...apiQueryKeys.detail(scope, 'leads', id), { activityPage }] as const,
    queryFn: ({ signal }) => apiRequest(`/api/leads/${encodeURIComponent(id)}?${new URLSearchParams({ workspace: scope.workspaceId, activityPage: String(activityPage) })}`, {
      signal, parse: raw => {
        const detail = leadDetailResultSchema.parse(raw);
        if (detail.lead.id !== id) throw new Error('The returned lead does not match the requested record.');
        return detail;
      }, failureMessage: copy.unavailable,
    }),
  });
}

export function leadNotesOptions(scope: ApiQueryScope, id: string, page: number) {
  return queryOptions({
    queryKey: [...apiQueryKeys.detail(scope, 'leads', id), 'notes', { page }] as const,
    queryFn: ({ signal }) => apiRequest(`/api/leads/${encodeURIComponent(id)}/notes?${new URLSearchParams({ workspace: scope.workspaceId, page: String(page) })}`, {
      signal, parse: raw => leadNotesResultSchema.parse(raw), failureMessage: copy.notesFailure,
    }),
  });
}

export function mergeLeadColumn(current: LeadListResult, next: LeadListResult, stage: LeadListQuery['column']) {
  if (current.scope !== next.scope || current.policyRevision !== next.policyRevision) return undefined;
  const page = next.columns.find(column => column.stage === stage);
  if (!page) throw new ApiContractError(copy.failure, new Error('The requested pipeline column is missing.'));
  return {
    ...current, total: next.total,
    columns: current.columns.map(column => column.stage === stage
      ? { ...page, leads: [...new Map([...column.leads, ...page.leads].map(lead => [lead.id, lead])).values()] } : column),
  };
}

export function mergeLeadActivity(current: LeadDetailResult, next: LeadDetailResult) {
  if (current.lead.id !== next.lead.id || current.scope !== next.scope || current.policyRevision !== next.policyRevision) return undefined;
  if (current.lead.version > next.lead.version) return current;
  return { ...next, teamNotes: current.teamNotes, activity: [...new Map([...current.activity, ...next.activity].map(event => [event.id, event])).values()] };
}

export async function invalidateLeadQueries(client: QueryClient, workspaceId: string, deletedId?: string) {
  const belongs = (key: readonly unknown[]) => key[0] === 'api' && key[2] === 'workspace' && key[3] === workspaceId;
  if (deletedId) {
    await client.cancelQueries({ predicate: query => belongs(query.queryKey) && query.queryKey[4] === 'leads' });
    client.removeQueries({ predicate: query => belongs(query.queryKey) && query.queryKey[4] === 'leads' && query.queryKey[5] === 'detail' && query.queryKey[6] === deletedId });
  }
  await client.invalidateQueries({
    predicate: query => belongs(query.queryKey) &&
      ['leads', 'home', 'customers', 'customer-detail', 'customer-candidates', 'jobs', 'job-detail', 'calendar', 'calendar-visit', 'calendar-advisories', 'estimates', 'reports', 'notifications'].includes(String(query.queryKey[4])),
  }, { throwOnError: true });
}
