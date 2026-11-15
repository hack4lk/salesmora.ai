'use client';

import { useId } from 'react';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { TeamLeadsReport, type TeamLeadsReportState } from '../team-leads-report/team-leads-report';
import { TeamJobsReport, type TeamJobsReportState } from '../team-jobs-report/team-jobs-report';
import { TeamReportFilters, validTeamReportFilters, type TeamReportFiltersValue, type TeamReportFilterScope } from '../team-report-filters/team-report-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';
import { validTeamReportProjection } from './team-report-workspace.validation';

export const teamReportViews = ['leads', 'jobs'] as const;
export type TeamReportView = typeof teamReportViews[number];
export type TeamReportProjection = (
  | { view: 'leads'; state: TeamLeadsReportState }
  | { view: 'jobs'; state: TeamJobsReportState }
) & { filters: TeamReportFiltersValue };
export type TeamReportWorkspaceProps = {
  /** Host supplies the filter snapshot used by this projection, not the current draft. */
  projection: TeamReportProjection;
  availableViews: readonly TeamReportView[];
  filters: TeamReportFiltersValue;
  /** Authorized roster for the current scope, independent of matched-record counts. */
  filterOptions: readonly ReportScopeOption[];
  scope: TeamReportFilterScope;
  filterState?: 'ready' | 'loading' | 'error';
  canRead: boolean;
  canReadCurrent: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onViewChange: (view: TeamReportView) => void;
  onFiltersChange: (value: TeamReportFiltersValue) => void;
  onRetryFilters: () => void;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};
const labels: Record<TeamReportView, string> = { leads: 'Current Leads workload', jobs: 'Current Jobs responsibility and participation' };

/** Host-owned current projections only; compose the approved UI without client-side result filtering. */
export function TeamReportWorkspace({ projection, availableViews, filters, filterOptions, scope, filterState = 'ready',
  canRead, canReadCurrent, canExport, canEdit, pending = false, onViewChange, onFiltersChange, onRetryFilters,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: TeamReportWorkspaceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow the Team report workspace." />;
  const validViews = new Set(availableViews).size === availableViews.length &&
    availableViews.every(view => teamReportViews.some(known => known === view));
  const allowed = canReadCurrent && availableViews.includes(projection.view);
  const validFilters = filterState === 'ready' && validTeamReportFilters(filters, filterOptions, scope);
  const validProjection = validFilters && validTeamReportProjection(projection, filters, filterOptions, scope);
  const actions = { canRead: true, canExport, canEdit, pending, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit };
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">{scope.kind === 'assigned' ? 'My workload report' : 'Team report'}</h1>
        <HelpTooltip label="About Team report workspace" paragraphs={[
          'Both views use current authorized records and surviving membership, independently of the reporting period. Member selections persist when switching views; no selection means all currently authorized members.',
          'Leads match primary owners. Jobs match any selected primary or supporting member and count once overall. Authorized counterpart cards remain visible for matched Jobs so primary totals reconcile; supporting counts remain non-additive.',
          'The separate unassigned queue contains only matched records. A Job without a primary owner can match through selected supporting participation. Assigned scope is self-only, with no unrelated identities or residual totals.',
          'Only the selected view renders evidence. Hosts replace matching aggregates and evidence together, resetting pagination on view, filter or evidence changes. Unavailable shared member selections require explicit correction; they never widen access. Visible record navigation is host-owned. CSV and configuration remain deferred; production Reports access is disabled.',
        ]} />
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:w-80">
        <label htmlFor={`${id}-view`} className="text-sm font-semibold">Report view</label>
        <select id={`${id}-view`} value={projection.view} disabled={pending || !validViews || !canReadCurrent}
          className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
          onChange={event => {
            const view = availableViews.find(view => view === event.target.value);
            if (!pending && validViews && canReadCurrent && view) onViewChange(view);
          }}>
          {!availableViews.includes(projection.view) && <option value={projection.view} disabled>Unavailable saved view</option>}
          {[...new Set(availableViews)].map(view => <option key={view} value={view}>{labels[view]}</option>)}
        </select>
      </div>
    </header>
    {!validViews ? <FormFeedback kind="error" message="Authorized Team report views are inconsistent. Retry the report." />
      : !allowed ? <FormFeedback kind="error" message="The selected Team report view is no longer available under current access. Choose an authorized view." /> : <>
        <TeamReportFilters value={filters} options={filterOptions} scope={scope} canRead state={filterState} pending={pending}
          onChange={value => { if (!pending) onFiltersChange(value); }} onRetry={onRetryFilters} />
        {validFilters && (!validProjection
          ? <FormFeedback kind="error" message="Team report results do not match the current filters, scope or authorized evidence. Retry the report." />
          : projection.view === 'leads' ? <TeamLeadsReport {...actions} state={projection.state} />
            : <TeamJobsReport {...actions} state={projection.state} />)}
      </>}
  </section>;
}
