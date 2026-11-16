import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { ApiRequestError, ApiTransportError } from './api-request';

export interface ApiQueryScope {
  viewerId: string;
  workspaceId: string;
}

export const apiQueryKeys = {
  viewer: (viewerId: string) => ['api', viewerId] as const,
  workspace: (scope: ApiQueryScope) => ['api', scope.viewerId, 'workspace', scope.workspaceId] as const,
  resource: (scope: ApiQueryScope, resource: string) => [...apiQueryKeys.workspace(scope), resource] as const,
  list: (scope: ApiQueryScope, resource: string, filters: Readonly<Record<string, unknown>>) =>
    [...apiQueryKeys.resource(scope, resource), 'list', filters] as const,
  detail: (scope: ApiQueryScope, resource: string, id: string) =>
    [...apiQueryKeys.resource(scope, resource), 'detail', id] as const,
  account: (viewerId: string, resource: string) => [...apiQueryKeys.viewer(viewerId), 'account', resource] as const,
};

export function retryApiQuery(failureCount: number, error: unknown) {
  return failureCount < 2 && (
    error instanceof ApiTransportError ||
    (error instanceof ApiRequestError && [502, 503, 504].includes(error.status))
  );
}

export function createApiQueryClient({ testing = false }: { testing?: boolean } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: testing ? false : retryApiQuery,
        refetchOnWindowFocus: !testing,
        refetchOnReconnect: !testing,
      },
      mutations: { retry: false, networkMode: 'always' },
    },
  });
}

export function retainApiQueryScope(client: QueryClient, scope: ApiQueryScope) {
  client.removeQueries({
    predicate: ({ queryKey }) => queryKey[0] === 'api' && (
      queryKey[1] !== scope.viewerId ||
      (queryKey[2] === 'workspace' && queryKey[3] !== scope.workspaceId)
    ),
  });
  // Mutations cannot be unsent; discard their cached results, not their network work.
  client.getMutationCache().clear();
}

export function removeOtherWorkspaceQueries(client: QueryClient, workspaceId: string) {
  client.removeQueries({
    predicate: ({ queryKey }) => queryKey[0] === 'api' &&
      queryKey[2] === 'workspace' && queryKey[3] !== workspaceId,
  });
}

export function isApiAccessError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && [401, 403, 404, 423].includes(error.status);
}

export function removeDeniedApiQueries(client: QueryClient, key: QueryKey, error: unknown) {
  if (!isApiAccessError(error)) return;
  client.removeQueries({
    queryKey: error.status === 401 ? key.slice(0, 2) : key.slice(0, 4),
    type: 'inactive',
  });
}
