import 'server-only';
import { activityReportExportInputSchema, activityReportExportPreviewSchema, activityReportExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceActivityExport, exportWorkspaceActivity } from './activity-export';
import { reportExportHttp } from './report-export-http';

export function activityExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Activity', input: activityReportExportInputSchema,
    preview: activityReportExportPreviewSchema, generation: activityReportExportGenerationSchema,
    load: previewWorkspaceActivityExport, download: exportWorkspaceActivity });
}
