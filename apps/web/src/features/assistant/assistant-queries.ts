import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { chatActionResponseSchema, chatHistoryResponseSchema } from '@salesmora/contracts';
import { apiReadOptions } from '../api/api-read-options';
import { apiQueryKeys, type ApiQueryScope } from '../api/api-query';
import { apiRequest } from '../api/api-request';
import { connectedAssistantData as copy } from './connected-assistant/connected-assistant.data';

export function assistantHistoryOptions(scope: ApiQueryScope, threadId: string) {
  const path = `/api/chat/threads?workspace=${encodeURIComponent(scope.workspaceId)}&thread=${encodeURIComponent(threadId)}`;
  return {
    ...apiReadOptions(scope, 'assistant-history', { threadId }, path, raw => {
      const history = chatHistoryResponseSchema.parse(raw);
      if (history.threadId !== threadId) throw new Error(copy.unavailable);
      return history;
    }, copy.unavailable),
    staleTime: 0,
    retry: false,
  };
}

export function assistantCancelOptions() {
  return mutationOptions({
    retry: false,
    networkMode: 'always',
    mutationFn: (body: { workspaceId: string; turnId: string }) => apiRequest('/api/chat/cancel', {
      method: 'POST', body, failureMessage: copy.interrupted,
      parse: raw => {
        if (!raw || typeof raw !== 'object' || !('cancelled' in raw) || raw.cancelled !== true) throw new Error(copy.interrupted);
        return { cancelled: true };
      },
    }),
  });
}

export function assistantLeadNavigationOptions() {
  return mutationOptions({
    retry: false,
    networkMode: 'always',
    mutationFn: (body: { workspaceId: string; resultId: string; leadId?: string }) => apiRequest('/api/chat/leads/navigation', {
      method: 'POST', body, failureMessage: copy.unavailable,
      parse: raw => {
        if (!raw || typeof raw !== 'object' || !('href' in raw) || typeof raw.href !== 'string' ||
          !/^\/leads(?:\/[0-9a-f-]{36})?\?/.test(raw.href)) throw new Error(copy.unavailable);
        const url = new URL(raw.href, 'http://assistant.local');
        if (url.searchParams.get('workspace') !== body.workspaceId || url.hash) throw new Error(copy.unavailable);
        return { href: raw.href };
      },
    }),
  });
}

export type AssistantLeadCommand = {
  path: '/api/chat/actions' | '/api/chat/deletions';
  body: { workspaceId: string; draftId: string; inputHash: string; decision: 'confirm' | 'cancel'; typedConfirmation?: string };
};
export function assistantLeadActionOptions(client: QueryClient, scope: ApiQueryScope) {
  return mutationOptions({
    retry: false,
    networkMode: 'always',
    mutationFn: ({ path, body }: AssistantLeadCommand) => apiRequest(path, {
      method: 'POST', body, failureMessage: copy.decisionInterrupted,
      parse: raw => {
        const result = chatActionResponseSchema.parse(raw);
        if (result.action.id !== body.draftId || result.action.inputHash !== body.inputHash) throw new Error(copy.decisionInterrupted);
        return result;
      },
    }),
    onSuccess: async (_result, { body }) => {
      if (body.decision !== 'confirm') return;
      const queryKey = apiQueryKeys.resource(scope, 'assistant-history');
      await client.cancelQueries({ queryKey });
      client.removeQueries({ queryKey });
    },
  });
}
