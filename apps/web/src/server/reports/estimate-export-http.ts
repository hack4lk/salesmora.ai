import 'server-only';
import { estimateReportExportInputSchema, estimateReportExportPreviewSchema, estimateReportExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceEstimateExport, exportWorkspaceEstimate } from './estimate-export';
import { reportExportHttp } from './report-export-http';

export function estimateExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Estimates', input: estimateReportExportInputSchema,
    preview: estimateReportExportPreviewSchema, generation: estimateReportExportGenerationSchema,
    load: previewWorkspaceEstimateExport, download: exportWorkspaceEstimate });
}
