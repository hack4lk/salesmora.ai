import 'server-only';
import { assignLead } from '@salesmora/data';
import type { AssignLeadInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function assignWorkspaceLead(userId: string, input: AssignLeadInput) { return assignLead(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input); }
