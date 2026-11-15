import {
  calendarExportInputSchema, calendarExportPreviewSchema, calendarExportGenerationSchema,
  type CalendarExportInput, type CalendarExportPreview, type CalendarReportQuery, type CalendarReportReadResult,
} from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const calendarExportLabels: Record<CalendarExportInput['dataset'], string> = {
  summary: 'Summary table', days: 'Daily visits table', 'person-days': 'Participant workload table',
  visits: 'Full visit evidence', 'busy-person-days': 'Busy person-day evidence',
  overlaps: 'Overlap person-pair evidence', past: 'Past scheduled visit evidence',
  jobs: 'Unscheduled Job evidence', workOrders: 'Unscheduled Work Order evidence',
};
export function calendarExportDatasetsForView(view: CalendarReportQuery['view']): CalendarExportInput['dataset'][] {
  return view === 'calendar-scheduled' ? ['summary', 'days', 'person-days', 'visits', 'busy-person-days']
    : view === 'calendar-review' ? ['summary', 'overlaps', 'past'] : ['summary', 'visits', 'jobs', 'workOrders'];
}
export function calendarExportInput(query: CalendarReportQuery, dataset: CalendarExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  const selected = query.view === 'calendar-scheduled'
    ? dataset === 'person-days' || dataset === 'busy-person-days' ? 'busy-person-days' : 'visits'
    : query.view === 'calendar-review' ? dataset === 'past' ? 'past' : 'overlaps'
      : dataset === 'jobs' || dataset === 'workOrders' ? dataset : 'visits';
  return calendarExportInputSchema.parse({ dataset, query: { ...unpaged, selected } });
}
export function calendarExportFilename(input: CalendarExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class CalendarCSVChangedError extends Error {
  constructor() { super('Calendar export data or access changed. Refresh the preview and review again.'); }
}
export class CalendarCSVDeniedError extends Error {
  constructor() { super('This Calendar export is unavailable under current access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new CalendarCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Calendar selection and technical CSV limits.'
    : 'Calendar CSV could not be completed. Try again.');
}
export async function loadCalendarCSVPreview(input: CalendarExportInput, authority: CalendarReportReadResult, signal: AbortSignal) {
  const response = await fetch('/api/reports/calendar/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = calendarExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    JSON.stringify(preview.scope) !== JSON.stringify(authority.scope) ||
    JSON.stringify(preview.outputScopes) !== JSON.stringify(authority.exportScopes) ||
    preview.today !== authority.report.today || preview.timezone !== authority.report.timezone || !authority.canExport) {
    throw new CalendarCSVChangedError();
  }
  return preview;
}
export async function receiveCalendarCSV(preview: CalendarExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/calendar/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, calendarExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      JSON.stringify(metadata.scope) !== JSON.stringify(preview.scope) ||
      JSON.stringify(metadata.outputScopes) !== JSON.stringify(preview.outputScopes) ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new CalendarCSVChangedError();
  }, signal, 'Calendar');
}
export { saveReportCSV as saveCalendarCSV } from '../save-report-csv';
