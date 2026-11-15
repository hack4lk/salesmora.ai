'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary, type ReportSummaryMetric } from '../report-summary/report-summary';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { leadOutcomesReportData as copy } from './lead-outcomes-report.data';
import { ReportDashboardLayout } from '../report-dashboard-layout/report-dashboard-layout';

export type LeadOutcome = 'won' | 'lost';
export type LeadOutcomesResult = {
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  counts: Readonly<Record<LeadOutcome, number>>;
  coverage: { kind: 'complete' } | { kind: 'partial'; explanation: string };
  /** Omit supporting IDs when their projections are not currently authorized. */
  evidenceIds: Readonly<Partial<Record<LeadOutcome, string>>>;
  /** The host selects and queries the matching distinct-lead projection. */
  selectedOutcome: LeadOutcome;
  rows: readonly ReportEvidenceRow[];
  page: number;
  pageSize: number;
};
export type LeadOutcomesReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: LeadOutcomesResult };
export type LeadOutcomesReportProps = {
  state: LeadOutcomesReportState;
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

/** Hosts supply same-snapshot distinct-lead counts and evidence; no stage history is inferred here. */
export function LeadOutcomesReport({ state, canRead, canExport, canEdit, pending = false, dashboard = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: LeadOutcomesReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  const total = result.counts[result.selectedOutcome];
  const valid = Object.values(result.counts).every(count => Number.isSafeInteger(count) && count >= 0) &&
    (result.coverage.kind === 'complete' || result.coverage.explanation.trim().length > 0) &&
    Number.isSafeInteger(result.page) && result.page > 0 && Number.isSafeInteger(result.pageSize) && result.pageSize > 0 &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    result.rows.every(row => row.id.trim() && ['transition', 'assignment', 'source'].every(column => Object.hasOwn(row.cells, column)));
  if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  const metrics: ReportSummaryMetric[] = (['won', 'lost'] as const).map(outcome => ({
    id: outcome, label: outcome === 'won' ? 'Won' : 'Lost',
    value: result.coverage.kind === 'partial'
      ? { kind: 'incomplete', displayValue: String(result.counts[outcome]), coverageLabel: copy.coverage }
      : { kind: 'count', value: result.counts[outcome] },
    description: copy.definition(outcome),
    dateBasisLabel: `${copy.basis} / ${result.periodLabel}`,
    evidenceId: result.evidenceIds[outcome],
  }));
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label="About lead outcomes" paragraphs={[copy.overlap]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
      {result.coverage.kind === 'partial' && <p role="status" className="m-0 text-sm font-semibold text-muted wrap-anywhere">
        {copy.coverage}: {result.coverage.explanation}
      </p>}
    </header>
    <ReportDashboardLayout dashboard={dashboard} summary={<ReportSummary canRead hideHeader compact={dashboard} metrics={metrics} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} />}>
    <ReportEvidenceTable viewLabel={copy.evidence(result.selectedOutcome)} contextInTooltip
      contextLabel={`${result.snapshotLabel} / ${copy.basis} / ${result.periodLabel} / ${result.scopeLabel} / ${copy.evidenceBasis}`}
      columns={[{ id: 'transition', label: 'Latest matching transition' }, { id: 'assignment', label: 'Current assignment' }, { id: 'source', label: 'Current source' }]}
      rows={result.rows} total={total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit}
      pending={pending} onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
      onRetry={onRetry} onEdit={onEdit} />
    </ReportDashboardLayout>
  </section>;
}
