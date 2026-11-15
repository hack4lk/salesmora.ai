'use client';

import { useId } from 'react';
import { addCalendarDays } from '@salesmora/domain';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { copy as jobStatusCopy } from '../../jobs/job-status-dialog/job-status-dialog.data';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { jobWorkloadMetrics, jobWorkloadProjectionTotal, validJobWorkloadResult, type JobWorkloadResult } from './job-workload-report.validation';
import { jobWorkloadReportData as copy } from './job-workload-report.data';

export type JobWorkloadReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: JobWorkloadResult };
export type JobWorkloadReportProps = {
  state: JobWorkloadReportState;
  canRead: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

/** Host-owned current grants, facets and same-snapshot counts; never derived from period lifecycle results. */
export function JobWorkloadReport({ state, canRead, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: JobWorkloadReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validJobWorkloadResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const current = `${result.snapshotLabel} / ${copy.mode}`;
  const window = `Business-local today: ${formatReportDate(result.today)}. Due soon: ${formatReportDate(result.today)} to ${formatReportDate(addCalendarDays(result.today, 7))}, both dates included.`;
  const selected = result.selected;
  const viewLabel = selected.kind === 'metric' ? copy.labels[selected.metric]
    : result.groups[selected.group].find(group => group.id === selected.id)!.label;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.scope, result.scopeLabel, copy.definitions.active,
          copy.overlap, copy.definitions.overdue, copy.definitions.dueSoon, window, copy.schedule, copy.definitions.unassigned]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{current}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns
      snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={jobWorkloadMetrics.map(metric => ({ id: metric, label: copy.labels[metric], value: { kind: 'count', value: result.counts[metric] },
        description: copy.definitions[metric], dateBasisLabel: `${current} / ${window}`, evidenceId: result.evidenceIds[metric] }))} />
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <ReportBreakdown groupLabel="Current status" total={result.counts.active} groups={result.groups.status} contextLabel={copy.mode} canRead pending={pending} onEvidence={onEvidence} />
      <ReportBreakdown groupLabel="Current primary owner" total={result.counts.active} groups={result.groups.owner} contextLabel="Primary responsibility only; supporting participation is separate." canRead pending={pending} onEvidence={onEvidence} />
      <ReportBreakdown groupLabel="Current service" total={result.counts.active} groups={result.groups.service} contextLabel={copy.mode} canRead pending={pending} onEvidence={onEvidence} />
      <ReportBreakdown groupLabel="Waiting reason" total={result.counts.waiting} groups={result.groups.waitingReason} contextLabel="Recorded reasons for currently Waiting Jobs." canRead pending={pending} onEvidence={onEvidence} />
    </div>
      <ReportEvidenceTable viewLabel={viewLabel} contextInTooltip contextLabel={`${current} / ${result.scopeLabel} / ${window} / ${copy.overlap} / ${copy.schedule}`}
        columns={[{ id: 'status', label: 'Current status' }, { id: 'deadline', label: 'Completion deadline' }, { id: 'scheduled', label: 'Scheduled work date' },
          { id: 'owner', label: 'Current primary owner' }, { id: 'service', label: 'Current service' }, { id: 'waiting', label: 'Waiting reason' }]}
        rows={result.rows.map(row => ({ ...row, cells: { ...row.cells, status: jobStatusBadgeData[row.status].label,
          deadline: row.completionDeadline === null ? 'No completion deadline' : formatReportDate(row.completionDeadline),
          scheduled: row.scheduledDate === null ? 'Not scheduled' : formatReportDate(row.scheduledDate),
          owner: row.primaryOwnerId === null ? copy.labels.unassigned : row.cells.owner,
          waiting: row.waitingReason === null ? 'Not Waiting' : jobStatusCopy.waitingReasons[row.waitingReason] } }))}
        total={jobWorkloadProjectionTotal(result)!} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
        onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
