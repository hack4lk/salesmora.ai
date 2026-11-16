'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiViewerId } from '../../api/api-query-provider';
import type { apiRequest, ApiRequestOptions } from '../../api/api-request';
import { estimateAssistantRequest } from './estimate-assistant-queries';

export function useEstimateAssistantRequest(workspaceId: string, binding = ''): typeof apiRequest {
  const viewerId = useApiViewerId(), client = useQueryClient();
  const controllers = useRef(new Set<AbortController>());
  useEffect(() => {
    const active = controllers.current;
    return () => { for (const controller of active) controller.abort(); };
  }, [workspaceId, viewerId]);
  return useMemo(() => async <T,>(path: string, options: ApiRequestOptions<T>) => {
    const scope = { viewerId, workspaceId }, controller = new AbortController();
    controllers.current.add(controller);
    const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
    try {
      return await estimateAssistantRequest(client, scope, binding, path, options, signal);
    } finally { controllers.current.delete(controller); }
  }, [client, viewerId, workspaceId, binding]);
}
