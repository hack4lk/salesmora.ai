import { describe, expect, it } from 'vitest';
import { jobReportQuerySchema, type JobReportQuery } from '@salesmora/contracts';
import { adaptJobReadResponse, jobReportEvidenceSelection, jobReportRequest, jobReportScopeKey, visibleJobRecord } from './job-read.adapter';
import { initialJobQuery, jobReadResponse, largeJobReadResponse } from './job-read.fixtures';

const initial = jobReadResponse(initialJobQuery);
function adapt(request: JobReportQuery, raw: unknown = jobReadResponse(request)) {
  return adaptJobReadResponse(raw, { request, scopeKey: jobReportScopeKey(initial), today: initial.today, timezone: initial.report.timezone });
}
const empty = { statuses: [], owners: [], services: [] };
const workload = jobReportQuerySchema.parse({ workspaceId: initial.workspaceId, view: 'workload',
  filters: empty, selection: { kind: 'metric', metric: 'active' }, page: 1, pageSize: 25 });
const completion = jobReportQuerySchema.parse({ workspaceId: initial.workspaceId, view: 'completion',
  period: { from: '2026-10-01', to: '2026-10-31' }, filters: empty, page: 1, pageSize: 25 });
describe('Jobs native-to-canonical authority adapter', () => {
  it('projects strict selected period/current drafts without date-control bookkeeping', () => {
    const filters = { period: { ...empty, statuses: ['completed'], services: ['service:installation'] },
      current: { ...empty, owners: ['unassigned'] } };
    for (const view of ['lifecycle', 'completion', 'workload'] as const) {
      const range = { from: '2026-10-01', to: '2026-10-31', count: 31 };
      const request = jobReportRequest({ workspaceId: initial.workspaceId, view, range, filters, page: 1, pageSize: 25,
        evidence: { lifecycle: 'completed', completion: undefined, workload: { kind: 'metric', metric: 'active' } } });
      expect(request.filters).toEqual(filters[view === 'workload' ? 'current' : 'period']);
      if ('period' in request) expect(request.period).toEqual({ from: range.from, to: range.to });
      else expect(request).not.toHaveProperty('period');
      expect(adapt(request).projection.view).toBe(view);
    }
    expect(() => jobReportRequest({ workspaceId: initial.workspaceId, view: 'workload',
      range: { from: '', to: '' }, filters: { period: empty, current: { ...empty, statuses: ['completed'] } },
      page: 1, pageSize: 25, evidence: { lifecycle: 'created', completion: undefined, workload: { kind: 'metric', metric: 'active' } } })).toThrow();
  });
  it('retains all four lifecycle counts, current display labels, native IDs and partial coverage', () => {
    for (const selectedView of ['created', 'completed', 'canceled', 'reopened'] as const) {
      const request = jobReportQuerySchema.parse({ ...initialJobQuery, selectedView });
      const raw = jobReadResponse(request);
      if (raw.report.view !== 'lifecycle') throw new Error('Expected lifecycle.');
      const partial = { ...raw, report: { ...raw.report, coverage: { ...raw.report.coverage,
        completed: { kind: 'partial', explanation: 'Surviving transitions only.' } } } };
      const { projection } = adapt(request, partial);
      if (projection.view !== 'lifecycle' || projection.state.kind !== 'ready') throw new Error('Expected ready lifecycle.');
      expect(projection.state.result.counts).toEqual({ created: 4, completed: 2, canceled: 1, reopened: 1 });
      expect(projection.state.result.coverage.completed).toEqual(partial.report.coverage.completed);
      expect(projection.state.result.rows.every(row => row.id === row.recordId)).toBe(true);
      expect(projection.state.result.rows.map(row => row.cells.status)).not.toContain('in-progress');
      expect(projection.state.result.periodLabel).toContain('both dates included');
      expect(projection.state.result.snapshotLabel).toContain('Europe/Warsaw');
      expect(jobReportEvidenceSelection(raw, raw.report.evidenceIds[selectedView])).toEqual({ view: 'lifecycle', evidence: selectedView });
    }
  });
  it('preserves completion duration across all/day/zero-day selections after reopening', () => {
    for (const selectedDate of [undefined, '2026-10-12', '2026-10-13']) {
      const request = jobReportQuerySchema.parse({ ...completion, selectedDate });
      const raw = jobReadResponse(request), { projection } = adapt(request, raw);
      if (projection.view !== 'completion' || projection.state.kind !== 'ready' || raw.report.view !== 'completion') throw new Error('Expected completion.');
      const result = projection.state.result;
      expect(result.total).toBe(2);
      expect(result.days).toHaveLength(31);
      expect(result.duration).toMatchObject({ sampleSize: 2, totalElapsedDays: 15 });
      expect(result.rows).toHaveLength(selectedDate === undefined ? 2 : selectedDate === '2026-10-12' ? 1 : 0);
      if (selectedDate === '2026-10-12') expect(result.rows[0]).toMatchObject({ createdDate: '2026-10-02', completionDate: selectedDate,
        cells: { status: 'In Progress' } });
      expect(jobReportEvidenceSelection(raw, raw.report.evidenceId)).toEqual({ view: 'completion', evidence: undefined });
      expect(jobReportEvidenceSelection(raw, raw.report.days[12]!.evidenceId)).toEqual({ view: 'completion', evidence: '2026-10-13' });
    }
  });
  it('renders a known same-day completion as zero elapsed days, not unavailable duration', () => {
    const request = jobReportQuerySchema.parse({ ...completion, filters: { ...empty, statuses: ['completed'] } });
    const raw = jobReadResponse(request);
    if (raw.report.view !== 'completion') throw new Error('Expected completion.');
    const sameDay = { ...raw, report: { ...raw.report, duration: { sampleSize: 1, totalElapsedDays: 0, averageElapsedDays: 0 },
      rows: raw.report.rows.map(row => ({ ...row, createdDate: row.completionDate })) } };
    expect(adapt(request, sameDay).projection.state).toMatchObject({ kind: 'ready',
      result: { total: 1, duration: { sampleSize: 1, totalElapsedDays: 0 } } });
  });
  it('preserves all six current queues and four groupings with exact native evidence mapping', () => {
    const raw = jobReadResponse(workload);
    if (raw.report.view !== 'workload') throw new Error('Expected workload.');
    for (const metric of ['active', 'overdue', 'dueSoon', 'noDeadline', 'waiting', 'unassigned'] as const) {
      const request = jobReportQuerySchema.parse({ ...workload, selection: { kind: 'metric', metric } });
      const { projection } = adapt(request);
      if (projection.view !== 'workload' || projection.state.kind !== 'ready') throw new Error('Expected ready workload.');
      expect(projection.state.result.selected).toEqual(request.view === 'workload' ? request.selection : undefined);
      expect(projection.state.result.counts).toEqual({ active: 5, overdue: 1, dueSoon: 2, noDeadline: 1, waiting: 1, unassigned: 1 });
      expect(jobReportEvidenceSelection(raw, raw.report.evidenceIds[metric])).toEqual({ view: 'workload', evidence: { kind: 'metric', metric } });
    }
    for (const group of ['status', 'owner', 'service', 'waitingReason'] as const) {
      for (const item of raw.report.groups[group]) {
        const selection = { kind: 'group', group, id: item.id };
        expect(adapt(jobReportQuerySchema.parse({ ...workload, selection })).projection.state.kind).toBe('ready');
        expect(jobReportEvidenceSelection(raw, item.evidenceId)).toEqual({ view: 'workload', evidence: selection });
      }
    }
  });
  it('keeps period/current facets independent of dates, selected population and evidence page', () => {
    const request = jobReportQuerySchema.parse({ ...initialJobQuery, filters: { ...empty, statuses: ['completed'] },
      period: { from: '2026-08-01', to: '2026-08-31' } });
    const { projection, filterOptions } = adapt(request);
    expect(projection.state.kind).toBe('ready');
    expect(filterOptions.statuses).toHaveLength(6);
    expect(filterOptions.owners.map(item => item.value)).toContain('unassigned');
    const current = adapt(jobReportQuerySchema.parse({ ...workload, filters: { ...empty, statuses: ['waiting'] } }));
    expect(current.filterOptions.statuses).toHaveLength(4);
    expect(current.filterOptions.services.map(item => item.value)).toContain('service:repair');
  });
  it('retains assigned supporting visibility without replacing primary-owner identity with Me', () => {
    const raw = jobReadResponse(workload, 'assigned');
    const { projection, filterOptions } = adaptJobReadResponse(raw, { request: workload,
      scopeKey: jobReportScopeKey(raw), today: raw.today, timezone: raw.report.timezone });
    if (projection.view !== 'workload' || projection.state.kind !== 'ready') throw new Error('Expected ready workload.');
    expect(projection.state.result.counts.active).toBe(1);
    expect(projection.state.result.rows[0]?.primaryOwnerId).toBe('member-a');
    expect(filterOptions.owners.map(option => option.value)).toEqual(['member:member-a']);
    expect(JSON.stringify(projection)).not.toContain('Teammate B');
    expect(JSON.stringify(projection)).not.toContain('Installation');
    expect(visibleJobRecord(raw, '00000000-0000-4000-8000-000000000102')).toBeUndefined();
  });
  it('permits only currently displayed native record and evidence identities', () => {
    const raw = jobReadResponse(jobReportQuerySchema.parse({ ...workload, selection: { kind: 'metric', metric: 'waiting' } }));
    expect(visibleJobRecord(raw, '00000000-0000-4000-8000-000000000103')).toBe('00000000-0000-4000-8000-000000000103');
    expect(visibleJobRecord(raw, '00000000-0000-4000-8000-000000000101')).toBeUndefined();
    expect(visibleJobRecord(raw, 'd2')).toBeUndefined();
    for (const id of ['day:2026-10-12', 'owner:member-a', 'export', 'completion']) expect(() => jobReportEvidenceSelection(raw, id)).toThrow();
    if (initial.report.view !== 'lifecycle') throw new Error('Expected lifecycle.');
    const lifecycle = initial.report;
    expect(() => adapt(initialJobQuery, { ...initial, report: { ...lifecycle,
      evidenceIds: { ...lifecycle.evidenceIds, reopened: lifecycle.evidenceIds.created } } })).toThrow();
  });
  it('rejects stale authority/query/clock/facets and malformed private evidence', () => {
    const raw = jobReadResponse(workload);
    for (const change of [{ workspaceId: '00000000-0000-4000-8000-000000000009' },
      { viewerId: 'another-viewer' }, { policyRevision: 2 }, { scope: 'assigned' },
      { query: { ...workload, page: 2 } }, { query: { ...workload, pageSize: 50 } },
      { options: { ...raw.options, context: 'period' } }, { options: { ...raw.options, owners: [] } },
      { report: { ...raw.report, rows: [{ ...raw.report.rows[0], notes: 'private' }] } }]) {
      expect(() => adapt(workload, { ...raw, ...change })).toThrow();
    }
    for (const change of [{ today: '2026-11-06' }, { timezone: 'America/New_York' }, { scopeKey: '' }]) {
      expect(() => adaptJobReadResponse(raw, { request: workload, scopeKey: jobReportScopeKey(raw),
        today: raw.today, timezone: raw.report.timezone, ...change })).toThrow();
    }
  });
  it('clamps backend 25/50/100 pages and preserves authorized empty results', () => {
    for (const pageSize of [25, 50, 100] as const) {
      for (const view of [initialJobQuery, completion, workload]) {
        const request = jobReportQuerySchema.parse({ ...view, page: 999, pageSize });
        const { projection } = adapt(request);
        expect(projection.state).toMatchObject({ kind: 'ready', result: { page: 1, pageSize } });
      }
    }
    const request = jobReportQuerySchema.parse({ ...completion, period: { from: '2026-08-01', to: '2026-08-31' } });
    expect(adapt(request).projection.state).toMatchObject({ kind: 'ready',
      result: { total: 0, rows: [], duration: { sampleSize: 0, totalElapsedDays: 0 } } });
  });
  it('preserves bounded 130-record native pages without deriving totals from visible rows', () => {
    for (const pageSize of [25, 50, 100] as const) {
      const ids = new Set<string>();
      for (let page = 1; page <= Math.ceil(130 / pageSize); page++) {
        const request = jobReportQuerySchema.parse({ ...workload, page, pageSize });
        const raw = largeJobReadResponse(request), pageRows = raw.report.rows;
        const projection = adapt(request, raw).projection;
        expect(projection.state).toMatchObject({ kind: 'ready', result: { counts: { active: 130 }, rows: pageRows, page, pageSize } });
        for (const row of pageRows) {
          expect(visibleJobRecord(raw, row.recordId)).toBe(row.id);
          expect(ids.has(row.id)).toBe(false);
          ids.add(row.id);
        }
      }
      expect(ids.size).toBe(130);
      const request = jobReportQuerySchema.parse({ ...workload, page: 999, pageSize });
      expect(adapt(request, largeJobReadResponse(request)).projection.state).toMatchObject({
        kind: 'ready', result: { page: Math.ceil(130 / pageSize), pageSize },
      });
    }
  });
});
