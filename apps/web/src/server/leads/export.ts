import 'server-only';
import { previewLeadExport, createLeadCSVExport } from '@salesmora/data';
import type { LeadExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function previewWorkspaceLeadExport(userId: string, input: LeadExportInput) {
  return previewLeadExport(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceLeads(userId: string, input: LeadExportInput, signal: AbortSignal) {
  return createLeadCSVExport(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input, signal);
}
