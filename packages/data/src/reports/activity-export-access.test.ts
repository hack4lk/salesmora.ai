import { describe, expect, it } from 'vitest';
import { permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { resolveActivityReportExportScopes } from './activity-export-access';

function context(): AuthorizationContext {
  const workspaceId = 'workspace', policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
describe('Activity CSV domain authority', () => {
  it('requires Reports export and independently intersects each source export grant', () => {
    const all = { lead: 'workspace', customer: 'workspace', job: 'workspace', estimate: 'workspace', 'work-order': 'workspace' };
    expect(resolveActivityReportExportScopes(context())).toEqual(all);
    for (const [permission, domain] of [['leads.export', 'lead'], ['customers.export', 'customer'],
      ['jobs.export', 'job'], ['estimates.export', 'estimate'], ['workorders.export', 'work-order']] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      expect(resolveActivityReportExportScopes(value)).toEqual({ ...all, [domain]: null });
    }
    const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'reports.export');
    expect(Object.values(resolveActivityReportExportScopes(value))).toEqual([null, null, null, null, null]);
  });
  it('narrows assigned report scope and omits Customer histories', () => {
    const value = context();
    value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === 'reports.read'
      ? { ...grant, scope: 'assigned' } : grant);
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(resolveActivityReportExportScopes(value)).toEqual({
      lead: 'assigned', customer: null, job: 'assigned', estimate: 'assigned', 'work-order': 'assigned',
    });
  });
  it('does not require or activate the unreviewed activity.export capability', () => {
    const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'activity.export');
    expect(Object.values(resolveActivityReportExportScopes(value)).every(Boolean)).toBe(true);
  });
});
