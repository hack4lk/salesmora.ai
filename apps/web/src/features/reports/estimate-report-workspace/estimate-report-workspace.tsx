'use client';

import { useId } from 'react';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { EstimateDecisionsReport, type EstimateDecisionsReportState } from '../estimate-decisions-report/estimate-decisions-report';
import { EstimateCurrentReport, type EstimateCurrentReportState } from '../estimate-current-report/estimate-current-report';
import { EstimateFirstQuotedReport, type EstimateFirstQuotedReportState } from '../estimate-first-quoted-report/estimate-first-quoted-report';
import { EstimateReportFilters, validEstimateReportFilters, type EstimateReportFiltersValue, type EstimateReportFiltersOptions, type EstimateReportFilterContext } from '../estimate-report-filters/estimate-report-filters';
import { validEstimateReportProjection } from './estimate-report-workspace.validation';

export const estimateReportViews = ['decisions', 'first-quoted', 'current'] as const;
export type EstimateReportView = typeof estimateReportViews[number];
export type EstimateReportAttribution = { familyId: string; ownerKey: string; parentType: 'lead' | 'job' };
export type EstimateReportProjection = (
  | { view: 'decisions'; state: EstimateDecisionsReportState }
  | { view: 'current'; state: EstimateCurrentReportState }
  | { view: 'first-quoted'; state: EstimateFirstQuotedReportState }
) & {
  /** Snapshot of filters and authorization scope used for the host query. */
  filters: EstimateReportFiltersValue;
  scopeKey: string;
  /** Current surviving attribution of the selected issued revision for each evidence row. */
  attribution: readonly EstimateReportAttribution[];
};
export type EstimateReportWorkspaceProps = {
  projection: EstimateReportProjection;
  availableViews: readonly EstimateReportView[];
  filters: Record<EstimateReportFilterContext, EstimateReportFiltersValue>;
  filterOptions: EstimateReportFiltersOptions;
  /** Opaque host scope identity, replaced when authorization/assigned relationships change. */
  scopeKey: string;
  filterState?: 'ready' | 'loading' | 'error';
  canRead: boolean;
  canReadCurrent: boolean;
  canReadMoney: boolean;
  canReadHandoff: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onViewChange: (view: EstimateReportView) => void;
  onFiltersChange: (context: EstimateReportFilterContext, value: EstimateReportFiltersValue) => void;
  onRetryFilters: () => void;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};
const labels: Record<EstimateReportView, string> = { decisions: 'Period decisions and accepted value', 'first-quoted': 'Period first-quoted families', current: 'Current quotes, expiry and Job handoff' };

/** Composition only; hosts own scope, date selection, queries, cancellation, pagination and record/CSV dialogs. */
export function EstimateReportWorkspace({ projection, availableViews, filters, filterOptions, scopeKey, filterState = 'ready',
  canRead, canReadCurrent, canReadMoney, canReadHandoff, canExport, canEdit, pending = false,
  onViewChange, onFiltersChange, onRetryFilters, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: EstimateReportWorkspaceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow the Estimates report workspace." />;
  const context = projection.view === 'current' ? 'current' : 'period';
  const validViews = new Set(availableViews).size === availableViews.length &&
    availableViews.every(view => estimateReportViews.some(known => known === view));
  const allowed = availableViews.includes(projection.view) && (context === 'period' || canReadCurrent);
  const validFilters = filterState === 'ready' && validEstimateReportFilters(filters[context], filterOptions);
  const validProjection = validFilters && validEstimateReportProjection(projection, filters[context], filterOptions, scopeKey, canReadMoney, canReadHandoff);
  const actions = { canRead: true, canReadMoney, canExport, canEdit, pending, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit };
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">Estimates report</h1>
        <HelpTooltip label="About Estimates report workspace" paragraphs={[
          "Period decisions use each family's latest issued revision and effective decision date; corrections/new issuance can restate earlier periods. Current quotes and handoff use business-local today, independently of the reporting period.",
          'Period/current filter drafts remain separate. Owner and parent filters use current surviving attribution of the selected issued revision, not a newer draft. Assigned authorization follows Job relationships, never owner selection.',
          'Only the selected view renders evidence. Hosts replace matching counts, frozen money and evidence together and reset pagination on view/filter/evidence changes. Money and complete Lead/Job handoff visibility are independent explicit grants.',
          'First-quoted families use their earliest persisted initial Send/Publish date, not resends or later revisions. They share period filters with decisions, but not the decision-date predicate or acceptance denominator. Dates and visible record navigation are host-owned. CSV and configuration remain deferred; production Reports access is disabled.',
        ]} />
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:w-80">
        <label htmlFor={`${id}-view`} className="text-sm font-semibold">Report view</label>
        <select id={`${id}-view`} value={projection.view} disabled={pending || !validViews}
          className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
          onChange={event => {
            const view = availableViews.find(view => view === event.target.value);
            if (!pending && validViews && view && (view !== 'current' || canReadCurrent)) onViewChange(view);
          }}>
          {!availableViews.includes(projection.view) && <option value={projection.view} disabled>Unavailable saved view</option>}
          {[...new Set(availableViews)].map(view => <option key={view} value={view} disabled={view === 'current' && !canReadCurrent}>{labels[view]}</option>)}
        </select>
      </div>
    </header>
    {!validViews ? <FormFeedback kind="error" message="Authorized Estimates report views are inconsistent. Retry the report." />
      : !allowed ? <FormFeedback kind="error" message="The selected Estimates report view is no longer available under current access. Choose an authorized view." /> : <>
        <EstimateReportFilters value={filters[context]} options={filterOptions} context={context} canRead state={filterState} pending={pending}
          onChange={value => { if (!pending) onFiltersChange(context, value); }} onRetry={onRetryFilters} />
        {validFilters && (!validProjection ? <FormFeedback kind="error" message="Estimates report results do not match the current filters, scope or authorized evidence. Retry the report." />
          : projection.view === 'decisions' ? <EstimateDecisionsReport {...actions} state={projection.state} />
            : projection.view === 'first-quoted' ? <EstimateFirstQuotedReport {...actions} state={projection.state} />
            : <EstimateCurrentReport {...actions} canReadHandoff={canReadHandoff} state={projection.state} />)}
      </>}
  </section>;
}
