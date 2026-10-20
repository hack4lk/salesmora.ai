import type { Knex } from 'knex';
import type { LeadReadRecord, PermissionId } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { currentAssignmentQuery } from './store';
export type AssignmentDelivery = { id: string; to: string; workspaceId: string; workspaceName: string; leadId: string; leadNumber: string; leadName: string; service: string; stage: LeadReadRecord['stage']; assignerName: string };
/** Workspace then outbox lock order matches mutations. Skip-locked claims support multiple workers.
 * A bounded provider call holds a shared workspace lock to serialize access revocation with delivery.
 */
export async function processAssignmentEmails(db: Knex, enabled: readonly PermissionId[], send: (mail: AssignmentDelivery) => Promise<void>, limit = 10) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates = await db('assignmentEmailOutbox as o').join('assignmentNotifications as n','n.id','o.id').where('o.status','queued').where('o.nextAttemptAt','<=',db.fn.now()).orderBy('o.nextAttemptAt').orderBy('o.id').limit(limit).select('o.id','n.workspaceId','n.userId','n.createdAt');
  for (const candidate of candidates) {
    try {
      await withWorkspaceAuthorization(db,{ workspaceId: candidate.workspaceId, userId: candidate.userId },enabled,false,async (trx,context) => {
        const job = await trx('assignmentEmailOutbox').where({id:candidate.id,status:'queued'}).where('nextAttemptAt','<=',trx.fn.now()).forUpdate().skipLocked().first();
        if (!job) return;
        const scope = resolveAuthorizedCollectionScope(context,'leads.read');
        const row = scope.allowed && scope.resourceKind === 'lead' && ['workspace','assigned'].includes(scope.scope) ? await currentAssignmentQuery(trx,context).where('n.id',job.id).first('n.leadId','l.leadNumber','l.name','l.service','l.stage','a.actorName') : undefined;
        const user = await trx('users').where({id:candidate.userId}).whereNull('deletionRequestedAt').first('email','emailVerified');
        const preference = await trx('notificationPreferences').where({userId:candidate.userId}).first('leadAssignedEmail');
        if (new Date(candidate.createdAt).getTime() < Date.now()-23*60*60*1000 || !row || !user?.emailVerified || preference?.leadAssignedEmail === false) { await trx('assignmentEmailOutbox').where({id:job.id}).update({status:'skipped'}); summary.skipped++; return; }
        const workspace = await trx('workspaces').where({id:candidate.workspaceId}).first('businessName');
        const attempts = job.attempts + 1;
        try {
          await send({id:job.id,to:user.email,workspaceId:candidate.workspaceId,workspaceName:workspace.businessName,leadId:row.leadId,leadNumber:`LD-${String(row.leadNumber).padStart(4,'0')}`,leadName:row.name,service:row.service,stage:row.stage,assignerName:row.actorName ?? ''});
          await trx('assignmentEmailOutbox').where({id:job.id}).update({status:'sent',attempts,sentAt:trx.fn.now()}); summary.sent++;
        } catch {
          if (attempts >= 5) summary.failed++; else summary.retryPending++;
          await trx('assignmentEmailOutbox').where({id:job.id}).update({status:attempts >= 5 ? 'failed' : 'queued',attempts,nextAttemptAt:new Date(Date.now()+60000*2**(attempts-1))});
        }
      });
    } catch (error) {
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db('assignmentEmailOutbox').where({id:candidate.id,status:'queued'}).update({status:'skipped'}); summary.skipped++;
    }
  }
  return summary;
}
