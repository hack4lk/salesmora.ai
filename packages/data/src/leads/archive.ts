import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { leadArchiveSchema, type LeadArchiveInput, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
export class LeadArchiveConflictError extends Error {}
/** Archive and restore share authority, atomic history and retry handling. No record is deleted. */
export async function setLeadArchived(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadArchiveInput, archived: boolean) {
  const input = leadArchiveSchema.parse(raw);
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db,identity,enabled,true,async (trx,context) => {
    return setLeadArchivedInTransaction(trx,context,input,archived);
  });
}
/** Caller holds the authorized workspace transaction; manual and confirmed-chat paths share this use case. */
export async function setLeadArchivedInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: LeadArchiveInput, archived: boolean, actorType: 'user' | 'assistant-confirmed' = 'user') {
  const input = leadArchiveSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  const type = archived ? 'archived' : 'restored';
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId,input.expectedVersion,archived])).digest('hex');
  const scope = resolveAuthorizedCollectionScope(context,'leads.read');
  if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace','assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({id:input.leadId,workspaceId:identity.workspaceId});
  if (scope.scope === 'assigned') query.andWhere('ownerId',identity.userId);
  const lead = await query.forUpdate().first('id','ownerId','version','archivedAt');
  if (!lead || !authorize(context,{permission:'leads.archive',resource:{kind:'lead',id:lead.id,workspaceId:identity.workspaceId,ownerId:lead.ownerId}}).allowed) throw new AuthorizationAccessError();
  const previous = await trx('leadActivity').where({id:input.submissionId,workspaceId:identity.workspaceId}).first('leadId','actorId','type','changes');
  if (previous) {
    if (previous.leadId !== lead.id || previous.actorId !== identity.userId || previous.type !== type || previous.changes.requestHash !== requestHash) throw new LeadArchiveConflictError();
    return {version:lead.version,archived:!!lead.archivedAt};
  }
  if (lead.version !== input.expectedVersion || !!lead.archivedAt === archived) throw new LeadArchiveConflictError();
  const now=new Date(), version=lead.version+1;
  const updated=await trx('leads').where({id:lead.id,workspaceId:identity.workspaceId,version:input.expectedVersion}).update({archivedAt:archived?now:null,archivedBy:archived?identity.userId:null,version,updatedAt:now,lastActivityAt:now});
  if (updated !== 1) throw new LeadArchiveConflictError();
  const actor=await trx('users').where({id:identity.userId}).first('name');
  await trx('leadActivity').insert({id:input.submissionId,workspaceId:identity.workspaceId,leadId:lead.id,actorId:identity.userId,actorName:actor.name,actorType,type,changes:JSON.stringify({from:!!lead.archivedAt,to:archived,fromVersion:lead.version,toVersion:version,requestHash}),createdAt:now});
  return {version,archived};
}
