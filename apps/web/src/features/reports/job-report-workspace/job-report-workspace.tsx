'use client';

import { useId } from 'react';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { JobLifecycleReport, type JobLifecycleReportState } from '../job-lifecycle-report/job-lifecycle-report';
import { JobCompletionReport, type JobCompletionReportState } from '../job-completion-report/job-completion-report';
import { JobWorkloadReport, type JobWorkloadReportState } from '../job-workload-report/job-workload-report';
import { JobReportFilters, validJobReportFilters, type JobReportFilterContext, type JobReportFiltersOptions, type JobReportFiltersValue } from '../job-report-filters/job-report-filters';

export const jobReportViews = ['lifecycle', 'completion', 'workload'] as const;
export type JobReportView = typeof jobReportViews[number];
export type JobReportProjection =
  | { view: 'lifecycle'; state: JobLifecycleReportState }
  | { view: 'completion'; state: JobCompletionReportState }
  | { view: 'workload'; state: JobWorkloadReportState };
export type JobReportWorkspaceProps = {
  projection: JobReportProjection;
  /** Currently authorized views; never silently replace a stale selected view. */
  availableViews: readonly JobReportView[];
  filters: { period: JobReportFiltersValue; current: JobReportFiltersValue };
  /** Options for the selected view, replaced atomically with its projection by the host. */
  filterOptions: JobReportFiltersOptions;
  filterState?: 'ready' | 'loading' | 'error';
  canRead: boolean;
  canReadCurrent: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onViewChange: (view: JobReportView) => void;
  onFiltersChange: (context: JobReportFilterContext, value: JobReportFiltersValue) => void;
  onRetryFilters: () => void;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};
const labels: Record<JobReportView, string> = {
  lifecycle: 'Period lifecycle', completion: 'Completion calendar and elapsed days', workload: 'Current workload and deadlines',
};

/** Compose approved slices only; hosts own current grants, snapshot queries, pagination, dates and dialogs. */
export function JobReportWorkspace({ projection, availableViews, filters, filterOptions, filterState = 'ready',
  canRead, canReadCurrent, canExport, canEdit, pending = false,
  onViewChange, onFiltersChange, onRetryFilters, onEvidence, onRecord, onExport,
  onPageChange, onPageSizeChange, onRetry, onEdit }: JobReportWorkspaceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow the Jobs report workspace." />;
  const context = projection.view === 'workload' ? 'current' : 'period';
  const allowed = availableViews.includes(projection.view) && (context === 'period' || canReadCurrent);
  const validViews = new Set(availableViews).size === availableViews.length &&
    availableViews.every(view => jobReportViews.some(known => known === view));
  const validFilters = filterState === 'ready' && validJobReportFilters(filters[context], filterOptions, context);
  const actions = { canRead: true, canExport, canEdit, pending, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit };
  let result;
  if (validViews && allowed && validFilters) {
    switch (projection.view) {
      case 'lifecycle': result = <JobLifecycleReport {...actions} state={projection.state} />; break;
      case 'completion': result = <JobCompletionReport {...actions} state={projection.state} />; break;
      case 'workload': result = <JobWorkloadReport {...actions} state={projection.state} />; break;
    }
  }
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">Jobs report</h1>
        <HelpTooltip label="About Jobs report workspace" paragraphs={[
          'Period lifecycle uses recorded creation and lifecycle-transition dates. Completion calendar and elapsed days use the same latest valid completion selected per Job within the period. Later reopening does not erase that completion.',
          'Current workload and deadlines use business-local today from their current snapshot, independently of the reporting period. Period and current filter drafts remain separate; current facet values never replace historical event selection.',
          'Only the selected view renders supporting evidence. View and filter changes request a matching authorized projection and reset evidence pagination in the host. CSV review uses current export authority and may cover fewer Jobs than the report.',
        ]} />
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:w-80">
        <label htmlFor={`${id}-view`} className="text-sm font-semibold">Report view</label>
        <select id={`${id}-view`} value={projection.view} disabled={pending || !validViews}
          className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
          onChange={event => {
            const view = availableViews.find(view => view === event.target.value);
            if (!pending && validViews && view && (view !== 'workload' || canReadCurrent)) onViewChange(view);
          }}>
          {!availableViews.includes(projection.view) && <option value={projection.view} disabled>Unavailable saved view</option>}
          {[...new Set(availableViews)].map(view => <option key={view} value={view} disabled={view === 'workload' && !canReadCurrent}>{labels[view]}</option>)}
        </select>
      </div>
    </header>
    {!validViews ? <FormFeedback kind="error" message="Authorized Jobs report views are inconsistent. Retry the report." />
      : !allowed ? <FormFeedback kind="error" message="The selected Jobs report view is no longer available under current access. Choose an authorized view." /> : <>
        <JobReportFilters value={filters[context]} options={filterOptions} context={context} canRead state={filterState} pending={pending}
          onChange={value => { if (!pending) onFiltersChange(context, value); }} onRetry={onRetryFilters} />
        {result}
      </>}
  </section>;
}
