import 'server-only';
import { previewCalendarExport, createCalendarCSVExport } from '@salesmora/data';
import { calendarExportInputSchema, type CalendarExportInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function previewWorkspaceCalendarExport(userId: string, raw: CalendarExportInput) {
  const input = calendarExportInputSchema.parse(raw);
  return previewCalendarExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input);
}
export function exportWorkspaceCalendar(userId: string, raw: CalendarExportInput, signal: AbortSignal) {
  const input = calendarExportInputSchema.parse(raw);
  return createCalendarCSVExport(database(), { userId, workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
}
