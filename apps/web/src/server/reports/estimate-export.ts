import 'server-only';
import { previewEstimateReportExport, createEstimateReportCSVExport } from '@salesmora/data';
import { estimateReportExportInputSchema, type EstimateReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceEstimateExport(userId: string, raw: EstimateReportExportInput) {
  const input = estimateReportExportInputSchema.parse(raw);
  return previewEstimateReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceEstimate(userId: string, raw: EstimateReportExportInput, signal: AbortSignal) {
  const input = estimateReportExportInputSchema.parse(raw);
  return createEstimateReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
