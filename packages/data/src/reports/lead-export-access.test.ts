import { describe, expect, it } from 'vitest';
import { permissionCatalog, permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { resolveLeadReportExportScope } from './lead-export-access';

function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy('workspace', 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId: 'workspace', userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId: 'workspace', userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
describe('Leads report CSV authority intersection', () => {
  it('requires every export/read/report entrance and does not accept stored grants for disabled surfaces', () => {
    expect(resolveLeadReportExportScope(context())).toBe('workspace');
    for (const permission of ['reports.export', 'reports.read', 'leads.export', 'leads.read'] as const) {
      const c = context(); c.enabledPermissions = c.enabledPermissions.filter(id => id !== permission);
      expect(resolveLeadReportExportScope(c)).toBeNull();
      const revoked = context(); revoked.policy.grants = revoked.policy.grants.filter(grant => grant.permission !== permission);
      expect(resolveLeadReportExportScope(revoked)).toBeNull();
    }
  });
  it('narrows workspace report access under any assigned read or export grant', () => {
    for (const permission of ['reports.read', 'leads.read', 'leads.export'] as const) {
      const c = context();
      c.policy.grants = c.policy.grants.map(grant => grant.role === 'owner' && grant.permission === permission
        ? { ...grant, scope: 'assigned' } : grant);
      if (permission === 'leads.read') {
        c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'owner' ||
          permissionCatalog[grant.permission].locked ||
          ['leads.read', 'leads.export', 'reports.read', 'reports.export', 'jobs.read'].includes(grant.permission))
          .map(grant => grant.role === 'owner' && grant.permission === 'leads.export' ? { ...grant, scope: 'assigned' } : grant);
      }
      expect(validateWorkspacePolicy(c.policy), permission).toMatchObject({ ok: true });
      expect(resolveLeadReportExportScope(c)).toBe('assigned');
    }
  });
  it('denies Office/Field ceilings and cross-workspace membership rather than trusting stored grants', () => {
    for (const role of ['office', 'field'] as const) {
      const c = context(); c.userId = role; c.membership = { ...c.membership, userId: role, role };
      c.policy.grants.push({ role, permission: 'reports.export', scope: 'enabled' });
      expect(resolveLeadReportExportScope(c)).toBeNull();
    }
    const c = context(); c.membership.workspaceId = 'foreign';
    expect(resolveLeadReportExportScope(c)).toBeNull();
  });
});
