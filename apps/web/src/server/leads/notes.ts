import 'server-only';
import { addLeadNote } from '@salesmora/data';
import type { AddLeadNoteInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function addWorkspaceLeadNote(userId: string, input: AddLeadNoteInput) {
  return addLeadNote(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input);
}
