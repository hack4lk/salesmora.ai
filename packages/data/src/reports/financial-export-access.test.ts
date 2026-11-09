import { describe, expect, it } from 'vitest';
import { permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { resolveFinancialReportExportAccess } from './financial-export-access';

function context(): AuthorizationContext {
  const workspaceId = 'workspace', policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' },
    { role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
describe('Financial CSV section authority', () => {
  it('requires Financial and Reports export access', () => {
    for (const permission of ['reports.financial.read', 'reports.export'] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      expect(resolveFinancialReportExportAccess(value)).toEqual({ estimates: null, materials: null });
    }
  });
  it('independently gates Estimate and material evidence and Job labels', () => {
    expect(resolveFinancialReportExportAccess(context())).toEqual({
      estimates: 'workspace', materials: { scope: 'workspace', jobScope: 'workspace' },
    });
    for (const permission of ['workorders.export', 'workorders.read', 'workorders.view_prices', 'workorders.view_costs'] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      expect(resolveFinancialReportExportAccess(value)).toMatchObject({ estimates: 'workspace', materials: null });
    }
    const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'estimates.export' && id !== 'jobs.export');
    expect(resolveFinancialReportExportAccess(value)).toEqual({ estimates: null, materials: { scope: 'workspace', jobScope: null } });
  });
});
