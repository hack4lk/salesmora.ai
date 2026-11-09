import { describe, expect, it } from 'vitest';
import { permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { resolveEstimateReportExportAccess } from './estimate-export-access';

function context(): AuthorizationContext {
  const workspaceId = 'workspace', policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
describe('Estimate report CSV authority', () => {
  it('requires both Reports and Estimate read/export gates', () => {
    expect(resolveEstimateReportExportAccess(context())).toEqual({ scope: 'workspace', handoff: true });
    for (const permission of ['reports.export', 'reports.read', 'estimates.read', 'estimates.export'] as const) {
      const disabled = context(); disabled.enabledPermissions = disabled.enabledPermissions.filter(id => id !== permission);
      expect(resolveEstimateReportExportAccess(disabled), permission).toBeNull();
      const revoked = context(); revoked.policy.grants = revoked.policy.grants.filter(grant => grant.permission !== permission);
      expect(resolveEstimateReportExportAccess(revoked), permission).toBeNull();
    }
  });
  it('narrows Estimates to assigned Jobs when report authority is assigned', () => {
    const value = context();
    value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === 'reports.read'
      ? { ...grant, scope: 'assigned' } : grant);
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(resolveEstimateReportExportAccess(value)).toEqual({ scope: 'assigned_job', handoff: false });
    value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'jobs.read');
    expect(resolveEstimateReportExportAccess(value)).toBeNull();
  });
  it('keeps Estimates export available but withholds linkage when a supporting export grant is absent', () => {
    for (const permission of ['leads.read', 'leads.export', 'jobs.read', 'jobs.export'] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      expect(resolveEstimateReportExportAccess(value), permission).toEqual({ scope: 'workspace', handoff: false });
    }
  });
  it('denies foreign membership and ineligible roles', () => {
    const value = context(); value.membership.workspaceId = 'other';
    expect(resolveEstimateReportExportAccess(value)).toBeNull();
    for (const role of ['office', 'field'] as const) {
      const denied = context(); denied.userId = role; denied.membership = { ...denied.membership, userId: role, role };
      denied.policy.grants.push({ role, permission: 'reports.export', scope: 'enabled' });
      expect(resolveEstimateReportExportAccess(denied)).toBeNull();
    }
  });
});
