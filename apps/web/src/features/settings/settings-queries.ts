import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { apiReadOptions, invalidateWorkspaceResources } from '../api/api-read-options';
import { apiQueryKeys, type ApiQueryScope } from '../api/api-query';
import { apiRequest, type ApiRequestOptions } from '../api/api-request';

export type SettingsResource = 'service-settings' | 'lead-settings' | 'job-notification-settings' | 'estimate-settings' |
  'work-order-settings' | 'notification-preferences' | 'permissions' | 'ai-usage';

export function settingsReadOptions<T>(scope: ApiQueryScope, resource: SettingsResource, path: string, parse: (raw: unknown) => T, failureMessage: string) {
  return {
    ...apiReadOptions(scope, resource, { path }, path, parse, failureMessage),
    ...(resource === 'ai-usage' ? {
      retry: false,
      queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]), parse, failureMessage,
      }),
    } : {}),
    staleTime: 0,
  };
}

const dependents: Record<SettingsResource, readonly string[]> = {
  'service-settings': ['service-choices','jobs','job-creation-deadline','leads','intake','capture','workflows','workflow-booking-options','estimates','calendar','reports'],
  'lead-settings': ['leads', 'intake', 'home'],
  'job-notification-settings': ['jobs', 'calendar', 'home'],
  'estimate-settings': ['estimates'],
  'work-order-settings': ['work-orders'],
  'notification-preferences': [],
  permissions: [],
  'ai-usage': [],
};
export type SettingsCommand<T = unknown> = {
  path: string; method: NonNullable<ApiRequestOptions<unknown>['method']>; body: unknown;
  parse: (raw: unknown) => T; failureMessage: string;
};
export function settingsMutationOptions<T = unknown>(client: QueryClient, scope: ApiQueryScope, resource: SettingsResource) {
  const queryKey = apiQueryKeys.resource(scope, resource);
  return mutationOptions({
    onMutate: () => client.cancelQueries({ queryKey }),
    mutationFn: (command: SettingsCommand<T>) => apiRequest(command.path, command),
    onSuccess: async () => {
      // Reviewed settings drafts only reconcile after an explicit save or reload.
      if (resource === 'permissions') {
        await client.cancelQueries({ queryKey: apiQueryKeys.workspace(scope) });
        client.removeQueries({ queryKey: apiQueryKeys.workspace(scope), type: 'inactive' });
        await client.invalidateQueries({ queryKey: apiQueryKeys.workspace(scope), refetchType: 'none' });
      } else if (resource === 'notification-preferences') {
        await client.invalidateQueries({
          predicate: query => query.queryKey[0] === 'api' && query.queryKey[1] === scope.viewerId &&
            query.queryKey[4] === resource, refetchType: 'none',
        });
      } else {
        await invalidateWorkspaceResources(client, scope.workspaceId, [resource, ...dependents[resource]], { refetchType: 'none' });
      }
    },
  });
}
