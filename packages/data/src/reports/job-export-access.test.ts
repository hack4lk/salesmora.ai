import { describe, expect, it } from 'vitest';
import { permissionCatalog, permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { resolveJobReportExportScope } from './job-export-access';

function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy('workspace', 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId: 'workspace', userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId: 'workspace', userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
describe('Jobs report CSV authority intersection', () => {
  it('requires each enabled and granted report and Jobs permission', () => {
    expect(resolveJobReportExportScope(context())).toBe('workspace');
    for (const permission of ['reports.export', 'reports.read', 'jobs.read', 'jobs.export'] as const) {
      const disabled = context();
      disabled.enabledPermissions = disabled.enabledPermissions.filter(id => id !== permission);
      expect(resolveJobReportExportScope(disabled), permission).toBeNull();
      const revoked = context();
      revoked.policy.grants = revoked.policy.grants.filter(grant => grant.permission !== permission);
      expect(resolveJobReportExportScope(revoked), permission).toBeNull();
    }
  });
  it('narrows to assigned for every narrowed report, read or export scope', () => {
    for (const permission of ['reports.read', 'jobs.read', 'jobs.export'] as const) {
      const value = context();
      if (permission === 'jobs.read') {
        value.policy.grants = value.policy.grants.filter(grant => grant.role !== 'owner' ||
          permissionCatalog[grant.permission].locked ||
          ['reports.export', 'reports.read', 'jobs.read', 'jobs.export'].includes(grant.permission))
          .map(grant => grant.role === 'owner' && grant.permission === 'jobs.export'
            ? { ...grant, scope: 'assigned' } : grant);
      }
      value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === permission
        ? { ...grant, scope: 'assigned' } : grant);
      expect(validateWorkspacePolicy(value.policy), permission).toMatchObject({ ok: true });
      expect(resolveJobReportExportScope(value), permission).toBe('assigned');
    }
  });
  it('denies ineligible roles and cross-workspace membership', () => {
    for (const role of ['office', 'field'] as const) {
      const value = context(); value.userId = role; value.membership = { ...value.membership, userId: role, role };
      value.policy.grants.push({ role, permission: 'reports.export', scope: 'enabled' });
      expect(resolveJobReportExportScope(value)).toBeNull();
    }
    const value = context(); value.membership.workspaceId = 'foreign';
    expect(resolveJobReportExportScope(value)).toBeNull();
  });
});
