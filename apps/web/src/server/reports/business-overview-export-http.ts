import 'server-only';
import { businessOverviewExportInputSchema, businessOverviewExportPreviewSchema,
  businessOverviewExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceOverviewExport, exportWorkspaceOverview } from './business-overview-export';
import { reportExportHttp } from './report-export-http';

export function businessOverviewExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Overview', input: businessOverviewExportInputSchema,
    preview: businessOverviewExportPreviewSchema, generation: businessOverviewExportGenerationSchema,
    load: previewWorkspaceOverviewExport, download: exportWorkspaceOverview });
}
