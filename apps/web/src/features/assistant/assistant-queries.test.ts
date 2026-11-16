import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver } from '@tanstack/react-query';
import { apiQueryKeys, createApiQueryClient, retainApiQueryScope } from '../api/api-query';
import { ApiContractError } from '../api/api-request';
import { assistantCancelOptions, assistantHistoryOptions, assistantLeadActionOptions, assistantLeadNavigationOptions } from './assistant-queries';
import { assistantHistoryFixture, assistantNoteFixture, assistantScope as scope, assistantThreadId, assistantTurnId } from './assistant-queries.fixtures';

afterEach(() => vi.unstubAllGlobals());
describe('assistant session queries', () => {
  it('deduplicates concurrent reauthorization but always rechecks subsequent history reads', async () => {
    const fetch = vi.fn(async () => Response.json(assistantHistoryFixture));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), options = assistantHistoryOptions(scope, assistantThreadId);
    const [first, second] = await Promise.all([client.fetchQuery(options), client.fetchQuery(options)]);
    expect(first).toEqual(assistantHistoryFixture);
    expect(second).toEqual(first);
    expect(fetch).toHaveBeenCalledTimes(1);
    await client.fetchQuery(options);
    expect(fetch).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it('isolates history by viewer, workspace and thread', () => {
    const key = assistantHistoryOptions(scope, assistantThreadId).queryKey;
    expect(key).not.toEqual(assistantHistoryOptions({ ...scope, viewerId: 'other' }, assistantThreadId).queryKey);
    expect(key).not.toEqual(assistantHistoryOptions({ ...scope, workspaceId: 'other' }, assistantThreadId).queryKey);
    expect(key).not.toEqual(assistantHistoryOptions(scope, assistantTurnId).queryKey);
  });
  it.each([{}, { ...assistantHistoryFixture, threadId: assistantTurnId }])('rejects malformed or wrong-thread history', async result => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(result)));
    const client = createApiQueryClient({ testing: true });
    await expect(client.fetchQuery(assistantHistoryOptions(scope, assistantThreadId))).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('aborts history on workspace changes without late cache writes', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_path, init: RequestInit) => {
      signal = init.signal ?? undefined;
      return new Promise<Response>(() => {});
    }));
    const client = createApiQueryClient({ testing: true }), options = assistantHistoryOptions(scope, assistantThreadId);
    const pending = client.fetchQuery(options).catch(error => error);
    retainApiQueryScope(client, { ...scope, workspaceId: 'other' });
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('retains the existing polling cadence by not automatically retrying failed history reads', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'Unavailable.' }, { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient();
    await expect(client.fetchQuery(assistantHistoryOptions(scope, assistantThreadId))).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
    client.clear();
  });
});
describe('assistant session commands', () => {
  const command = {
    path: '/api/chat/actions' as const,
    body: { workspaceId: scope.workspaceId, draftId: assistantNoteFixture.id, inputHash: assistantNoteFixture.inputHash, decision: 'confirm' as const },
  };
  it.each([401, 403, 409, 422, 423, 429, 503])('does not retry HTTP %s or change the reviewed proposal on an explicit retry', async status => {
    const fetch = vi.fn(async () => Response.json({ error: 'draft_changed_or_expired' }, { status }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), observer = new MutationObserver(client, assistantLeadActionOptions(client, scope));
    await expect(observer.mutate(command)).rejects.toMatchObject({ status, details: { error: 'draft_changed_or_expired' } });
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(observer.mutate(command)).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(fetch.mock.calls[1]);
    client.clear();
  });
  it('evicts only the originating history after a confirmed write, protecting deleted evidence', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ action: { ...assistantNoteFixture, state: 'confirmed' } })));
    const client = createApiQueryClient({ testing: true });
    const key = assistantHistoryOptions(scope, assistantThreadId).queryKey;
    const other = assistantHistoryOptions({ ...scope, workspaceId: 'other' }, assistantThreadId).queryKey;
    const leads = apiQueryKeys.resource(scope, 'leads');
    for (const k of [key, other, leads]) client.setQueryData(k, {});
    const observer = new MutationObserver(client, assistantLeadActionOptions(client, scope));
    await observer.mutate(command);
    expect(client.getQueryData(key)).toBeUndefined();
    expect(client.getQueryData(other)).toEqual({});
    expect(client.getQueryData(leads)).toEqual({});
    client.clear();
  });
  it('does not replace a reviewed proposal with a mismatched response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ action: { ...assistantNoteFixture, id: assistantTurnId, state: 'confirmed' } })));
    const client = createApiQueryClient({ testing: true });
    const observer = new MutationObserver(client, assistantLeadActionOptions(client, scope));
    await expect(observer.mutate(command)).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('preserves typed deletion confirmation and cancellation payloads exactly', async () => {
    const fetch = vi.fn(async () => Response.json({ action: { ...assistantNoteFixture, state: 'cancelled' } }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), observer = new MutationObserver(client, assistantLeadActionOptions(client, scope));
    const body = { ...command.body, decision: 'cancel' as const, typedConfirmation: 'LD-1048' };
    await observer.mutate({ path: '/api/chat/deletions', body });
    expect(fetch.mock.calls[0]).toMatchObject(['/api/chat/deletions', { body: JSON.stringify(body), method: 'POST' }]);
    client.clear();
  });
  it('requires an acknowledged stop and never retries cancellation automatically', async () => {
    const fetch = vi.fn(async () => Response.json({ cancelled: true }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), observer = new MutationObserver(client, assistantCancelOptions());
    await expect(observer.mutate({ workspaceId: scope.workspaceId, turnId: assistantTurnId })).resolves.toEqual({ cancelled: true });
    fetch.mockResolvedValue(Response.json({ cancelled: false }));
    await expect(observer.mutate({ workspaceId: scope.workspaceId, turnId: assistantTurnId })).rejects.toBeInstanceOf(ApiContractError);
    expect(fetch).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it.each([
    'https://example.test/leads?workspace=other',
    `/leads?workspace=other`,
    `/leads?workspace=${scope.workspaceId}#unreviewed`,
    `/settings?workspace=${scope.workspaceId}`,
  ])('rejects an invalid or cross-workspace lead destination: %s', async href => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ href })));
    const client = createApiQueryClient({ testing: true }), observer = new MutationObserver(client, assistantLeadNavigationOptions());
    await expect(observer.mutate({ workspaceId: scope.workspaceId, resultId: assistantNoteFixture.id })).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('accepts a server-authorized same-workspace lead destination', async () => {
    const href = `/leads/${assistantNoteFixture.lead.id}?workspace=${scope.workspaceId}`;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ href })));
    const client = createApiQueryClient({ testing: true }), observer = new MutationObserver(client, assistantLeadNavigationOptions());
    await expect(observer.mutate({ workspaceId: scope.workspaceId, resultId: assistantNoteFixture.id, leadId: assistantNoteFixture.lead.id })).resolves.toEqual({ href });
    client.clear();
  });
});
