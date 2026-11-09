'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calendarReportReadResultSchema, type CalendarReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { addCalendarDays, calendarWeekStart } from '@salesmora/domain';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { CalendarReportWorkspace, calendarReportViews, type CalendarReportProjection, type CalendarReportView } from './calendar-report-workspace';
import type { CalendarReportFilterContext, CalendarReportFiltersValue } from '../calendar-report-filters/calendar-report-filters';
import { calendarReportRequest } from './calendar-report-workspace.adapter';
import { adaptCalendarReadResponse, calendarReportScopeKey, visibleCalendarRecord } from './calendar-read.adapter';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { CalendarExport } from './calendar-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

const defaults = { scheduled: 'visits' as const, review: 'overlaps' as const, unscheduled: 'visits' as const };
export type CalendarReportPageProps = {
  initial: CalendarReportReadResult; onRecord: (record: { id: string; type: 'job' | 'work_order' }) => void; onReload: () => void;
};
export function CalendarReportPage({ initial, onRecord, onReload }: CalendarReportPageProps) {
  return <TemplateSession key={`${calendarReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={calendarReportReadResultSchema.parse}>
    {(result, template, run, revision) => <CalendarReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function CalendarReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: CalendarReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = calendarReportScopeKey(initial);
  const [view, setView] = useState<CalendarReportView>(initial.query.view === 'calendar-scheduled' ? 'scheduled'
    : initial.query.view === 'calendar-review' ? 'review' : 'unscheduled');
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? ('period' in initial.query
    ? { preset: 'custom', ...initial.query.period } : { preset: 'custom', from: calendarWeekStart(today), to: addCalendarDays(calendarWeekStart(today), 6) }));
  const [filters, setFilters] = useState<Record<CalendarReportFilterContext, CalendarReportFiltersValue>>({
    dated: initial.query.view === 'calendar-unscheduled' ? { participants: [], recordTypes: [] } : initial.query.filters,
    unscheduled: initial.query.view === 'calendar-unscheduled' ? initial.query.filters : { participants: [], recordTypes: [] },
  });
  const [evidence, setEvidence] = useState<Parameters<typeof calendarReportRequest>[0]['evidence']>({
    scheduled: initial.query.view === 'calendar-scheduled' ? initial.query.selected : defaults.scheduled,
    review: initial.query.view === 'calendar-review' ? initial.query.selected : defaults.review,
    unscheduled: initial.query.view === 'calendar-unscheduled' ? initial.query.selected : defaults.unscheduled,
  });
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [retry, setRetry] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const range = useMemo(() => {
    const resolved = resolveReportPeriod(period, today, 'calendar').range;
    if (!resolved) throw new Error('Choose a valid Calendar report period.');
    return { from: resolved.from, to: resolved.to };
  }, [period, today]);
  const request = useMemo(() => calendarReportRequest({ workspaceId: initial.workspaceId, view, filters, range, evidence, page, pageSize }),
    [initial.workspaceId, view, filters, range, evidence, page, pageSize]);
  const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
  const validate = useCallback((raw: unknown) => { adaptCalendarReadResponse(raw, { request, scopeKey, today, timezone }); },
    [request, scopeKey, today, timezone]);
  const loaded = useReportRead({ key, initial, validate, url: `/api/reports/calendar?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Calendar report could not be loaded. Try again.' });
  let projection: CalendarReportProjection = { view, state: { kind: loaded.pending ? 'loading' : 'error' },
    filters: filters[view === 'unscheduled' ? 'unscheduled' : 'dated'], scopeKey, attribution: [] };
  let adapted: ReturnType<typeof adaptCalendarReadResponse> | undefined;
  let raw: CalendarReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptCalendarReadResponse(loaded.raw, { request, scopeKey, today, timezone });
      raw = calendarReportReadResultSchema.parse(loaded.raw);
      projection = adapted.projection;
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Calendar report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  const reset = () => { setPage(1); setEvidence(defaults); };
  const unavailable = () => { throw new Error('Calendar report export, configuration and Calendar deep links are not integrated yet.'); };
  return <ReportPageLayout area="calendar" workspaceId={initial.workspaceId} query={request}
    period={'period' in request ? period : null} ready={!loaded.pending && !error && !!raw} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!loaded.pending && !error && !!raw?.canExport} onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    {!denied && view !== 'unscheduled' && <ReportDateControls value={period} context="calendar" today={today} timezone={timezone}
      pending={loaded.pending} onApply={value => { setPeriod(value); reset(); }} />}
    <CalendarReportWorkspace projection={projection} availableViews={calendarReportViews} filters={filters}
      filterOptions={error ? {} : adapted?.filterOptions ?? {}} filterState={loaded.pending ? 'loading' : error ? 'error' : 'ready'}
      scope={initial.scope} scopeKey={scopeKey} range={range} canRead={!denied}
      canExport={!loaded.pending && !error && !!raw?.canExport} canEdit={false} canOpenCalendar={false}
      pending={loaded.pending} onViewChange={next => { setView(next); reset(); }}
      onFiltersChange={(context, value) => { setFilters(previous => ({ ...previous, [context]: value })); reset(); }}
      onRetryFilters={() => setRetry(value => value + 1)} onRetry={() => setRetry(value => value + 1)}
      onEvidence={id => {
        if (loaded.pending || !adapted) return;
        if (view === 'scheduled' && ['scheduled-visits', 'busy-person-days'].includes(id)) {
          setEvidence(previous => ({ ...previous, scheduled: id === 'busy-person-days' ? 'busy-person-days' : 'visits' }));
        } else if (view === 'review' && ['overlapping-pairs', 'past-visits'].includes(id)) {
          setEvidence(previous => ({ ...previous, review: id === 'past-visits' ? 'past' : 'overlaps' }));
        } else if (view === 'unscheduled' && ['unscheduled-visits', 'unscheduled-jobs', 'unscheduled-work-orders'].includes(id)) {
          setEvidence(previous => ({ ...previous, unscheduled: id === 'unscheduled-jobs' ? 'jobs' : id === 'unscheduled-work-orders' ? 'workOrders' : 'visits' }));
        } else throw new Error('This Calendar evidence selection is unavailable.');
        setPage(1);
      }}
      onRecord={id => { if (!loaded.pending && raw) { const record = visibleCalendarRecord(raw, id); if (record) onRecord({ id: record.id, type: record.type }); } }}
      onCalendar={unavailable} onExport={() => setExportOpen(true)} onEdit={unavailable}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    <p className="m-0 text-sm text-muted">Calendar-opening actions are not integrated yet. Visible record links retain their current authorized record type.</p>
    {exportOpen && raw && !loaded.pending && !error && raw.canExport && <CalendarExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function CalendarReportRoute({ initial }: { initial: CalendarReportReadResult }) {
  const router = useRouter();
  return <CalendarReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={record => router.push(`/${record.type === 'job' ? 'jobs' : 'work-orders'}/${encodeURIComponent(record.id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
