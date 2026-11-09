import type { ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';

export const jobLifecycleViews = ['created', 'completed', 'canceled', 'reopened'] as const;
export type JobLifecycleView = typeof jobLifecycleViews[number];
export type JobLifecycleCoverage = { kind: 'complete' } | { kind: 'partial'; explanation: string };
export type JobLifecycleResult = {
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  counts: Readonly<Record<JobLifecycleView, number>>;
  coverage: Readonly<Record<JobLifecycleView, JobLifecycleCoverage>>;
  evidenceIds: Readonly<Partial<Record<JobLifecycleView, string>>>;
  selectedView: JobLifecycleView;
  /** Row IDs identify distinct Jobs, not their individual lifecycle events. */
  rows: readonly ReportEvidenceRow[];
  page: number;
  pageSize: number;
};

export function validJobLifecycleResult(result: JobLifecycleResult): boolean {
  const total = result.counts[result.selectedView];
  return jobLifecycleViews.every(view => Number.isSafeInteger(result.counts[view]) && result.counts[view] >= 0 &&
    (result.coverage[view].kind === 'complete' || result.coverage[view].explanation.trim().length > 0)) &&
    Number.isSafeInteger(result.page) && result.page > 0 && Number.isSafeInteger(result.pageSize) && result.pageSize > 0 &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    result.rows.every(row => row.id.trim() && ['date', 'status', 'owner', 'service'].every(column => Object.hasOwn(row.cells, column)) &&
      typeof row.cells.date === 'string' && row.cells.date.trim().length > 0);
}
