import { describe, expect, it } from 'vitest';
import { permissionIds, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { canExportLeadSourceDataset, resolveLeadSourceExportAccess } from './lead-source-export-access';

function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy('workspace', 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId: 'workspace', userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId: 'workspace', userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
function setScope(value: AuthorizationContext, permission: PermissionId, scope: string) {
  value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === permission
    ? { ...grant, scope } as typeof grant : grant);
}
function revoke(value: AuthorizationContext, permission: PermissionId) {
  value.policy.grants = value.policy.grants.filter(grant => grant.role !== 'owner' || grant.permission !== permission);
}
function disable(value: AuthorizationContext, permission: PermissionId) {
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
}
describe('Sources CSV output-specific authority', () => {
  it('requires default-off Reports export and intersected Lead read/export for the base dataset', () => {
    expect(resolveLeadSourceExportAccess(context())).toMatchObject({
      leadScope: 'workspace', conversion: { kind: 'available' }, acceptedValue: { kind: 'available' },
    });
    for (const permission of ['reports.export', 'reports.read', 'leads.read', 'leads.export'] as const) {
      const missing = context(); revoke(missing, permission);
      expect(resolveLeadSourceExportAccess(missing), permission).toBeNull();
      const disabled = context(); disabled.enabledPermissions = disabled.enabledPermissions.filter(id => id !== permission);
      expect(resolveLeadSourceExportAccess(disabled), permission).toBeNull();
    }
  });
  it('keeps cohort exports available while narrowing the Lead scope, and denies conversion/value expansion', () => {
    const assigned = context();
    setScope(assigned, 'leads.export', 'assigned');
    expect(validateWorkspacePolicy(assigned.policy)).toMatchObject({ ok: true });
    const access = resolveLeadSourceExportAccess(assigned);
    expect(access).toMatchObject({ leadScope: 'assigned', conversion: { kind: 'unavailable' },
      acceptedValue: { kind: 'unavailable' } });
    expect(canExportLeadSourceDataset(access!, 'source-groups')).toBe(true);
    expect(canExportLeadSourceDataset(access!, 'cohort')).toBe(true);
    expect(canExportLeadSourceDataset(access!, 'converted')).toBe(false);
    expect(canExportLeadSourceDataset(access!, 'accepted-estimates')).toBe(false);
  });
  it('requires workspace Job read and export plus report source scope for conversion', () => {
    for (const permission of ['jobs.read', 'jobs.export'] as const) {
      const missing = context();
      if (permission.endsWith('.read')) disable(missing, permission);
      else revoke(missing, permission);
      const access = resolveLeadSourceExportAccess(missing)!;
      expect(access.conversion, permission).toEqual({ kind: 'unavailable', reason: 'permissions' });
      expect(access.acceptedValue.kind).toBe('unavailable');
      expect(canExportLeadSourceDataset(access, 'converted')).toBe(false);
    }
    const assigned = context(); setScope(assigned, 'jobs.export', 'assigned');
    expect(validateWorkspacePolicy(assigned.policy)).toMatchObject({ ok: true });
    expect(resolveLeadSourceExportAccess(assigned)?.conversion.kind).toBe('unavailable');
    const disabled = context(); disabled.enabledPermissions = disabled.enabledPermissions.filter(id => id !== 'jobs.export');
    expect(resolveLeadSourceExportAccess(disabled)?.conversion.kind).toBe('unavailable');
  });
  it('requires complete workspace Estimate read/export and both Lead and Estimate archive visibility for accepted value', () => {
    for (const permission of ['estimates.read', 'estimates.export', 'leads.archive', 'estimates.archive'] as const) {
      const missing = context();
      if (permission.endsWith('.read') || permission.endsWith('.archive')) disable(missing, permission);
      else revoke(missing, permission);
      const access = resolveLeadSourceExportAccess(missing)!;
      expect(access.acceptedValue, permission).toEqual({ kind: 'unavailable', reason: 'permissions' });
      expect(canExportLeadSourceDataset(access, 'accepted-estimates')).toBe(false);
    }
    const disabled = context(); disabled.enabledPermissions = disabled.enabledPermissions.filter(id => id !== 'estimates.export');
    expect(resolveLeadSourceExportAccess(disabled)?.acceptedValue.kind).toBe('unavailable');
  });
  it('denies non-owner/admin report export ceilings, invalid policy and foreign membership', () => {
    const field = context(); field.userId = 'field';
    field.membership = { ...field.membership, userId: 'field', role: 'field' };
    field.policy.grants.push({ role: 'field', permission: 'reports.export', scope: 'enabled' });
    expect(resolveLeadSourceExportAccess(field)).toBeNull();
    const invalid = context(); invalid.policy.revision = -1;
    expect(resolveLeadSourceExportAccess(invalid)).toBeNull();
    const foreign = context(); foreign.membership.workspaceId = 'other';
    expect(resolveLeadSourceExportAccess(foreign)).toBeNull();
  });
});
