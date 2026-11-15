import 'server-only';
import { previewFinancialReportExport, createFinancialReportCSVExport } from '@salesmora/data';
import { financialReportExportInputSchema, type FinancialReportExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceFinancialExport(userId: string, raw: FinancialReportExportInput) {
  const input = financialReportExportInputSchema.parse(raw);
  return previewFinancialReportExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceFinancial(userId: string, raw: FinancialReportExportInput, signal: AbortSignal) {
  const input = financialReportExportInputSchema.parse(raw);
  return createFinancialReportCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
