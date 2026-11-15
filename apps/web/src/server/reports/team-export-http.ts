import 'server-only';
import { teamReportExportInputSchema, teamReportExportPreviewSchema, teamReportExportGenerationSchema } from '@salesmora/contracts';
import { previewWorkspaceTeamExport, exportWorkspaceTeam } from './team-export';
import { reportExportHttp } from './report-export-http';

export function teamExportHttp(request: Request, mode: 'preview' | 'download') {
  return reportExportHttp(request, mode, { label: 'Team', input: teamReportExportInputSchema,
    preview: teamReportExportPreviewSchema, generation: teamReportExportGenerationSchema,
    load: previewWorkspaceTeamExport, download: exportWorkspaceTeam });
}
