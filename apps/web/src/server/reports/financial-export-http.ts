import 'server-only';
import { financialReportExportInputSchema, financialReportExportPreviewSchema, financialReportExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceFinancialExport, exportWorkspaceFinancial } from './financial-export';
import { reportExportHttp } from './report-export-http';

export function financialExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Financial', input: financialReportExportInputSchema,
    preview: financialReportExportPreviewSchema, generation: financialReportExportGenerationSchema,
    load: previewWorkspaceFinancialExport, download: exportWorkspaceFinancial });
}
