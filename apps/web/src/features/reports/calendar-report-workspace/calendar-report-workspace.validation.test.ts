import { describe, expect, it } from 'vitest';
import { calendarWorkspaceResponse, calendarWorkspaceEmptyFilters as empty, calendarWorkspaceOptions as options,
  calendarWorkspaceRange as range, calendarWorkspaceScopeKey as scopeKey, calendarWorkspaceDefaultEvidence } from './calendar-report-workspace.fixtures';
import { validCalendarReportProjection } from './calendar-report-workspace.validation';
import { calendarReportViews, type CalendarReportProjection } from './calendar-report-workspace';
import type { CalendarReportFiltersValue, CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';

const scope = { kind: 'workspace' } as const;
function valid(projection: CalendarReportProjection, filters: CalendarReportFiltersValue = empty, selectedScope: CalendarReportFilterScope = scope) {
  return validCalendarReportProjection(projection, filters, options, selectedScope, scopeKey, range);
}
describe('Calendar workspace projections', () => {
  it('accepts all canonical views and evidence units with counts computed before pagination', () => {
    for (const view of calendarReportViews) expect(valid(calendarWorkspaceResponse(view))).toBe(true);
    for (const scheduled of ['visits', 'busy-person-days'] as const) {
      expect(valid(calendarWorkspaceResponse('scheduled', empty, { evidence: { ...calendarWorkspaceDefaultEvidence, scheduled } }))).toBe(true);
    }
    for (const review of ['overlaps', 'past'] as const) {
      expect(valid(calendarWorkspaceResponse('review', empty, { evidence: { ...calendarWorkspaceDefaultEvidence, review } }))).toBe(true);
    }
    for (const page of [1, 2]) {
      const projection = calendarWorkspaceResponse('unscheduled', empty, { evidence: { ...calendarWorkspaceDefaultEvidence, unscheduled: 'workOrders' }, page, pageSize: 1 });
      expect(valid(projection)).toBe(true);
      if (projection.view === 'unscheduled' && projection.state.kind === 'ready') expect(projection.state.result.counts).toEqual({ visits: 1, jobs: 1, workOrders: 2 });
    }
  });
  it('matches type before participant, excludes unrelated records and narrows member projections', () => {
    const selected = { participants: ['blair'], recordTypes: ['work_order'] };
    for (const view of calendarReportViews) {
      const projection = calendarWorkspaceResponse(view, selected);
      expect(valid(projection, selected)).toBe(true);
      if (projection.state.kind === 'ready') expect(projection.state.result.members.map(member => member.id)).toEqual(['blair']);
      expect(JSON.stringify(projection.attribution)).not.toContain('alex');
      expect(projection.attribution.flatMap(row => row.records).every(record => record.type === 'work_order' && record.id === 'workspace-fixture:W1')).toBe(true);
    }
    const noJob = { participants: ['blair'], recordTypes: ['job'] };
    const projection = calendarWorkspaceResponse('scheduled', noJob);
    expect(valid(projection, noJob)).toBe(true);
    if (projection.view === 'scheduled' && projection.state.kind === 'ready') expect(projection.state.result.counts.visits).toBe(0);
    const jobs = calendarWorkspaceResponse('scheduled', { ...empty, recordTypes: ['job'] });
    if (jobs.view === 'scheduled' && jobs.state.kind === 'ready') expect(jobs.state.result.counts).toEqual({ visits: 3, busyPersonDays: 0 });
    const orders = calendarWorkspaceResponse('scheduled', { ...empty, recordTypes: ['work_order'] });
    if (orders.view === 'scheduled' && orders.state.kind === 'ready') expect(orders.state.result.counts.visits).toBe(2);
  });
  it('uses OR within and AND across facets, with order-independent filter snapshots', () => {
    const filters = { participants: ['alex', 'blair'], recordTypes: ['job', 'work_order'] };
    const projection = calendarWorkspaceResponse('scheduled', filters);
    expect(valid(projection, { participants: ['blair', 'alex'], recordTypes: ['work_order', 'job'] })).toBe(true);
    if (projection.view === 'scheduled' && projection.state.kind === 'ready') expect(projection.state.result.counts).toEqual({ visits: 4, busyPersonDays: 1 });
    expect(valid(projection, { ...filters, participants: ['alex'] })).toBe(false);
    expect(valid({ ...projection, filters: { ...filters, participants: ['alex', 'alex'] } }, filters)).toBe(false);
  });
  it('rejects stale scopes, date ranges and options while unscheduled is date-independent', () => {
    for (const view of calendarReportViews) {
      const projection = calendarWorkspaceResponse(view);
      expect(valid({ ...projection, scopeKey: 'old' })).toBe(false);
      expect(validCalendarReportProjection(projection, empty, options, scope, '', range)).toBe(false);
      expect(validCalendarReportProjection(projection, empty, options, scope, scopeKey, { from: '2026-11-06', to: '2026-11-12' })).toBe(view === 'unscheduled');
    }
    expect(validCalendarReportProjection(calendarWorkspaceResponse('scheduled'), empty,
      { ...options, recordTypes: [{ value: 'work_order', label: 'Work Order' }] }, scope, scopeKey, range)).toBe(false);
  });
  it('enforces own-scope identity, roster and per-record participants', () => {
    const own = { kind: 'own', viewerId: 'blair' } as const;
    const ownOptions = { ...options, participants: [{ value: 'blair', label: 'Blair' }] };
    for (const view of calendarReportViews) {
      const projection = calendarWorkspaceResponse(view, empty, { scope: own, options: ownOptions });
      expect(validCalendarReportProjection(projection, empty, ownOptions, own, scopeKey, range)).toBe(true);
      expect(valid(projection)).toBe(false);
      expect(JSON.stringify(projection.attribution)).not.toContain('alex');
    }
    expect(validCalendarReportProjection(calendarWorkspaceResponse('scheduled'), empty, ownOptions, own, scopeKey, range)).toBe(false);
  });
  it('rejects missing/extra attribution, mismatched record membership and participant unions', () => {
    const projection = calendarWorkspaceResponse('scheduled');
    const row = projection.attribution[0]!, record = row.records[0]!;
    for (const attribution of [
      [], [...projection.attribution, row],
      [{ ...row, visitId: 'hidden' }, ...projection.attribution.slice(1)],
      [{ ...row, records: row.records.slice(1) }, ...projection.attribution.slice(1)],
      [{ ...row, records: [{ ...record, participantIds: ['hidden'] }, ...row.records.slice(1)] }, ...projection.attribution.slice(1)],
      [{ ...row, records: row.records.map(record => ({ ...record, participantIds: [] })) }, ...projection.attribution.slice(1)],
    ]) expect(valid({ ...projection, attribution })).toBe(false);
    const filtered = { ...empty, participants: ['alex'] };
    expect(valid({ ...projection, filters: filtered }, filtered)).toBe(false);
  });
  it('keeps loading/error states typed and validates snapshots before rendering them', () => {
    for (const kind of ['loading', 'error'] as const) {
      const projection: CalendarReportProjection = { view: 'scheduled', state: { kind }, filters: empty, scopeKey, attribution: [] };
      expect(valid(projection)).toBe(true);
      expect(valid({ ...projection, scopeKey: 'old' })).toBe(false);
    }
  });
});
