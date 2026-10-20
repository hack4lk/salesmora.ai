import {
  permissionCatalog, workspacePolicySchema, workspaceRoles,
  type PermissionDefinition, type PermissionId, type PermissionScope, type WorkspacePolicy, type WorkspaceRole,
} from '@salesmora/contracts';

export function definition(permission: PermissionId): PermissionDefinition {
  return permissionCatalog[permission];
}
export function grantScope(policy: WorkspacePolicy, role: WorkspaceRole, permission: PermissionId): PermissionScope | undefined {
  return policy.grants.find(grant => grant.role === role && grant.permission === permission)?.scope;
}
/** Scope containment is intentionally resource-specific; it is not a global ordering. */
export function scopeCovers(read: PermissionScope | undefined, requested: PermissionScope): boolean {
  return read === requested || read === 'workspace';
}
export type PolicyValidation = { ok: true; policy: WorkspacePolicy } | { ok: false; reason: string };
export function validateWorkspacePolicy(input: unknown): PolicyValidation {
  const parsed = workspacePolicySchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid-policy' };
  const policy = parsed.data;
  const seen = new Set<string>();
  for (const grant of policy.grants) {
    const spec = definition(grant.permission);
    const key = `${grant.role}:${grant.permission}`;
    if (seen.has(key)) return { ok: false, reason: 'duplicate-grant' };
    seen.add(key);
    if (!spec.scopes.includes(grant.scope)) return { ok: false, reason: 'unsupported-scope' };
    if (!spec.eligibleRoles.includes(grant.role)) return { ok: false, reason: 'role-ceiling' };
  }
  for (const role of workspaceRoles) {
    for (const permission of Object.keys(permissionCatalog) as PermissionId[]) {
      const spec = definition(permission);
      const scope = grantScope(policy, role, permission);
      if (spec.locked && role === 'owner' && scope !== 'enabled') return { ok: false, reason: 'protected-owner-power' };
      if (!scope) continue;
      for (const dependency of spec.dependencies as readonly PermissionId[]) {
        if (scope === 'enabled' ? !grantScope(policy, role, dependency) : !scopeCovers(grantScope(policy, role, dependency), scope)) return { ok: false, reason: 'missing-read-dependency' };
      }
      if (scope === 'assigned_job' && !scopeCovers(grantScope(policy, role, 'jobs.read'), 'assigned')) return { ok: false, reason: 'missing-job-dependency' };
      if (scope === 'related_assigned' && !grantScope(policy, role, 'leads.read') && !grantScope(policy, role, 'jobs.read')) return { ok: false, reason: 'missing-related-dependency' };
    }
  }
  return { ok: true, policy };
}
/** Template only: unreviewed and unimplemented actions remain denied by the engine. */
export function createDefaultWorkspacePolicy(workspaceId: string, revision = 0): WorkspacePolicy {
  const grants: WorkspacePolicy['grants'] = [];
  for (const role of workspaceRoles) {
    for (const permission of Object.keys(permissionCatalog) as PermissionId[]) {
      const scope = definition(permission).defaults[role];
      if (scope) grants.push({ role, permission, scope });
    }
  }
  const result = validateWorkspacePolicy({ workspaceId, revision, grants });
  if (!result.ok) throw new Error(`Invalid default policy: ${result.reason}`);
  return result.policy;
}
