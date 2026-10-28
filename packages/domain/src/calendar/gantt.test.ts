import { describe, expect, it } from 'vitest';
import { permissionIds, workspaceRoles, type AuthorizationContext, type PermissionId, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '../authorization/policy';
import { canViewGantt } from './gantt';

function context(role: WorkspaceRole, revoke: PermissionId[] = []): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy('workspace-a', 4);
  policy.grants = policy.grants.filter(grant => !(grant.role === role && revoke.includes(grant.permission)));
  const userId = `${role}-user`;
  return { userId, ownerUserId: 'owner-user', workspaceId: 'workspace-a', membership: { userId, workspaceId: 'workspace-a', role }, policy, enabledPermissions: [...permissionIds] };
}

describe('canViewGantt', () => {
  it('is available to owners and admins only by default', () => {
    expect(workspaceRoles.filter(role => canViewGantt(context(role)))).toEqual(['owner', 'admin']);
  });
  it.each(['calendar.read', 'jobs.read', 'workorders.read'] as const)('is hidden when an admin loses %s', permission => {
    expect(canViewGantt(context('admin', [permission]))).toBe(false);
  });
});
