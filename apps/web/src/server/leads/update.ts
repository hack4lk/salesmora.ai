import 'server-only';
import { updateLead } from '@salesmora/data';
import type { UpdateLeadInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function updateWorkspaceLead(userId: string, input: UpdateLeadInput) {
  return updateLead(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input);
}
