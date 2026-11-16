'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { isApiAccessError, removeDeniedApiQueries } from './api-query';
import { useApiQueryScope } from './api-query-provider';

export function useApiQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TQueryFnData, Error, TData, TQueryKey>,
) {
  const scope = useApiQueryScope();
  const key = options.queryKey;
  if (key[0] !== 'api' || key[1] !== scope.viewerId ||
    (key[2] !== 'account' && (key[2] !== 'workspace' || key[3] !== scope.workspaceId))) {
    throw new Error('API query key does not match the current viewer and workspace.');
  }
  const client = useQueryClient();
  const result = useQuery(options);
  useEffect(() => {
    const data = options.initialData, timestamp = options.initialDataUpdatedAt;
    if (data === undefined || typeof data === 'function' || typeof timestamp !== 'number') return;
    if ((client.getQueryState(key)?.dataUpdatedAt ?? 0) < timestamp) client.setQueryData<TQueryFnData>(key, data, { updatedAt: timestamp });
  }, [client, key, options.initialData, options.initialDataUpdatedAt]);
  useEffect(() => {
    removeDeniedApiQueries(client, key, result.error);
  }, [client, key, result.error]);
  // A failed authorization recheck must not leave the previous successful response visible.
  return isApiAccessError(result.error) ? { ...result, data: undefined } : result;
}
