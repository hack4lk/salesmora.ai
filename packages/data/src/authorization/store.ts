import type { Knex } from 'knex';
import { AsyncLocalStorage } from 'node:async_hooks';
import { authorizationContextSchema, type AuthorizationContext, type PermissionId, type PolicyChange } from '@salesmora/contracts';
import defaults from './defaults-v1.json' with { type: 'json' };
import { authorizePolicyChange, resolveAuthorizedCollectionScope, validateWorkspacePolicy } from '@salesmora/domain';

export class AuthorizationAccessError extends Error {
  constructor() { super('Access denied.'); }
}
/** A staff-suspended workspace. Extends the access error so every existing caller fails closed;
 * callers that can do better (page redirect, API 423, worker hold) check for it first. */
export class WorkspaceSuspendedError extends AuthorizationAccessError {
  constructor() { super(); this.message = 'This workspace is unavailable. Contact support.'; }
}
export class AuthorizationConflictError extends Error {
  constructor() { super('Permissions changed. Reload before saving.'); }
}
/** Identity must come from the authenticated session; enabled permissions from server configuration. */
export interface WorkspaceIdentity { userId: string; workspaceId: string }

const transactionAuthorities = new WeakMap<Knex, AuthorizationContext>();
const mutationAuthorities = new WeakSet<Knex>();
const requestAuthorities = new AsyncLocalStorage<{ db: Knex; context: AuthorizationContext }>();

/** Server-authenticated, request-local authority. Never wrap confirmation endpoints in this scope. */
export function withWorkspaceAuthoritySnapshot<T>(db: Knex, context: AuthorizationContext, run: () => T): T {
  return requestAuthorities.run({ db, context }, run);
}
export function workspaceAuthoritySnapshot(db: Knex, identity: WorkspaceIdentity) {
  const held = transactionAuthorities.get(db) ?? (requestAuthorities.getStore()?.db === db
    ? requestAuthorities.getStore()?.context : undefined);
  if (held && (held.userId !== identity.userId || held.workspaceId !== identity.workspaceId))
    throw new AuthorizationAccessError();
  return held;
}
function isTransaction(db: Knex): db is Knex.Transaction {
  return db.isTransaction === true;
}

async function scopedAuthority<T>(
  trx: Knex.Transaction, context: AuthorizationContext, run: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>,
  mutationLocked = false,
) {
  transactionAuthorities.set(trx, context);
  if (mutationLocked) mutationAuthorities.add(trx);
  try { return await run(trx, context); }
  finally { transactionAuthorities.delete(trx); mutationAuthorities.delete(trx); }
}

async function loadContext(trx: Knex.Transaction, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[]): Promise<AuthorizationContext> {
  const rows = await trx('workspaces as w')
    .join('workspaceMemberships as m', 'm.workspaceId', 'w.id')
    .join('users as u', 'u.id', 'm.userId')
    .join('workspacePolicies as p', 'p.workspaceId', 'w.id')
    .leftJoin('workspaceRolePolicies as g', 'g.workspaceId', 'w.id')
    .where({ 'w.id': identity.workspaceId, 'm.userId': identity.userId })
    .whereNull('w.deletionRequestedAt').whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt')
    .select<{
      ownerId: string; userId: string; workspaceId: string; membershipRole: string; revision: number;
      grantRole: string | null; permission: string | null; scope: string | null;
    }[]>('w.ownerId', 'm.userId', 'm.workspaceId', 'm.role as membershipRole', 'p.revision',
      'g.role as grantRole', 'g.permission', 'g.scope');
  const head = rows[0];
  if (!head) throw new AuthorizationAccessError();
  const grants = rows.filter(row => row.permission !== null)
    .map(row => ({ role: row.grantRole, permission: row.permission, scope: row.scope }));
  const membership = { userId: head.userId, workspaceId: head.workspaceId, role: head.membershipRole };
  const parsed = authorizationContextSchema.safeParse({ ...identity, ownerUserId: head.ownerId, membership,
    policy: { workspaceId: identity.workspaceId, revision: head.revision, grants }, enabledPermissions });
  if (!parsed.success || !validateWorkspacePolicy(parsed.data.policy).ok ||
      ((membership.role === 'owner') !== (head.ownerId === identity.userId))) throw new AuthorizationAccessError();
  return parsed.data;
}

async function lockedWorkspace(trx: Knex.Transaction, workspaceId: string, write: boolean) {
  const query = trx('workspaces').where({ id: workspaceId }).whereNull('deletionRequestedAt');
  const row = await (write ? query.forUpdate() : query.forShare()).first('id', 'suspendedAt');
  if (!row) throw new AuthorizationAccessError();
  if (row.suspendedAt) throw new WorkspaceSuspendedError();
}

/** Server adapter boundary. The callback must finish protected work before the transaction resolves. */
export async function withWorkspaceAuthorization<T>(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[], write: boolean,
  run: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>,
  options?: { reuseNestedAuthority: true }): Promise<T> {
  const held = transactionAuthorities.get(db);
  if (held) {
    if (held.userId !== identity.userId || held.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
    const context = { ...held, enabledPermissions: held.enabledPermissions.filter(permission => enabledPermissions.includes(permission)) };
    // Keep write savepoints: a caller may catch a domain/SQL failure and return clarification.
    if (write || context.enabledPermissions.length !== held.enabledPermissions.length)
      return db.transaction(trx => scopedAuthority(trx, context, run, mutationAuthorities.has(db)));
    if (!isTransaction(db)) throw new Error('Authorization scope requires a live transaction.');
    return run(db, context);
  }
  const admitted = workspaceAuthoritySnapshot(db, identity);
  if (admitted) {
    const context = { ...admitted, enabledPermissions: admitted.enabledPermissions.filter(permission => enabledPermissions.includes(permission)) };
    return db.transaction(trx => scopedAuthority(trx, context, run));
  }
  return db.transaction(async trx => {
    await lockedWorkspace(trx, identity.workspaceId, write);
    const context = await loadContext(trx, identity, enabledPermissions);
    if (options?.reuseNestedAuthority) {
      if (!write) throw new Error('Nested authorization reuse requires an exclusive workspace lock.');
      return scopedAuthority(trx, context, run, true);
    }
    return run(trx, context);
  });
}
/** A write that must reauthorize under an exclusive lock. A page/read request snapshot
 * is not mutation authority; only a proven live mutation scope may be reused. */
export async function withCurrentWorkspaceMutation<T>(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  run: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>): Promise<T> {
  const held = transactionAuthorities.get(db);
  if (held && (held.userId !== identity.userId || held.workspaceId !== identity.workspaceId)) throw new AuthorizationAccessError();
  if (held && mutationAuthorities.has(db)) return withWorkspaceAuthorization(db, identity, enabled, true, run);
  return db.transaction(async trx => {
    await lockedWorkspace(trx, identity.workspaceId, true);
    const context = await loadContext(trx, identity, enabled);
    return scopedAuthority(trx, context, run, true);
  });
}
/** Recipient delivery inside an already-protected workspace transaction needs its own current
 * user policy, rather than reusing the actor's request-local authority. The parent holds the workspace lock. */
export async function withWorkspaceRecipientAuthorization<T>(trx: Knex.Transaction, actor: AuthorizationContext, userId: string,
  run: (nested: Knex.Transaction, recipient: AuthorizationContext) => Promise<T>): Promise<T> {
  if (!isTransaction(trx)) throw new AuthorizationAccessError();
  return trx.transaction(async nested => {
    const recipient = await loadContext(nested, { workspaceId: actor.workspaceId, userId }, actor.enabledPermissions);
    return scopedAuthority(nested, recipient, run);
  });
}
export async function loadWorkspaceAuthorization(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabledPermissions, false, async (_trx, context) => context);
}
/** New-workspace use case only, inside its creation transaction after inserting the Owner membership.
 * This is an explicit initializer, never a fallback from a denied read or failed policy load.
 */
export async function initializeWorkspacePolicy(trx: Knex.Transaction, identity: WorkspaceIdentity) {
  await lockedWorkspace(trx, identity.workspaceId, true);
  const workspace = await trx('workspaces').where({ id: identity.workspaceId, ownerId: identity.userId }).first('id');
  const owner = await trx('workspaceMemberships').where({ ...identity, role: 'owner' }).first('userId');
  if (!workspace || !owner || await trx('workspacePolicies').where({ workspaceId: identity.workspaceId }).first()) throw new AuthorizationAccessError();
  const result = validateWorkspacePolicy({ workspaceId: identity.workspaceId, revision: 0, grants: [...defaults,
    ...(["owner","admin"] as const).map(role=>({role,permission:"customers.email.send" as const,scope:"enabled" as const})),
    ...(["owner", "admin", "office"] as const).map(role => ({ role, permission: "workflows.read" as const, scope: "enabled" as const })),
    ...(["owner", "admin"] as const).map(role => ({ role, permission: "workflows.publish" as const, scope: "enabled" as const })),
    ...(["owner", "admin"] as const).map(role => ({ role, permission: "workflows.manage" as const, scope: "enabled" as const })),
    {role: "office", permission: "leadCapture.archive", scope: "workspace"},
    {role: "field", permission: "jobs.schedule.update", scope: "assigned"},
    ...(["owner", "admin", "office"] as const).map(role => ({role, permission: "workorders.schedule.update" as const, scope: "workspace" as const})),
    {role: "field", permission: "workorders.schedule.update", scope: "assigned_job"}, {role: 'owner', permission: 'billing.read', scope: 'enabled'}, {role: 'admin', permission: 'billing.read', scope: 'enabled'}] });
  if (!result.ok) throw new AuthorizationAccessError();
  await trx('workspacePolicies').insert({ workspaceId: identity.workspaceId, revision: 0, templateVersion: 1 });
  await trx('workspaceRolePolicies').insert(result.policy.grants.map(grant => ({ workspaceId: identity.workspaceId, ...grant })));
  await trx('authorizationAudit').insert({ workspaceId: identity.workspaceId, actorId: identity.userId, action: 'workspace.seeded',
    beforeRevision: null, afterRevision: 0, afterPolicy: JSON.stringify(result.policy) });
  return result.policy;
}

/** Current authority, comparison, grants and audit commit together under the workspace lock. */
export async function saveWorkspacePolicy(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[], change: PolicyChange) {
  return db.transaction(async trx => {
    await lockedWorkspace(trx, identity.workspaceId, true);
    const context = await loadContext(trx, identity, enabledPermissions);
    const decision = authorizePolicyChange(context, change);
    if (!decision.allowed) {
      if (decision.reason === 'stale-policy-revision') throw new AuthorizationConflictError();
      throw new AuthorizationAccessError();
    }
    await trx('workspaceRolePolicies').where({ workspaceId: identity.workspaceId }).delete();
    await trx('workspaceRolePolicies').insert(decision.policy.grants.map(grant => ({ workspaceId: identity.workspaceId, ...grant })));
    await trx('workspacePolicies').where({ workspaceId: identity.workspaceId }).update({ revision: decision.policy.revision, updatedAt: trx.fn.now() });
    await trx('authorizationAudit').insert({ workspaceId: identity.workspaceId, actorId: identity.userId,
      action: 'policy.saved', beforeRevision: context.policy.revision, afterRevision: decision.policy.revision,
      beforePolicy: JSON.stringify(context.policy), afterPolicy: JSON.stringify(decision.policy) });
    return decision.policy;
  });
}

async function withLeadQuery<T>(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[], read: (query: Knex.QueryBuilder) => Promise<T>): Promise<T> {
  return db.transaction(async trx => {
    // Membership/policy mutations take the same workspace's exclusive lock. No stale decision is reused.
    await lockedWorkspace(trx, identity.workspaceId, false);
    const context = await loadContext(trx, identity, enabledPermissions);
    const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
    if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
    const query = trx('leads').where({ workspaceId: scope.workspaceId });
    if (scope.scope === 'assigned') query.andWhere({ ownerId: scope.userId });
    return read(query);
  });
}
export interface LeadSummary { id: string; name: string; service: string; stage: string; ownerId: string | null; createdAt: Date }
export async function listAuthorizedLeads(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[], limit = 50): Promise<LeadSummary[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Limit must be between 1 and 100.');
  return withLeadQuery(db, identity, enabledPermissions, async query => query.whereNull('archivedAt').select('id', 'name', 'service', 'stage', 'ownerId', 'createdAt').orderBy('createdAt', 'desc').orderBy('id', 'desc').limit(limit));
}
export async function authorizedLeadPipelineCounts(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[]): Promise<Record<string, number>> {
  return withLeadQuery(db, identity, enabledPermissions, async query => {
    const rows = await query.whereNull('archivedAt').select('stage').count<{ stage: string; count: string }[]>({ count: '*' }).groupBy('stage');
    return Object.fromEntries(rows.map(row => [row.stage, Number(row.count)]));
  });
}
