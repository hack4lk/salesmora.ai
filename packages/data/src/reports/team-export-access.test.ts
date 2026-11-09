import { describe, expect, it } from 'vitest';
import { permissionIds, teamReportExportInputSchema, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { resolveTeamReportExportScopes, requireTeamReportExportScope } from './team-export-access';

const workspaceId = '00000000-0000-4000-8000-000000000001';
function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.export', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
const input = (view: 'team-leads' | 'team-jobs', selected: object, dataset = 'evidence', members: string[] = []) =>
  teamReportExportInputSchema.parse({ dataset, query: { workspaceId, view, selected, filters: { members } } });
describe('Team report CSV authority', () => {
  it('independently intersects each domain and common Reports gates', () => {
    expect(resolveTeamReportExportScopes(context())).toEqual({ leads: { kind: 'workspace' }, jobs: { kind: 'workspace' } });
    for (const permission of ['reports.export', 'reports.read', 'leads.read', 'leads.export', 'jobs.read', 'jobs.export'] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      const scopes = resolveTeamReportExportScopes(value);
      if (permission.startsWith('reports.')) expect(scopes).toEqual({ leads: null, jobs: null });
      else if (permission.startsWith('leads.')) expect(scopes).toEqual({ leads: null, jobs: { kind: 'workspace' } });
      else expect(scopes).toEqual({ leads: { kind: 'workspace' }, jobs: null });
    }
    const defaultOff = context();
    defaultOff.policy.grants = defaultOff.policy.grants.filter(grant => grant.permission !== 'reports.export');
    expect(resolveTeamReportExportScopes(defaultOff)).toEqual({ leads: null, jobs: null });
  });
  it('narrows each domain independently and forbids foreign member and unassigned selections', () => {
    const value = context();
    value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === 'jobs.export'
      ? { ...grant, scope: 'assigned' } : grant);
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(resolveTeamReportExportScopes(value)).toEqual({
      leads: { kind: 'workspace' }, jobs: { kind: 'assigned', currentMemberId: 'owner' },
    });
    expect(requireTeamReportExportScope(value, input('team-jobs', { kind: 'member', id: 'owner',
      responsibility: 'supporting', filter: 'all' }))).toEqual({ kind: 'assigned', currentMemberId: 'owner' });
    for (const candidate of [
      input('team-jobs', { kind: 'queue', queue: 'unassigned' }),
      input('team-jobs', { kind: 'unassigned', filter: 'all' }),
      input('team-jobs', { kind: 'member', id: 'other', responsibility: 'primary', filter: 'all' }),
      input('team-jobs', { kind: 'queue', queue: 'active' }, 'unassigned'),
      input('team-jobs', { kind: 'queue', queue: 'active' }, 'summary', ['other']),
    ]) expect(() => requireTeamReportExportScope(value, candidate)).toThrow(AuthorizationAccessError);
    value.policy.grants = value.policy.grants.map(grant => grant.role === 'owner' && grant.permission === 'leads.export'
      ? { ...grant, scope: 'assigned' } : grant);
    expect(validateWorkspacePolicy(value.policy)).toMatchObject({ ok: true });
    expect(() => requireTeamReportExportScope(value, input('team-leads', { kind: 'owner', id: 'member:other' })))
      .toThrow(AuthorizationAccessError);
    expect(requireTeamReportExportScope(value, input('team-leads', { kind: 'owner', id: 'member:owner' })))
      .toEqual({ kind: 'assigned', currentMemberId: 'owner' });
  });
  it('denies foreign workspaces, ineligible roles and invalid membership', () => {
    const value = context();
    expect(() => requireTeamReportExportScope(value, { ...input('team-jobs', { kind: 'queue', queue: 'active' }),
      query: { ...input('team-jobs', { kind: 'queue', queue: 'active' }).query,
        workspaceId: '00000000-0000-4000-8000-000000000002' } })).toThrow(AuthorizationAccessError);
    value.membership.workspaceId = 'foreign';
    expect(resolveTeamReportExportScopes(value)).toEqual({ leads: null, jobs: null });
    for (const role of ['office', 'field'] as const) {
      const denied = context(); denied.userId = role; denied.membership = { ...denied.membership, userId: role, role };
      denied.policy.grants.push({ role, permission: 'reports.export', scope: 'enabled' });
      expect(resolveTeamReportExportScopes(denied)).toEqual({ leads: null, jobs: null });
    }
  });
});
