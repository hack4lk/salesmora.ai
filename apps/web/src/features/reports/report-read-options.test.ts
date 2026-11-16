import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver, QueryObserver } from '@tanstack/react-query';
import {
  activityReportReadResultSchema, businessOverviewReadResultSchema, calendarReportReadResultSchema,
  estimateReportReadResultSchema, financialReportReadResultSchema, jobReportReadResultSchema,
  leadReportReadResultSchema, leadSourceReadResultSchema, teamReportReadResultSchema, reportTemplateSchema,
} from '@salesmora/contracts';
import { apiQueryKeys, createApiQueryClient, retainApiQueryScope } from '../api/api-query';
import { invalidateWorkspaceResources } from '../api/api-read-options';
import { ApiContractError, ApiRequestError } from '../api/api-request';
import { reportReadOptions } from './report-read-options';
import { reportTemplateListOptions, reportTemplateMutationOptions } from './report-templates/report-template-queries';
import { initialJobQuery, jobReadResponse } from './job-report-workspace/job-read.fixtures';
import { adaptJobReadResponse, jobReportScopeKey } from './job-report-workspace/job-read.adapter';
import { initialLeadReportQuery, leadReportBackendResponse } from './lead-report-workspace/lead-report.adapter.fixtures';
import { initialLeadSourceQuery, sourceReadResponse } from './lead-source-report/lead-source-read.fixtures';
import { initialOverviewQuery, overviewReadResponse } from './business-overview/business-overview-read.fixtures';
import { initialCalendarQuery, calendarReadResponse } from './calendar-report-workspace/calendar-read.fixtures';
import { initialTeamQuery, teamReadResponse } from './team-report-workspace/team-read.fixtures';
import { initialEstimateQuery, estimateReadResponse } from './estimate-report-workspace/estimate-read.fixtures';
import { activityReadResponse } from './activity-report/activity-read.fixtures';
import { financialReadResponse } from './financial-report/financial-read.fixtures';

const initial = jobReadResponse(initialJobQuery);
const scope = { viewerId: initial.viewerId, workspaceId: initial.workspaceId };
const read = (key = 'authority:today:lifecycle', identity = scope) => reportReadOptions({
  scope: identity, key, url: `/api/reports/jobs?${new URLSearchParams({ query: JSON.stringify(initialJobQuery) })}`,
  validate: raw => { adaptJobReadResponse(raw, { request: initialJobQuery, scopeKey: jobReportScopeKey(initial),
    today: initial.today, timezone: initial.report.timezone }); },
  failureMessage: 'Read failed.',
});
const fixtures = [
  { area: 'leads', result: leadReportBackendResponse(initialLeadReportQuery), validate: leadReportReadResultSchema.parse },
  { area: 'sources', result: sourceReadResponse(initialLeadSourceQuery), validate: leadSourceReadResultSchema.parse },
  { area: 'overview', result: overviewReadResponse(initialOverviewQuery), validate: businessOverviewReadResultSchema.parse },
  { area: 'calendar', result: calendarReadResponse(initialCalendarQuery), validate: calendarReportReadResultSchema.parse },
  { area: 'jobs', result: initial, validate: jobReportReadResultSchema.parse },
  { area: 'team', result: teamReadResponse(initialTeamQuery), validate: teamReportReadResultSchema.parse },
  { area: 'estimates', result: estimateReadResponse(initialEstimateQuery), validate: estimateReportReadResultSchema.parse },
  { area: 'activity', result: activityReadResponse(), validate: activityReportReadResultSchema.parse },
  { area: 'financial', result: financialReadResponse(), validate: financialReportReadResultSchema.parse },
];
afterEach(() => vi.unstubAllGlobals());

describe('shared report queries', () => {
  it.each(fixtures)('caches validated $area reads and rejects malformed envelopes', async ({ area, result, validate }) => {
    const fetch = vi.fn(async () => Response.json(result));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    const options = reportReadOptions({ scope: { viewerId: result.viewerId, workspaceId: result.workspaceId }, key: area,
      url: `/api/reports/${area}?query=fixture`, validate, failureMessage: 'Invalid report.' });
    await client.fetchQuery(options);
    await client.fetchQuery(options);
    expect(fetch).toHaveBeenCalledTimes(1);
    fetch.mockResolvedValue(Response.json({ query: result.query }));
    await expect(client.fetchQuery({ ...options, staleTime: 0 })).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('isolates full request, policy/clock context, viewer and workspace', async () => {
    const fetch = vi.fn(async () => Response.json(initial));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    await Promise.all([client.fetchQuery(read()), client.fetchQuery(read())]);
    await client.fetchQuery(read());
    expect(fetch).toHaveBeenCalledTimes(1);
    await client.fetchQuery(read('authority:today:other-evidence'));
    await client.fetchQuery(read('new-policy:today:lifecycle'));
    await client.fetchQuery(read('authority:tomorrow:lifecycle'));
    await client.fetchQuery(read(undefined, { ...scope, viewerId: 'other' }));
    await client.fetchQuery(read(undefined, { ...scope, workspaceId: 'other' }));
    expect(fetch).toHaveBeenCalledTimes(6);
    client.clear();
  });
  it('keeps the original snapshot timestamp and preserves a newer cached response', async () => {
    const client = createApiQueryClient({ testing: true }), options = read();
    const timestamp = Date.parse(initial.report.asOf);
    const observer = new QueryObserver<unknown, Error, unknown, unknown, ReturnType<typeof apiQueryKeys.list>>(
      client, { ...options, enabled: false, initialData: initial, initialDataUpdatedAt: timestamp });
    expect(client.getQueryState(options.queryKey)?.dataUpdatedAt).toBe(timestamp);
    client.setQueryData(options.queryKey, { newer: true }, { updatedAt: timestamp + 1_000 });
    observer.setOptions({ ...options, enabled: false, initialData: initial, initialDataUpdatedAt: timestamp });
    expect(client.getQueryData(options.queryKey)).toEqual({ newer: true });
    observer.destroy(); client.clear();
  });
  it.each([
    { ...initial, policyRevision: initial.policyRevision + 1 },
    { ...initial, viewerId: 'other-viewer' },
    { ...initial, query: { ...initial.query, pageSize: 50 } },
  ])('does not cache a response with incompatible authority or request', async raw => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(raw)));
    const client = createApiQueryClient({ testing: true }), options = read();
    await expect(client.fetchQuery(options)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('invalidates reports in only the affected workspace without touching template configurations', async () => {
    const client = createApiQueryClient({ testing: true });
    const keys = [read().queryKey, read(undefined, { ...scope, workspaceId: 'other' }).queryKey,
      reportTemplateListOptions(scope, 'jobs').queryKey];
    for (const key of keys) client.setQueryData(key, {});
    await invalidateWorkspaceResources(client, scope.workspaceId, ['reports']);
    expect(keys.map(key => client.getQueryState(key)?.isInvalidated)).toEqual([true, false, false]);
    client.clear();
  });
  it('cancels old workspace requests and does not populate the cleared cache', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_path, init: RequestInit) => {
      signal = init.signal ?? undefined;
      return new Promise<Response>(() => {});
    }));
    const client = createApiQueryClient({ testing: true }), options = read();
    const pending = client.fetchQuery(options).catch(error => error);
    retainApiQueryScope(client, { ...scope, workspaceId: 'other' });
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    client.clear();
  });
  it('exposes read denial without an automatic retry', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'Access ended.' }, { status: 403 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient();
    await expect(client.fetchQuery(read())).rejects.toBeInstanceOf(ApiRequestError);
    expect(fetch).toHaveBeenCalledTimes(1);
    client.clear();
  });
});

describe('report template queries and mutations', () => {
  it('shares a fresh list only within its viewer, workspace and report area', async () => {
    const fetch = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true });
    await client.fetchQuery(reportTemplateListOptions(scope, 'jobs'));
    await client.fetchQuery(reportTemplateListOptions(scope, 'jobs'));
    await client.fetchQuery(reportTemplateListOptions(scope, 'leads'));
    await client.fetchQuery(reportTemplateListOptions({ ...scope, viewerId: 'other' }, 'jobs'));
    await client.fetchQuery(reportTemplateListOptions({ ...scope, workspaceId: 'other' }, 'jobs'));
    expect(fetch).toHaveBeenCalledTimes(4);
    client.clear();
  });
  it('rejects a valid template belonging to a different area or workspace', async () => {
    const template = reportTemplateSchema.parse({ id: '00000000-0000-4000-8000-000000000099', workspaceId: scope.workspaceId,
      area: 'jobs', name: 'Jobs', version: 1, createdAt: initial.report.asOf, updatedAt: initial.report.asOf,
      configuration: { area: 'jobs', period: { preset: 'custom', from: '2026-10-01', to: '2026-10-31' },
        query: { view: 'lifecycle', filters: { statuses: [], owners: [], services: [] }, selectedView: 'created' } } });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([template])));
    const client = createApiQueryClient({ testing: true });
    await expect(client.fetchQuery(reportTemplateListOptions(scope, 'leads'))).rejects.toBeInstanceOf(ApiContractError);
    await expect(client.fetchQuery(reportTemplateListOptions({ ...scope, workspaceId: 'other' }, 'jobs'))).rejects.toBeInstanceOf(ApiContractError);
    client.clear();
  });
  it('does not retry conflicting writes or change a frozen template list', async () => {
    const client = createApiQueryClient({ testing: true }), options = reportTemplateListOptions(scope, 'jobs');
    client.setQueryData(options.queryKey, []);
    const work = vi.fn(async () => { throw new ApiRequestError('Template changed.', 409, { version: 2 }); });
    const mutation = new MutationObserver(client, reportTemplateMutationOptions(client, scope, 'jobs'));
    await expect(mutation.mutate(work)).rejects.toMatchObject({ status: 409, details: { version: 2 } });
    expect(work).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(options.queryKey)).toEqual([]);
    client.clear();
  });
  it('marks only the originating template list stale without refetching a reviewed list', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient({ testing: true }), options = reportTemplateListOptions(scope, 'jobs');
    const keys = [options.queryKey, reportTemplateListOptions(scope, 'leads').queryKey,
      reportTemplateListOptions({ ...scope, viewerId: 'other' }, 'jobs').queryKey];
    for (const key of keys) client.setQueryData(key, []);
    const observer = new QueryObserver(client, options), unsubscribe = observer.subscribe(() => {});
    const mutation = new MutationObserver(client, reportTemplateMutationOptions(client, scope, 'jobs'));
    await mutation.mutate(async () => {});
    expect(keys.map(key => client.getQueryState(key)?.isInvalidated)).toEqual([true, false, false]);
    expect(fetch).not.toHaveBeenCalled();
    unsubscribe(); client.clear();
  });
});
