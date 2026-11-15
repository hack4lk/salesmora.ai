import 'server-only';
import { jobReportExportInputSchema, jobReportExportPreviewSchema, jobReportExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceJobExport, exportWorkspaceJobs } from './job-export';
import { reportExportHttp } from './report-export-http';

export function jobExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Jobs', input: jobReportExportInputSchema,
    preview: jobReportExportPreviewSchema, generation: jobReportExportGenerationSchema,
    load: previewWorkspaceJobExport, download: exportWorkspaceJobs });
}
