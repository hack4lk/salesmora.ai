import type { Knex } from 'knex';
import { authorizationContextSchema, type AuthorizationContext, type PermissionId, type PolicyChange } from '@salesmora/contracts';
import defaults from './defaults-v1.json' with { type: 'json' };
import { authorizePolicyChange, resolveAuthorizedCollectionScope, validateWorkspacePolicy } from '@salesmora/domain';

export class AuthorizationAccessError extends Error {
  constructor() { super('Access denied.'); }
}
export class AuthorizationConflictError extends Error {
  constructor() { super('Permissions changed. Reload before saving.'); }
}
/** Identity must come from the authenticated session; enabled permissions from server configuration. */
export interface WorkspaceIdentity { userId: string; workspaceId: string }

async function loadContext(trx: Knex.Transaction, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[]): Promise<AuthorizationContext> {
  const workspace = await trx('workspaces').where({ id: identity.workspaceId }).whereNull('deletionRequestedAt').first('ownerId');
  const user = await trx('users').where({ id: identity.userId }).whereNull('deletionRequestedAt').first('id');
  const membership = await trx('workspaceMemberships').where(identity).first('userId', 'workspaceId', 'role');
  const head = await trx('workspacePolicies').where({ workspaceId: identity.workspaceId }).first('revision');
  if (!user || !workspace || !membership || !head) throw new AuthorizationAccessError();
  const grants = await trx('workspaceRolePolicies').where({ workspaceId: identity.workspaceId }).select('role', 'permission', 'scope');
  const parsed = authorizationContextSchema.safeParse({ ...identity, ownerUserId: workspace.ownerId, membership,
    policy: { workspaceId: identity.workspaceId, revision: head.revision, grants }, enabledPermissions });
  if (!parsed.success || !validateWorkspacePolicy(parsed.data.policy).ok ||
      ((membership.role === 'owner') !== (workspace.ownerId === identity.userId))) throw new AuthorizationAccessError();
  return parsed.data;
}

async function lockedWorkspace(trx: Knex.Transaction, workspaceId: string, write: boolean) {
  const query = trx('workspaces').where({ id: workspaceId }).whereNull('deletionRequestedAt');
  const row = await (write ? query.forUpdate() : query.forShare()).first('id');
  if (!row) throw new AuthorizationAccessError();
}

/** Server adapter boundary. The callback must finish protected work before the transaction resolves. */
export async function withWorkspaceAuthorization<T>(db: Knex, identity: WorkspaceIdentity, enabledPermissions: readonly PermissionId[], write: boolean,
  use: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<T>): Promise<T> {
  return db.transaction(async trx => {
    await lockedWorkspace(trx, identity.workspaceId, write);
    return use(trx, await loadContext(trx, identity, enabledPermissions));
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
  const result = validateWorkspacePolicy({ workspaceId: identity.workspaceId, revision: 0, grants: [...defaults, {role: 'owner', permission: 'billing.read', scope: 'enabled'}, {role: 'admin', permission: 'billing.read', scope: 'enabled'}] });
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
