import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver } from '@tanstack/react-query';
import { apiQueryKeys, createApiQueryClient, retainApiQueryScope } from '../api/api-query';
import { ApiContractError } from '../api/api-request';
import { assistantResultMutationOptions, assistantResultOptions, readAssistantResult } from './assistant-result-queries';
import { assistantScope as scope } from './assistant-queries.fixtures';

const resource = 'assistant-calendar-proposal', path = '/api/chat/calendar/proposals?proposalId=reviewed';
const parse = (raw: unknown) => {
  if (!raw || typeof raw !== 'object' || !('id' in raw) || raw.id !== 'reviewed') throw Error('Wrong ticket.');
  return { id: raw.id };
};
const read = (client: ReturnType<typeof createApiQueryClient>, signal = new AbortController().signal) =>
  readAssistantResult(client, scope, resource, path, parse, 'Unavailable.', signal);
afterEach(() => vi.unstubAllGlobals());

describe('assistant result reads', () => {
  it('isolates viewer, workspace, resource, URL and reviewed binding', () => {
    const options = (overrides = scope, name = resource, url = path, binding = '') =>
      assistantResultOptions(overrides, name, url, parse, 'Unavailable.', binding);
    const key = options().queryKey;
    for (const other of [
      options({ ...scope, viewerId: 'other' }), options({ ...scope, workspaceId: 'other' }),
      options(scope, 'report'), options(scope, resource, '/other'), options(scope, resource, path, 'new-retrievedAt'),
    ]) expect(other.queryKey).not.toEqual(key);
  });
  it('deduplicates concurrent rechecks but always requests fresh authorization afterward', async () => {
    const fetch = vi.fn(async () => Response.json({ id: 'reviewed' }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    await expect(Promise.all([read(client), read(client)])).resolves.toEqual([{ id: 'reviewed' }, { id: 'reviewed' }]);
    expect(fetch).toHaveBeenCalledTimes(1);
    await read(client);
    expect(fetch).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it('rejects mismatched tickets before caching them', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ id: 'unreviewed' })));
    const client = createApiQueryClient({ testing: true });
    await expect(read(client)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(assistantResultOptions(scope, resource, path, parse, 'Unavailable.').queryKey)).toBeUndefined();
    client.clear();
  });
  it('does not abort another subscriber when one card unmounts', async () => {
    let finish!: (response: Response) => void;
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>((_url, init) => {
      signal = init?.signal ?? undefined;
      return new Promise(resolve => { finish = resolve; });
    }));
    const client = createApiQueryClient({ testing: true }), controller = new AbortController();
    const first = read(client, controller.signal).catch(error => error);
    const second = read(client);
    controller.abort();
    expect(signal?.aborted).toBe(false);
    finish(Response.json({ id: 'reviewed' }));
    await expect(second).resolves.toEqual({ id: 'reviewed' });
    expect(await first).toMatchObject({ name: 'AbortError' });
    client.clear();
  });
  it('aborts the transport when the last card unmounts', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>((_url, init) => {
      signal = init?.signal ?? undefined;
      return new Promise(() => {});
    }));
    const client = createApiQueryClient({ testing: true }), controller = new AbortController();
    const pending = read(client, controller.signal).catch(error => error);
    controller.abort();
    await pending;
    expect(signal?.aborted).toBe(true);
    client.clear();
  });
  it('cancels old workspace work without a late cache write', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>((_url, init) => {
      signal = init?.signal ?? undefined;
      return new Promise(() => {});
    }));
    const client = createApiQueryClient({ testing: true }), pending = read(client).catch(error => error);
    retainApiQueryScope(client, { ...scope, workspaceId: 'other' });
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    client.clear();
  });
  it.each([403, 409, 503])('surfaces HTTP %s without polling-level retries', async status => {
    const fetch = vi.fn(async () => Response.json({ error: 'unavailable' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient();
    const key = apiQueryKeys.resource(scope, 'calendar');
    client.setQueryData(key, { protected: true });
    await expect(read(client)).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(1);
    if (status === 403) expect(client.getQueryData(key)).toBeUndefined();
    client.clear();
  });
});

describe('assistant result commands', () => {
  const command = {
    path: '/api/chat/calendar/proposals',
    body: { workspaceId: scope.workspaceId, proposalId: 'reviewed', inputHash: 'hash', visitId: 'visit', revision: 'revision', decision: 'confirm' },
    parse, signal: new AbortController().signal, changes: true,
  };
  it('preserves exact reviewed command identity and evicts only originating proposal reads', async () => {
    const fetch = vi.fn(async () => Response.json({ id: 'reviewed' }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), key = apiQueryKeys.resource(scope, resource);
    const other = apiQueryKeys.resource({ ...scope, workspaceId: 'other' }, resource);
    const calendar = apiQueryKeys.resource(scope, 'calendar');
    for (const k of [key, other, calendar]) client.setQueryData(k, {});
    const observer = new MutationObserver(client, assistantResultMutationOptions<ReturnType<typeof parse>>(client, scope, resource, 'Unavailable.'));
    await expect(observer.mutate(command)).resolves.toEqual({ id: 'reviewed' });
    expect(fetch.mock.calls[0]).toMatchObject([command.path, { method: 'POST', body: JSON.stringify(command.body), signal: command.signal }]);
    expect(client.getQueryData(key)).toBeUndefined();
    expect(client.getQueryData(other)).toEqual({});
    expect(client.getQueryData(calendar)).toEqual({});
    client.clear();
  });
  it.each([403, 409, 503])('never retries HTTP %s decisions or navigation', async status => {
    const fetch = vi.fn(async () => Response.json({ error: 'unavailable' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), observer = new MutationObserver(client, assistantResultMutationOptions<ReturnType<typeof parse>>(client, scope, resource, 'Unavailable.'));
    await expect(observer.mutate(command)).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(1);
    client.clear();
  });
  it('rejects mismatched receipts and leaves reviewed data unmodified', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ id: 'wrong' })));
    const client = createApiQueryClient({ testing: true }), key = apiQueryKeys.resource(scope, resource);
    client.setQueryData(key, { reviewed: true });
    const observer = new MutationObserver(client, assistantResultMutationOptions<ReturnType<typeof parse>>(client, scope, resource, 'Unavailable.'));
    await expect(observer.mutate(command)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(key)).toEqual({ reviewed: true });
    client.clear();
  });
});
