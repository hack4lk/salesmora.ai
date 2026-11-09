import { describe, expect, it } from 'vitest';
import { calendarExportInputSchema, permissionCatalog, permissionIds, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, resolveAuthorizedCollectionScope, validateWorkspacePolicy } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { requireCalendarExportAccess, canExportCalendarDataset, resolveCalendarExportAccess } from './calendar-export-access';

const workspaceId = '00000000-0000-4000-8000-000000000001';
function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
function setScope(value: AuthorizationContext, permission: PermissionId,
  scope: AuthorizationContext['policy']['grants'][number]['scope']) {
  value.policy.grants = value.policy.grants.map(grant =>
    grant.role === 'owner' && grant.permission === permission ? { ...grant, scope } : grant);
}
function disable(value: AuthorizationContext, permission: PermissionId) {
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
}
const input = (dataset = 'visits', recordTypes: ('job' | 'work_order')[] = [], participants: string[] = []) =>
  calendarExportInputSchema.parse({ dataset,
    query: { workspaceId, view: 'calendar-unscheduled', selected: dataset,
      filters: { participants, recordTypes } } });

describe('Calendar CSV intersected authority', () => {
  it('requires default-off Reports export, Reports read and Calendar read', () => {
    expect(resolveCalendarExportAccess(context())).toEqual({
      scope: { kind: 'workspace' }, outputScopes: {
        jobs: { kind: 'available', scope: 'workspace' },
        workOrders: { kind: 'available', scope: 'workspace' },
      },
    });
    for (const permission of ['reports.export', 'reports.read', 'calendar.read'] as const) {
      const value = context(); disable(value, permission);
      expect(resolveCalendarExportAccess(value), permission).toBeNull();
    }
    const defaultOff = context();
    defaultOff.policy.grants = defaultOff.policy.grants.filter(grant => grant.permission !== 'reports.export');
    expect(resolveCalendarExportAccess(defaultOff)).toBeNull();
  });
  it('does not widen either parent domain and does not mutate the original read context', () => {
    const value = context();
    setScope(value, 'jobs.export', 'assigned');
    setScope(value, 'workorders.export', 'assigned_job');
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(resolveCalendarExportAccess(value)?.outputScopes).toEqual({
      jobs: { kind: 'available', scope: 'assigned' },
      workOrders: { kind: 'available', scope: 'assigned_job' },
    });
    expect(requireCalendarExportAccess(value, input()).outputScopes).toEqual({
      jobs: { kind: 'available', scope: 'assigned' },
      workOrders: { kind: 'available', scope: 'assigned_job' },
    });
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(resolveAuthorizedCollectionScope(value, 'jobs.read')).toMatchObject({ allowed: true, scope: 'workspace' });
    const narrowRead = context();
    // A read grant cannot be narrowed under unchanged wider dependent policy grants.
    narrowRead.policy.grants = narrowRead.policy.grants.filter(grant => grant.role !== 'owner' ||
      permissionCatalog[grant.permission].locked ||
      ['reports.export', 'reports.read', 'calendar.read', 'jobs.read', 'jobs.export',
        'workorders.read', 'workorders.export'].includes(grant.permission));
    setScope(narrowRead, 'jobs.read', 'assigned');
    setScope(narrowRead, 'jobs.export', 'assigned');
    setScope(narrowRead, 'workorders.read', 'assigned_job');
    setScope(narrowRead, 'workorders.export', 'assigned_job');
    expect(validateWorkspacePolicy(narrowRead.policy)).toMatchObject({ ok: true });
    expect(resolveCalendarExportAccess(narrowRead)?.outputScopes).toEqual({
      jobs: { kind: 'available', scope: 'assigned' },
      workOrders: { kind: 'available', scope: 'assigned_job' },
    });
  });
  it('preserves own Calendar participation semantics instead of substituting assigned parent semantics', () => {
    for (const [permission, scope] of [['reports.read', 'assigned'], ['calendar.read', 'own_assigned']] as const) {
      const value = context(); setScope(value, permission, scope);
      expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
      const access = resolveCalendarExportAccess(value)!;
      expect(access.scope).toEqual({ kind: 'own', viewerId: 'owner' });
      expect(canExportCalendarDataset(access, input('visits', [], ['other']))).toBe(false);
      expect(canExportCalendarDataset(access, input('visits', [], ['owner']))).toBe(true);
      expect(() => requireCalendarExportAccess(value, input('visits', [], ['other']))).toThrow(AuthorizationAccessError);
    }
  });
  it('marks unavailable domains for query suppression and rejects explicit unavailable selections', () => {
    for (const permission of ['jobs.read', 'jobs.export', 'workorders.read', 'workorders.export'] as const) {
      const value = context(); disable(value, permission);
      const jobsMissing = permission.startsWith('jobs.');
      const access = resolveCalendarExportAccess(value)!;
      expect(jobsMissing ? access.outputScopes.jobs : access.outputScopes.workOrders).toEqual({
        kind: 'unavailable', reason: 'permissions',
      });
      expect(canExportCalendarDataset(access, input())).toBe(true);
      expect(canExportCalendarDataset(access, input(jobsMissing ? 'jobs' : 'workOrders'))).toBe(false);
      expect(canExportCalendarDataset(access, input('visits', [jobsMissing ? 'job' : 'work_order']))).toBe(false);
      expect(requireCalendarExportAccess(value, input())).toEqual(access);
    }
    const noParents = context(); disable(noParents, 'jobs.export'); disable(noParents, 'workorders.export');
    expect(resolveCalendarExportAccess(noParents)).toBeNull();
  });
  it('rejects foreign workspaces/membership, invalid policies and non-Owner/Admin ceilings', () => {
    expect(() => requireCalendarExportAccess(context(), { ...input(), query: {
      ...input().query, workspaceId: '00000000-0000-4000-8000-000000000002',
    } })).toThrow(AuthorizationAccessError);
    const foreign = context(); foreign.membership.workspaceId = 'other';
    expect(resolveCalendarExportAccess(foreign)).toBeNull();
    const invalid = context(); invalid.policy.revision = -1;
    expect(resolveCalendarExportAccess(invalid)).toBeNull();
    const field = context(); field.userId = 'field';
    field.membership = { ...field.membership, userId: 'field', role: 'field' };
    field.policy.grants.push({ role: 'field', permission: 'reports.export', scope: 'enabled' });
    expect(resolveCalendarExportAccess(field)).toBeNull();
  });
});
