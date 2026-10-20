import { describe, expect, it } from 'vitest';
import { permissionCatalog, permissionIds, workspaceRoles, type AuthorizationContext, type PermissionDefinition, type PermissionId, type WorkspacePolicy, type WorkspaceRole } from '@salesmora/contracts';
import { authorize, authorizePolicyChange, resolveAuthorizedCollectionScope } from './authorize';
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from './policy';

const defaultPolicy = () => createDefaultWorkspacePolicy('workspace-a', 4);
function context(role: WorkspaceRole = 'field'): AuthorizationContext {
  const userId = role === 'owner' ? 'owner-user' : `${role}-user`;
  return { userId, ownerUserId: 'owner-user', workspaceId: 'workspace-a', membership: { userId, workspaceId: 'workspace-a', role }, policy: defaultPolicy(), enabledPermissions: [...permissionIds] };
}
const lead = (ownerId: string | null = 'field-user', workspaceId = 'workspace-a') => ({ kind: 'lead' as const, id: 'lead-1', workspaceId, ownerId });
const job = (ownerId: string | null = 'other-user', teamUserIds = ['field-user'], workspaceId = 'workspace-a') => ({ kind: 'job' as const, id: 'job-1', workspaceId, ownerId, teamUserIds });
const workOrder = (parent: ReturnType<typeof job> | null = job(), assigneeIds?: string[]) => ({ kind: 'work_order' as const, id: 'wo-1', workspaceId: 'workspace-a', job: parent, ...(assigneeIds ? { assigneeIds } : {}) });
const estimate = (parent: ReturnType<typeof job> | null = job()) => ({ kind: 'estimate' as const, id: 'estimate-1', workspaceId: 'workspace-a', job: parent });
function remove(policy: WorkspacePolicy, role: WorkspaceRole, permission: PermissionId) {
  policy.grants = policy.grants.filter(grant => grant.role !== role || grant.permission !== permission);
}
function setGrant(policy: WorkspacePolicy, role: WorkspaceRole, permission: PermissionId, scope: WorkspacePolicy['grants'][number]['scope']) {
  remove(policy, role, permission); policy.grants.push({ role, permission, scope });
}

describe('all default role/action combinations', () => {
  for (const role of workspaceRoles) {
    for (const permission of permissionIds) {
      it(`${role}: ${permission}`, () => {
        const c = context(role);
        const spec: PermissionDefinition = permissionCatalog[permission];
        const resource = {
          lead: lead(c.userId), job: job(c.userId, []), estimate: estimate(job(c.userId, [])), work_order: workOrder(job(c.userId, [])),
          customer: { kind: 'customer', id: 'customer-1', workspaceId: 'workspace-a', related: [lead(c.userId)] },
          calendar: { kind: 'calendar', id: 'event', workspaceId: 'workspace-a', userId: c.userId, job: null },
          campaign: { kind: 'campaign', id: 'campaign-1', workspaceId: 'workspace-a' },
          intake: { kind: 'intake', id: 'intake-1', workspaceId: 'workspace-a' },
          workspace: undefined, report: undefined, activity: undefined,
        }[spec.resource];
        const actual = spec.mode === 'collection'
          ? resolveAuthorizedCollectionScope(c, permission)
          : authorize(c, {
            permission,
            resource: spec.mode === 'create' && spec.scopes.includes('enabled') ? undefined : resource,
            fields: permission === 'leads.update' ? ['notes'] : undefined,
            targetRole: permission === 'team.invite' || permission === 'team.role.assign' ? 'field' : undefined,
            targetMembership: permission === 'team.remove' || permission === 'team.role.assign'
              ? { userId: 'field-target', workspaceId: 'workspace-a', role: 'field' } : undefined,
          });
        expect(actual.allowed).toBe(!!spec.defaults[role] && spec.reviewed);
      });
    }
  }
});

describe('code-owned catalog and policy validation', () => {
  it('has 77 unique actions, legal defaults, known dependencies and a consistent default template', () => {
    expect(permissionIds).toHaveLength(77);
    expect(new Set(permissionIds).size).toBe(permissionIds.length);
    expect(validateWorkspacePolicy(defaultPolicy()).ok).toBe(true);
    for (const id of permissionIds) {
      const spec: PermissionDefinition = permissionCatalog[id];
      for (const dependency of spec.dependencies) expect(permissionIds).toContain(dependency);
      for (const role of workspaceRoles) {
        const scope = spec.defaults[role];
        if (scope) { expect(spec.scopes).toContain(scope); expect(spec.eligibleRoles).toContain(role); }
      }
    }
  });
  it('rejects unknown roles, action names, scopes, extra claims and duplicate grants', () => {
    for (const change of [{ role: 'member' }, { permission: 'sql.execute' }, { scope: 'all-tenants' }, { admin: true }]) {
      const policy = defaultPolicy(); Object.assign(policy.grants[0], change);
      expect(validateWorkspacePolicy(policy).ok).toBe(false);
    }
    const policy = defaultPolicy(); policy.grants.push(policy.grants[0]);
    expect(validateWorkspacePolicy(policy)).toEqual({ ok: false, reason: 'duplicate-grant' });
    expect(validateWorkspacePolicy({ ...defaultPolicy(), revision: -1 }).ok).toBe(false);
  });
  for (const role of ['office', 'field'] as const) {
    for (const id of permissionIds.filter(id => /\.(export|delete|archive)$/.test(id))) {
      it(`permanently rejects ${role} grant for ${id}`, () => {
        const policy = defaultPolicy(); setGrant(policy, role, id, permissionCatalog[id].scopes[0]);
        expect(validateWorkspacePolicy(policy)).toEqual({ ok: false, reason: 'role-ceiling' });
        const actor = context(role); actor.policy = policy;
        expect(resolveAuthorizedCollectionScope(actor, id).allowed).toBe(false);
      });
    }
  }
  for (const id of ['permissions.read', 'permissions.manage', 'billing.manage', 'ownership.transfer'] as const) {
    it(`protects ${id} against removal and delegation`, () => {
      const policy = defaultPolicy(); remove(policy, 'owner', id);
      expect(validateWorkspacePolicy(policy)).toEqual({ ok: false, reason: 'protected-owner-power' });
      const delegated = defaultPolicy(); setGrant(delegated, 'admin', id, 'enabled');
      expect(validateWorkspacePolicy(delegated).ok).toBe(false);
    });
  }
  it('rejects mismatched read scopes and missing assigned-job dependencies', () => {
    const policy = defaultPolicy(); setGrant(policy, 'field', 'jobs.complete', 'workspace');
    expect(validateWorkspacePolicy(policy).ok).toBe(false);
    const noJob = defaultPolicy(); remove(noJob, 'field', 'jobs.read');
    expect(validateWorkspacePolicy(noJob).ok).toBe(false);
    const noRead = defaultPolicy(); remove(noRead, 'office', 'campaigns.read');
    expect(validateWorkspacePolicy(noRead).ok).toBe(false);
  });
});

describe('fail-closed identity, feature and policy boundaries', () => {
  it('rejects another workspace, membership identity and inconsistent ownership', () => {
    for (const mutate of [
      (c: AuthorizationContext) => { c.membership.workspaceId = 'workspace-b'; },
      (c: AuthorizationContext) => { c.policy.workspaceId = 'workspace-b'; },
      (c: AuthorizationContext) => { c.membership.userId = 'someone-else'; },
      (c: AuthorizationContext) => { c.membership.role = 'owner'; },
      (c: AuthorizationContext) => { c.ownerUserId = c.userId; },
    ]) { const c = context(); mutate(c); expect(authorize(c, { permission: 'leads.read', resource: lead() }).allowed).toBe(false); }
    expect(authorize(null, { permission: 'leads.read' }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'unknown' }).allowed).toBe(false);
    expect(authorize({ ...context(), browserTools: ['campaigns.create'] }, { permission: 'leads.read', resource: lead() }).allowed).toBe(false);
  });
  it('requires explicitly enabled actions and dependencies, including for Owner', () => {
    const c = context('owner'); c.enabledPermissions = [];
    expect(authorize(c, { permission: 'leads.create' }).allowed).toBe(false);
    c.enabledPermissions = ['leads.update'];
    expect(authorize(c, { permission: 'leads.update', resource: lead('owner-user'), fields: ['name'] }).allowed).toBe(false);
  });
  it('does not let create-only policies imply assignment authority', () => {
    const c = context('office'); remove(c.policy, 'office', 'leads.assign');
    expect(authorize(c, { permission: 'leads.create' })).toEqual({ allowed: false, reason: 'create-assignment-rule-unreviewed' });
    const unavailable = context('office'); unavailable.enabledPermissions = unavailable.enabledPermissions.filter(id => id !== 'leads.assign');
    expect(authorize(unavailable, { permission: 'leads.create' }).allowed).toBe(false);
  });
  it('protects catalog restrictions from accidental runtime mutation', () => {
    expect(Object.isFrozen(permissionCatalog)).toBe(true);
    expect(Object.isFrozen(permissionCatalog['campaigns.archive'].eligibleRoles)).toBe(true);
    expect(Object.isFrozen(permissionCatalog['permissions.manage'].defaults)).toBe(true);
  });
  it('keeps unreviewed proposals non-executable', () => {
    expect(authorize(context('owner'), { permission: 'workspace.delete' }).allowed).toBe(true);
    expect(authorize(context('admin'), { permission: 'workspace.delete' }).allowed).toBe(false);
    expect(authorize(context('office'), { permission: 'jobs.update', resource: job() }).allowed).toBe(false);
  });
  it('denies unknown data and a missing policy rather than falling back to defaults', () => {
    expect(authorize({ ...context(), policy: undefined }, { permission: 'leads.read', resource: lead() }).allowed).toBe(false);
    const c = context(); remove(c.policy, 'field', 'leads.update');
    expect(authorize(c, { permission: 'leads.update', resource: lead(), fields: ['notes'] }).allowed).toBe(false);
  });
});

describe('record scopes and action separation', () => {
  it('Field works with assigned leads, but cannot create or reassign them', () => {
    const c = context();
    for (const ownerId of ['field-user', 'other-user', null]) {
      expect(authorize(c, { permission: 'leads.read', resource: lead(ownerId) }).allowed).toBe(ownerId === 'field-user');
      expect(authorize(c, { permission: 'leads.update', resource: lead(ownerId), fields: ['notes'] }).allowed).toBe(ownerId === 'field-user');
    }
    expect(authorize(c, { permission: 'leads.create' }).allowed).toBe(false);
    expect(authorize(c, { permission: 'leads.assign', resource: lead() }).allowed).toBe(false);
    expect(authorize(c, { permission: 'leads.read', resource: lead('field-user', 'workspace-b') }).allowed).toBe(false);
  });
  it('ordinary updates cannot smuggle stage, assignment, tenant, audit or deletion changes', () => {
    for (const field of ['ownerId', 'stage', 'workspaceId', 'createdBy', 'deletedAt', 'archivedAt', '__proto__']) {
      expect(authorize(context('owner'), { permission: 'leads.update', resource: lead(), fields: [field] }).allowed).toBe(false);
    }
    expect(authorize(context(), { permission: 'leads.update', resource: lead() }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'leads.stage.update', resource: lead() }).allowed).toBe(true);
  });
  it('job owner or current teammate has access; unrelated and revoked assignments deny', () => {
    for (const resource of [job('field-user', []), job('other-user', ['field-user'])]) {
      for (const permission of ['jobs.read', 'jobs.status.update', 'jobs.progress.create', 'jobs.complete'] as const) {
        expect(authorize(context(), { permission, resource }).allowed).toBe(true);
      }
    }
    for (const resource of [job(null, []), job('other-user', []), job('field-user', [], 'workspace-b')]) {
      expect(authorize(context(), { permission: 'jobs.read', resource }).allowed).toBe(false);
    }
    for (const permission of ['jobs.create', 'jobs.schedule.update', 'jobs.assign', 'jobs.cancel', 'jobs.reopen'] as const) {
      expect(authorize(context(), { permission, resource: job() }).allowed).toBe(false);
    }
    expect(authorize(context('office'), { permission: 'jobs.reopen', resource: job() }).allowed).toBe(false);
    expect(authorize(context('admin'), { permission: 'jobs.reopen', resource: job() }).allowed).toBe(true);
  });
  it('work-order access follows role defaults, assigned jobs and the price/cost ceilings', () => {
    const ids = permissionIds.filter(id => id.startsWith('workorders.'));
    expect(ids).toHaveLength(13);
    expect(authorize(context('office'), { permission: 'workorders.read', resource: workOrder(job('other-user', [])) }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder() }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(job('other-user', [])) }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(null) }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(job('field-user', [], 'workspace-b')) }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(job('other-user', []), ['field-user']) }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'workorders.progress', resource: workOrder(job('other-user', []), ['field-user']) }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'workorders.update', resource: workOrder(job('other-user', []), ['field-user']) }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(job('other-user', []), ['someone-else']) }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'workorders.read', resource: workOrder(job('field-user', [], 'workspace-b'), ['field-user']) }).allowed).toBe(false);
    for (const permission of ['workorders.update', 'workorders.issue', 'workorders.cancel', 'workorders.view_prices', 'workorders.view_costs'] as const)
      expect(authorize(context(), { permission, resource: workOrder() }).allowed).toBe(false);
    for (const permission of ['workorders.progress', 'workorders.complete'] as const)
      expect(authorize(context(), { permission, resource: workOrder() }).allowed).toBe(true);
    expect(authorize(context('office'), { permission: 'workorders.view_prices', resource: workOrder() }).allowed).toBe(true);
    expect(authorize(context('office'), { permission: 'workorders.view_costs', resource: workOrder() }).allowed).toBe(false);
    expect(authorize(context('admin'), { permission: 'workorders.view_costs', resource: workOrder() }).allowed).toBe(true);
    expect(authorize(context('office'), { permission: 'workorders.delete', resource: workOrder() }).allowed).toBe(false);
    expect(validateWorkspacePolicy(defaultPolicy()).ok).toBe(true);
  });
  it('estimates require a current authorized assigned job, not arbitrary parent references', () => {
    for (const permission of ['estimates.read', 'estimates.create', 'estimates.update', 'estimates.send'] as const) {
      expect(authorize(context(), { permission, resource: estimate() }).allowed).toBe(true);
      for (const parent of [null, job(null, []), job('field-user', [], 'workspace-b')]) expect(authorize(context(), { permission, resource: estimate(parent) }).allowed).toBe(false);
    }
    const c = context(); c.enabledPermissions = c.enabledPermissions.filter(id => id !== 'jobs.read');
    expect(authorize(c, { permission: 'estimates.send', resource: estimate() }).allowed).toBe(false);
    expect(authorize(context('owner'), { permission: 'estimates.read', resource: estimate(job('owner-user', [], 'workspace-b')) }).allowed).toBe(false);
  });
  it('related customer access never implies full customer browsing, editing, or unrelated history', () => {
    const resource = { kind: 'customer', id: 'customer-1', workspaceId: 'workspace-a', related: [job()] };
    expect(authorize(context(), { permission: 'customers.related.read', resource }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'customers.read', resource }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'customers.update', resource }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'customers.related.read', resource: { ...resource, related: [job(null, [])] } }).allowed).toBe(false);
    expect(authorize(context('owner'), { permission: 'customers.related.read', resource: { ...resource, related: [job(null, [], 'workspace-b')] } }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'leads.read', resource: lead('other-user') }).allowed).toBe(false);
  });
  it('calendar access follows own schedule or authorized assigned work', () => {
    const resource = { kind: 'calendar', id: 'event', workspaceId: 'workspace-a', userId: 'other-user', job: job() };
    expect(authorize(context(), { permission: 'calendar.read', resource }).allowed).toBe(true);
    expect(authorize(context(), { permission: 'calendar.read', resource: { ...resource, job: null } }).allowed).toBe(false);
    expect(authorize(context(), { permission: 'calendar.read', resource: { ...resource, userId: 'field-user', job: null } }).allowed).toBe(true);
  });
  it('returns query scopes, never permission to read all rows, for counts/reports/exports', () => {
    for (const permission of ['leads.read', 'jobs.read', 'reports.read'] as const) {
      expect(resolveAuthorizedCollectionScope(context(), permission)).toMatchObject({ allowed: true, scope: 'assigned', userId: 'field-user', workspaceId: 'workspace-a', policyRevision: 4 });
      expect(authorize(context(), { permission }).allowed).toBe(false);
      expect(resolveAuthorizedCollectionScope(context('office'), permission)).toMatchObject({ allowed: true, scope: 'workspace' });
    }
    expect(resolveAuthorizedCollectionScope(context(), 'leads.export').allowed).toBe(false);
    expect(resolveAuthorizedCollectionScope(context('admin'), 'leads.export').allowed).toBe(true);
    expect(resolveAuthorizedCollectionScope(context('admin'), 'team.remove').allowed).toBe(false);
  });
  it('report access cannot recover revoked source reads or widen a source scope', () => {
    const c = context(); c.enabledPermissions = c.enabledPermissions.filter(id => id !== 'leads.read');
    expect(resolveAuthorizedCollectionScope(c, 'reports.read')).toMatchObject({ allowed: true, sourceScopes: { job: 'assigned' } });
    const result = resolveAuthorizedCollectionScope(c, 'reports.read');
    if (result.allowed) expect(result.sourceScopes).not.toHaveProperty('lead');
    c.enabledPermissions = c.enabledPermissions.filter(id => id !== 'jobs.read');
    expect(resolveAuthorizedCollectionScope(c, 'reports.read').allowed).toBe(false);
    const admin = context('admin'); admin.policy.grants = admin.policy.grants.filter(grant => grant.role !== 'admin' || !grant.permission.startsWith('leads.'));
    setGrant(admin.policy, 'admin', 'leads.read', 'assigned');
    remove(admin.policy, 'admin', 'activity.export');
    expect(resolveAuthorizedCollectionScope(admin, 'reports.read')).toMatchObject({ allowed: true, scope: 'workspace', sourceScopes: { lead: 'assigned', job: 'workspace' } });
  });
  it('Office campaign access never implies archive or integration administration', () => {
    const resource = { kind: 'campaign', workspaceId: 'workspace-a', id: 'campaign-1' };
    for (const permission of ['campaigns.read', 'campaigns.update', 'campaigns.activate', 'campaigns.pause'] as const) {
      expect(authorize(context('office'), { permission, resource }).allowed).toBe(true);
      expect(authorize(context(), { permission, resource }).allowed).toBe(false);
    }
    for (const permission of ['campaigns.archive', 'integrations.read', 'integrations.manage'] as const) expect(authorize(context('office'), { permission, resource: permission === 'campaigns.archive' ? resource : undefined }).allowed).toBe(false);
  });
});

describe('membership administration and Owner-only policy saves', () => {
  it('enforces invite and assignment target ceilings even under customized grants', () => {
    for (const targetRole of workspaceRoles) {
      expect(authorize(context('admin'), { permission: 'team.invite', targetRole }).allowed).toBe(targetRole === 'office' || targetRole === 'field');
      expect(authorize(context('owner'), { permission: 'team.invite', targetRole }).allowed).toBe(targetRole !== 'owner');
    }
    const c = context('office'); setGrant(c.policy, 'office', 'team.invite', 'enabled');
    expect(authorize(c, { permission: 'team.invite', targetRole: 'field' }).allowed).toBe(false);
    expect(authorize(context('admin'), { permission: 'team.invite' }).allowed).toBe(false);
  });
  it('Admin changes/removes Office/Field, but never self/Owner/Admin/another tenant', () => {
    for (const role of workspaceRoles) {
      const targetMembership = { role, userId: `${role}-target`, workspaceId: 'workspace-a' };
      expect(authorize(context('admin'), { permission: 'team.remove', targetMembership }).allowed).toBe(role === 'office' || role === 'field');
      expect(authorize(context('owner'), { permission: 'team.remove', targetMembership }).allowed).toBe(role !== 'owner');
    }
    const targetMembership = { role: 'field', userId: 'field-target', workspaceId: 'workspace-a' };
    expect(authorize(context('admin'), { permission: 'team.role.assign', targetMembership, targetRole: 'office' }).allowed).toBe(true);
    expect(authorize(context('admin'), { permission: 'team.role.assign', targetMembership, targetRole: 'admin' }).allowed).toBe(false);
    expect(authorize(context('owner'), { permission: 'team.role.assign', targetMembership, targetRole: 'admin' }).allowed).toBe(true);
    expect(authorize(context('admin'), { permission: 'team.remove', targetMembership: { ...targetMembership, userId: 'admin-user' } }).allowed).toBe(false);
    expect(authorize(context('admin'), { permission: 'team.remove', targetMembership: { ...targetMembership, workspaceId: 'workspace-b' } }).allowed).toBe(false);
    expect(authorize(context('owner'), { permission: 'team.remove' }).allowed).toBe(false);
  });
  it('only current Owner can save the next policy revision with invariants intact', () => {
    const policy = defaultPolicy(); policy.revision = 5;
    remove(policy, 'office', 'campaigns.pause');
    const change = { expectedRevision: 4, policy };
    expect(authorizePolicyChange(context('owner'), change).allowed).toBe(true);
    for (const role of ['admin', 'office', 'field'] as const) expect(authorizePolicyChange(context(role), change).allowed).toBe(false);
    expect(authorizePolicyChange(context('owner'), { ...change, expectedRevision: 3 }).allowed).toBe(false);
    expect(authorizePolicyChange(context('owner'), { ...change, policy: { ...policy, workspaceId: 'workspace-b' } }).allowed).toBe(false);
    const escalated = structuredClone(policy); setGrant(escalated, 'office', 'campaigns.archive', 'workspace');
    expect(authorizePolicyChange(context('owner'), { ...change, policy: escalated }).allowed).toBe(false);
    const revoked = context('owner'); revoked.ownerUserId = 'new-owner';
    expect(authorizePolicyChange(revoked, change).allowed).toBe(false);
  });
});

it('customer browsing and linking have a permanent Field ceiling', () => {
 const field=context('field');
 setGrant(field.policy,'field','customers.read','workspace');
 expect(validateWorkspacePolicy(field.policy).ok).toBe(false);
 const ordinary=context('field');
 expect(authorize(ordinary,{permission:'leads.update',fields:['customerId'],resource:lead(ordinary.userId)}).allowed).toBe(false);
 const office=context('office');
 expect(authorize(office,{permission:'leads.update',fields:['customerId'],resource:lead(office.userId)}).allowed).toBe(true);
 remove(office.policy,'office','customers.update');
 expect(authorize(office,{permission:'leads.update',fields:['customerId'],resource:lead(office.userId)}).allowed).toBe(false);
});

it('Field related-customer grants never widen beyond assigned work',()=>{
 const field=context('field');setGrant(field.policy,'field','customers.related.read','workspace');
 expect(authorize(field,{permission:'customers.related.read',resource:{kind:'customer',id:'customer-1',workspaceId:field.workspaceId,related:[lead('other-user')]}}).allowed).toBe(false);
 expect(authorize(field,{permission:'customers.related.read',resource:{kind:'customer',id:'customer-1',workspaceId:field.workspaceId,related:[lead(field.userId)]}}).allowed).toBe(true);
});
