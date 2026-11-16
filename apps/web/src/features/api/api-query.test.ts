import { afterEach, describe, expect, it, vi } from 'vitest';
import { onlineManager } from '@tanstack/react-query';
import { apiQueryKeys, createApiQueryClient, removeDeniedApiQueries, removeOtherWorkspaceQueries, retainApiQueryScope, retryApiQuery } from './api-query';
import { ApiContractError, ApiRequestError, ApiTransportError } from './api-request';

const scope = { viewerId: 'viewer-a', workspaceId: 'workspace-a' };
const clients: ReturnType<typeof createApiQueryClient>[] = [];
function client() {
  const instance = createApiQueryClient({ testing: true });
  clients.push(instance);
  return instance;
}
afterEach(() => {
  for (const instance of clients) instance.clear();
  clients.length = 0;
  vi.useRealTimers();
});

describe('API query foundation', () => {
  it('includes viewer, workspace, resource, and every list filter in keys', () => {
    const filters = { page: 2, owners: ['one'], sort: 'oldest' };
    expect(apiQueryKeys.list(scope, 'leads', filters)).toEqual(['api', 'viewer-a', 'workspace', 'workspace-a', 'leads', 'list', filters]);
    expect(apiQueryKeys.detail(scope, 'leads', 'lead-a')).toEqual(['api', 'viewer-a', 'workspace', 'workspace-a', 'leads', 'detail', 'lead-a']);
    expect(apiQueryKeys.account('viewer-a', 'notifications')).toEqual(['api', 'viewer-a', 'account', 'notifications']);
  });

  it('reuses fresh data and isolates clients rather than sharing an SSR singleton', async () => {
    const first = client(), second = client(), key = apiQueryKeys.detail(scope, 'leads', 'lead-a');
    let reads = 0;
    const queryFn = async () => ++reads;
    expect(await first.fetchQuery({ queryKey: key, queryFn })).toBe(1);
    expect(await first.fetchQuery({ queryKey: key, queryFn })).toBe(1);
    expect(await second.fetchQuery({ queryKey: key, queryFn })).toBe(2);
  });

  it('refetches at the exact 30-second freshness boundary', async () => {
    vi.useFakeTimers();
    const now = Date.now();
    const instance = client(), key = apiQueryKeys.resource(scope, 'leads');
    let reads = 0;
    const queryFn = async () => ++reads;
    expect(await instance.fetchQuery({ queryKey: key, queryFn })).toBe(1);
    vi.setSystemTime(now + 29_999);
    expect(await instance.fetchQuery({ queryKey: key, queryFn })).toBe(1);
    vi.setSystemTime(now + 30_000);
    expect(await instance.fetchQuery({ queryKey: key, queryFn })).toBe(2);
  });

  it('collects an unused query at the exact five-minute retention boundary', async () => {
    vi.useFakeTimers();
    const instance = client(), key = apiQueryKeys.resource(scope, 'leads');
    await instance.fetchQuery({ queryKey: key, queryFn: async () => 'cached' });
    await vi.advanceTimersByTimeAsync(299_999);
    expect(instance.getQueryData(key)).toBe('cached');
    await vi.advanceTimersByTimeAsync(1);
    expect(instance.getQueryData(key)).toBeUndefined();
  });

  it('deduplicates concurrent reads and clears in-flight data on sign-out', async () => {
    const instance = client(), key = apiQueryKeys.detail(scope, 'leads', 'lead-a');
    let reads = 0, aborted = false;
    const queryFn = ({ signal }: { signal: AbortSignal }) => {
      reads++;
      signal.addEventListener('abort', () => { aborted = true; });
      return new Promise<string>(() => {});
    };
    const first = instance.fetchQuery({ queryKey: key, queryFn }).catch(error => error);
    const second = instance.fetchQuery({ queryKey: key, queryFn }).catch(error => error);
    expect(reads).toBe(1);
    instance.clear();
    await Promise.all([first, second]);
    expect(aborted).toBe(true);
    expect(instance.getQueryCache().getAll()).toHaveLength(0);
  });

  it('evicts another identity/workspace but keeps current workspace and account data', () => {
    const instance = client(), current = apiQueryKeys.resource(scope, 'leads');
    instance.setQueryData(current, 'current');
    instance.setQueryData(apiQueryKeys.resource({ ...scope, workspaceId: 'workspace-b' }, 'leads'), 'other workspace');
    instance.setQueryData(apiQueryKeys.resource({ ...scope, viewerId: 'viewer-b' }, 'leads'), 'other viewer');
    instance.setQueryData(apiQueryKeys.account(scope.viewerId, 'settings'), 'account');
    retainApiQueryScope(instance, scope);
    expect(instance.getQueryCache().getAll()).toHaveLength(2);
    expect(instance.getQueryData(current)).toBe('current');
    expect(instance.getQueryData(apiQueryKeys.account(scope.viewerId, 'settings'))).toBe('account');
  });

  it('removes pending reads when switching workspaces and rejects late cache writes', async () => {
    const instance = client(), key = apiQueryKeys.resource(scope, 'leads');
    let resolve: (value: string) => void = () => { throw new Error('Read not started'); };
    const pending = instance.fetchQuery({
      queryKey: key,
      queryFn: () => new Promise<string>(done => { resolve = done; }),
    }).catch(error => error);
    removeOtherWorkspaceQueries(instance, 'workspace-b');
    resolve('old workspace data');
    await pending;
    expect(instance.getQueryData(key)).toBeUndefined();
  });

  it('evicts inactive workspace data after denial and all viewer data after session loss', () => {
    const instance = client(), key = apiQueryKeys.detail(scope, 'leads', 'one');
    instance.setQueryData(key, 'lead');
    instance.setQueryData(apiQueryKeys.resource(scope, 'home'), 'home');
    instance.setQueryData(apiQueryKeys.account(scope.viewerId, 'settings'), 'account');
    removeDeniedApiQueries(instance, key, new ApiRequestError('Denied', 403, {}));
    expect(instance.getQueryCache().getAll()).toHaveLength(1);
    removeDeniedApiQueries(instance, key, new ApiRequestError('Sign in', 401, {}));
    expect(instance.getQueryCache().getAll()).toHaveLength(0);
  });

  it('retries only transport/gateway read failures, at most twice', () => {
    for (const error of [new ApiTransportError('Offline', new Error()), ...[502, 503, 504].map(status => new ApiRequestError('Unavailable', status, {}))]) {
      expect(retryApiQuery(0, error)).toBe(true);
      expect(retryApiQuery(1, error)).toBe(true);
      expect(retryApiQuery(2, error)).toBe(false);
    }
    for (const status of [400, 401, 403, 404, 409, 422, 423, 429, 500]) {
      expect(retryApiQuery(0, new ApiRequestError('Failed', status, {}))).toBe(false);
    }
    expect(retryApiQuery(0, new ApiContractError('Bad data', new Error()))).toBe(false);
    expect(retryApiQuery(0, new Error('AbortError'))).toBe(false);
  });

  it('never retries or queues offline mutations and makes Storybook deterministic', async () => {
    const instance = client();
    let writes = 0;
    const mutation = instance.getMutationCache().build(instance, { mutationFn: async () => { writes++; throw new ApiTransportError('Offline', new Error()); } });
    const wasOnline = onlineManager.isOnline();
    onlineManager.setOnline(false);
    try {
      await expect(mutation.execute(undefined)).rejects.toThrow('Offline');
    } finally {
      onlineManager.setOnline(wasOnline);
    }
    expect(writes).toBe(1);
    expect(instance.getDefaultOptions().mutations).toEqual({ retry: false, networkMode: 'always' });
    expect(instance.getDefaultOptions().queries).toMatchObject({ retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false, staleTime: 30_000 });
    expect(createApiQueryClient().getDefaultOptions().queries).toMatchObject({ retry: retryApiQuery, refetchOnWindowFocus: true, refetchOnReconnect: true });
  });
});
