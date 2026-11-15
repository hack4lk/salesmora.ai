import 'server-only';
import { previewLeadSourceExport, createLeadSourceCSVExport } from '@salesmora/data';
import { leadSourceExportInputSchema, type LeadSourceExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceLeadSourceExport(userId: string, raw: LeadSourceExportInput) {
  const input = leadSourceExportInputSchema.parse(raw);
  return previewLeadSourceExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}

export function exportWorkspaceLeadSource(userId: string, raw: LeadSourceExportInput, signal: AbortSignal) {
  const input = leadSourceExportInputSchema.parse(raw);
  return createLeadSourceCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
