import 'server-only';
import { setLeadArchived } from '@salesmora/data';
import type { LeadArchiveInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function archiveWorkspaceLead(userId:string,input:LeadArchiveInput,archived:boolean) {
  return setLeadArchived(database(),{userId,workspaceId:input.workspaceId},enabledPermissions,input,archived);
}
