import 'server-only';
import { deleteLead } from '@salesmora/data';
import type { DeleteLeadInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';

export function deleteWorkspaceLead(userId: string, input: DeleteLeadInput) {
  return deleteLead(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input);
}
