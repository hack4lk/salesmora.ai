import { calendarReportQuerySchema, calendarReportReadResultSchema, calendarScheduledResultSchema, calendarReviewResultSchema,
  calendarUnscheduledResultSchema, type CalendarReportQuery } from '@salesmora/contracts';
import { calendarBackendResponse, calendarBackendOptions, calendarBackendWorkspaceId } from './calendar-report-workspace.adapter.fixtures';
import { calendarWorkspaceRange } from './calendar-report-workspace.fixtures';
import type { CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';

export const initialCalendarQuery = calendarReportQuerySchema.parse({
  workspaceId: calendarBackendWorkspaceId, view: 'calendar-scheduled', period: calendarWorkspaceRange, selected: 'visits',
});
export function calendarReadResponse(query: CalendarReportQuery, scope: CalendarReportFilterScope = { kind: 'workspace' }, replacement = false) {
  const raw = calendarBackendResponse(query, scope);
  const report = query.view === 'calendar-scheduled' ? calendarScheduledResultSchema.parse(raw)
    : query.view === 'calendar-review' ? calendarReviewResultSchema.parse(raw) : calendarUnscheduledResultSchema.parse(raw);
  const visits = report.view === 'calendar-scheduled'
    ? report.evidence.kind === 'visits' ? report.evidence.rows : [] : report.visits;
  const relabelled = replacement ? visits.map(visit => ({ ...visit, records: visit.records.map(record => ({ ...record, label: `Replacement ${record.label}` })) })) : visits;
  return calendarReportReadResultSchema.parse({
    workspaceId: query.workspaceId, viewerId: scope.kind === 'own' ? scope.viewerId : 'calendar-viewer',
    policyRevision: 1, scope, query, options: calendarBackendOptions(query, scope),
    canExport: scope.kind === 'workspace', exportScopes: scope.kind === 'workspace' ? {
      jobs: { kind: 'available', scope: 'workspace' }, workOrders: { kind: 'available', scope: 'workspace' },
    } : null,
    report: replacement ? report.view === 'calendar-scheduled'
      ? { ...report, evidence: { kind: 'visits', rows: relabelled } } : { ...report, visits: relabelled } : report,
  });
}
