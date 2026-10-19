import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { addLeadNoteSchema, type AddLeadNoteInput, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';

export class LeadNoteConflictError extends Error {
  constructor() { super('This note submission was already used for different content.'); }
}
/** Notes are append-only: current lead read authority is required even when replaying a request. */
export async function addLeadNote(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: AddLeadNoteInput) {
  const input = addLeadNoteSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const result = await addLeadNoteInTransaction(trx, context, input);
    return result.note;
  });
}
/** Caller holds the authorized workspace write transaction. Manual and chat notes share one append-only use case. */
export async function addLeadNoteInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: AddLeadNoteInput, actorType: 'user' | 'assistant-confirmed' = 'user') {
  const input = addLeadNoteSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId, input.body])).digest('hex');
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: identity.workspaceId, id: input.leadId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', identity.userId);
  const lead = await query.forUpdate().first('id', 'version');
  if (!lead) throw new AuthorizationAccessError();
  const previous = await trx('leadActivity').where({ id: input.submissionId, workspaceId: identity.workspaceId }).first();
  if (previous) {
    if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== 'note' || previous.changes.requestHash !== requestHash) throw new LeadNoteConflictError();
    return { version: lead.version as number, note: { id: previous.id as string, body: input.body, authorName: previous.actorName as string, createdAt: previous.createdAt.toISOString(), viaAssistant: previous.actorType === 'assistant-confirmed' } };
  }
  const now = new Date(), actor = await trx('users').where({ id: identity.userId }).first('name');
  await trx('leadActivity').insert({ id: input.submissionId, workspaceId: identity.workspaceId, leadId: lead.id, actorId: identity.userId, actorName: actor.name, actorType, type: 'note', changes: JSON.stringify({ body: input.body, requestHash }), createdAt: now });
  await trx('leads').where({ workspaceId: identity.workspaceId, id: lead.id }).update({ version: lead.version + 1, updatedAt: now, lastActivityAt: now });
  return { version: lead.version + 1, note: { id: input.submissionId, body: input.body, authorName: actor.name as string, createdAt: now.toISOString(), viaAssistant: actorType === 'assistant-confirmed' } };
}
