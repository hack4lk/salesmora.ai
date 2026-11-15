import { addCalendarDays } from '@salesmora/domain';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { jobLifecycleViews, type JobLifecycleView } from '../job-lifecycle-report/job-lifecycle-report.validation';
import { completionElapsedDays } from '../job-completion-report/job-completion-report.validation';
import { jobWorkloadMetrics, jobWorkloadGroupId, jobMatchesWorkload, type JobWorkloadProjection, type JobWorkloadRow } from '../job-workload-report/job-workload-report.validation';
import { workloadRows, workloadResult } from '../job-workload-report/job-workload-report.fixtures';
import type { JobReportFiltersValue } from '../job-report-filters/job-report-filters';
import type { JobReportView, JobReportProjection } from './job-report-workspace';

export const jobWorkspacePeriod = { from: '2026-10-01', to: '2026-10-31',
  periodLabel: 'Oct 1 to Oct 31, 2026, both dates included', snapshotLabel: workloadResult.snapshotLabel,
  scopeLabel: 'Currently authorized Jobs and surviving lifecycle evidence.' };
export const jobWorkspaceRows: readonly JobWorkloadRow[] = [...workloadRows,
  { ...workloadRows[1]!, id: 'closed', recordId: 'closed', label: 'Completed installation', status: 'completed',
    serviceId: 'installation', cells: { owner: 'Teammate A', service: 'Installation' } },
  { ...workloadRows[3]!, id: 'canceled', recordId: 'canceled', label: 'Canceled inquiry', status: 'canceled' },
];
const creationDates: Record<string, string> = { d0: '2026-10-02', d1: '2026-10-15', d2: '2026-09-20',
  d3: '2026-10-31', d5: '2026-09-15', closed: '2026-10-15', canceled: '2026-09-10' };
const events: Record<Exclude<JobLifecycleView, 'created'>, Record<string, string>> = {
  completed: { d0: '2026-10-12', closed: '2026-10-20' },
  canceled: { canceled: '2026-10-22' }, reopened: { d0: '2026-10-18' },
};

/** Shared fictional population; d0 retains its selected October completion after reopening. */
export function jobWorkspaceResponse(view: JobReportView, filters: JobReportFiltersValue, evidence?: string, page = 1, pageSize = 25,
  range = jobWorkspacePeriod, population = jobWorkspaceRows): JobReportProjection {
  const authorized = population.filter(row =>
    (!filters.statuses.length || filters.statuses.includes(row.status)) &&
    (!filters.owners.length || filters.owners.includes(jobWorkloadGroupId(row, 'owner')!)) &&
    (!filters.services.length || filters.services.includes(row.serviceId)));
  const inPeriod = (date: string | undefined): date is string => date !== undefined && date >= range.from && date <= range.to;
  const paging = (total: number) => Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  if (view === 'lifecycle') {
    const selectedView = jobLifecycleViews.find(view => view === evidence) ?? 'completed';
    const selected = (view: JobLifecycleView) => authorized.filter(row => inPeriod(view === 'created' ? creationDates[row.id] : events[view][row.id]));
    const selectedRows = selected(selectedView), selectedPage = paging(selectedRows.length);
    return { view, state: { kind: 'ready', result: { ...range,
      counts: { created: selected('created').length, completed: selected('completed').length, canceled: selected('canceled').length, reopened: selected('reopened').length },
      coverage: { created: { kind: 'complete' }, completed: { kind: 'complete' }, canceled: { kind: 'complete' }, reopened: { kind: 'complete' } },
      evidenceIds: { created: 'created', completed: 'completed', canceled: 'canceled', reopened: 'reopened' }, selectedView,
      rows: selectedRows.slice((selectedPage - 1) * pageSize, selectedPage * pageSize).map(row => ({ ...row,
        cells: { ...row.cells, date: (selectedView === 'created' ? creationDates[row.id] : events[selectedView][row.id])!,
          status: jobStatusBadgeData[row.status].label } })), page: selectedPage, pageSize,
    } } };
  }
  if (view === 'completion') {
    const completed = authorized.filter(row => inPeriod(events.completed[row.id]));
    const selectedDate = evidence?.startsWith('day:') ? evidence.slice(4) : undefined;
    const selectedRows = completed.filter(row => selectedDate === undefined || events.completed[row.id] === selectedDate), selectedPage = paging(selectedRows.length);
    const count = (Date.parse(`${range.to}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / 86400000 + 1;
    return { view, state: { kind: 'ready', result: { ...range, total: completed.length, coverage: { kind: 'complete' },
      days: Array.from({ length: count }, (_, i) => {
        const date = addCalendarDays(range.from, i);
        return { date, count: completed.filter(row => events.completed[row.id] === date).length, evidenceId: `day:${date}` };
      }), duration: { sampleSize: completed.length, totalElapsedDays: completed.reduce((sum, row) =>
        sum + completionElapsedDays(creationDates[row.id]!, events.completed[row.id]!)!, 0) },
      evidenceId: 'completed', selectedDate,
      rows: selectedRows.slice((selectedPage - 1) * pageSize, selectedPage * pageSize).map(row => ({ ...row,
        createdDate: creationDates[row.id]!, completionDate: events.completed[row.id]!,
        cells: { ...row.cells, status: jobStatusBadgeData[row.status].label } })), page: selectedPage, pageSize,
    } } };
  }
  const active = authorized.filter(row => jobMatchesWorkload(row, 'active', workloadResult.today));
  const metric = jobWorkloadMetrics.find(metric => metric === evidence) ?? 'active';
  let selected: JobWorkloadProjection = { kind: 'metric', metric };
  for (const group of ['status', 'owner', 'service', 'waitingReason'] as const) {
    const option = workloadResult.groups[group].find(option => option.evidenceId === evidence);
    if (option) selected = { kind: 'group', group, id: option.id };
  }
  const selectedProjection = selected;
  const selectedRows = active.filter(row => selectedProjection.kind === 'metric'
    ? jobMatchesWorkload(row, selectedProjection.metric, workloadResult.today) : jobWorkloadGroupId(row, selectedProjection.group) === selectedProjection.id);
  const selectedPage = paging(selectedRows.length);
  const groups = (group: 'status' | 'owner' | 'service' | 'waitingReason') => workloadResult.groups[group].map(option =>
    ({ ...option, count: active.filter(row => jobWorkloadGroupId(row, group) === option.id).length }));
  return { view, state: { kind: 'ready', result: { ...workloadResult,
    counts: { active: active.length, overdue: active.filter(row => jobMatchesWorkload(row, 'overdue', workloadResult.today)).length,
      dueSoon: active.filter(row => jobMatchesWorkload(row, 'dueSoon', workloadResult.today)).length,
      noDeadline: active.filter(row => jobMatchesWorkload(row, 'noDeadline', workloadResult.today)).length,
      waiting: active.filter(row => row.status === 'waiting').length, unassigned: active.filter(row => row.primaryOwnerId === null).length },
    groups: { status: groups('status'), owner: groups('owner'), service: groups('service'), waitingReason: groups('waitingReason') },
    selected, rows: selectedRows.slice((selectedPage - 1) * pageSize, selectedPage * pageSize), page: selectedPage, pageSize,
  } } };
}
