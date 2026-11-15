import 'server-only';
import { previewJobReportExport, createJobReportCSVExport } from '@salesmora/data';
import { jobReportExportInputSchema, type JobReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceJobExport(userId: string, raw: JobReportExportInput) {
  const input = jobReportExportInputSchema.parse(raw);
  return previewJobReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceJobs(userId: string, raw: JobReportExportInput, signal: AbortSignal) {
  const input = jobReportExportInputSchema.parse(raw);
  return createJobReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
