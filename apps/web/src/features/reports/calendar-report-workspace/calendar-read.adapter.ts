import { calendarReportQuerySchema, calendarReportReadResultSchema,
  type CalendarReportQuery, type CalendarReportReadResult } from '@salesmora/contracts';
import { adaptCalendarReportResponse } from './calendar-report-workspace.adapter';

export function calendarReportScopeKey(result: CalendarReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.scope, result.canExport, result.exportScopes]);
}
export function adaptCalendarReadResponse(raw: unknown, input: {
  request: CalendarReportQuery; scopeKey: string; today: string; timezone: string;
}) {
  const request = calendarReportQuerySchema.parse(input.request), response = calendarReportReadResultSchema.parse(raw);
  if (JSON.stringify(response.query) !== JSON.stringify(request) || calendarReportScopeKey(response) !== input.scopeKey ||
    response.report.today !== input.today || response.report.timezone !== input.timezone) {
    throw new Error('Calendar report results no longer match this request or current authority. Reload the report.');
  }
  return adaptCalendarReportResponse(response.report, response.options, { request, scopeKey: input.scopeKey });
}
export function visibleCalendarRecord(result: CalendarReportReadResult, id: string): { id: string; type: 'job' | 'work_order' } | undefined {
  const report = result.report;
  const visits = report.view === 'calendar-scheduled' ? report.evidence.kind === 'visits' ? report.evidence.rows : [] : report.visits;
  return visits.flatMap(visit => visit.records).find(record => record.recordId === id);
}
