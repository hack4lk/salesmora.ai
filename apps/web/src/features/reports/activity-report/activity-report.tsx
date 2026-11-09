'use client';

import { useId } from 'react';
import { DataTable, FormFeedback, HelpTooltip, Pagination } from '@salesmora/ui';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { ReportFacetFilters } from '../report-facet-filters/report-facet-filters';
import { ReportResultState } from '../report-result-state/report-result-state';
import { ReportSummary } from '../report-summary/report-summary';
import { activityReportData as copy } from './activity-report.data';
import {
  activityActions,
  activityDomains,
  activityEventKey,
  validActivityFilters,
  validActivityReportResult,
  type ActivityFilterOptions,
  type ActivityFiltersValue,
  type ActivityReportResult,
  type ActivityDomain,
} from './activity-report.validation';

export type ActivityReportState =
  | { kind: 'loading' }
  | { kind: 'error'; message?: string }
  | { kind: 'ready'; result: ActivityReportResult };
export type ActivityRecordReference = { domain: ActivityDomain; recordId: string };
export type ActivityReportProps = {
  state: ActivityReportState;
  period: ReportPeriodSelection;
  filters: ActivityFiltersValue;
  filterOptions: ActivityFilterOptions;
  today: string;
  timezone: string;
  canRead: boolean;
  filterState?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  onPeriodApply: (period: ReportPeriodSelection) => void;
  onFiltersChange: (filters: ActivityFiltersValue) => void;
  onRetryFilters: () => void;
  onRetry: () => void;
  onRecord: (record: ActivityRecordReference) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const limit = { domains: 5, actions: 11, actors: 50 } as const;

function validOptions(options: ActivityFilterOptions): boolean {
  return validActivityFilters({ domains: [], actions: [], actors: [] }, options);
}

/** Hosts supply the authorized, filtered and safely summarized native-domain event projection. */
export function ActivityReport({
  state,
  period,
  filters,
  filterOptions,
  today,
  timezone,
  canRead,
  filterState = 'ready',
  pending = false,
  onPeriodApply,
  onFiltersChange,
  onRetryFilters,
  onRetry,
  onRecord,
  onPageChange,
  onPageSizeChange,
}: ActivityReportProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const optionsValid = validOptions(filterOptions);
  const filtersValid = optionsValid && validActivityFilters(filters, filterOptions);
  const safeFilterOptions = optionsValid
    ? filterOptions
    : { domains: [], actions: [], actors: [] };
  const safeFilters = filtersValid
    ? filters
    : { domains: [], actions: [], actors: [] };
  const resultValid = state.kind !== 'ready' || filtersValid &&
    validActivityReportResult(state.result, period, filters, filterOptions, today, timezone);
  const facets = [
    { id: 'domains', label: copy.domainLabel, selected: safeFilters.domains, options: safeFilterOptions.domains, limit: limit.domains },
    { id: 'actions', label: copy.actionLabel, selected: safeFilters.actions, options: safeFilterOptions.actions, limit: limit.actions },
    { id: 'actors', label: copy.actorLabel, selected: safeFilters.actors, options: safeFilterOptions.actors, limit: limit.actors },
  ];
  const events = state.kind === 'ready' && resultValid ? state.result : undefined;
  const columns = [
    { id: 'time', label: 'Event time', render: (event: NonNullable<typeof events>['rows'][number]) =>
      new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone })
        .format(new Date(event.occurredAt)) },
    { id: 'type', label: copy.domainLabel, render: (event: NonNullable<typeof events>['rows'][number]) => copy.domains[event.domain] },
    { id: 'action', label: copy.actionLabel, render: (event: NonNullable<typeof events>['rows'][number]) => copy.actions[event.action] },
    { id: 'actor', label: copy.actorLabel, render: (event: NonNullable<typeof events>['rows'][number]) => event.actor.label },
  ];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="flex min-w-0 items-center gap-1">
      <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h1>
      <HelpTooltip label="About CRM activity history" paragraphs={[copy.filtersHelp, copy.ordering, copy.detail]} />
    </header>
    <ReportDateControls value={period} context="history" today={today} timezone={timezone} pending={pending} onApply={onPeriodApply} />
    <ReportFacetFilters reportLabel="CRM activity" context="period" canRead state={filterState} pending={pending}
      facets={facets} validOptions={optionsValid} validSelection={filtersValid}
      attributionHelp={copy.detail} onRetry={onRetryFilters}
      onSelect={(facet, selected) => {
        if (pending) return;
        if (facet === 'domains') onFiltersChange({ ...safeFilters,
          domains: selected.filter((value): value is ActivityFiltersValue['domains'][number] =>
            activityDomains.some(domain => domain === value)) });
        else if (facet === 'actions') onFiltersChange({ ...safeFilters,
          actions: selected.filter((value): value is ActivityFiltersValue['actions'][number] =>
            activityActions.some(action => action === value)) });
        else if (facet === 'actors') onFiltersChange({ ...safeFilters, actors: selected });
      }}
      onClear={() => { if (!pending) onFiltersChange({ domains: [], actions: [], actors: [] }); }} />
    {state.kind === 'loading' ? <ReportResultState state={{ kind: 'loading' }} canRead canEdit={false}
      pending={pending} onRetry={onRetry} onEdit={() => undefined} />
      : state.kind === 'error' ? <ReportResultState state={{ kind: 'error', message: state.message }} canRead canEdit={false}
        pending={pending} onRetry={onRetry} onEdit={() => undefined} />
        : !resultValid ? <FormFeedback kind="error" message={copy.invalid} />
          : <>
            <p className="m-0 text-sm font-semibold wrap-anywhere">{events!.periodLabel}</p>
            <p className="m-0 text-xs text-muted wrap-anywhere">{events!.snapshotLabel} / {events!.scopeLabel}</p>
            <ReportSummary canRead hideHeader snapshotLabel={events!.snapshotLabel} scopeLabel={events!.scopeLabel}
              pending={pending} onEvidence={() => undefined}
              metrics={[{ id: 'events', label: copy.count, value: { kind: 'count', value: events!.total },
                dateBasisLabel: `Event timestamp / ${events!.periodLabel}`,
                description: `${copy.ordering} ${copy.detail}` }]} />
            {events!.total === 0 ? <ReportResultState state={{ kind: 'empty' }} canRead canEdit={false}
              pending={pending} onRetry={onRetry} onEdit={() => undefined} />
              : <>
                <p className="m-0 text-sm text-muted">{copy.ordering}</p>
                <DataTable caption={copy.title} rows={events!.rows} getRowId={activityEventKey}
                  getRowLabel={event => `${copy.domains[event.domain]} ${event.recordLabel}`}
                  columns={[
                    { id: 'record', label: 'Record / event', render: event =>
                      <button type="button" disabled={pending} aria-label={`View record: ${event.recordLabel}`}
                        onClick={() => { if (!pending) onRecord({ domain: event.domain, recordId: event.recordId }); }}
                        className="min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
                        {event.recordLabel}
                      </button> },
                    ...columns,
                    { id: 'summary', label: 'Safe summary', render: event =>
                      `${copy.domains[event.domain]} · ${copy.actions[event.action].toLowerCase()}` },
                  ]} />
                <Pagination total={events!.total} page={events!.page} pageSize={events!.pageSize} disabled={pending}
                  onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
              </>}
          </>}
  </section>;
}
