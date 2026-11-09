import 'server-only';
import { previewBusinessOverviewExport, createBusinessOverviewCSVExport } from '@salesmora/data';
import { businessOverviewExportInputSchema, type BusinessOverviewExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceOverviewExport(userId: string, raw: BusinessOverviewExportInput) {
  const input = businessOverviewExportInputSchema.parse(raw);
  return previewBusinessOverviewExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceOverview(userId: string, raw: BusinessOverviewExportInput, signal: AbortSignal) {
  const input = businessOverviewExportInputSchema.parse(raw);
  return createBusinessOverviewCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
