'use client';

import { useId } from 'react';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { LeadIntakeReport, type LeadIntakeReportState } from '../lead-intake-report/lead-intake-report';
import { LeadOutcomesReport, type LeadOutcomesReportState } from '../lead-outcomes-report/lead-outcomes-report';
import { LeadAttentionReport, type LeadAttentionReportState } from '../lead-attention-report/lead-attention-report';
import { LeadConversionReport, type LeadConversionReportState } from '../lead-conversion-report/lead-conversion-report';
import { LeadSourceReport, type LeadSourceReportState } from '../lead-source-report/lead-source-report';
import { LeadPipelineReport, type LeadPipelineReportState } from '../lead-pipeline-report/lead-pipeline-report';
import type { ReportCurrentContextState } from '../report-current-context/report-current-context';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';
import { LeadReportFilters, validLeadReportFilters, type LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';

export type LeadReportView = 'intake' | 'pipeline' | 'won' | 'lost' | 'conversion' | 'source' | 'attention' | 'age';
export type LeadReportProjection =
  | { view: 'intake'; state: LeadIntakeReportState }
  | { view: 'pipeline' | 'age'; state: LeadPipelineReportState }
  | { view: 'won' | 'lost'; state: LeadOutcomesReportState }
  | { view: 'attention'; state: LeadAttentionReportState }
  | { view: 'conversion'; state: LeadConversionReportState }
  | { view: 'source'; state: LeadSourceReportState };
export type LeadReportWorkspaceProps = {
  projection: LeadReportProjection;
  /** Current authorized views, without role inference. A stale selected view is not silently replaced. */
  availableViews: readonly LeadReportView[];
  filters: { period: LeadReportFiltersValue; current: LeadReportFiltersValue };
  filterOptions: Partial<Record<keyof LeadReportFiltersValue, readonly ReportScopeOption[]>>;
  filterState?: 'ready' | 'loading' | 'error';
  current: ReportCurrentContextState;
  canRead: boolean;
  canReadCurrent: boolean;
  canReadConversion: boolean;
  canReadAcceptedValue: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onViewChange: (view: LeadReportView) => void;
  onFiltersChange: (context: 'period' | 'current', value: LeadReportFiltersValue) => void;
  onRetryFilters: () => void;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onRetryCurrent: () => void;
  onEdit: () => void;
};
const labels: Record<LeadReportView, string> = {
  intake: 'Intake', pipeline: 'Pipeline', won: 'Won', lost: 'Lost',
  conversion: 'Conversion', source: 'Lead-source effectiveness', attention: 'Attention', age: 'Age',
};

/** Canonical composition only. Hosts replace projection/filter options atomically and own all queries and dialogs. */
export function LeadReportWorkspace({ projection, availableViews, filters, filterOptions, filterState = 'ready',
  current, canRead, canReadCurrent, canReadConversion, canReadAcceptedValue, canExport, canEdit, pending = false,
  onViewChange, onFiltersChange, onRetryFilters, onEvidence, onRecord, onExport,
  onPageChange, onPageSizeChange, onRetry, onRetryCurrent, onEdit }: LeadReportWorkspaceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow the Leads report workspace." />;
  const context = ['pipeline', 'attention', 'age'].includes(projection.view) ? 'current' : 'period';
  const readProjection = context === 'period' || canReadCurrent;
  const allowed = availableViews.includes(projection.view) && readProjection;
  const validFilters = filterState === 'ready' && validLeadReportFilters(filters[context], filterOptions);
  const actions = { canRead: readProjection, canExport, canEdit, pending, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit };
  let result;
  if (allowed && validFilters) {
    switch (projection.view) {
      case 'intake':
        result = <LeadIntakeReport {...actions} state={projection.state} current={current} canReadCurrent={canReadCurrent} onRetryCurrent={onRetryCurrent} />;
        break;
      case 'pipeline':
      case 'age':
        result = <LeadPipelineReport {...actions} state={projection.state} dashboard breakdown={projection.view === 'age' ? 'age' : 'stage'} />;
        break;
      case 'won':
      case 'lost':
        result = projection.state.kind === 'ready' && projection.state.result.selectedOutcome !== projection.view
          ? <FormFeedback kind="error" message="The outcome evidence does not match the selected report view. Retry the report." />
          : <LeadOutcomesReport {...actions} state={projection.state} dashboard />;
        break;
      case 'attention':
        result = <LeadAttentionReport {...actions} state={projection.state} dashboard />;
        break;
      case 'conversion':
        result = <LeadConversionReport {...actions} state={projection.state} canReadConversion={canReadConversion} />;
        break;
      case 'source':
        result = <LeadSourceReport {...actions} state={projection.state} canReadConversion={canReadConversion}
          canReadAcceptedValue={canReadAcceptedValue} />;
        break;
    }
  }
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">Leads report</h1>
        <HelpTooltip label="About Leads report workspace" paragraphs={[
          'Intake, source effectiveness and conversion use lead creation dates; Won and Lost use recorded stage-transition dates. Pipeline, attention and age are current snapshots, not period-filtered results.',
          'Accepted estimate value in source effectiveness uses distinct currently accepted estimate families linked to the creation cohort as of the snapshot, with frozen pre-tax amounts. It requires complete workspace Lead, Job and Estimate read access, including Lead and Estimate archives; ambiguous cohort links are shown as unattributed. The dedicated Financial report permission is not required.',
          'Period and current filter selections are maintained separately. Changing views requests a matching authorized projection and resets its evidence pagination in the host.',
          'Only the selected view renders supporting evidence. The live host owns authorized requests, record navigation and separately authorized full-result CSV review/download. Template persistence and production Reports activation remain deferred.',
        ]} />
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:w-64">
        <label htmlFor={`${id}-view`} className="text-sm font-semibold">Report view</label>
        <select id={`${id}-view`} value={projection.view} disabled={pending} className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
          onChange={event => {
            const view = availableViews.find(item => item === event.target.value);
            if (!pending && view && (!['pipeline', 'attention', 'age'].includes(view) || canReadCurrent)) onViewChange(view);
          }}>
          {!availableViews.includes(projection.view) && <option value={projection.view} disabled>Unavailable saved view</option>}
          {availableViews.map(view => <option key={view} value={view} disabled={!canReadCurrent && ['pipeline', 'attention', 'age'].includes(view)}>{labels[view]}</option>)}
        </select>
      </div>
    </header>
    {!allowed ? <FormFeedback kind="error" message="The selected Leads report view is no longer available under current access. Choose an authorized view." /> : <>
      <LeadReportFilters value={filters[context]} options={filterOptions} context={context} canRead state={filterState} pending={pending}
        onChange={value => { if (!pending) onFiltersChange(context, value); }} onRetry={onRetryFilters} />
      {result}
    </>}
  </section>;
}
