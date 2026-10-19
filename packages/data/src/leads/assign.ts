import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { assignLeadSchema, type AssignLeadInput, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
export class LeadAssignmentConflictError extends Error {}
export async function assignLead(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: AssignLeadInput) {
  const input = assignLeadSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return assignLeadInTransaction(trx, context, input);
  });
}
/** Caller holds the authorized workspace write transaction; chat and manual writes share notification semantics. */
export async function assignLeadInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: AssignLeadInput, actorType: 'user' | 'assistant-confirmed' = 'user') {
  const input = assignLeadSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId, input.expectedVersion, input.ownerId])).digest('hex');
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: identity.workspaceId, id: input.leadId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
  const lead = await query.forUpdate().first('id', 'version', 'ownerId', 'ownerName', 'archivedAt');
  if (!lead || !authorize(context, { permission: 'leads.assign', resource: { kind: 'lead', id: lead.id, workspaceId: identity.workspaceId, ownerId: lead.ownerId } }).allowed) throw new AuthorizationAccessError();
  const previous = await trx('leadActivity').where({ id: input.submissionId, workspaceId: identity.workspaceId }).first('leadId', 'actorId', 'type', 'changes');
  if (previous) {
    if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== 'assigned' || previous.changes.requestHash !== requestHash) throw new LeadAssignmentConflictError();
    return { version: lead.version };
  }
  if (lead.archivedAt || lead.version !== input.expectedVersion) throw new LeadAssignmentConflictError();
  const member = input.ownerId === null ? null : await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': identity.workspaceId, 'm.userId': input.ownerId }).whereNull('u.deletionRequestedAt').first('u.name');
  if (input.ownerId !== null && !member) throw new LeadAssignmentConflictError();
  if (lead.ownerId === input.ownerId) return { version: lead.version };
  const now = new Date(), version = lead.version + 1;
  const actor = await trx('users').where({ id: identity.userId }).first('name');
  await trx('leads').where({ id: lead.id, workspaceId: identity.workspaceId, version: input.expectedVersion }).update({ ownerId: input.ownerId, ownerName: member?.name ?? null, version, updatedAt: now, lastActivityAt: now });
  const former = lead.ownerId ? await trx('users').where({ id: lead.ownerId }).first('name') : null;
  await trx('leadActivity').insert({ id: input.submissionId, workspaceId: identity.workspaceId, leadId: lead.id, actorId: identity.userId, actorName: actor.name, actorType, type: 'assigned', changes: JSON.stringify({ from: former?.name ?? lead.ownerName ?? null, to: member?.name ?? null, ownerId: input.ownerId, toVersion: version, requestHash }), createdAt: now });
  if (input.ownerId && input.ownerId !== identity.userId) {
    await trx('assignmentNotifications').insert({ id: input.submissionId, workspaceId: identity.workspaceId, leadId: lead.id, userId: input.ownerId, createdAt: now });
    await trx('assignmentEmailOutbox').insert({ id: input.submissionId });
  }
  return { version };
}
