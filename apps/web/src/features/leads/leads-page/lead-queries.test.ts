import { afterEach, describe, expect, it, vi } from 'vitest';
import { leadListResultSchema, leadDetailResultSchema, type LeadDetailResult } from '@salesmora/contracts';
import { createApiQueryClient, apiQueryKeys } from '../../api/api-query';
import { ApiContractError } from '../../api/api-request';
import { leadListOptions, leadDetailOptions, leadNotesOptions, mergeLeadColumn, mergeLeadActivity, invalidateLeadQueries } from './lead-queries';
import { leadQueryScope as scope, leadQueryFixture as filters, leadListFixture as list, leadDetailFixture as detail } from './lead-queries.fixtures';

const clients: ReturnType<typeof createApiQueryClient>[] = [];
function client() { const instance = createApiQueryClient({ testing: true }); clients.push(instance); return instance; }
afterEach(() => { clients.forEach(instance => instance.clear()); clients.length = 0; vi.unstubAllGlobals(); });

describe('Leads query integration', () => {
  it('validates complete list/detail snapshots and rejects missing permissions or invalid records', () => {
    expect(leadListResultSchema.parse(list)).toEqual(list);
    expect(leadDetailResultSchema.parse(detail)).toEqual(detail);
    expect(leadListResultSchema.safeParse({ ...list, canCreate: undefined }).success).toBe(false);
    expect(leadDetailResultSchema.safeParse({ ...detail, lead: { ...detail.lead, version: 0 } }).success).toBe(false);
  });
  it('separates filters, list pages, columns, notes, activity pages and viewers in keys', () => {
    const keys = [
      leadListOptions(scope, filters), leadListOptions(scope, { ...filters, page: 2 }),
      leadListOptions(scope, { ...filters, q: 'Jordan' }), leadListOptions(scope, { ...filters, column: 'new', columnPage: 2 }),
      leadListOptions({ ...scope, viewerId: 'other' }, filters), leadListOptions({ ...scope, workspaceId: 'other' }, { ...filters, workspaceId: 'other' }),
      leadDetailOptions(scope, detail.lead.id), leadDetailOptions(scope, detail.lead.id, 2),
      leadNotesOptions(scope, detail.lead.id, 1), leadNotesOptions(scope, detail.lead.id, 2),
    ].map(options => JSON.stringify(options.queryKey));
    expect(new Set(keys).size).toBe(keys.length);
    expect(() => leadListOptions({ ...scope, workspaceId: 'other' }, filters)).toThrow(ApiContractError);
  });
  it('uses validated cached list responses and abortable transports without duplicate reads', async () => {
    const fetch = vi.fn().mockImplementation(async () => Response.json(list));
    vi.stubGlobal('fetch', fetch);
    const instance = client(), options = leadListOptions(scope, filters);
    const [first, second] = await Promise.all([instance.fetchQuery(options), instance.fetchQuery(options)]);
    expect(first).toEqual(second); expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/leads?'), expect.objectContaining({ signal: expect.any(AbortSignal), cache: 'no-store' }));
  });
  it('rejects a successful detail response for a different record', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(detail)));
    await expect(client().fetchQuery(leadDetailOptions(scope, '00000000-0000-4000-8000-000000000102'))).rejects.toBeInstanceOf(ApiContractError);
  });
  it('deduplicates pipeline pages and rejects permission changes rather than merging old scope', () => {
    const old = { ...list, columns: [{ ...list.columns[0], leads: [detail.lead], page: 1 }] };
    const nextLead = { ...detail.lead, id: '00000000-0000-4000-8000-000000000102' };
    const next = { ...old, columns: [{ ...old.columns[0], leads: [detail.lead, nextLead], page: 2 }] };
    expect(mergeLeadColumn(old, next, 'new')?.columns[0].leads).toEqual([detail.lead, nextLead]);
    expect(mergeLeadColumn(old, { ...next, policyRevision: 2 }, 'new')).toBeUndefined();
    expect(mergeLeadColumn(old, { ...next, scope: 'assigned' }, 'new')).toBeUndefined();
    expect(() => mergeLeadColumn(old, { ...next, columns: [] }, 'new')).toThrow(ApiContractError);
  });
  it('merges history without losing notes or replacing a newer record version', () => {
    const nextEvent = { ...detail.activity[0], id: '00000000-0000-4000-8000-000000000202' };
    const next = { ...detail, activity: [detail.activity[0], nextEvent] };
    expect(mergeLeadActivity(detail, next)?.activity).toHaveLength(2);
    expect(mergeLeadActivity({ ...detail, lead: { ...detail.lead, version: 3 } }, next)?.lead.version).toBe(3);
    expect(mergeLeadActivity(detail, { ...next, policyRevision: 2 })).toBeUndefined();
  });
  it('invalidates every dependent resource without touching another workspace/viewer account cache', async () => {
    const instance = client();
    const resources = ['leads', 'home', 'customers', 'jobs', 'calendar', 'estimates', 'reports', 'notifications'];
    for (const resource of resources) {
      instance.setQueryData(apiQueryKeys.resource(scope, resource), resource);
      instance.setQueryData(apiQueryKeys.resource({ ...scope, workspaceId: 'other-workspace' }, resource), resource);
    }
    instance.setQueryData(apiQueryKeys.account(scope.viewerId, 'settings'), 'account');
    await invalidateLeadQueries(instance, scope.workspaceId);
    for (const resource of resources) {
      expect(instance.getQueryState(apiQueryKeys.resource(scope, resource))?.isInvalidated).toBe(true);
      expect(instance.getQueryState(apiQueryKeys.resource({ ...scope, workspaceId: 'other-workspace' }, resource))?.isInvalidated).toBe(false);
    }
    expect(instance.getQueryState(apiQueryKeys.account(scope.viewerId, 'settings'))?.isInvalidated).toBe(false);
  });
  it('removes deleted details, history, notes and pending reads before late results can repopulate them', async () => {
    const instance = client(), id = detail.lead.id;
    instance.setQueryData(leadDetailOptions(scope, id).queryKey, detail);
    instance.setQueryData(leadNotesOptions(scope, id, 1).queryKey, { notes: [], total: 0 });
    let complete: (value: LeadDetailResult) => void = () => { throw new Error('Read not started'); };
    const pending = instance.fetchQuery({ ...leadDetailOptions(scope, id, 2), queryFn: () => new Promise<LeadDetailResult>(resolve => { complete = resolve; }) }).catch(error => error);
    await invalidateLeadQueries(instance, scope.workspaceId, id);
    complete(detail); await pending;
    expect(instance.getQueryCache().findAll({ queryKey: apiQueryKeys.detail(scope, 'leads', id) })).toHaveLength(0);
  });
});
