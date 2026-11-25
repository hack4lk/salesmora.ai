import { infiniteQueryOptions, mutationOptions, type QueryClient, type InfiniteData } from '@tanstack/react-query';
import { markNotificationReadResultSchema, notificationResultSchema, type NotificationResult } from '@salesmora/contracts';
import { apiQueryKeys, isApiAccessError, type ApiQueryScope } from '../../api/api-query';
import { apiRequest } from '../../api/api-request';
import { notificationMenuData as copy } from './notification-menu.data';

export function notificationQueryOptions(scope: ApiQueryScope) {
  return infiniteQueryOptions({
    queryKey: apiQueryKeys.list(scope, 'notifications', { pagination: 'infinite' }),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => apiRequest(
      `/api/notifications?workspace=${encodeURIComponent(scope.workspaceId)}&page=${pageParam}`,
      {
        signal, failureMessage: copy.loadError,
        parse: raw => notificationResultSchema.refine(result => result.page === pageParam, {
          message: 'Notification response page does not match the requested page.',
        }).parse(raw),
      },
    ),
    getNextPageParam: (last: NotificationResult) => last.hasMore && last.page < 50 ? last.page + 1 : undefined,
    refetchInterval: 15_000,
    refetchOnWindowFocus: 'always',
  });
}

export function markNotificationReadOptions(client: QueryClient, scope: ApiQueryScope) {
  const queryKey = apiQueryKeys.resource(scope, 'notifications');
  return mutationOptions({
    onMutate: () => client.cancelQueries({ queryKey }),
    mutationFn: (id: string) => apiRequest('/api/notifications/read', {
      method: 'POST', body: { workspaceId: scope.workspaceId, id },
      parse: raw => markNotificationReadResultSchema.parse(raw), failureMessage: copy.actionError,
    }),
    onSuccess: (_data, id) => client.setQueriesData<InfiniteData<NotificationResult>>({ queryKey }, data => {
      if (!data) return data;
      const removedUnread = data.pages.some(page => page.items.some(item => item.id === id && !item.read));
      return { ...data, pages: data.pages.map(page => ({ ...page,
        items: page.items.filter(item => item.id !== id),
        unreadCount: Math.max(0, page.unreadCount - Number(removedUnread)),
      })) };
    }),
    // Refetch failures are shown by the read query; preserve the original write error.
    onSettled: (_data, error) => client.invalidateQueries({
      queryKey, refetchType: isApiAccessError(error) ? 'none' : 'active',
    }),
  });
}

export function notificationItems(pages: readonly NotificationResult[]) {
  return [...new Map(pages.flatMap(page => page.items).filter(item => !item.read).map(item => [item.id, item])).values()];
}
