import { QueryObserver, mutationOptions, type QueryClient } from '@tanstack/react-query';
import { apiReadOptions } from '../api/api-read-options';
import { apiQueryKeys, removeDeniedApiQueries, type ApiQueryScope } from '../api/api-query';
import { apiRequest } from '../api/api-request';

export function assistantResultOptions<T>(scope: ApiQueryScope, resource: string, path: string, parse: (raw: unknown) => T, failureMessage: string, binding = '') {
  return {
    ...apiReadOptions(scope, resource, { path, binding }, path, parse, failureMessage),
    staleTime: 0, gcTime: 0, retry: false,
  };
}

export async function readAssistantResult<T>(
  client: QueryClient, scope: ApiQueryScope, resource: string, path: string,
  parse: (raw: unknown) => T, failureMessage: string, signal: AbortSignal, binding = '',
) {
  signal.throwIfAborted();
  const options = assistantResultOptions(scope, resource, path, parse, failureMessage, binding);
  const observer = new QueryObserver(client, { ...options, enabled: false });
  const unsubscribe = observer.subscribe(() => {});
  const abort = () => unsubscribe();
  signal.addEventListener('abort', abort, { once: true });
  try {
    const result = await observer.refetch({ throwOnError: true, cancelRefetch: false });
    signal.throwIfAborted();
    if (result.data === undefined) throw new Error(failureMessage);
    return result.data;
  } catch (error) {
    removeDeniedApiQueries(client, options.queryKey, error);
    throw error;
  } finally {
    signal.removeEventListener('abort', abort);
    unsubscribe();
  }
}

export type AssistantResultCommand<T> = {
  path: string; body: unknown; parse: (raw: unknown) => T; signal: AbortSignal; changes?: boolean;
  method?: 'POST' | 'PATCH';
};
export function assistantResultMutationOptions<T>(client: QueryClient, scope: ApiQueryScope, resource: string, failureMessage: string) {
  return mutationOptions({
    retry: false, networkMode: 'always', gcTime: 0,
    mutationFn: (command: AssistantResultCommand<T>) => apiRequest(command.path, {
      method: command.method ?? 'POST', body: command.body, signal: command.signal, parse: command.parse, failureMessage,
    }),
    onError: error => { removeDeniedApiQueries(client, apiQueryKeys.resource(scope, resource), error); },
    onSuccess: async (_result, command) => {
      if (!command.changes) return;
      const queryKey = apiQueryKeys.resource(scope, resource);
      await client.cancelQueries({ queryKey });
      client.removeQueries({ queryKey });
    },
  });
}
