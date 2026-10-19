import 'server-only';
import { permissionCatalog, permissionIds, workspaceRoles, type PermissionId, type PolicyChange } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError, AuthorizationConflictError, saveWorkspacePolicy } from '@salesmora/data';
import { database } from '../workspaces/store';
import { enabledPermissions, workspaceAuthorization } from './permissions';

export const permissionAuthenticationWindowMs = 15 * 60 * 1000;

export async function readPermissions(userId: string, workspaceId: string) {
  const context = await workspaceAuthorization(userId, workspaceId);
  if (!authorize(context, { permission: 'permissions.read' }).allowed) throw new AuthorizationAccessError();
  return context.policy;
}

export async function savePermissions(userId: string, change: PolicyChange) {
  const workspaceId = change.policy.workspaceId;
  const context = await workspaceAuthorization(userId, workspaceId);
  if (!authorize(context, { permission: 'permissions.manage' }).allowed) throw new AuthorizationAccessError();
  if (change.expectedRevision !== context.policy.revision) throw new AuthorizationConflictError();
  const scope = (grants: PolicyChange['policy']['grants'], role: typeof workspaceRoles[number], permission: PermissionId) => grants.find(grant => grant.role === role && grant.permission === permission)?.scope;
  // Do not allow a forged request to configure unavailable/unreviewed actions or bypass UI ceilings.
  for (const role of workspaceRoles) for (const permission of permissionIds) {
    if (scope(context.policy.grants, role, permission) === scope(change.policy.grants, role, permission)) continue;
    const definition = permissionCatalog[permission];
    if (!enabledPermissions.includes(permission) || !definition.reviewed || definition.locked ||
      (['team.invite', 'team.role.assign', 'team.remove'].includes(permission) && role !== 'owner' && role !== 'admin')) throw new AuthorizationAccessError();
  }
  // Reload authority and compare revisions again under the exclusive workspace lock.
  return saveWorkspacePolicy(database(), { userId, workspaceId }, enabledPermissions, change);
}
