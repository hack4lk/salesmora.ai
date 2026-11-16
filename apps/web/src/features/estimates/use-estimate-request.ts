'use client';

import { useCallback, useEffect, useRef } from 'react';
import { QueryObserver, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { apiReadOptions, apiResourceFamily, invalidateWorkspaceResources } from '../api/api-read-options';
import { apiRequest, ApiRequestError, type ApiRequestOptions } from '../api/api-request';
import { apiQueryKeys, isApiAccessError, removeDeniedApiQueries, type ApiQueryScope } from '../api/api-query';
import { useApiQueryScope } from '../api/api-query-provider';

type RequestOptions = { method?: ApiRequestOptions<unknown>['method']; body?: string; signal?: AbortSignal | null; fresh?: boolean };
type Command = { path: string; method: NonNullable<RequestOptions['method']>; body: unknown; parse: (raw: unknown) => unknown; failureMessage: string; signal?: AbortSignal };
const affectedResources = ['estimates', 'leads', 'customers', 'jobs', 'work-orders', 'calendar', 'home', 'reports'];
const affectedFamilies = affectedResources.flatMap(apiResourceFamily);

export function estimateReadResource(path: string) {
  const url = new URL(path, 'http://localhost');
  if (url.pathname === '/api/estimates/related') return 'related-estimates';
  if (url.pathname === '/api/estimates/parents') return 'estimate-parents';
  if (url.pathname.startsWith('/api/materials')) return 'materials';
  if (url.pathname.startsWith('/api/leads')) return 'leads';
  if (url.pathname.startsWith('/api/jobs')) return 'jobs';
  const suffix = url.pathname.split('/')[4];
  return ({ lifecycle: 'estimate-history', revisions: 'estimate-revisions', sharing: 'estimate-sharing',
    decision: 'estimate-decision', convert: 'estimate-conversion', 'lead-stage': 'estimate-lead-stage' })[suffix ?? ''] ?? 'estimate-detail';
}

export async function fetchEstimateQuery<T>(
  client: QueryClient, scope: ApiQueryScope, path: string, failureMessage: string,
  options: Pick<RequestOptions, 'fresh' | 'signal'>, parse: (raw: unknown) => T,
): Promise<T> {
  const url = new URL(path, 'http://localhost');
  // Capability links must never be retained in the ordinary server-state cache.
  if (url.pathname.endsWith('/sharing/link')) {
    return apiRequest(path, { parse, failureMessage, signal: options.signal ?? undefined });
  }
  url.searchParams.sort();
  const normalized = `${url.pathname}${url.search}`;
  const read = { ...apiReadOptions(scope, estimateReadResource(path), { url: normalized }, normalized, parse, failureMessage),
    staleTime: options.fresh === false ? 30_000 : 0 };
  try {
    options.signal?.throwIfAborted();
    // Imperative review consumers are active reads, not inactive cache entries.
    const unsubscribe = new QueryObserver(client, read).subscribe(() => {});
    try {
      // A caller's cleanup must not abort a deduplicated read used by another review.
      const result = await client.fetchQuery(read);
      options.signal?.throwIfAborted();
      return result;
    } finally { unsubscribe(); }
  } catch (error) {
    removeDeniedApiQueries(client, read.queryKey, error);
    throw error;
  }
}

/** Cached reads feed local, version-bound reviews; explicit reviews always revalidate. */
export function useEstimateRequest() {
  const client = useQueryClient(), scope = useApiQueryScope(), active = useRef(true);
  const { viewerId, workspaceId } = scope;
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const mutation = useMutation({
    onMutate: () => client.cancelQueries({
      queryKey: apiQueryKeys.workspace({ viewerId, workspaceId }),
      predicate: query => affectedFamilies.includes(String(query.queryKey[4])),
    }),
    mutationFn: (command: Command) => apiRequest(command.path, command),
  });
  const mutate = mutation.mutateAsync;
  return useCallback(async <T,>(path: string, failureMessage: string, options: RequestOptions, parse: (raw: unknown) => T): Promise<T> => {
    const method = options.method ?? 'GET';
    const identity = { viewerId, workspaceId };
    if (method === 'GET') {
      return fetchEstimateQuery(client, identity, path, failureMessage, options, parse);
    }
    const result = await mutate({ path, method, body: options.body ? JSON.parse(options.body) : undefined, parse, failureMessage, signal: options.signal ?? undefined });
    if (!active.current) throw new Error(failureMessage);
    const deleting = method === 'DELETE';
    if (deleting) {
      const base = new URL(path, 'http://localhost').pathname;
      client.removeQueries({ queryKey: apiQueryKeys.workspace(identity), predicate: query => {
        const parameters = query.queryKey[6];
        if (typeof parameters !== 'object' || parameters === null || !('url' in parameters) || typeof parameters.url !== 'string') return false;
        const pathname = new URL(parameters.url, 'http://localhost').pathname;
        return pathname === base || pathname.startsWith(`${base}/`);
      } });
    }
    // Frozen editor/review snapshots are reconciled by their existing explicit reloads.
    // Do not turn a saved command into a failed command if a dependent reload fails.
    await invalidateWorkspaceResources(client, workspaceId, affectedResources, { refetchType: 'none' });
    return parse(result);
  }, [client, mutate, viewerId, workspaceId]);
}

export { ApiRequestError as EstimateLifecycleRequestError };
export { isApiAccessError };
