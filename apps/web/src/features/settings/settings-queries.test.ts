import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver, QueryObserver } from '@tanstack/react-query';
import {
  estimateBusinessProfileReadSchema, jobNotificationSettingsSnapshotSchema, leadAssignmentSettingsSnapshotSchema,
  notificationPreferencesSchema, workOrderSettingsSchema, workspaceAIUsageSchema, workspacePolicySchema,
} from '@salesmora/contracts';
import { apiQueryKeys, createApiQueryClient, retainApiQueryScope } from '../api/api-query';
import { ApiContractError, ApiRequestError } from '../api/api-request';
import { settingsMutationOptions, settingsReadOptions, type SettingsResource } from './settings-queries';
import {
  settingsScope as scope, leadSettingsFixture, jobSettingsFixture, estimateSettingsFixture, notificationPreferencesFixture,
  workOrderSettingsFixture, settingsPolicyFixture, aiUsageFixture,
} from './settings-queries.fixtures';

const fixtures: { resource: SettingsResource; result: unknown; parse: (raw: unknown) => unknown }[] = [
  { resource: 'lead-settings', result: leadSettingsFixture, parse: leadAssignmentSettingsSnapshotSchema.parse },
  { resource: 'job-notification-settings', result: jobSettingsFixture, parse: jobNotificationSettingsSnapshotSchema.parse },
  { resource: 'estimate-settings', result: { record: estimateSettingsFixture, canManage: true, role: 'owner' }, parse: estimateBusinessProfileReadSchema.parse },
  { resource: 'notification-preferences', result: notificationPreferencesFixture, parse: notificationPreferencesSchema.parse },
  { resource: 'work-order-settings', result: workOrderSettingsFixture, parse: workOrderSettingsSchema.omit({ workspaceId: true }).parse },
  { resource: 'permissions', result: settingsPolicyFixture, parse: workspacePolicySchema.parse },
  { resource: 'ai-usage', result: aiUsageFixture, parse: workspaceAIUsageSchema.parse },
];
afterEach(() => vi.unstubAllGlobals());
describe('settings requests', () => {
  it.each(fixtures)('validates $resource responses and always rechecks explicit reloads', async ({ resource, result, parse }) => {
    const fetch = vi.fn(async () => Response.json(result));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const read = settingsReadOptions(scope, resource, '/api/settings/test', parse, 'Invalid settings.');
    await client.fetchQuery(read);
    await client.fetchQuery(read);
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockResolvedValue(Response.json({ invalid: true }));
    await expect(client.fetchQuery(read)).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('does not request server-supplied form drafts before an explicit reload', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const observer = new QueryObserver(client, {
      ...settingsReadOptions(scope, 'lead-settings', '/api/settings/leads', leadAssignmentSettingsSnapshotSchema.parse, 'Failed.'),
      enabled: false,
    });
    const unsubscribe = observer.subscribe(() => {});
    expect(fetch).not.toHaveBeenCalled();
    unsubscribe(); client.clear();
  });
  it('isolates viewer/workspace/settings keys', () => {
    const read = (identity = scope, resource: SettingsResource = 'lead-settings') =>
      settingsReadOptions(identity, resource, '/api/settings/test', raw => raw, 'Failed.').queryKey;
    expect(read()).not.toEqual(read({ ...scope, viewerId: 'other' }));
    expect(read()).not.toEqual(read({ ...scope, workspaceId: 'other' }));
    expect(read()).not.toEqual(read(scope, 'estimate-settings'));
  });
  it('keeps the AI refresh timeout at 15 seconds without retrying the timed-out request', async () => {
    const timeoutController = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const fetch = vi.fn((_path, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient();
    try {
      const read = settingsReadOptions(scope, 'ai-usage', '/api/ai-usage', workspaceAIUsageSchema.parse, 'Failed.');
      const pending = client.fetchQuery(read).catch(error => error);
      expect(timeout).toHaveBeenCalledWith(15_000);
      timeoutController.abort(new DOMException('Timed out.', 'TimeoutError'));
      expect(await pending).toBeInstanceOf(Error);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally { timeout.mockRestore(); client.clear(); }
  });
  it('preserves the reviewed revision and submission ID across an explicit retry, never automatically retrying writes', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'Response unavailable.' }, { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'lead-settings'));
    const command = {
      path: '/api/settings/leads', method: 'PUT' as const, failureMessage: 'Failed.',
      body: { workspaceId: scope.workspaceId, expectedVersion: 1, requestId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', value: { kind: 'unassigned' } },
      parse: leadAssignmentSettingsSnapshotSchema.parse,
    };
    await expect(mutation.mutate(command)).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(mutation.mutate(command)).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(fetch.mock.calls[1]);
    client.clear();
  });
  it.each([401, 403, 404, 409, 422, 423, 428])('retains status %s and details for denial, conflict and reauthentication UX', async status => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Review required.', reason: 'review' }, { status })));
    const client = createApiQueryClient({ testing: true }), mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'permissions'));
    await expect(mutation.mutate({ path: '/api/permissions', method: 'POST', body: {}, parse: raw => raw, failureMessage: 'Failed.' }))
      .rejects.toMatchObject({ status, details: { reason: 'review' } });
    client.clear();
  });
  it('invalidates affected Job reads, not other settings or another workspace', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(jobSettingsFixture)));
    const client = createApiQueryClient({ testing: true });
    const resources = ['job-notification-settings', 'jobs', 'job-detail', 'job-creation-deadline', 'calendar', 'home', 'estimate-settings'];
    const keys = resources.map(resource => apiQueryKeys.resource(scope, resource));
    const other = apiQueryKeys.resource({ ...scope, workspaceId: 'other' }, 'jobs');
    for (const key of [...keys, other]) client.setQueryData(key, {});
    const mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'job-notification-settings'));
    await mutation.mutate({ path: '/api/settings/job-notifications', method: 'PUT', body: {}, parse: jobNotificationSettingsSnapshotSchema.parse, failureMessage: 'Failed.' });
    expect(keys.map(key => client.getQueryState(key)?.isInvalidated)).toEqual([true, true, true, true, true, true, false]);
    expect(client.getQueryState(other)?.isInvalidated).toBe(false);
    client.clear();
  });
  it('does not overwrite a frozen read snapshot or trigger automatic refetch when saving', async () => {
    const fetch = vi.fn(async () => Response.json({ ...leadSettingsFixture, version: 2 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const options = settingsReadOptions(scope, 'lead-settings', '/api/settings/leads', leadAssignmentSettingsSnapshotSchema.parse, 'Failed.');
    client.setQueryData(options.queryKey, leadSettingsFixture);
    const observer = new QueryObserver(client, { ...options, enabled: false }), unsubscribe = observer.subscribe(() => {});
    const mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'lead-settings'));
    await mutation.mutate({ path: '/api/settings/leads', method: 'PUT', body: {}, parse: leadAssignmentSettingsSnapshotSchema.parse, failureMessage: 'Failed.' });
    expect(client.getQueryData(options.queryKey)).toEqual(leadSettingsFixture);
    expect(fetch).toHaveBeenCalledTimes(1);
    unsubscribe(); client.clear();
  });
  it('invalidates personal preferences in every workspace for only the current viewer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(notificationPreferencesFixture)));
    const client = createApiQueryClient({ testing: true });
    const identities = [scope, { ...scope, workspaceId: 'other' }, { ...scope, viewerId: 'other' }];
    const keys = identities.map(identity => apiQueryKeys.resource(identity, 'notification-preferences'));
    for (const key of keys) client.setQueryData(key, {});
    const mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'notification-preferences'));
    await mutation.mutate({ path: '/api/settings/notifications', method: 'PUT', body: {}, parse: notificationPreferencesSchema.parse, failureMessage: 'Failed.' });
    expect(keys.map(key => client.getQueryState(key)?.isInvalidated)).toEqual([true, true, false]);
    client.clear();
  });
  it('evicts inactive workspace authority after a policy save without touching another workspace', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(settingsPolicyFixture)));
    const client = createApiQueryClient({ testing: true });
    const key = apiQueryKeys.resource(scope, 'leads'), other = apiQueryKeys.resource({ ...scope, workspaceId: 'other' }, 'leads');
    client.setQueryData(key, {}); client.setQueryData(other, {});
    const mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'permissions'));
    await mutation.mutate({ path: '/api/permissions', method: 'POST', body: {}, parse: workspacePolicySchema.parse, failureMessage: 'Failed.' });
    expect(client.getQueryData(key)).toBeUndefined();
    expect(client.getQueryData(other)).toEqual({});
    client.clear();
  });
  it('cancels a pending settings read when the workspace changes', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_path, init: RequestInit) => {
      signal = init.signal ?? undefined;
      return new Promise<Response>(() => {});
    }));
    const client = createApiQueryClient({ testing: true });
    const options = settingsReadOptions(scope, 'lead-settings', '/api/settings/leads', leadAssignmentSettingsSnapshotSchema.parse, 'Failed.');
    const pending = client.fetchQuery(options).catch(error => error);
    retainApiQueryScope(client, { ...scope, workspaceId: 'other' });
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('does not invalidate resources for a malformed successful write', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})));
    const client = createApiQueryClient({ testing: true }), key = apiQueryKeys.resource(scope, 'work-orders');
    client.setQueryData(key, {});
    const mutation = new MutationObserver(client, settingsMutationOptions<unknown>(client, scope, 'work-order-settings'));
    await expect(mutation.mutate({ path: '/api/settings/work-orders', method: 'PUT', body: {}, parse: workOrderSettingsSchema.omit({ workspaceId: true }).parse, failureMessage: 'Failed.' })).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    client.clear();
  });
  it('preserves HTTP access errors instead of coercing them into an empty settings snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Unavailable.' }, { status: 403 })));
    const client = createApiQueryClient();
    await expect(client.fetchQuery(settingsReadOptions(scope, 'lead-settings', '/api/settings/leads', leadAssignmentSettingsSnapshotSchema.parse, 'Failed.'))).rejects.toBeInstanceOf(ApiRequestError);
    client.clear();
  });
});
