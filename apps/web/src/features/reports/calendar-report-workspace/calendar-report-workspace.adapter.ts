import {
  calendarScheduledQuerySchema, calendarScheduledResultSchema,
  calendarReviewQuerySchema, calendarReviewResultSchema,
  calendarUnscheduledQuerySchema, calendarUnscheduledResultSchema,
  calendarReportFilterOptionsResultSchema,
  type CalendarReportQuery,
} from '@salesmora/contracts';
import type { CalendarReportFiltersValue, CalendarReportFilterContext } from '../calendar-report-filters/calendar-report-filters';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import type { CalendarReportProjection, CalendarReportView, CalendarReportAttribution } from './calendar-report-workspace';
import { validCalendarReportProjection } from './calendar-report-workspace.validation';

export type CalendarReportRequest = CalendarReportQuery;
const contextFor = (view: CalendarReportView): CalendarReportFilterContext => view === 'unscheduled' ? 'unscheduled' : 'dated';

/** Builds only the selected view's request; the undated draft never receives host visit dates. */
export function calendarReportRequest(input: {
  workspaceId: string; view: CalendarReportView;
  filters: Record<CalendarReportFilterContext, CalendarReportFiltersValue>;
  range: { from: string; to: string }; page: number; pageSize: number;
  evidence: { scheduled: 'visits' | 'busy-person-days'; review: 'overlaps' | 'past'; unscheduled: 'visits' | 'jobs' | 'workOrders' };
}): CalendarReportRequest {
  const filters = input.filters[contextFor(input.view)];
  const common = { workspaceId: input.workspaceId, filters, page: input.page, pageSize: input.pageSize };
  switch (input.view) {
    case 'scheduled': return calendarScheduledQuerySchema.parse({
      ...common, view: 'calendar-scheduled', period: { from: input.range.from, to: input.range.to }, selected: input.evidence.scheduled,
    });
    case 'review': return calendarReviewQuerySchema.parse({
      ...common, view: 'calendar-review', period: { from: input.range.from, to: input.range.to }, selected: input.evidence.review,
    });
    case 'unscheduled': return calendarUnscheduledQuerySchema.parse({
      ...common, view: 'calendar-unscheduled', selected: input.evidence.unscheduled,
    });
  }
}

function attribution(visits: readonly {
  id: string; participantIds: readonly string[];
  records: readonly { id: string; type: 'job' | 'work_order'; participantIds?: readonly string[] }[];
}[]): CalendarReportAttribution[] {
  return visits.map(visit => ({
    visitId: visit.id,
    records: visit.records.map(record => {
      if (!record.participantIds) throw new Error('Calendar report record attribution is missing. Retry the report.');
      return { id: record.id, type: record.type, participantIds: record.participantIds };
    }),
  }));
}

/** Adapt a validated service response, never infer individual record membership from a visit union. */
export function adaptCalendarReportResponse(raw: unknown, rawOptions: unknown, input: {
  request: CalendarReportRequest; scopeKey: string;
}): { projection: CalendarReportProjection; filterOptions: ReturnType<typeof calendarReportFilterOptionsResultSchema.parse> } {
  const options = calendarReportFilterOptionsResultSchema.parse(rawOptions);
  const request = input.request.view === 'calendar-scheduled' ? calendarScheduledQuerySchema.parse(input.request)
    : input.request.view === 'calendar-review' ? calendarReviewQuerySchema.parse(input.request)
      : calendarUnscheduledQuerySchema.parse(input.request);
  const context = request.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated';
  if (options.workspaceId !== request.workspaceId || options.context !== context || !input.scopeKey.trim()) {
    throw new Error('Calendar report options do not match the current workspace or view. Retry the report.');
  }
  const result = request.view === 'calendar-scheduled' ? calendarScheduledResultSchema.parse(raw)
    : request.view === 'calendar-review' ? calendarReviewResultSchema.parse(raw) : calendarUnscheduledResultSchema.parse(raw);
  if (result.workspaceId !== request.workspaceId || result.view !== request.view ||
    result.evidence.kind !== request.selected || result.pageSize !== request.pageSize ||
    result.page !== Math.min(request.page, Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)))) {
    throw new Error('Calendar report response does not match the selected request. Retry the report.');
  }
  const snapshotLabel = `Current authorized schedule / ${new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: result.timezone,
  }).format(new Date(result.asOf))} (${result.timezone})`;
  const common = { scopeKey: input.scopeKey, filters: result.filters };
  let projection: CalendarReportProjection;
  if (result.view === 'calendar-scheduled') {
    projection = { ...common, view: 'scheduled',
      attribution: attribution(result.evidence.kind === 'visits' ? result.evidence.rows : []),
      state: { kind: 'ready', result: { ...result, snapshotLabel,
        periodLabel: `${formatReportDate(result.from)} - ${formatReportDate(result.to)}`,
        evidenceIds: { visits: 'scheduled-visits', busyPersonDays: 'busy-person-days' } } } };
  } else if (result.view === 'calendar-review') {
    projection = { ...common, view: 'review', attribution: attribution(result.visits),
      state: { kind: 'ready', result: { ...result, snapshotLabel,
        periodLabel: `${formatReportDate(result.from)} - ${formatReportDate(result.to)}`,
        evidenceIds: { overlaps: 'overlapping-pairs', past: 'past-visits' } } } };
  } else {
    projection = { ...common, view: 'unscheduled', attribution: attribution(result.visits),
      state: { kind: 'ready', result: { ...result, snapshotLabel,
        evidenceIds: { visits: 'unscheduled-visits', jobs: 'unscheduled-jobs', workOrders: 'unscheduled-work-orders' } } } };
  }
  const range = 'period' in request ? request.period : { from: result.today, to: result.today };
  if (!validCalendarReportProjection(projection, request.filters, options, options.scope, input.scopeKey, range)) {
    throw new Error('Calendar report results do not match the current filters, dates, scope or record attribution. Retry the report.');
  }
  return { projection, filterOptions: options };
}
