import { describe, expect, it } from 'vitest';
import { adaptBusinessOverviewResponse, businessOverviewRequest, type BusinessOverviewAuthority } from './business-overview.adapter';
import { overviewBackendAuthority, overviewBackendResponse, overviewBackendScopeKey, overviewBackendWorkspaceId } from './business-overview.adapter.fixtures';
import { businessOverviewToday, businessOverviewTimezone, defaultBusinessOverviewPeriod } from './business-overview.fixtures';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
function setup(authority: BusinessOverviewAuthority = overviewBackendAuthority, period: ReportPeriodSelection = defaultBusinessOverviewPeriod, invalidMoney = false) {
  const range = resolveReportPeriod(period, businessOverviewToday, 'history').range;
  if (!range) throw new Error('Invalid Overview test period.');
  const request = businessOverviewRequest({ workspaceId: overviewBackendWorkspaceId, range });
  return { raw: overviewBackendResponse(request, authority, invalidMoney), host: {
    request, period, authority, scopeKey: overviewBackendScopeKey, canRead: true,
    today: businessOverviewToday, timezone: businessOverviewTimezone,
  } };
}
function ready(test = setup()) {
  const adapted = adaptBusinessOverviewResponse(test.raw, test.host);
  expect(adapted.scopeKey).toBe(overviewBackendScopeKey);
  if (adapted.state.kind !== 'ready') throw new Error('Expected ready Overview.');
  return adapted.state.result;
}
describe('Business Overview backend adaptation', () => {
  it('projects compact native counts with explicit snapshots and only canonical evidence selectors', () => {
    const result = ready();
    expect(result.periodMetrics.find(item => item.id === 'accepted-value')?.value).toEqual({ kind: 'formatted', displayValue: '$3,200.00' });
    expect(result.currentMetrics.find(item => item.id === 'active-jobs')?.value).toEqual({ kind: 'count', value: 5 });
    expect(result.scopeLabel).toContain('2026-11-06T10:00:08Z');
    expect(result.snapshotLabel).toContain('no single cross-section snapshot');
    expect(result.attention.kind === 'available' && result.attention.items.map(item => item.id))
      .toEqual(['stale-leads', 'overdue-jobs', 'waiting-jobs', 'upcoming-visits']);
    expect(JSON.stringify(result)).not.toContain('recordId');
    expect(setup().host.request.period).toEqual({ from: '2026-10-08', to: '2026-11-06' });
  });
  it('recalculates only period counts and leaves current definitions and attention intact', () => {
    const result = ready(setup(overviewBackendAuthority, { preset: 'custom', from: '2026-08-01', to: '2026-08-30' }));
    expect(result.periodMetrics.filter(item => item.id !== 'accepted-value').every(item => item.value.kind === 'count' && item.value.value === 0)).toBe(true);
    expect(result.currentMetrics).toEqual(ready().currentMetrics);
    expect(result.attention).toEqual(ready().attention);
    expect(result.upcomingVisitsRangeLabel).toBe('2026-11-06 to 2026-11-12, including today');
  });
  it('discloses omitted queues without publishing zero counts or navigation for unreadable domains', () => {
    const authority = { ...overviewBackendAuthority, lead: null, estimate: null };
    const result = ready(setup(authority));
    expect(result.periodMetrics.find(item => item.id === 'new-leads')).toMatchObject({ value: { kind: 'unavailable' } });
    expect(result.periodMetrics.find(item => item.id === 'new-leads')).not.toHaveProperty('evidenceId');
    expect(result.scopeLabel).toContain('Lead metrics are unavailable');
    expect(result.attention.kind === 'available' && result.attention.items.map(item => item.id))
      .toEqual(['overdue-jobs', 'waiting-jobs', 'upcoming-visits']);
    expect(ready(setup({ ...authority, job: null, calendar: null })).attention.kind).toBe('unavailable');
  });
  it('retains accepted counts when frozen money is invalid instead of substituting zero', () => {
    const result = ready(setup(overviewBackendAuthority, defaultBusinessOverviewPeriod, true));
    expect(result.periodMetrics.find(item => item.id === 'accepted-estimates')?.value).toEqual({ kind: 'count', value: 2 });
    expect(result.periodMetrics.find(item => item.id === 'accepted-value')).toMatchObject({ value: { kind: 'unavailable' } });
    expect(result.periodMetrics.find(item => item.id === 'accepted-value')).not.toHaveProperty('evidenceId');
  });
  it('preserves assigned coverage and rejects broader stale authority or another Calendar viewer', () => {
    const assigned: BusinessOverviewAuthority = { reportScope: 'assigned', lead: { scope: 'assigned', archives: 'excluded' },
      job: { scope: 'assigned' }, estimate: { scope: 'assigned_job', archives: 'excluded' }, calendar: { kind: 'own', viewerId: 'mock-viewer' } };
    expect(ready(setup(assigned)).currentMetrics).toHaveLength(7);
    const test = setup();
    expect(() => adaptBusinessOverviewResponse(test.raw, { ...test.host, authority: assigned })).toThrow();
    const narrow = setup(assigned);
    expect(() => adaptBusinessOverviewResponse(narrow.raw, { ...narrow.host,
      authority: { ...assigned, calendar: { kind: 'own', viewerId: 'another-viewer' } } })).toThrow();
  });
  it('rejects stale workspace, period, timezone, clocks, read authority and archive coverage', () => {
    const test = setup();
    for (const host of [{ ...test.host, canRead: false }, { ...test.host, scopeKey: '' },
      { ...test.host, today: '2026-11-05' }, { ...test.host, timezone: 'UTC' },
      { ...test.host, authority: { ...overviewBackendAuthority, lead: null } },
      { ...test.host, authority: { ...overviewBackendAuthority, estimate: { scope: 'workspace' as const, archives: 'excluded' as const } } }]) {
      expect(() => adaptBusinessOverviewResponse(test.raw, host)).toThrow();
    }
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, workspaceId: '00000000-0000-4000-8000-000000000002' }, test.host)).toThrow();
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, from: '2026-10-01' }, test.host)).toThrow();
    if (test.raw.jobs.kind !== 'available') throw new Error('Expected mock Jobs.');
    test.raw.jobs.reads.workload.asOf = '2026-11-05T10:00:00Z';
    expect(() => adaptBusinessOverviewResponse(test.raw, test.host)).toThrow();
  });
  it('rejects private payloads, unsafe counts and contradictory authorized aggregate populations', () => {
    const test = setup();
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, rows: [{ recordId: 'private' }] }, test.host)).toThrow();
    if (test.raw.jobs.kind !== 'available') throw new Error('Expected mock Jobs.');
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, jobs: { ...test.raw.jobs, active: Number.MAX_SAFE_INTEGER + 1 } }, test.host)).toThrow();
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, jobs: { ...test.raw.jobs, overdue: 6 } }, test.host)).toThrow();
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, jobs: { ...test.raw.jobs, privateMetadata: 'hidden' } }, test.host)).toThrow();
    expect(() => adaptBusinessOverviewResponse({ ...test.raw, calendar: { ...test.raw.calendar, to: '2026-11-13' } }, test.host)).toThrow();
  });
  it('accepts complete safe native coverage and available zero queues without truncation', () => {
    const test = setup();
    if (test.raw.jobs.kind !== 'available' || test.raw.leads.kind !== 'available' || test.raw.calendar.kind !== 'available') throw new Error('Expected mock domains.');
    test.raw.jobs.reads.workload.scopeLabel = 'S'.repeat(4000);
    test.raw.jobs.overdue = 0; test.raw.jobs.waiting = 0; test.raw.leads.inactive = 0; test.raw.calendar.visits = 0;
    const result = ready(test);
    expect(result.scopeLabel).toContain('S'.repeat(4000));
    expect(result.attention).toEqual({ kind: 'available', items: [] });
    test.raw.jobs.reads.workload.scopeLabel = 'unsafe\u0000';
    expect(() => adaptBusinessOverviewResponse(test.raw, test.host)).toThrow();
  });
});
