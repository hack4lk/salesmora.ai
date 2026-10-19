import { describe, expect, it } from 'vitest';
import { chatToolIds, workspaceRoles, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { authorizeChatTool, authorizeChatTurn, availableChatTools } from './access';
import { authorizeLeadOperation, availableLeadOperations } from './leads/authorization';
const workspaceId = '00000000-0000-4000-8000-000000000001';
const request = { workspaceId, clientTurnId: '00000000-0000-4000-8000-000000000002', surfaceKey: 'home', message: 'Summarize my leads' };
function context(role: WorkspaceRole): AuthorizationContext {
  const userId = `${role}-user`;
  return { workspaceId, userId, ownerUserId: 'owner-user', membership: { workspaceId, userId, role },
    policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: ['assistant.use', 'leads.read', 'leads.create', 'leads.assign', 'leads.stage.update', 'leads.update', 'leads.archive', 'leads.export', 'leads.delete'] };
}
describe('shared app, Leads capability and chat authorization', () => {
  for (const role of workspaceRoles) it(`${role}: facade availability never grants another operation`, () => {
    const c = context(role);
    expect(authorizeChatTurn(c, request).allowed).toBe(true);
    for (const surface of ['home', 'leads.list', 'lead.detail']) {
      expect(authorizeChatTool(c, surface, 'leads_query', chatToolIds)).toEqual(resolveAuthorizedCollectionScope(c, 'leads.read'));
      expect(authorizeChatTool(c, surface, 'leads_propose_action', chatToolIds).allowed).toBe(true);
      const expected = role === 'field' ? ['history', 'details', 'search', 'pipeline_summary', 'update', 'add_note', 'update_with_stage', 'change_stage'] : ['history', 'details', 'search', 'pipeline_summary', 'create', 'update', 'add_note', 'assign', 'update_with_stage', 'change_stage'];
      if (role === 'owner' || role === 'admin') expected.splice(expected.indexOf('assign'), 0, 'delete', 'export_csv', 'set_archived');
      expect(availableLeadOperations(c, surface)).toEqual(expected);
      expect(authorizeLeadOperation(c, surface, 'create').allowed).toBe(role !== 'field');
    }
    expect(availableLeadOperations(c, 'leads.create')).toEqual(role === 'field' ? [] : ['create']);
    for (const surface of ['settings.overview', 'settings.permissions']) {
      expect(availableChatTools(c, surface, chatToolIds)).toEqual(['search_help']);
      expect(availableLeadOperations(c, surface)).toEqual([]);
    }
  });
  it('requires the explicit runtime implementation list', () => {
    expect(availableChatTools(context('owner'), 'home')).toEqual([]);
    expect(authorizeChatTool(context('owner'), 'home', 'search_help').allowed).toBe(false);
  });
  it('rejects unknown operations, legacy tools and unsupported surfaces', () => {
    const c = context('owner');
    for (const operation of ['constructor', '__proto__', 'delete_all', 'run_sql']) expect(authorizeLeadOperation(c, 'home', operation).allowed).toBe(false);
    expect(authorizeChatTool(c, 'campaigns', 'search_help', chatToolIds).allowed).toBe(false);
    expect(authorizeChatTool(c, 'home', 'draft_create_lead', chatToolIds).allowed).toBe(false);
  });
  it('revocation removes only the affected operation until all lead permissions are removed', () => {
    const c = context('office');
    c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== 'leads.stage.update');
    expect(availableLeadOperations(c, 'home')).toEqual(['history', 'details', 'search', 'pipeline_summary', 'create', 'update', 'add_note', 'assign']);
    expect(authorizeChatTool(c, 'home', 'leads_propose_action', chatToolIds).allowed).toBe(true);
    expect(authorizeLeadOperation(c, 'home', 'change_stage').allowed).toBe(false);
    c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || !grant.permission.startsWith('leads.'));
    expect(availableChatTools(c, 'home', chatToolIds)).toEqual(['search_help']);
    c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== 'assistant.use');
    expect(authorizeChatTurn(c, request).allowed).toBe(false);
    expect(availableChatTools(c, 'home', chatToolIds)).toEqual([]);
  });
  it('rejects forged authority and other workspaces', () => {
    expect(authorizeChatTurn(context('owner'), { ...request, workspaceId: '00000000-0000-4000-8000-000000000003' }).allowed).toBe(false);
    for (const key of ['role', 'userId', 'tools', 'operations', 'history', 'policy', 'recordRefs']) expect(authorizeChatTurn(context('field'), { ...request, [key]: 'owner' }).allowed).toBe(false);
    const c = context('owner'); c.membership.workspaceId = 'another-workspace';
    expect(availableChatTools(c, 'home', chatToolIds)).toEqual([]);
    expect(availableLeadOperations(c, 'home')).toEqual([]);
  });
  it('keeps unavailable app features disabled despite saved grants', () => {
    const c = context('owner'); c.enabledPermissions = ['assistant.use'];
    expect(availableChatTools(c, 'home', chatToolIds)).toEqual(['search_help']);
    expect(availableLeadOperations(c, 'home')).toEqual([]);
  });
});

it('exposes combined proposals only when both update and stage permissions are available', () => {
  for (const permission of ['leads.update', 'leads.stage.update']) {
    const c = context('office');
    c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== permission);
    expect(availableLeadOperations(c, 'lead.detail')).not.toContain('update_with_stage');
    expect(authorizeLeadOperation(c, 'lead.detail', 'update_with_stage').allowed).toBe(false);
  }
});

it('assignment availability follows the saved app grant and supported surfaces', () => {
  const c = context('office');
  expect(authorizeLeadOperation(c, 'lead.detail', 'assign').allowed).toBe(true);
  expect(authorizeLeadOperation(context('field'), 'lead.detail', 'assign').allowed).toBe(false);
  c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'office' || grant.permission !== 'leads.assign');
  expect(authorizeLeadOperation(c, 'home', 'assign').allowed).toBe(false);
  expect(availableLeadOperations(c, 'lead.detail')).not.toContain('assign');
});

it('team notes follow readable-lead scope independently of ordinary update permission', () => {
  const c = context('field');
  c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'field' || grant.permission !== 'leads.update');
  expect(authorizeLeadOperation(c, 'lead.detail', 'add_note').allowed).toBe(true);
  expect(authorizeLeadOperation(c, 'lead.detail', 'update').allowed).toBe(false);
  c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'field' || !grant.permission.startsWith('leads.'));
  expect(authorizeLeadOperation(c, 'lead.detail', 'add_note').allowed).toBe(false);
  expect(authorizeLeadOperation(context('owner'), 'settings.overview', 'add_note').allowed).toBe(false);
});

it('archive and restore require the app archive grant, eligible role and relevant surface', () => {
  for (const role of workspaceRoles) expect(authorizeLeadOperation(context(role), 'lead.detail', 'set_archived').allowed).toBe(role === 'owner' || role === 'admin');
  const c = context('admin');
  c.policy.grants = c.policy.grants.filter(grant => grant.role !== 'admin' || grant.permission !== 'leads.archive');
  expect(authorizeLeadOperation(c, 'home', 'set_archived').allowed).toBe(false);
  expect(authorizeLeadOperation(context('owner'), 'settings.overview', 'set_archived').allowed).toBe(false);
});

it('export follows the app role ceiling and intersected collection grants', () => {
  for (const role of workspaceRoles) expect(authorizeLeadOperation(context(role), 'home', 'export_csv').allowed).toBe(role === 'owner' || role === 'admin');
  const c = context('admin'); c.policy.grants = c.policy.grants.filter(g => !(g.role === 'admin' && g.permission === 'leads.export'));
  expect(authorizeLeadOperation(c, 'leads.list', 'export_csv').allowed).toBe(false);
  expect(authorizeLeadOperation(context('owner'), 'settings.overview', 'export_csv').allowed).toBe(false);
});

it('permanent deletion requires the app role ceiling, workspace read and current delete grant', () => {
  for (const role of workspaceRoles) expect(authorizeLeadOperation(context(role), 'lead.detail', 'delete').allowed).toBe(role === 'owner' || role === 'admin');
  const c = context('admin'); c.policy.grants = c.policy.grants.map(g => g.role === 'admin' && g.permission === 'leads.read' ? { ...g, scope: 'assigned' } : g);
  expect(authorizeLeadOperation(c, 'home', 'delete').allowed).toBe(false);
  const revoked = context('admin'); revoked.policy.grants = revoked.policy.grants.filter(g => !(g.role === 'admin' && g.permission === 'leads.delete'));
  expect(authorizeLeadOperation(revoked, 'home', 'delete').allowed).toBe(false);
  expect(authorizeLeadOperation(context('owner'), 'settings.overview', 'delete').allowed).toBe(false);
});
