import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { moveLeadStageSchema, type MoveLeadStageInput, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';

export class LeadStageConflictError extends Error {
  constructor() { super('This lead changed or cannot be moved. Reload it before trying again.'); }
}
/** Workspace lock serializes policy changes and writes. Identity/actor always come from the session. */
export async function moveLeadStage(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: MoveLeadStageInput) {
  const input = moveLeadStageSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return moveLeadStageInTransaction(trx, context, input);
  });
}

/** Caller holds the authorized workspace write transaction; manual and confirmed-chat paths share this use case. */
export async function moveLeadStageInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: MoveLeadStageInput, actorType: 'user' | 'assistant-confirmed' = 'user') {
  const input = moveLeadStageSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const reason = input.to === 'lost' ? input.reason?.trim() || undefined : undefined;
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId, input.expectedVersion, input.to, reason ?? null])).digest('hex');
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: identity.workspaceId, id: input.leadId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
  const lead = await query.forUpdate().first('id', 'stage', 'version', 'ownerId', 'archivedAt');
  if (!lead || !authorize(context, { permission: 'leads.stage.update', resource: { kind: 'lead', id: lead.id, workspaceId: identity.workspaceId, ownerId: lead.ownerId } }).allowed) throw new AuthorizationAccessError();
  const previous = await trx('leadActivity').where({ id: input.submissionId, workspaceId: identity.workspaceId }).first('leadId', 'actorId', 'type', 'changes');
  if (previous) {
    if (previous.leadId !== input.leadId || previous.actorId !== identity.userId || previous.type !== 'stage' || previous.changes.requestHash !== requestHash) throw new LeadStageConflictError();
    return { version: lead.version };
  }
  if (lead.archivedAt || lead.version !== input.expectedVersion || lead.stage === input.to) throw new LeadStageConflictError();
  const now = new Date(), version = lead.version + 1;
  const updated = await trx('leads').where({ workspaceId: identity.workspaceId, id: lead.id, version: input.expectedVersion }).update({ stage: input.to, version, updatedAt: now, lastActivityAt: now });
  if (updated !== 1) throw new LeadStageConflictError();
  const actor = await trx('users').where({ id: identity.userId }).first('name');
  await trx('leadActivity').insert({ id: input.submissionId, workspaceId: identity.workspaceId, leadId: lead.id, actorId: identity.userId, actorName: actor.name, actorType, type: 'stage', changes: JSON.stringify({ from: lead.stage, to: input.to, ...(reason ? { reason } : {}), requestHash }), createdAt: now });
  return { version };
}
