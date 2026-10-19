import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { deleteLeadSchema, type DeleteLeadInput, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';

export class LeadDeleteConflictError extends Error {}
export class LeadDeleteConfirmationError extends Error {}
export class LeadDeleteWonError extends Error {}

/** Permanent single-record deletion. Authority, audit and content removal commit together. */
export async function deleteLead(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: DeleteLeadInput) {
  const input = deleteLeadSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => deleteLeadInTransaction(trx, context, input));
}
/** Caller holds current workspace authorization; manual and confirmed chat deletion share one use case. */
export async function deleteLeadInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: DeleteLeadInput) {
  const input = deleteLeadSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId, input.expectedVersion, input.typedConfirmation])).digest('hex');
    const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
    const resource = { kind: 'lead' as const, id: input.leadId, workspaceId: identity.workspaceId, ownerId: null };
    // Delete's catalog ceiling is Owner/Admin, workspace scope. Recheck even for retries
    // after the lead has gone, without using the audit as a substitute for authority.
    if (!scope.allowed || scope.resourceKind !== 'lead' || scope.scope !== 'workspace' || !authorize(context, { permission: 'leads.delete', resource }).allowed) throw new AuthorizationAccessError();
    const previous = await trx('leadDeletionAudit').where({ id: input.submissionId, workspaceId: identity.workspaceId }).first();
    if (previous) {
      if (previous.leadId !== input.leadId || previous.actorId !== identity.userId || previous.requestHash !== requestHash) throw new LeadDeleteConflictError();
      return { deleted: true as const };
    }
    const lead = await trx('leads').where({ id: input.leadId, workspaceId: identity.workspaceId }).forUpdate().first('id', 'leadNumber', 'version', 'stage');
    if (!lead) throw new AuthorizationAccessError();
    if (lead.version !== input.expectedVersion) throw new LeadDeleteConflictError();
    if (lead.stage === 'won') throw new LeadDeleteWonError();
    if (input.typedConfirmation !== `LD-${String(lead.leadNumber).padStart(4, '0')}`) throw new LeadDeleteConfirmationError();
    await trx('leadDeletionAudit').insert({ id: input.submissionId, workspaceId: identity.workspaceId, leadId: lead.id, leadNumber: lead.leadNumber, actorId: identity.userId, requestHash });
    // Confirmed creation proposals contain a copy of the lead. Remove those payloads;
    // immutable, non-content chat audit evidence and private conversations retain their policy.
    await trx('chatActionDrafts').where({ workspaceId: identity.workspaceId }).andWhere(function () {
      this.where({ leadId: lead.id }).orWhereIn('turnId', trx('chatTurns').where({ workspaceId: identity.workspaceId })
        .whereRaw('"leadEvidence" @> ?::jsonb', [JSON.stringify([{ id: lead.id }])]).select('id'));
    }).delete();
    const removed = await trx('leads').where({ id: lead.id, workspaceId: identity.workspaceId, version: input.expectedVersion }).delete();
    if (removed !== 1) throw new LeadDeleteConflictError();
    // Activity and assignment notification/outbox rows cascade. Creation admissions
    // intentionally remain independent; billing's monthly creation policy owns them.
    return { deleted: true as const };
}
