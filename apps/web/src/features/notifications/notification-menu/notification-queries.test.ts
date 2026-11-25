import { afterEach, describe, expect, it, vi } from 'vitest';
import { InfiniteQueryObserver, MutationObserver } from '@tanstack/react-query';
import { createApiQueryClient, retainApiQueryScope } from '../../api/api-query';
import { ApiContractError, ApiRequestError } from '../../api/api-request';
import { markNotificationReadOptions, notificationItems, notificationQueryOptions } from './notification-queries';
import { notificationFixture as first, olderNotificationFixture as older, notificationScope as scope } from './notification-queries.fixtures';

afterEach(() => vi.unstubAllGlobals());

describe('notification queries', () => {
  it('deduplicates fresh reads and isolates viewers and workspaces', async () => {
    const fetch = vi.fn(async () => Response.json(first));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const read = (identity = scope) => client.fetchInfiniteQuery(notificationQueryOptions(identity));
    await Promise.all([read(), read()]);
    await read();
    expect(fetch).toHaveBeenCalledTimes(1);
    await read({ ...scope, viewerId: 'another-viewer' });
    await read({ ...scope, workspaceId: 'another-workspace' });
    expect(fetch).toHaveBeenCalledTimes(3);
    client.clear();
  });
  it('removes a confirmed read notice and refills pages from the unread feed', async () => {
    let marked = false;
    const fetch = vi.fn(async (path: string) => {
      if (path === '/api/notifications/read') {
        marked = true;
        return Response.json({ ok: true });
      }
      const page = path.endsWith('page=2') ? 2 : 1;
      const items = marked ? older.items : [...first.items, ...older.items];
      return Response.json({ items: items.slice(page - 1, page), unreadCount: items.length, page, hasMore: page < items.length });
    });
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const observer = new InfiniteQueryObserver(client, notificationQueryOptions(scope));
    const unsubscribe = observer.subscribe(() => {});
    await observer.refetch();
    await observer.fetchNextPage();
    expect(observer.getCurrentResult().hasNextPage).toBe(false);
    expect(notificationItems(observer.getCurrentResult().data!.pages)).toHaveLength(2);
    expect(notificationItems([first, { ...older, items: [...first.items, ...older.items] }])).toHaveLength(2);
    const mutation = new MutationObserver(client, markNotificationReadOptions(client, scope));
    await mutation.mutate(first.items[0].id);
    expect(fetch.mock.calls.map(([path]) => path)).toEqual([
      `/api/notifications?workspace=${scope.workspaceId}&page=1`,
      `/api/notifications?workspace=${scope.workspaceId}&page=2`,
      '/api/notifications/read',
      `/api/notifications?workspace=${scope.workspaceId}&page=1`,
    ]);
    expect(observer.getCurrentResult().data!.pages[0].unreadCount).toBe(1);
    expect(notificationItems(observer.getCurrentResult().data!.pages)).toEqual(older.items);
    unsubscribe(); client.clear();
  });
  it.each([{}, { ...first, page: 2 }])('does not cache malformed or mismatched response pages', async raw => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(raw)));
    const client = createApiQueryClient({ testing: true });
    const options = notificationQueryOptions(scope);
    await expect(client.fetchInfiniteQuery(options)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('cancels the query-owned request when the workspace changes', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_path, init: RequestInit) => {
      requestSignal = init.signal ?? undefined;
      return new Promise<Response>(() => {});
    }));
    const client = createApiQueryClient({ testing: true });
    const options = notificationQueryOptions(scope);
    const pending = client.fetchInfiniteQuery(options).catch(error => error);
    retainApiQueryScope(client, { ...scope, workspaceId: 'another-workspace' });
    await pending;
    expect(requestSignal?.aborted).toBe(true);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('surfaces write denial without retrying, changing cached data, or refetching denied reads', async () => {
    const fetch = vi.fn<(path: string, init?: RequestInit) => Promise<Response>>(async () => Response.json({ error: 'Access ended.' }, { status: 403 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const options = notificationQueryOptions(scope);
    client.setQueryData(options.queryKey, { pages: [first], pageParams: [1] });
    const observer = new InfiniteQueryObserver(client, options), unsubscribe = observer.subscribe(() => {});
    const mutation = new MutationObserver(client, markNotificationReadOptions(client, scope));
    await expect(mutation.mutate(first.items[0].id)).rejects.toBeInstanceOf(ApiRequestError);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({ workspaceId: scope.workspaceId, id: first.items[0].id });
    expect(observer.getCurrentResult().data!.pages[0]).toEqual(first);
    unsubscribe(); client.clear();
  });
  it('does not invalidate notifications in another viewer or workspace', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ok: true })));
    const client = createApiQueryClient({ testing: true });
    const scopes = [scope, { ...scope, viewerId: 'another-viewer' }, { ...scope, workspaceId: 'another-workspace' }];
    for (const identity of scopes) client.setQueryData(notificationQueryOptions(identity).queryKey, { pages: [first], pageParams: [1] });
    const mutation = new MutationObserver(client, markNotificationReadOptions(client, scope));
    await mutation.mutate(first.items[0].id);
    expect(scopes.map(identity => client.getQueryState(notificationQueryOptions(identity).queryKey)?.isInvalidated)).toEqual([true, false, false]);
    client.clear();
  });
  it('keeps the existing polling interval, foreground focus refresh, and API page limit', () => {
    const options = notificationQueryOptions(scope);
    expect(options.refetchInterval).toBe(15_000);
    expect(options.refetchOnWindowFocus).toBe('always');
    expect(options.getNextPageParam!({ ...first, page: 50 }, [], 50, [])).toBeUndefined();
  });
});

it('filters already-read cached notices out of the displayed items', () => {
  expect(notificationItems([{ ...first, items: first.items.map(item => ({ ...item, read: true })) }])).toEqual([]);
});
