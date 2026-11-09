import { jobReportQuerySchema, jobReportReadResultSchema, jobLifecycleResultSchema, jobCompletionResultSchema, jobWorkloadResultSchema,
  jobStatuses, type JobReportQuery } from '@salesmora/contracts';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { workloadResult } from '../job-workload-report/job-workload-report.fixtures';
import { jobWorkspaceResponse, jobWorkspaceRows, jobWorkspacePeriod } from './job-report-workspace.fixtures';

export const jobReadWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const initialJobQuery = jobReportQuerySchema.parse({ workspaceId: jobReadWorkspaceId, view: 'lifecycle',
  period: { from: jobWorkspacePeriod.from, to: jobWorkspacePeriod.to }, filters: { statuses: [], owners: [], services: [] },
  selectedView: 'created', page: 1, pageSize: 25 });
const nativeService = (id: string) => id === 'none' ? id : `service:${id}`;
const mockService = (id: string) => id === 'none' ? id : id.slice('service:'.length);
function uuid(id: string): string {
  const index = jobWorkspaceRows.findIndex(row => row.id === id);
  if (index < 0) throw new Error('Unknown fictional Job identity.');
  return `00000000-0000-4000-8000-${String(index + 101).padStart(12, '0')}`;
}
function status(label: string) {
  const value = jobStatuses.find(value => jobStatusBadgeData[value].label === label);
  if (!value) throw new Error('Unknown fictional Job status.');
  return value;
}

/** Strict API envelope over the established fictional canonical population, not a live authorization engine. */
export function jobReadResponse(query: JobReportQuery, scope: 'workspace' | 'assigned' = 'workspace') {
  const population = scope === 'assigned' ? jobWorkspaceRows.filter(row => row.id === 'd0') : jobWorkspaceRows;
  const filters = { ...query.filters, services: query.filters.services.map(mockService) };
  const range = 'period' in query ? { ...jobWorkspacePeriod, ...query.period } : jobWorkspacePeriod;
  let evidence: string | undefined;
  if (query.view === 'lifecycle') evidence = query.selectedView;
  else if (query.view === 'completion') evidence = query.selectedDate === undefined ? undefined : `day:${query.selectedDate}`;
  else if (query.selection.kind === 'metric') evidence = query.selection.metric;
  else {
    const { group, id } = query.selection;
    const mockId = group === 'service' ? mockService(id) : id;
    const selected = workloadResult.groups[group].find(item => item.id === mockId);
    if (!selected?.evidenceId) throw new Error('Unknown fictional workload selection.');
    evidence = selected.evidenceId;
  }
  const projection = jobWorkspaceResponse(query.view, filters, evidence, query.page, query.pageSize, range, population);
  const common = { asOf: '2026-11-05T09:00:00.000Z', timezone: 'Europe/Warsaw',
    scopeLabel: scope === 'assigned' ? 'Current supporting assignment to the fictional overdue repair.' : 'All authorized fictional Jobs.',
    filters: query.filters, pageSize: query.pageSize };
  let report;
  if (projection.view === 'lifecycle' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    report = jobLifecycleResultSchema.parse({ ...common, view: 'lifecycle', ...(query.view === 'lifecycle' ? query.period : {}),
      counts: result.counts, coverage: result.coverage, evidenceIds: result.evidenceIds, selectedView: result.selectedView,
      page: result.page, evidenceTotal: result.counts[result.selectedView], rows: result.rows.map(row => ({
        id: uuid(row.id), recordId: uuid(row.id), label: row.label,
        cells: { date: row.cells.date, status: status(String(row.cells.status)), owner: row.cells.owner, service: row.cells.service },
      })) });
  } else if (projection.view === 'completion' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    report = jobCompletionResultSchema.parse({ ...common, view: 'completion', from: result.from, to: result.to,
      total: result.total, coverage: result.coverage, days: result.days.map(day => ({ ...day, evidenceId: `completion:day:${day.date}` })),
      duration: { ...result.duration, averageElapsedDays: result.duration.sampleSize === 0 ? null : result.duration.totalElapsedDays / result.duration.sampleSize },
      evidenceId: 'completion', selectedDate: result.selectedDate, page: result.page,
      evidenceTotal: result.selectedDate === undefined ? result.total : result.days.find(day => day.date === result.selectedDate)!.count,
      rows: result.rows.map(row => ({ id: uuid(row.id), recordId: uuid(row.id), label: row.label,
        createdDate: row.createdDate, completionDate: row.completionDate, cells: { status: status(String(row.cells.status)), owner: row.cells.owner } })) });
  } else if (projection.view === 'workload' && projection.state.kind === 'ready' && query.view === 'workload') {
    const result = projection.state.result;
    const groups = {
      status: result.groups.status, waitingReason: result.groups.waitingReason,
      owner: result.groups.owner.filter(group => group.count > 0 || group.id === 'unassigned')
        .map(group => ({ ...group, evidenceId: `owner:${group.id}` })),
      service: result.groups.service.filter(group => group.count > 0 || group.id === 'none')
        .map(group => ({ ...group, id: nativeService(group.id), evidenceId: `service:${nativeService(group.id)}` })),
    };
    const selection = query.selection;
    report = jobWorkloadResultSchema.parse({ ...common, view: 'workload', today: result.today,
      counts: result.counts, groups, evidenceIds: result.evidenceIds, selection: query.selection, page: result.page,
      evidenceTotal: selection.kind === 'metric' ? result.counts[selection.metric]
        : groups[selection.group].find(group => group.id === selection.id)!.count,
      rows: result.rows.map(row => ({ ...row, id: uuid(row.id), recordId: uuid(row.id), serviceId: nativeService(row.serviceId) })) });
  } else throw new Error('Expected a ready fictional Jobs projection.');
  const facetRows = query.view === 'workload' ? population.filter(row => !['completed', 'canceled'].includes(row.status)) : population;
  const owners = [...new Map(facetRows.map(row => {
    const value = row.primaryOwnerId === null ? 'unassigned' : `member:${row.primaryOwnerId}`;
    return [value, { value, label: String(row.cells.owner) }] as const;
  })).values()];
  const services = [...new Map(facetRows.map(row => {
    const value = nativeService(row.serviceId);
    return [value, { value, label: String(row.cells.service) }] as const;
  })).values()];
  return jobReportReadResultSchema.parse({ workspaceId: query.workspaceId, viewerId: scope === 'assigned' ? 'supporting-viewer' : 'jobs-viewer',
    policyRevision: 1, scope, exportScope: null, today: workloadResult.today, query, report,
    options: { context: query.view === 'workload' ? 'current' : 'period',
      statuses: (query.view === 'workload' ? jobStatuses.slice(0, 4) : jobStatuses).map(value => ({ value, label: jobStatusBadgeData[value].label })),
      owners, services } });
}

/** Repeat the fictional native workload to exercise bounded host paging, never live totals. */
export function largeJobReadResponse(query: JobReportQuery) {
  if (query.view !== 'workload') throw new Error('The large fictional population supports Workload only.');
  const initial = jobReadResponse({ ...query, page: 1 });
  if (initial.report.view !== 'workload') throw new Error('Expected fictional Workload.');
  const report = initial.report, factor = 26;
  const rows = report.rows.flatMap(row => Array.from({ length: factor }, (_, copy) => {
    const id = `00000000-0000-4000-8000-${String(Number(row.id.slice(-12)) * factor + copy).padStart(12, '0')}`;
    return { ...row, id, recordId: id, label: `${row.label} / copy ${copy + 1}` };
  }));
  const evidenceTotal = report.evidenceTotal * factor;
  const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
  const scaled = (groups: typeof report.groups.status) => groups.map(group => ({ ...group, count: group.count * factor }));
  return jobReportReadResultSchema.parse({ ...initial, query, report: { ...report, page, evidenceTotal,
    counts: { active: report.counts.active * factor, overdue: report.counts.overdue * factor,
      dueSoon: report.counts.dueSoon * factor, noDeadline: report.counts.noDeadline * factor,
      waiting: report.counts.waiting * factor, unassigned: report.counts.unassigned * factor },
    groups: { status: scaled(report.groups.status), owner: scaled(report.groups.owner),
      service: scaled(report.groups.service), waitingReason: scaled(report.groups.waitingReason) },
    rows: rows.slice((page - 1) * query.pageSize, page * query.pageSize) } });
}
