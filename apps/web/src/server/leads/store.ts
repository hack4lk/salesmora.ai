import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import type { AuthorizationContext, LeadInput } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { assignLead, assertLeadCapacity, authorizedLeadPipelineCounts } from '@salesmora/data';
import { authorizedWorkspace, enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export class LeadAccessError extends Error {}
export class LeadOwnerError extends Error {}
export class LeadConflictError extends Error {}

/** No client-supplied role or creator is trusted. Assignment is restricted to current members. */
export async function createLead(userId: string, workspaceId: string, submissionId: string, input: LeadInput) {
  return authorizedWorkspace(userId, workspaceId, true, async (trx, context) => {
    return createLeadInTransaction(trx, context, userId, workspaceId, submissionId, input);
  });
}
/** Shared manual/confirmed-chat use case; caller holds the authorized workspace transaction. */
export async function createLeadInTransaction(trx: Knex.Transaction, context: AuthorizationContext, userId: string, workspaceId: string, submissionId: string, input: LeadInput) {
  if (context.workspaceId !== workspaceId || context.userId !== userId) throw new LeadAccessError();
  if (!authorize(context, { permission: 'leads.create' }).allowed || !authorize(context, { permission: 'leads.assign', resource: { kind: 'lead', id: submissionId, workspaceId, ownerId: null } }).allowed) throw new LeadAccessError();
  const key = { workspaceId, createdBy: userId, submissionId };
  const submissionHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const existing = await trx('leads').where(key).first();
  if (existing) {
    if (existing.submissionHash !== submissionHash) throw new LeadConflictError();
    return { id: existing.id as string, created: false };
  }
  if (input.ownerId && !await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where({ 'm.workspaceId': workspaceId, 'm.userId': input.ownerId }).whereNull('u.deletionRequestedAt').first('u.id')) throw new LeadOwnerError();
  const createdAt=await assertLeadCapacity(trx,workspaceId);
  const inserted = await trx('leads').insert({ ...input, ownerId: null, ...key, submissionHash, createdAt, id: randomUUID() }).onConflict(['workspaceId', 'createdBy', 'submissionId']).ignore().returning('id');
  if (inserted.length) {
    if (input.ownerId) await assignLead(trx, {userId,workspaceId}, context.enabledPermissions, {workspaceId,leadId:inserted[0].id,ownerId:input.ownerId,expectedVersion:1,submissionId:randomUUID()});
    return { id: inserted[0].id as string, created: true };
  }
  const saved = await trx('leads').where(key).first();
  if (saved.submissionHash !== submissionHash) throw new LeadConflictError();
  return { id: saved.id as string, created: false };
}
export async function leadOwners(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    if (!authorize(context, { permission: 'leads.create' }).allowed) throw new LeadAccessError();
    return trx('workspaceMemberships').join('users', 'users.id', 'workspaceMemberships.userId').where('workspaceMemberships.workspaceId', workspaceId).whereNull('users.deletionRequestedAt').orderBy('users.name').orderBy('users.id').select<{ id: string; name: string }[]>('users.id', 'users.name');
  });
}
/** Aggregate only the selected workspace while enforcing the viewer's current membership. */
export async function workspaceLeadPipelineCounts(userId: string, workspaceId: string) {
  const counts: Record<LeadInput['stage'], number> = { new: 0, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 };
  const rows = await authorizedLeadPipelineCounts(database(), { userId, workspaceId }, enabledPermissions);
  for (const stage of Object.keys(counts) as LeadInput['stage'][]) counts[stage] = rows[stage] ?? 0;
  return counts;
}
