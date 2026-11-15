import { z } from 'zod';
import { calendarScheduledQuerySchema, calendarScheduledResultSchema } from './calendar-scheduled';
import { calendarReviewQuerySchema, calendarReviewResultSchema } from './calendar-review';
import { calendarUnscheduledQuerySchema, calendarUnscheduledResultSchema } from './calendar-unscheduled';
import { calendarReportFilterOptionsResultSchema } from './calendar-filters';
import { calendarExportOutputScopesSchema } from './calendar-export';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
export const calendarReportQuerySchema = z.discriminatedUnion('view', [
  calendarScheduledQuerySchema, calendarReviewQuerySchema, calendarUnscheduledQuerySchema,
]);
export type CalendarReportQuery = z.infer<typeof calendarReportQuerySchema>;
export const calendarReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text, policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  scope: calendarScheduledResultSchema.shape.scope, query: calendarReportQuerySchema,
  canExport: z.boolean(), exportScopes: calendarExportOutputScopesSchema.nullable(),
  report: z.union([calendarScheduledResultSchema, calendarReviewResultSchema, calendarUnscheduledResultSchema]),
  options: calendarReportFilterOptionsResultSchema,
}).strict().superRefine((result, context) => {
  const { query, report, options, scope } = result;
  let valid = result.workspaceId === query.workspaceId && report.workspaceId === result.workspaceId &&
    result.canExport === (result.exportScopes !== null) &&
    (!result.exportScopes || result.exportScopes.jobs.kind === 'available' || result.exportScopes.workOrders.kind === 'available') &&
    options.workspaceId === result.workspaceId && query.view === report.view &&
    JSON.stringify(report.scope) === JSON.stringify(scope) && JSON.stringify(options.scope) === JSON.stringify(scope) &&
    (scope.kind !== 'own' || scope.viewerId === result.viewerId) &&
    options.context === (query.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated') &&
    JSON.stringify(query.filters) === JSON.stringify(report.filters) &&
    query.selected === report.evidence.kind && query.pageSize === report.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.evidenceTotal / query.pageSize))) &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success &&
    options.participants.every(item => text.safeParse(item.value).success && text.safeParse(item.label).success) &&
    options.recordTypes.every(item => text.safeParse(item.label).success) &&
    query.filters.participants.every(id => options.participants.some(option => option.value === id)) &&
    query.filters.recordTypes.every(type => options.recordTypes.some(option => option.value === type)) &&
    report.members.every(member => text.safeParse(member.id).success && text.safeParse(member.label).success &&
      options.participants.some(option => option.value === member.id));
  if ('period' in query && 'from' in report) valid &&= query.period.from === report.from && query.period.to === report.to;
  const visits = report.view === 'calendar-scheduled'
    ? report.evidence.kind === 'visits' ? report.evidence.rows : [] : report.visits;
  valid &&= visits.every(visit => text.safeParse(visit.label).success && visit.records.every(record =>
    text.safeParse(record.label).success && options.recordTypes.some(option => option.value === record.type) &&
    record.participantIds !== undefined && record.participantIds.every(id => text.safeParse(id).success)));
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === report.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Calendar report request, authority, facets and attribution do not match.' });
});
export type CalendarReportReadResult = z.infer<typeof calendarReportReadResultSchema>;
