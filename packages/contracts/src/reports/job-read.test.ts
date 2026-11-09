import { describe, expect, it } from 'vitest';
import { jobStatuses, jobWaitingReasons } from '../job';
import { jobReportQuerySchema, jobReportReadResultSchema, type JobReportQuery } from './job-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const recordId = '00000000-0000-4000-8000-000000000002';
const period = { from: '2026-11-03', to: '2026-11-05' };
const filters = { statuses: [], owners: [], services: [] };
const base = { asOf: '2026-11-05T17:00:00.000Z', timezone: 'America/New_York',
  scopeLabel: 'All Jobs authorized by current workspace access.', filters, page: 1, pageSize: 25 };
const option = (value: string) => ({ value, label: value });
const group = (id: string, count: number, evidenceId: string) => ({ id, label: id, count, evidenceId });
const counts = { active: 1, overdue: 0, dueSoon: 1, noDeadline: 0, waiting: 0, unassigned: 0 };
const groups = {
  status: jobStatuses.slice(0, 4).map(status => group(status, status === 'scheduled' ? 1 : 0, `status:${status}`)),
  owner: [group('member:viewer', 1, 'owner:member:viewer'), group('unassigned', 0, 'owner:unassigned')],
  service: [group('service:repair', 1, 'service:service:repair'), group('none', 0, 'service:none')],
  waitingReason: jobWaitingReasons.map(reason => group(reason, 0, `waitingReason:${reason}`)),
};
function response(query: JobReportQuery) {
  const common = { ...base, view: query.view, filters: query.filters, pageSize: query.pageSize };
  const row = { id: recordId, recordId, label: 'J-0002 / Repair' };
  let report;
  if (query.view === 'lifecycle') {
    report = { ...common, ...period, counts: { created: 1, completed: 1, canceled: 1, reopened: 1 },
      coverage: { created: { kind: 'complete' }, completed: { kind: 'complete' },
        canceled: { kind: 'partial', explanation: 'Surviving transitions only.' }, reopened: { kind: 'complete' } },
      evidenceIds: { created: 'created', completed: 'completed', canceled: 'canceled', reopened: 'reopened' },
      selectedView: query.selectedView, evidenceTotal: 1,
      rows: [{ ...row, cells: { date: period.from, status: 'scheduled', owner: 'Viewer', service: 'repair' } }] };
  } else if (query.view === 'completion') {
    const total = query.selectedDate === undefined || query.selectedDate === period.from ? 1 : 0;
    report = { ...common, ...period, total: 1, coverage: { kind: 'complete' },
      days: [period.from, '2026-11-04', period.to].map(date => ({ date, count: date === period.from ? 1 : 0, evidenceId: `completion:day:${date}` })),
      duration: { sampleSize: 1, totalElapsedDays: 0, averageElapsedDays: 0 }, evidenceId: 'completion',
      selectedDate: query.selectedDate, evidenceTotal: total,
      rows: total ? [{ ...row, createdDate: period.from, completionDate: period.from, cells: { status: 'scheduled', owner: 'Viewer' } }] : [] };
  } else {
    const selection = query.selection;
    const total = selection.kind === 'metric' ? counts[selection.metric] : groups[selection.group].find(group => group.id === selection.id)!.count;
    report = { ...common, today: period.to, counts, groups, selection, evidenceTotal: total,
      evidenceIds: { active: 'active', overdue: 'overdue', dueSoon: 'dueSoon', noDeadline: 'noDeadline', waiting: 'waiting', unassigned: 'unassigned' },
      rows: total ? [{ ...row, cells: { owner: 'Viewer', service: 'repair' }, status: 'scheduled',
        completionDeadline: period.to, scheduledDate: period.from, primaryOwnerId: 'viewer', serviceId: 'service:repair', waitingReason: null }] : [] };
  }
  return jobReportReadResultSchema.parse({ workspaceId, viewerId: 'viewer', policyRevision: 1, scope: 'workspace', exportScope: null,
    today: period.to, query, report, options: { context: query.view === 'workload' ? 'current' : 'period',
      statuses: (query.view === 'workload' ? jobStatuses.slice(0, 4) : jobStatuses).map(option),
      owners: [option('member:viewer')], services: [option('service:repair')] } });
}
const lifecycle = jobReportQuerySchema.parse({ workspaceId, view: 'lifecycle', period, filters, selectedView: 'created' });
const completion = jobReportQuerySchema.parse({ workspaceId, view: 'completion', period, filters });
const workload = jobReportQuerySchema.parse({ workspaceId, view: 'workload', filters, selection: { kind: 'metric', metric: 'active' } });

describe('Jobs authority read envelope', () => {
  it('preserves four lifecycle selections and partial surviving-event coverage', () => {
    for (const selectedView of ['created', 'completed', 'canceled', 'reopened']) {
      const result = response(jobReportQuerySchema.parse({ ...lifecycle, selectedView, page: 999 }));
      expect(result.report.page).toBe(1);
      expect(result.report).toMatchObject({ selectedView, coverage: { canceled: { kind: 'partial' } } });
    }
  });
  it('preserves all and per-day completion selection, including genuine zero and zero elapsed days', () => {
    for (const selectedDate of [undefined, period.from, '2026-11-04']) {
      expect(response(jobReportQuerySchema.parse({ ...completion, selectedDate })).report)
        .toMatchObject({ selectedDate, duration: { sampleSize: 1, totalElapsedDays: 0, averageElapsedDays: 0 } });
    }
    expect(jobReportQuerySchema.safeParse({ ...completion, selectedDate: '2026-11-06' }).success).toBe(false);
  });
  it('preserves six workload metrics and all grouping selections, including absent zero placeholders', () => {
    for (const metric of Object.keys(counts)) response(jobReportQuerySchema.parse({ ...workload, selection: { kind: 'metric', metric } }));
    for (const group of ['status', 'owner', 'service', 'waitingReason'] as const) {
      for (const item of groups[group]) response(jobReportQuerySchema.parse({ ...workload, selection: { kind: 'group', group, id: item.id } }));
    }
  });
  it('rejects forged identity/query fields, closed current statuses and unsupported current date controls', () => {
    for (const extra of [{ viewerId: 'forged' }, { role: 'owner' }, { period }, { selectedDate: period.from }]) {
      expect(jobReportQuerySchema.safeParse({ ...workload, ...extra }).success).toBe(false);
    }
    expect(jobReportQuerySchema.safeParse({ ...workload, filters: { ...filters, statuses: ['completed'] } }).success).toBe(false);
    expect(jobReportQuerySchema.safeParse({ ...lifecycle, unexpected: true }).success).toBe(false);
  });
  it('rejects mismatched query, facets, clocks and private evidence while retaining assigned primary-owner semantics', () => {
    const initial = response(lifecycle);
    expect(jobReportReadResultSchema.safeParse({ ...initial, scope: 'assigned', exportScope: 'workspace' }).success).toBe(false);
    expect(jobReportReadResultSchema.safeParse({ ...initial, exportScope: 'assigned' }).success).toBe(true);
    for (const change of [
      { workspaceId: recordId }, { today: '2026-11-04' }, { policyRevision: Number.MAX_SAFE_INTEGER + 1 },
      { query: { ...lifecycle, selectedView: 'completed' } }, { query: { ...lifecycle, period: { ...period, from: '2026-11-02' } } },
      { query: { ...lifecycle, pageSize: 50 } }, { query: { ...lifecycle, filters: { ...filters, owners: ['member:hidden'] } } },
      { options: { ...initial.options, context: 'current' } },
      { options: { ...initial.options, owners: [option('viewer')] } },
      { options: { ...initial.options, services: [option('repair')] } },
      { options: { ...initial.options, statuses: [option('scheduled'), option('scheduled')] } },
      { report: { ...initial.report, timezone: 'Invalid/Timezone' } },
      { report: { ...initial.report, evidenceIds: { created: 'created', completed: 'created', canceled: 'canceled', reopened: 'reopened' } } },
      { report: { ...initial.report, rows: [{ ...initial.report.rows[0], notes: 'Private' }] } },
    ]) expect(jobReportReadResultSchema.safeParse({ ...initial, ...change }).success).toBe(false);
    const current = response(workload);
    expect(jobReportReadResultSchema.safeParse({ ...current, options: { ...current.options, owners: [] } }).success).toBe(false);
    expect(jobReportReadResultSchema.safeParse({ ...current, options: { ...current.options, statuses: [option('completed')] } }).success).toBe(false);
    expect(jobReportReadResultSchema.safeParse({ ...current, query: { ...workload, selection: { kind: 'metric', metric: 'dueSoon' } } }).success).toBe(false);
    const completed = response(completion);
    expect(jobReportReadResultSchema.safeParse({ ...completed, query: { ...completion, selectedDate: period.from } }).success).toBe(false);
    // Assigned Jobs may be supported by the viewer with a different authorized primary owner.
    expect(jobReportReadResultSchema.safeParse({ ...initial, scope: 'assigned', viewerId: 'supporting-viewer' }).success).toBe(true);
  });
});
