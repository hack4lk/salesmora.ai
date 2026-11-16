import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { apiQueryKeys, type ApiQueryScope } from './api-query';
import { apiRequest } from './api-request';

export function apiReadOptions<T>(
  scope: ApiQueryScope, resource: string, parameters: Readonly<Record<string, unknown>>,
  path: string, parse: (raw: unknown) => T, failureMessage: string,
) {
  return queryOptions({
    queryKey: apiQueryKeys.list(scope, resource, parameters),
    queryFn: ({ signal }) => apiRequest(path, { signal, parse, failureMessage }),
  });
}

export async function invalidateWorkspaceResources(client: QueryClient, workspaceId: string, resources: readonly string[], options: { refetchType?: 'active' | 'none' } = {}) {
  const affected = resources.flatMap(apiResourceFamily);
  await client.invalidateQueries({
    ...options,
    predicate: query => query.queryKey[0] === 'api' && query.queryKey[2] === 'workspace' &&
      query.queryKey[3] === workspaceId && affected.includes(String(query.queryKey[4])),
  }, { throwOnError: true });
}

export function apiResourceFamily(resource: string): readonly string[] {
  switch (resource) {
    case 'customers': return ['customers', 'customer-detail', 'customer-candidates'];
    case 'jobs': return ['jobs', 'job-detail', 'job-messages', 'job-creation-deadline'];
    case 'calendar': return ['calendar', 'calendar-visit', 'calendar-advisories'];
    case 'work-orders': return ['work-orders', 'work-order-detail', 'work-order-visit', 'work-order-creation'];
    case 'estimates': return ['estimates', 'estimate-detail', 'estimate-history', 'estimate-revisions', 'estimate-sharing', 'estimate-decision', 'estimate-conversion', 'estimate-lead-stage', 'estimate-parents', 'related-estimates'];
    case 'intake': return ['intake', 'intake-detail', 'intake-review'];
    default: return [resource];
  }
}
