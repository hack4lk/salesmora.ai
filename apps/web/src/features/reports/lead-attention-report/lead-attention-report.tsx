'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { validLeadAttentionCounts, type LeadAttentionCounts, type LeadAttentionView } from './lead-attention-report.validation';
import { leadAttentionReportData as copy } from './lead-attention-report.data';
import { ReportDashboardLayout } from '../report-dashboard-layout/report-dashboard-layout';

export type LeadAttentionResult = {
  snapshotLabel: string;
  scopeLabel: string;
  /** Host-formatted exact cutoff from the same server-owned snapshot as the counts. */
  inactivityCutoffLabel: string;
  counts: LeadAttentionCounts;
  evidenceIds: Readonly<Partial<Record<LeadAttentionView, string>>>;
  selectedView: LeadAttentionView;
  rows: readonly ReportEvidenceRow[];
  page: number;
  pageSize: number;
};
export type LeadAttentionReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: LeadAttentionResult };
export type LeadAttentionReportProps = {
  state: LeadAttentionReportState;
  canRead: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  dashboard?: boolean;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

/** Hosts query current grants and predicates independently; no attention is inferred from period rows. */
export function LeadAttentionReport({ state, canRead, canExport, canEdit, pending = false, dashboard = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: LeadAttentionReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  const total = result.counts[result.selectedView];
  const valid = validLeadAttentionCounts(result.counts) && result.inactivityCutoffLabel.trim().length > 0 &&
    Number.isSafeInteger(result.page) && result.page > 0 && Number.isSafeInteger(result.pageSize) && result.pageSize > 0 &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    result.rows.every(row => row.id.trim() && ['stage', 'owner', 'activity', 'reason'].every(column => Object.hasOwn(row.cells, column)));
  if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  const cutoff = `Inactivity cutoff: ${result.inactivityCutoffLabel}. Activity must be strictly earlier; equality is excluded.`;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.scope, result.scopeLabel, copy.openOnly, copy.overlap, copy.definitions.inactive, cutoff, copy.definitions.unowned]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{result.snapshotLabel} / {copy.mode}</p>
    </header>
    <ReportDashboardLayout dashboard={dashboard} summary={<ReportSummary canRead hideHeader compact={dashboard} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} metrics={(['inactive', 'unowned', 'combined'] as const).map(view => ({
        id: view, label: copy.labels[view], value: { kind: 'count', value: result.counts[view] },
        description: `${copy.definitions[view]} ${copy.openOnly}`,
        dateBasisLabel: `${copy.mode} / ${result.snapshotLabel}${view === 'inactive' ? ` / ${cutoff}` : ''}`,
        evidenceId: result.evidenceIds[view],
      }))} />}>
    <ReportEvidenceTable viewLabel={copy.labels[result.selectedView]} contextInTooltip
      contextLabel={`${result.snapshotLabel} / ${copy.mode} / ${result.scopeLabel} / ${copy.openOnly} / ${copy.definitions[result.selectedView]} / ${cutoff} / ${copy.evidence}`}
      columns={[{ id: 'stage', label: 'Current stage' }, { id: 'owner', label: 'Current primary owner' },
        { id: 'activity', label: 'Last recorded activity' }, { id: 'reason', label: 'Attention reason' }]}
      rows={result.rows} total={total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit}
      pending={pending} onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
      onRetry={onRetry} onEdit={onEdit} />
    </ReportDashboardLayout>
  </section>;
}
