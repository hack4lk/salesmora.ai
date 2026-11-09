import { jobReportQuerySchema, jobReportReadResultSchema, type JobReportQuery, type JobReportReadResult } from '@salesmora/contracts';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import type { JobReportFilterContext, JobReportFiltersValue } from '../job-report-filters/job-report-filters';
import { validJobReportFilters } from '../job-report-filters/job-report-filters';
import { validJobLifecycleResult, type JobLifecycleView } from '../job-lifecycle-report/job-lifecycle-report.validation';
import { validJobCompletionResult } from '../job-completion-report/job-completion-report.validation';
import { validJobWorkloadResult, type JobWorkloadProjection } from '../job-workload-report/job-workload-report.validation';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import type { JobReportProjection, JobReportView } from './job-report-workspace';

export type JobReportEvidence = {
  lifecycle: JobLifecycleView; completion: string | undefined; workload: JobWorkloadProjection;
};
export function jobReportRequest(input: {
  workspaceId: string; view: JobReportView; range: { from: string; to: string };
  filters: Record<JobReportFilterContext, JobReportFiltersValue>;
  evidence: JobReportEvidence; page: number; pageSize: number;
}): JobReportQuery {
  const common = { workspaceId: input.workspaceId, view: input.view,
    filters: input.filters[input.view === 'workload' ? 'current' : 'period'], page: input.page, pageSize: input.pageSize };
  if (input.view === 'workload') return jobReportQuerySchema.parse({ ...common, selection: input.evidence.workload });
  const period = { from: input.range.from, to: input.range.to };
  return jobReportQuerySchema.parse(input.view === 'lifecycle'
    ? { ...common, period, selectedView: input.evidence.lifecycle }
    : { ...common, period, selectedDate: input.evidence.completion });
}
export function jobReportScopeKey(result: JobReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.scope, result.exportScope]);
}
export function adaptJobReadResponse(raw: unknown, input: {
  request: JobReportQuery; scopeKey: string; today: string; timezone: string;
}): { projection: JobReportProjection; filterOptions: JobReportReadResult['options'] } {
  const request = jobReportQuerySchema.parse(input.request), parsed = jobReportReadResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Jobs report data does not match the current request, authority or evidence. Reload the report.');
  const response = parsed.data;
  if (JSON.stringify(response.query) !== JSON.stringify(request) || jobReportScopeKey(response) !== input.scopeKey ||
    response.today !== input.today || response.report.timezone !== input.timezone) {
    throw new Error('Jobs report results no longer match this request or current authority. Reload the report.');
  }
  const report = response.report;
  const snapshotLabel = `Current authorized Jobs / ${new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: report.timezone,
  }).format(new Date(report.asOf))} (${report.timezone})`;
  let projection: JobReportProjection;
  if (report.view === 'workload') {
    const result = { ...report, snapshotLabel, selected: report.selection };
    if (!validJobWorkloadResult(result)) throw new Error('Jobs workload evidence cannot be displayed consistently. Retry the report.');
    projection = { view: 'workload', state: { kind: 'ready', result } };
  } else {
    const common = { snapshotLabel,
      periodLabel: `${formatReportDate(report.from)} - ${formatReportDate(report.to)}, both dates included` };
    if (report.view === 'lifecycle') {
      const result = { ...report, ...common, rows: report.rows.map(row => ({
        ...row, cells: { ...row.cells, status: jobStatusBadgeData[row.cells.status].label },
      })) };
      if (!validJobLifecycleResult(result)) throw new Error('Jobs lifecycle evidence cannot be displayed consistently. Retry the report.');
      projection = { view: 'lifecycle', state: { kind: 'ready', result } };
    } else {
      const result = { ...report, ...common, rows: report.rows.map(row => ({
        ...row, cells: { ...row.cells, status: jobStatusBadgeData[row.cells.status].label },
      })) };
      if (!validJobCompletionResult(result)) throw new Error('Jobs completion evidence cannot be displayed consistently. Retry the report.');
      projection = { view: 'completion', state: { kind: 'ready', result } };
    }
  }
  if (!validJobReportFilters(request.filters, response.options, response.options.context)) {
    throw new Error('Jobs report filters no longer match the current authorized options. Retry the report.');
  }
  return { projection, filterOptions: response.options };
}
export type JobReportEvidenceSelection =
  | { view: 'lifecycle'; evidence: JobReportEvidence['lifecycle'] }
  | { view: 'completion'; evidence: JobReportEvidence['completion'] }
  | { view: 'workload'; evidence: JobReportEvidence['workload'] };
export function jobReportEvidenceSelection(result: JobReportReadResult, id: string): JobReportEvidenceSelection {
  const report = result.report;
  if (report.view === 'lifecycle') {
    const selected = (['created', 'completed', 'canceled', 'reopened'] as const).find(view => report.evidenceIds[view] === id);
    if (selected) return { view: 'lifecycle', evidence: selected };
  } else if (report.view === 'completion') {
    if (report.evidenceId === id) return { view: 'completion', evidence: undefined };
    const day = report.days.find(day => day.evidenceId === id);
    if (day) return { view: 'completion', evidence: day.date };
  } else {
    const metric = (['active', 'overdue', 'dueSoon', 'noDeadline', 'waiting', 'unassigned'] as const)
      .find(metric => report.evidenceIds[metric] === id);
    if (metric) return { view: 'workload', evidence: { kind: 'metric', metric } };
    for (const group of ['status', 'owner', 'service', 'waitingReason'] as const) {
      const selected = report.groups[group].find(item => item.evidenceId === id);
      if (selected) return { view: 'workload', evidence: { kind: 'group', group, id: selected.id } };
    }
  }
  throw new Error('This Jobs evidence selection is unavailable.');
}
export function visibleJobRecord(result: JobReportReadResult, id: string): string | undefined {
  return result.report.rows.find(row => row.recordId === id)?.id;
}
