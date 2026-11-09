'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip, SeafoamOutlineButton } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { leadAttentionReportData } from '../lead-attention-report/lead-attention-report.data';
import { teamOpenLeadStages, teamLeadOwnerKey, teamLeadSelectionTotal, validTeamLeadsResult, type TeamLeadsResult } from './team-leads-report.validation';

export type TeamLeadsReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: TeamLeadsResult };
export type TeamLeadsReportProps = {
  state: TeamLeadsReportState;
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
const labels = { open: 'Open Leads', inactive: 'Seven-day inactivity', unassigned: 'No current primary owner' };
const stageLabels = { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent' };
const definitions = {
  open: leadAttentionReportData.openOnly,
  inactive: leadAttentionReportData.definitions.inactive,
  unassigned: leadAttentionReportData.definitions.unowned,
};
const alphabetic = new Intl.Collator('en', { sensitivity: 'base' });

/** Current authorized member projections only; no rankings, historical attribution or capacity inference. */
export function TeamLeadsReport({ state, canRead, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: TeamLeadsReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validTeamLeadsResult(result)) return <FormFeedback kind="error" message="Team Leads workload could not be displayed because its counts, scope or evidence are inconsistent. Retry the report." />;
  const assigned = result.scope.kind === 'assigned';
  const owners = [...result.owners].sort((a, b) => a.id === 'unassigned' ? 1 : b.id === 'unassigned' ? -1
    : alphabetic.compare(a.label, b.label) || alphabetic.compare(a.id, b.id));
  const ownerLabel = (key: string) => assigned ? 'Me' : key === 'unassigned' ? labels.unassigned : owners.find(owner => owner.id === key)!.label;
  const current = `${result.snapshotLabel} / ${leadAttentionReportData.mode}`;
  const cutoff = `Inactivity cutoff: ${result.inactivityCutoffLabel}. Activity must be strictly earlier; equality is excluded.`;
  const selected = result.selected;
  const viewLabel = selected.kind === 'queue' ? labels[selected.queue] : `${ownerLabel(selected.id)} / ${selected.stage !== undefined
    ? stageLabels[selected.stage] : selected.inactiveOnly ? labels.inactive : labels.open}`;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{assigned ? 'My workload / Leads' : 'Team workload / Leads'}</h2>
        <HelpTooltip label="About Team Leads workload" paragraphs={[
          definitions.open, definitions.inactive, cutoff, definitions.unassigned,
          'Current primary responsibility and surviving membership determine owner groups. Former identities are not reconstructed from missing membership. Stage counts reconcile independently within each owner.',
          'Inactivity overlaps owner/stage groups; do not add it to open counts. Counts are distinct Leads, not hours, capacity, utilization or performance scores.',
          assigned ? 'Assigned scope shows only My workload, with no unrelated teammate identities, unassigned queue or workspace residual totals.'
            : 'Authorized members are listed alphabetically, not ranked by count. The unassigned queue is separate and includes records needing reassignment.',
          result.scopeLabel,
        ]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{current}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={(assigned ? ['open', 'inactive'] as const : ['open', 'inactive', 'unassigned'] as const).map(queue => ({
        id: queue, label: labels[queue], value: { kind: 'count', value: result.counts[queue] },
        description: definitions[queue], dateBasisLabel: `${current} / ${cutoff}`, evidenceId: result.evidenceIds[queue],
      }))} />
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      {owners.map(owner => <ReportBreakdown key={owner.id} groupLabel={`${ownerLabel(owner.id)} / current stage`} total={owner.count}
          groups={teamOpenLeadStages.map(stage => ({ id: stage, label: stageLabels[stage], count: owner.stages[stage], evidenceId: owner.stageEvidenceIds?.[stage] }))}
          contextLabel={`Current primary responsibility / ${current}`} canRead pending={pending} onEvidence={onEvidence}
          footer={<div className="flex min-w-0 flex-wrap items-center gap-3">
          <p className="m-0 text-sm text-muted">{labels.inactive}: <strong className="tabular-nums text-ink">{owner.inactive}</strong></p>
          {owner.evidenceId !== undefined && <SeafoamOutlineButton label="View owner evidence" aria-label={`View owner evidence: ${ownerLabel(owner.id)}`}
            disabled={pending} onClick={() => { if (!pending && owner.evidenceId !== undefined) onEvidence(owner.evidenceId); }} />}
          {owner.inactiveEvidenceId !== undefined && <SeafoamOutlineButton label="View inactive evidence" aria-label={`View inactive evidence: ${ownerLabel(owner.id)}`}
            disabled={pending} onClick={() => { if (!pending && owner.inactiveEvidenceId !== undefined) onEvidence(owner.inactiveEvidenceId); }} />}
          </div>} />)}
    </div>
    <ReportEvidenceTable viewLabel={viewLabel} contextInTooltip contextLabel={`${current} / ${result.scopeLabel} / ${cutoff} / ${definitions.open} / ${definitions.unassigned}`}
      columns={[{ id: 'stage', label: 'Current stage' }, { id: 'owner', label: 'Current primary owner' },
        { id: 'created', label: 'Creation date' }, { id: 'activity', label: 'Last recorded activity' }, { id: 'inactive', label: 'Seven-day inactivity' }]}
      rows={result.rows.map(row => ({ ...row, cells: { ...row.cells, stage: stageLabels[teamOpenLeadStages.find(stage => stage === row.stage)!],
        owner: ownerLabel(teamLeadOwnerKey(row)), inactive: row.inactive ? 'Yes' : 'No' } }))}
      total={teamLeadSelectionTotal(result)!} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
