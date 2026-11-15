import { describe, expect, it } from 'vitest';
import { leadReportRequest, adaptLeadReportResponse, leadReportScopeKey, nativeLeadReportViews } from './lead-report.adapter';
import { initialLeadReportQuery, leadReportBackendResponse, leadReportWorkspaceId, leadReportToday } from './lead-report.adapter.fixtures';
import { workspaceLeadFixtures } from './lead-report-workspace.fixtures';

const empty = { stages: [], owners: [], sources: [] };
const build = (view: typeof nativeLeadReportViews[number] = 'intake', evidenceId?: string, page = 1, pageSize = 25) => leadReportRequest({
  workspaceId: leadReportWorkspaceId, view, evidenceId, page, pageSize, today: leadReportToday,
  period: { preset: 'custom', from: '2026-10-01', to: '2026-10-31' }, filters: { period: empty, current: empty },
});
const adapt = (request = build(), raw = leadReportBackendResponse(request)) => adaptLeadReportResponse(raw, {
  request, scopeKey: leadReportScopeKey(raw), today: leadReportToday, timezone: 'Europe/Warsaw',
});
describe('Leads native report adaptation', () => {
  it('maps all six supported native views, preserving current counts, outcome coverage and canonical stage names', () => {
    for (const view of nativeLeadReportViews) expect(adapt(build(view)).projection.view).toBe(view);
    const intake = adapt();
    expect(intake.current).toMatchObject({ kind: 'ready', snapshot: { count: 3 } });
    const pipeline = adapt(build('pipeline', 'stage:estimate-sent'));
    expect(pipeline.projection.state.kind === 'ready' && 'selectedView' in pipeline.projection.state.result &&
      pipeline.projection.state.result.selectedView).toEqual({ kind: 'stage', stage: 'estimate_sent' });
    expect(adapt(build('won')).projection.state).toMatchObject({ result: { counts: { won: 1, lost: 2 }, coverage: { kind: 'partial' } } });
    expect(adapt(build('attention')).projection.state).toMatchObject({ result: { inactivityCutoffLabel: expect.stringContaining('2026-10-29T10:00:00.000Z') } });
  });
  it('builds strict independent filters and omits historical dates from current views', () => {
    const filters = {
      period: { stages: ['won'], owners: ['user-text-id'], sources: ['website'] },
      current: { stages: ['new'], owners: ['me'], sources: ['referral'] },
    };
    for (const view of nativeLeadReportViews) {
      const request = leadReportRequest({ workspaceId: leadReportWorkspaceId, view, today: leadReportToday,
        period: { preset: 'last30days' }, filters, page: 1, pageSize: 25 });
      expect(request.filters).toEqual(['intake', 'won', 'lost'].includes(view) ? filters.period : filters.current);
      if (request.view === 'intake') expect(request.currentFilters).toEqual(filters.current);
    }
    expect(build('pipeline')).not.toHaveProperty('period');
    expect(build()).toEqual(initialLeadReportQuery);
    expect(() => build('intake', 'unsupported')).toThrow();
    expect(() => build('pipeline', 'stage:won')).toThrow();
    expect(() => build('intake', undefined, 1, 2)).toThrow();
    expect(() => leadReportRequest({ workspaceId: leadReportWorkspaceId, view: 'conversion', today: leadReportToday,
      period: { preset: 'last30days' }, filters: { period: empty, current: empty }, page: 1, pageSize: 25 })).toThrow();
  });
  it('aggregates longer intake spans without inventing weekly or monthly evidence actions', () => {
    for (const period of [{ preset: 'custom' as const, from: '2026-09-30', to: '2026-10-31' },
      { preset: 'custom' as const, from: '2026-07-30', to: '2026-10-31' }]) {
      const input = { workspaceId: leadReportWorkspaceId, view: 'intake' as const, today: leadReportToday,
        period, filters: { period: empty, current: empty }, page: 1, pageSize: 25 };
      const projection = adapt(leadReportRequest(input)).projection;
      if (projection.view !== 'intake' || projection.state.kind !== 'ready') throw new Error('Expected ready intake');
      const trend = projection.state.result.trend;
      if (!trend) throw new Error('Expected intake trend');
      const buckets = trend.buckets;
      expect(buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(projection.state.result.total);
      const aggregateBuckets = buckets.filter(bucket => bucket.from !== bucket.to);
      expect(aggregateBuckets.length).toBeGreaterThan(0);
      for (const bucket of aggregateBuckets) {
        expect(bucket).not.toHaveProperty('evidenceId');
        expect(() => leadReportRequest({ ...input, evidenceId: `trend:${bucket.from}` })).toThrow('Only individual daily');
      }
    }
  });
  it('matches daily trend evidence and preserves exact 25/50/100 clamping without page-local totals', () => {
    const daily = adapt(build('intake', 'trend:2026-10-15'));
    expect(daily.projection.state).toMatchObject({ result: { total: 4, selectedTrendBucket: '2026-10-15', rows: [expect.objectContaining({ label: 'Referral inquiry' })] } });
    const rows = Array.from({ length: 126 }, (_, index) => ({ ...workspaceLeadFixtures[0]!, id: `l${1000 + index}`, label: `Inquiry ${index}`, created: '2026-10-15', age: 21 }));
    for (const size of [25, 50, 100]) {
      const request = build('pipeline', undefined, 999, size), raw = leadReportBackendResponse(request, 'workspace', rows);
      expect(adapt(request, raw).projection.state).toMatchObject({ result: { total: 126, page: Math.ceil(126 / size), pageSize: size } });
    }
  });
  it('rejects stale identity, policy, scope, archive, clock and request associations before exposing evidence', () => {
    const raw = leadReportBackendResponse(build()), input = { request: build(), scopeKey: leadReportScopeKey(raw), today: leadReportToday, timezone: 'Europe/Warsaw' };
    for (const changes of [{ viewerId: 'another-viewer' }, { policyRevision: 2 }, { scope: 'assigned' },
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { archiveVisibility: 'excluded' }]) {
      expect(() => adaptLeadReportResponse({ ...raw, ...changes }, input)).toThrow();
    }
    expect(() => adaptLeadReportResponse(raw, { ...input, today: '2026-11-06' })).toThrow();
    expect(() => adaptLeadReportResponse(raw, { ...input, request: build('pipeline') })).toThrow();
  });
  it('rejects private columns, invalid age/stage rows and unsupported filter options', () => {
    const request = build('pipeline'), raw = leadReportBackendResponse(request);
    const input = { request, scopeKey: leadReportScopeKey(raw), today: leadReportToday, timezone: 'Europe/Warsaw' };
    for (const cells of [{ privateNotes: 'secret' }, { age: 'bad' }, { stage: 'won' }]) {
      expect(() => adaptLeadReportResponse({ ...raw, report: { ...raw.report,
        rows: raw.report.rows.map(row => ({ ...row, cells: { ...row.cells, ...cells } })),
      } }, input)).toThrow();
    }
    expect(() => adaptLeadReportResponse({ ...raw, options: { ...raw.options,
      sources: [...raw.options.sources, { value: 'unknown', label: 'Unknown' }],
    } }, input)).toThrow();
    const assigned = leadReportBackendResponse(build('pipeline'), 'assigned');
    expect(adapt(build('pipeline'), assigned).options.owners.map(item => item.value)).toEqual(['me', 'unassigned']);
  });
});
