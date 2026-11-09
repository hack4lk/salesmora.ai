import 'server-only';
import { calendarExportInputSchema, calendarExportPreviewSchema, calendarExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceCalendarExport, exportWorkspaceCalendar } from './calendar-export';
import { reportExportHttp } from './report-export-http';

export function calendarExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Calendar', input: calendarExportInputSchema,
    preview: calendarExportPreviewSchema, generation: calendarExportGenerationSchema,
    load: previewWorkspaceCalendarExport, download: exportWorkspaceCalendar });
}
