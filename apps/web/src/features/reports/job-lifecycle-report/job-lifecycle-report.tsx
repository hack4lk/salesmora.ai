'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportDashboardLayout } from '../report-dashboard-layout/report-dashboard-layout';
import { ReportSummary, type ReportSummaryMetric } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { jobLifecycleViews, validJobLifecycleResult, type JobLifecycleResult } from './job-lifecycle-report.validation';
import { jobLifecycleReportData as copy } from './job-lifecycle-report.data';

export type JobLifecycleReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: JobLifecycleResult };
export type JobLifecycleReportProps = {
  state: JobLifecycleReportState;
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

/** Hosts select authorized distinct Jobs and matching event evidence; current statuses never infer transitions. */
export function JobLifecycleReport({ state, canRead, canExport, canEdit, pending = false, dashboard = true,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: JobLifecycleReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validJobLifecycleResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const metrics: ReportSummaryMetric[] = jobLifecycleViews.map(view => {
    const coverage = result.coverage[view];
    return {
      id: view, label: copy.labels[view],
      value: coverage.kind === 'partial'
        ? { kind: 'incomplete', displayValue: String(result.counts[view]), coverageLabel: `${copy.coverage}: ${coverage.explanation}` }
        : { kind: 'count', value: result.counts[view] },
      description: copy.definitions[view],
      dateBasisLabel: `${copy.basis[view]} / ${result.periodLabel}`,
      evidenceId: result.evidenceIds[view],
    };
  });
  const view = result.selectedView;
  const selectedCoverage = result.coverage[view];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.overlap, copy.definitions.completed, copy.definitions.reopened, copy.snapshot]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
    </header>
    <ReportDashboardLayout dashboard={dashboard} summary={<ReportSummary canRead hideHeader compact={dashboard}
      metrics={metrics} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence} />}>
      {selectedCoverage.kind === 'partial' && <p role="status" className="m-0 text-sm font-semibold text-muted wrap-anywhere">
        {copy.coverage}: {selectedCoverage.explanation}
      </p>}
      <ReportEvidenceTable viewLabel={`${copy.labels[view]} Jobs`} contextInTooltip
        contextLabel={`${result.snapshotLabel} / ${copy.basis[view]} / ${result.periodLabel} / ${result.scopeLabel} / ${copy.evidence}`}
        columns={[{ id: 'date', label: view === 'created' ? 'Creation date' : 'Latest matching transition' },
          { id: 'status', label: 'Current status' }, { id: 'owner', label: 'Current primary owner' }, { id: 'service', label: 'Current service' }]}
        rows={result.rows} total={result.counts[view]} page={result.page} pageSize={result.pageSize}
        canRead canExport={canExport} canEdit={canEdit} pending={pending} onRecord={onRecord} onExport={onExport}
        onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
    </ReportDashboardLayout>
  </section>;
}
