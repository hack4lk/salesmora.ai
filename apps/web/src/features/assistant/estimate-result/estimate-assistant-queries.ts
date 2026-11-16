import type { QueryClient } from '@tanstack/react-query';
import { apiQueryKeys, type ApiQueryScope } from '../../api/api-query';
import type { ApiRequestOptions } from '../../api/api-request';
import { assistantResultMutationOptions, readAssistantResult } from '../assistant-result-queries';

export async function estimateAssistantRequest<T>(
  client: QueryClient, scope: ApiQueryScope, binding: string, path: string, options: ApiRequestOptions<T>, signal: AbortSignal,
) {
  const resource = 'assistant-estimate-result';
  if (!options.method || options.method === 'GET') {
    return readAssistantResult(client, scope, resource, path, options.parse, options.failureMessage, signal, binding);
  }
  if (options.method !== 'POST' && options.method !== 'PATCH') throw Error(options.failureMessage);
  const body = options.body;
  const changes = options.method === 'PATCH' || !!body && typeof body === 'object' &&
    'decision' in body && (body.decision === 'confirm' || body.decision === 'cancel');
  const mutation = client.getMutationCache().build(client,
    assistantResultMutationOptions<T>(client, scope, resource, options.failureMessage));
  try {
    const result = await mutation.execute({
      path, body, parse: options.parse, signal, method: options.method, changes,
    });
    if (changes) {
      const queryKey = apiQueryKeys.resource(scope, 'assistant-history');
      await client.cancelQueries({ queryKey });
      client.removeQueries({ queryKey });
    }
    return result;
  } finally { client.getMutationCache().remove(mutation); }
}
