import 'server-only';
import { previewActivityReportExport, createActivityReportCSVExport } from '@salesmora/data';
import { activityReportExportInputSchema, type ActivityReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceActivityExport(userId: string, raw: ActivityReportExportInput) {
  const input = activityReportExportInputSchema.parse(raw);
  return previewActivityReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceActivity(userId: string, raw: ActivityReportExportInput, signal: AbortSignal) {
  const input = activityReportExportInputSchema.parse(raw);
  return createActivityReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
