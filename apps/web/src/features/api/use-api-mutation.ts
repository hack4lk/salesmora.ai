'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { apiRequest, type ApiRequestOptions } from './api-request';
import { apiQueryKeys } from './api-query';
import { useApiQueryScope } from './api-query-provider';
import { apiResourceFamily } from './api-read-options';

export function useApiMutation<T>(resource: string, parse: (raw: unknown) => T, failureMessage: string) {
  const active = useRef(true);
  const client = useQueryClient(), scope = useApiQueryScope();
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  return useMutation({
    onMutate: () => client.cancelQueries({
      queryKey: apiQueryKeys.workspace(scope),
      predicate: query => apiResourceFamily(resource).includes(String(query.queryKey[4])),
    }),
    mutationFn: async (request: { path: string; method: NonNullable<ApiRequestOptions<T>['method']>; body: unknown; signal?: AbortSignal }) => {
      const result = await apiRequest(request.path, { method: request.method, body: request.body, signal: request.signal, parse, failureMessage });
      if (!active.current) throw new Error(failureMessage);
      return result;
    },
  });
}
