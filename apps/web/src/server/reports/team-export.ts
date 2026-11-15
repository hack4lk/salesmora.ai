import 'server-only';
import { previewTeamReportExport, createTeamReportCSVExport } from '@salesmora/data';
import { teamReportExportInputSchema, type TeamReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceTeamExport(userId: string, raw: TeamReportExportInput) {
  const input = teamReportExportInputSchema.parse(raw);
  return previewTeamReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceTeam(userId: string, raw: TeamReportExportInput, signal: AbortSignal) {
  const input = teamReportExportInputSchema.parse(raw);
  return createTeamReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
