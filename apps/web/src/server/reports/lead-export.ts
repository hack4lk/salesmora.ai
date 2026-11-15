import 'server-only';
import { previewLeadReportExport, createLeadReportCSVExport } from '@salesmora/data';
import { leadReportExportInputSchema, type LeadReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceLeadReportExport(userId: string, raw: LeadReportExportInput) {
  const input = leadReportExportInputSchema.parse(raw);
  return previewLeadReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceLeadReport(userId: string, raw: LeadReportExportInput, signal: AbortSignal) {
  const input = leadReportExportInputSchema.parse(raw);
  return createLeadReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
