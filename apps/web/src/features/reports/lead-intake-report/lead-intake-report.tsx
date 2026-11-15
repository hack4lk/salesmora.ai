'use client';

import { useId } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown, type ReportBreakdownGroup } from '../report-breakdown/report-breakdown';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportCurrentContext, type ReportCurrentContextState } from '../report-current-context/report-current-context';
import { ReportResultState } from '../report-result-state/report-result-state';
import { leadIntakeReportData as copy } from './lead-intake-report.data';
import { ReportIntakeTrend } from '../report-intake-trend/report-intake-trend';
import { validIntakeTrend, type IntakeTrendBucket, type IntakeTrendRange } from '../report-intake-trend/report-intake-trend.validation';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';

export type LeadIntakeReportState =
  | { kind: 'loading' | 'error' }
  | { kind: 'ready'; result: {
    periodLabel: string;
    snapshotLabel: string;
    scopeLabel: string;
    total: number;
    sources: readonly ReportBreakdownGroup[];
    rows: readonly ReportEvidenceRow[];
    page: number;
    pageSize: number;
    evidenceId?: string;
    /** Optional chronological creation-date buckets for this exact filtered period result. */
    trend?: { range: IntakeTrendRange; buckets: readonly IntakeTrendBucket[] };
    /** Bucket start date for the host-selected evidence page; omit for the full cohort. */
    selectedTrendBucket?: string;
  } };
export type LeadIntakeReportProps = {
  state: LeadIntakeReportState;
  current: ReportCurrentContextState;
  canRead: boolean;
  canReadCurrent: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onRetryCurrent: () => void;
  onEdit: () => void;
};

/** Composes the reviewed UI for one lead creation-cohort projection; hosts own queries and current grants. */
export function LeadIntakeReport({ state, current, canRead, canReadCurrent, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onRetryCurrent, onEdit }: LeadIntakeReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  const selectedBucket = result.trend?.buckets.find(bucket => bucket.from === result.selectedTrendBucket);
  const evidenceTotal = selectedBucket?.count ?? result.total;
  const validTrend = (!result.trend || validIntakeTrend(result.trend.range, result.total, result.trend.buckets)) &&
    (result.selectedTrendBucket === undefined || selectedBucket !== undefined);
  const validPage = Number.isSafeInteger(result.page) && result.page > 0 && Number.isSafeInteger(result.pageSize) && result.pageSize > 0 &&
    result.page <= Math.max(1, Math.ceil(evidenceTotal / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, evidenceTotal - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    result.rows.every(row => row.id.trim() && ['created', 'assignment', 'source'].every(column => Object.hasOwn(row.cells, column)));
  if (!validReportBreakdown(result.total, result.sources) || !validTrend || !validPage) return <FormFeedback kind="error" message={copy.invalid} />;
  const context = `${copy.basis} / ${result.periodLabel} / ${result.scopeLabel}`;
  const evidenceView = selectedBucket ? `${copy.view} / ${formatReportDate(selectedBucket.from)} to ${formatReportDate(selectedBucket.to)}` : copy.view;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
    </header>
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
    <div className="grid min-w-0 gap-6">
      <ReportCurrentContext state={current} canRead={canReadCurrent} pending={pending} onRetry={onRetryCurrent} onEvidence={onEvidence} />
      {result.trend && <ReportIntakeTrend range={result.trend.range} buckets={result.trend.buckets} total={result.total} canRead pending={pending} onEvidence={onEvidence} />}
      <ReportBreakdown groupLabel={copy.group} groups={result.sources} total={result.total} contextLabel={context} canRead pending={pending} onEvidence={onEvidence} />
      <ReportEvidenceTable viewLabel={evidenceView} contextLabel={`${result.snapshotLabel} / ${context}`}
        columns={[{ id: 'created', label: 'Creation date' }, { id: 'assignment', label: 'Assignment' }, { id: 'source', label: 'Source' }]}
        rows={result.rows} total={evidenceTotal} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit}
        pending={pending} onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
    </div>
    <div className="grid min-w-0 gap-4">
    <ReportSummary canRead hideHeader snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[{ id: 'new-leads', label: copy.metric, value: { kind: 'count', value: result.total },
        description: copy.definition, dateBasisLabel: `${copy.basis} / ${result.periodLabel}`, evidenceId: result.evidenceId }]} />
    </div>
    </div>
  </section>;
}
