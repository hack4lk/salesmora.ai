'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip, SeafoamOutlineButton } from '@salesmora/ui';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { copy as jobStatusCopy } from '../../jobs/job-status-dialog/job-status-dialog.data';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { activeJobStatuses } from '../job-workload-report/job-workload-report.validation';
import { jobWorkloadReportData } from '../job-workload-report/job-workload-report.data';
import { teamJobSelectionTotal, validTeamJobsResult, type TeamJobsResult, type TeamJobWorkload } from './team-jobs-report.validation';

export type TeamJobsReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: TeamJobsResult };
export type TeamJobsReportProps = {
  state: TeamJobsReportState;
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
const labels = { active: 'Active Jobs', overdue: 'Overdue', waiting: 'Waiting', unassigned: 'No current primary owner' };
const responsibilityLabels = { primary: 'Primary responsibility', supporting: 'Supporting participation' };
const alphabetic = new Intl.Collator('en', { sensitivity: 'base' });
const participationHelp = 'Supporting participation is non-additive across members. A shared Job can appear for several people, but the overall active count includes it once. Primary responsibility is separate; the primary owner cannot also be a supporting participant on that Job.';

/** Canonical current workload UI; hosts provide authorized distinct Jobs and separate responsibility projections. */
export function TeamJobsReport({ state, canRead, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: TeamJobsReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validTeamJobsResult(result)) return <FormFeedback kind="error" message="Team Jobs workload could not be displayed because its counts, participation, scope or evidence are inconsistent. Retry the report." />;
  const assigned = result.scope.kind === 'assigned';
  const members = [...result.members].sort((a, b) => alphabetic.compare(a.label, b.label) || alphabetic.compare(a.id, b.id));
  const memberLabel = (memberId: string) => assigned ? 'Me' : members.find(member => member.id === memberId)!.label;
  const current = `${result.snapshotLabel} / ${jobWorkloadReportData.mode}`;
  const today = `Business-local today: ${formatReportDate(result.today)}. Due today is not overdue.`;
  const selected = result.selected;
  const viewLabel = selected.kind === 'queue' ? labels[selected.queue]
    : `${selected.kind === 'unassigned' ? labels.unassigned : `${memberLabel(selected.id)} / ${responsibilityLabels[selected.responsibility]}`} / ${selected.filter === 'all' ? labels.active
      : selected.filter === 'overdue' ? labels.overdue : jobStatusBadgeData[selected.filter].label}`;
  function workloadCard(workload: TeamJobWorkload, label: string) {
    return <ReportBreakdown groupLabel={label} total={workload.count} contextLabel={`${current} / ${today}`}
      groups={activeJobStatuses.map(status => ({ id: status, label: jobStatusBadgeData[status].label,
        count: workload.statuses[status], evidenceId: workload.statusEvidenceIds?.[status] }))}
      canRead pending={pending} onEvidence={onEvidence}
      footer={<div className="grid min-w-0 gap-3">
        <p className="m-0 text-sm text-muted">Overdue: <strong className="text-ink tabular-nums">{workload.overdue}</strong>
          {' / '}Waiting: <strong className="text-ink tabular-nums">{workload.waiting}</strong></p>
        <div className="flex min-w-0 flex-wrap gap-3">
          {([
            { label: 'View workload evidence', evidenceId: workload.evidenceId },
            { label: 'View overdue evidence', evidenceId: workload.overdueEvidenceId },
            { label: 'View Waiting evidence', evidenceId: workload.waitingEvidenceId },
          ]).map(action => action.evidenceId === undefined ? null : <SeafoamOutlineButton key={action.label}
            label={action.label} aria-label={`${action.label}: ${label}`} disabled={pending}
            onClick={() => { if (!pending && action.evidenceId !== undefined) onEvidence(action.evidenceId); }} />)}
        </div>
      </div>} />;
  }
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{assigned ? 'My workload / Jobs' : 'Team workload / Jobs'}</h2>
        <HelpTooltip label="About Team Jobs workload" paragraphs={[
          jobWorkloadReportData.definitions.active, participationHelp, jobWorkloadReportData.definitions.overdue, today,
          jobWorkloadReportData.schedule, jobWorkloadReportData.definitions.waiting, jobWorkloadReportData.definitions.unassigned,
          'Members are ordered alphabetically, not ranked. Counts are distinct Jobs, not hours, capacity, utilization or performance scores.',
          assigned ? 'Assigned scope shows only My workload. Primary responsibility and supporting participation contain self only; unrelated primary identities, teammate rosters and unassigned residual totals are withheld.'
            : 'Primary member counts plus the unassigned queue reconcile to distinct Active Jobs. Supporting member counts must not be summed as an exclusive breakdown.',
          result.scopeLabel,
        ]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{current}</p>
      <p className="m-0 text-sm text-muted wrap-anywhere">{participationHelp}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns={assigned} fourColumns={!assigned} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} metrics={[
        ...(['active', 'overdue', 'waiting'] as const).map(queue => ({
          id: queue, label: labels[queue], value: { kind: 'count' as const, value: result.counts[queue] },
          description: jobWorkloadReportData.definitions[queue], dateBasisLabel: `${current} / ${today}`, evidenceId: result.evidenceIds[queue],
        })),
        ...(result.unassigned === null ? [] : [{
          id: 'unassigned', label: labels.unassigned, value: { kind: 'count' as const, value: result.unassigned.count },
          description: jobWorkloadReportData.definitions.unassigned, dateBasisLabel: current, evidenceId: result.evidenceIds.unassigned,
        }]),
      ]} />
    {members.map(member => <section key={member.id} aria-label={`Workload / ${memberLabel(member.id)}`} className="grid min-w-0 gap-4">
      <h3 className="m-0 text-xl font-semibold wrap-anywhere">{memberLabel(member.id)}</h3>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
        {workloadCard(member.primary, `${memberLabel(member.id)} / ${responsibilityLabels.primary}`)}
        {workloadCard(member.supporting, `${memberLabel(member.id)} / ${responsibilityLabels.supporting}`)}
      </div>
    </section>)}
    {result.unassigned !== null && workloadCard(result.unassigned, labels.unassigned)}
    <ReportEvidenceTable viewLabel={viewLabel} contextInTooltip
      contextLabel={`${current} / ${today} / ${result.scopeLabel} / ${participationHelp} / ${jobWorkloadReportData.schedule}`}
      columns={[{ id: 'status', label: 'Current status' }, { id: 'owner', label: 'Current primary owner' },
        { id: 'supporting', label: 'Supporting participation' }, { id: 'deadline', label: 'Completion deadline' },
        { id: 'scheduled', label: 'Scheduled work date' }, { id: 'service', label: 'Current service' }, { id: 'waiting', label: 'Waiting reason' }]}
      rows={result.rows.map(row => ({ ...row, cells: { ...row.cells, status: jobStatusBadgeData[row.status].label,
        owner: row.primary.kind === 'member' ? memberLabel(row.primary.id) : row.primary.kind === 'unassigned' ? labels.unassigned : 'Not disclosed in My workload',
        supporting: row.supportingMemberIds.length === 0 ? assigned ? 'Not supporting this Job' : 'None' : [...row.supportingMemberIds].sort((a, b) =>
          alphabetic.compare(memberLabel(a), memberLabel(b))).map(memberLabel).join(', '),
        deadline: row.completionDeadline === null ? 'No completion deadline' : formatReportDate(row.completionDeadline),
        scheduled: row.scheduledDate === null ? 'Not scheduled' : formatReportDate(row.scheduledDate),
        waiting: row.waitingReason === null ? 'Not Waiting' : jobStatusCopy.waitingReasons[row.waitingReason],
      } }))}
      total={teamJobSelectionTotal(result)!} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
