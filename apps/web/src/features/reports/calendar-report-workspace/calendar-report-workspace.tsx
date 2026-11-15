'use client';

import { useId } from 'react';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { CalendarScheduledReport, type CalendarScheduledReportProps, type CalendarReportTarget } from '../calendar-scheduled-report/calendar-scheduled-report';
import { CalendarReviewReport, type CalendarReviewReportProps } from '../calendar-review-report/calendar-review-report';
import { CalendarUnscheduledReport, type CalendarUnscheduledReportProps } from '../calendar-unscheduled-report/calendar-unscheduled-report';
import { CalendarReportFilters, validCalendarReportFilters, type CalendarReportFiltersValue, type CalendarReportFiltersOptions,
  type CalendarReportFilterContext, type CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';
import { validCalendarReportProjection } from './calendar-report-workspace.validation';

export const calendarReportViews = ['scheduled', 'review', 'unscheduled'] as const;
export type CalendarReportView = typeof calendarReportViews[number];
export type CalendarReportAttribution = {
  visitId: string;
  /** Current authorized matching record membership, already restricted to selected people. */
  records: readonly { id: string; type: 'job' | 'work_order'; participantIds: readonly string[] }[];
};
export type CalendarReportProjection = (
  | { view: 'scheduled'; state: CalendarScheduledReportProps['state'] }
  | { view: 'review'; state: CalendarReviewReportProps['state'] }
  | { view: 'unscheduled'; state: CalendarUnscheduledReportProps['state'] }
) & {
  filters: CalendarReportFiltersValue;
  scopeKey: string;
  attribution: readonly CalendarReportAttribution[];
};
export type CalendarReportWorkspaceProps = Omit<CalendarScheduledReportProps, 'state' | 'onCalendar'> & {
  projection: CalendarReportProjection;
  availableViews: readonly CalendarReportView[];
  filters: Record<CalendarReportFilterContext, CalendarReportFiltersValue>;
  filterOptions: CalendarReportFiltersOptions;
  scope: CalendarReportFilterScope;
  /** Opaque authorization identity; replace when relevant grants or record relationships change. */
  scopeKey: string;
  /** Exact host-selected visit dates; ignored by the undated queue. Date controls remain host-owned. */
  range: { from: string; to: string };
  filterState?: 'ready' | 'loading' | 'error';
  onViewChange: (view: CalendarReportView) => void;
  onFiltersChange: (context: CalendarReportFilterContext, value: CalendarReportFiltersValue) => void;
  onRetryFilters: () => void;
  onCalendar: (target: CalendarReportTarget | { kind: 'unscheduled'; visitId: string }) => void;
};
const labels: Record<CalendarReportView, string> = {
  scheduled: 'Scheduled visits and workload', review: 'Schedule review', unscheduled: 'Unscheduled queues',
};

/** Canonical composition; hosts replace authorized snapshots and reset pagination on navigation/filter changes. */
export function CalendarReportWorkspace({ projection, availableViews, filters, filterOptions, scope, scopeKey, range, filterState = 'ready',
  canRead, canExport, canEdit, canOpenCalendar, pending = false, onViewChange, onFiltersChange, onRetryFilters,
  onEvidence, onCalendar, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: CalendarReportWorkspaceProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow the Calendar report workspace." />;
  const context = projection.view === 'unscheduled' ? 'unscheduled' : 'dated';
  const validViews = new Set(availableViews).size === availableViews.length &&
    availableViews.every(view => calendarReportViews.some(known => known === view));
  const allowed = availableViews.includes(projection.view);
  const validFilters = filterState === 'ready' && validCalendarReportFilters(filters[context], filterOptions, scope);
  const validProjection = validFilters && validCalendarReportProjection(projection, filters[context], filterOptions, scope, scopeKey, range);
  const actions = { canRead: true, canExport, canEdit, canOpenCalendar, pending, onEvidence, onCalendar, onRecord, onExport,
    onPageChange, onPageSizeChange, onRetry, onEdit };
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">Calendar report</h1>
        <HelpTooltip label="About Calendar report workspace" paragraphs={[
          'All views describe the current authorized schedule, not scheduling history or attendance. Scheduled visits and schedule review share exact visit dates and a dated filter draft. Unscheduled queues have an independent current draft and no date predicate.',
          'Match authorized active records by type first, then current participants from those records. Keep matching canonical visits distinct; withhold unrelated records and crew. Selected people bound person, busy person-day and overlap projections. Work Order access never grants parent-Job access; own scope shows Me only.',
          'Only one selected view and supporting-evidence table render. Hosts filter the full source before aggregation/pagination and replace counts and evidence together. View, filters, dates and evidence changes reset the page; page-size changes reset the page too.',
          'Calendar links and permitted record links are independent of report access. Drill-through does not promise scheduling permission. Dates, queries, CSV review and navigation remain host-owned; production routes and APIs are not enabled.',
        ]} />
      </div>
      <div className="grid w-full min-w-0 gap-2 sm:w-80">
        <label htmlFor={`${id}-view`} className="text-sm font-semibold">Report view</label>
        <select id={`${id}-view`} value={projection.view} disabled={pending || !validViews}
          className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
          onChange={event => {
            const view = availableViews.find(view => view === event.target.value);
            if (!pending && validViews && view) onViewChange(view);
          }}>
          {!availableViews.includes(projection.view) && <option value={projection.view} disabled>Unavailable saved view</option>}
          {[...new Set(availableViews)].map(view => <option key={view} value={view}>{labels[view]}</option>)}
        </select>
      </div>
    </header>
    {!validViews ? <FormFeedback kind="error" message="Authorized Calendar report views are inconsistent. Retry the report." />
      : !allowed ? <FormFeedback kind="error" message="The selected Calendar report view is no longer available under current access. Choose an authorized view." /> : <>
        <CalendarReportFilters value={filters[context]} options={filterOptions} context={context} scope={scope} canRead
          state={filterState} pending={pending} onChange={value => { if (!pending) onFiltersChange(context, value); }} onRetry={onRetryFilters} />
        {validFilters && (!validProjection ? <FormFeedback kind="error" message="Calendar report results do not match the current filters, dates, scope or authorized evidence. Retry the report." />
          : projection.view === 'scheduled' ? <CalendarScheduledReport {...actions} state={projection.state} />
            : projection.view === 'review' ? <CalendarReviewReport {...actions} state={projection.state} />
              : <CalendarUnscheduledReport {...actions} state={projection.state} />)}
      </>}
  </section>;
}
