import {
  adminPermissionIdSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminPermissionId,
  type StaffRoleId,
} from '@salesmora/contracts';

export type AdminAuthorizationDenial = { allowed: false; reason: 'invalid-role' | 'invalid-permission' | 'permission-denied' };
export type AdminAuthorizationGrant = { allowed: true; role: StaffRoleId; permission: AdminPermissionId };
export type AdminAuthorizationDecision = AdminAuthorizationGrant | AdminAuthorizationDenial;

/** The role must be loaded from the current staff record on the server, never from browser claims. */
export function authorizeAdmin(roleInput: unknown, permissionInput: unknown): AdminAuthorizationDecision {
  const role = staffRoleIdSchema.safeParse(roleInput);
  if (!role.success) return { allowed: false, reason: 'invalid-role' };
  const permission = adminPermissionIdSchema.safeParse(permissionInput);
  if (!permission.success) return { allowed: false, reason: 'invalid-permission' };
  if (!staffRolePermissions[role.data].includes(permission.data)) {
    return { allowed: false, reason: 'permission-denied' };
  }
  return { allowed: true, role: role.data, permission: permission.data };
}
