'use client';
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiViewerId } from '../api/api-query-provider';
import { assistantResultMutationOptions, readAssistantResult } from './assistant-result-queries';

export function useAssistantResultRequest<T>(workspaceId: string, resource: string, failureMessage: string, binding = '') {
  const viewerId = useApiViewerId(), client = useQueryClient();
  const scope = useMemo(() => ({ viewerId, workspaceId }), [viewerId, workspaceId]);
  const { mutateAsync, reset } = useMutation(assistantResultMutationOptions<T>(client, scope, resource, failureMessage));
  return useMemo(() => ({
    read: <U,>(path: string, parse: (raw: unknown) => U, signal: AbortSignal) =>
      readAssistantResult(client, scope, resource, path, parse, failureMessage, signal, binding),
    write: async (path: string, body: unknown, parse: (raw: unknown) => T, signal: AbortSignal, changes = false) => {
      try { return await mutateAsync({ path, body, parse, signal, changes }); }
      finally { reset(); }
    },
  }), [client, scope, resource, failureMessage, binding, mutateAsync, reset]);
}
