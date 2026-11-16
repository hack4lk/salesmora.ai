import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiQueryClient } from './api-query';
import { apiReadOptions, invalidateWorkspaceResources } from './api-read-options';
import { customerListResultSchema, jobListResultSchema, calendarResultSchema, materialListResultSchema, workOrderListResultSchema } from '@salesmora/contracts';
import { materialListFixture, workOrderListFixture } from './api-catalog.fixtures';
import { customerListFixture, customerDetailFixture, jobListFixture, calendarFixture, workflowScope } from './api-workflow.fixtures';
import { ApiContractError } from './api-request';
import { QueryObserver } from '@tanstack/react-query';

afterEach(() => vi.unstubAllGlobals());
describe('workspace workflow reads', () => {
  it.each([
    ['customers', customerListFixture, (raw: unknown) => customerListResultSchema.parse(raw)],
    ['jobs', jobListFixture, (raw: unknown) => jobListResultSchema.parse(raw)],
    ['calendar', calendarFixture, (raw: unknown) => calendarResultSchema.parse(raw)],
    ['materials', materialListFixture, (raw: unknown) => materialListResultSchema.parse(raw)],
    ['work-orders', workOrderListFixture, (raw: unknown) => workOrderListResultSchema.parse(raw)],
  ])('reuses fresh %s filters and isolates workspace/viewer', async (resource, fixture, parse) => {
    const fetch = vi.fn(async () => Response.json(fixture));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const read = (scope = workflowScope, q = '') => apiReadOptions<unknown>(scope, resource, { q, page: 1 }, `/api/${resource}?q=${q}`, parse, 'Read failed.');
    await client.fetchQuery(read());
    await client.fetchQuery(read(workflowScope, 'other'));
    await client.fetchQuery(read());
    expect(fetch).toHaveBeenCalledTimes(2);
    await client.fetchQuery(read({ ...workflowScope, viewerId: 'another-viewer' }));
    await client.fetchQuery(read({ ...workflowScope, workspaceId: 'another-workspace' }));
    expect(fetch).toHaveBeenCalledTimes(4);
    client.clear();
  });
  it('invalidates detail, candidate, visit and message families only in the affected workspace', async () => {
    const client = createApiQueryClient({ testing: true });
    const resources = ['customers', 'customer-detail', 'customer-candidates', 'jobs', 'job-detail', 'job-messages', 'job-creation-deadline', 'calendar', 'calendar-visit', 'calendar-advisories',
      'work-orders', 'work-order-detail', 'work-order-visit', 'work-order-creation', 'intake', 'intake-detail', 'intake-review', 'materials',
      'estimates', 'estimate-detail', 'estimate-history', 'estimate-revisions', 'estimate-sharing', 'estimate-decision', 'estimate-conversion', 'estimate-lead-stage', 'estimate-parents', 'related-estimates'];
    for (const resource of resources) for (const workspaceId of [workflowScope.workspaceId, 'other']) {
      client.setQueryData(apiReadOptions({ ...workflowScope, workspaceId }, resource, {}, '/api/test', raw => raw, 'failed').queryKey, {});
    }
    await invalidateWorkspaceResources(client, workflowScope.workspaceId, ['customers', 'jobs', 'calendar', 'work-orders', 'intake', 'materials', 'estimates']);
    for (const query of client.getQueryCache().getAll()) expect(query.state.isInvalidated).toBe(query.queryKey[3] === workflowScope.workspaceId);
    client.clear();
  });
  it('rejects malformed successful DTOs instead of caching them', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ rows: [] })));
    const client = createApiQueryClient({ testing: true });
    const options = apiReadOptions(workflowScope, 'customers', {}, '/api/customers', raw => customerListResultSchema.parse(raw), 'Read failed.');
    await expect(client.fetchQuery(options)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('can invalidate a deleted active record without re-reading it before navigation', async () => {
    const client = createApiQueryClient({ testing: true });
    const fetch = vi.fn(async () => Response.json(customerDetailFixture));
    vi.stubGlobal('fetch', fetch);
    const options = apiReadOptions(workflowScope, 'customer-detail', { id: 'deleted' }, '/api/customers/deleted', raw => raw, 'Read failed.');
    client.setQueryData(options.queryKey, customerDetailFixture);
    const observer = new QueryObserver(client, options), unsubscribe = observer.subscribe(() => {});
    await invalidateWorkspaceResources(client, workflowScope.workspaceId, ['customers'], { refetchType: 'none' });
    expect(fetch).not.toHaveBeenCalled();
    expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(true);
    unsubscribe(); client.clear();
  });
});
