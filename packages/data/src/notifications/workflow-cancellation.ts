import type {Knex} from 'knex';
import {workflowDefinitionSchema,type AuthorizationContext,type PermissionId} from '@salesmora/contracts';
import {canReadWorkflowRecords} from '@salesmora/domain';
import {AuthorizationAccessError,WorkspaceSuspendedError,withWorkspaceAuthorization} from '../authorization/store';
import {withoutSuspendedWorkspaces} from '../accounts/workspace-hold';
import {workflowParticipantsEligible} from '../workflows/execution';
export function cancellationNotificationQuery(trx:Knex.Transaction,c:AuthorizationContext,emailOnly=false){
 const q=trx('workflowCancellationNotifications as n').join('workflowCancellationOpenings as o',j=>j.on('o.workspaceId','n.workspaceId').andOn('o.id','n.openingId')).join('workflows as w',j=>j.on('w.workspaceId','n.workspaceId').andOn('w.id','n.workflowId')).where({'n.workspaceId':c.workspaceId,'n.userId':c.userId,'o.status':'open','w.status':'active'}).whereNull('w.deletedAt').whereRaw('w.version=o."workflowVersion" AND o.date>(now() AT TIME ZONE o.timezone)::date');
 if(!emailOnly)q.where('n.inApp',true);if(!canReadWorkflowRecords(c,'cancellation_fill'))q.whereRaw('false');return q;
}
export type CancellationEmail={id:string;to:string;workspaceId:string;openingId:string;description:string};
export async function processCancellationEmails(db:Knex,enabled:readonly PermissionId[],send:(m:CancellationEmail)=>Promise<void>,limit=10,target?:{id:string;workspaceId:string}){
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new RangeError('Invalid email batch.');
 const summary={sent:0,skipped:0,retryPending:0,failed:0};const query=withoutSuspendedWorkspaces(db('workflowCancellationNotifications'),'workflowCancellationNotifications.workspaceId').where({emailStatus:'queued'}).where('nextAttemptAt','<=',db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit);if(target)query.where(target);
 for(const candidate of await query.select('id','workspaceId','userId'))try{
  await withWorkspaceAuthorization(db,{workspaceId:candidate.workspaceId,userId:candidate.userId},enabled,false,async(trx,c)=>{
   const queued=await trx('workflowCancellationNotifications').where({id:candidate.id,emailStatus:'queued'}).where('nextAttemptAt','<=',trx.fn.now()).forUpdate().skipLocked().first();if(!queued)return;
   const row=await cancellationNotificationQuery(trx,c,true).join('users as u','u.id','n.userId').leftJoin('notificationPreferences as p','p.userId','u.id').where('n.id',candidate.id).select('n.openingId','n.description','w.definition','w.publisherId','u.email','u.emailVerified','p.jobActivityEmail').first();
   const def=workflowDefinitionSchema.safeParse(row?.definition);
   if(!row||!row.emailVerified||row.jobActivityEmail===false||!def.success||def.data.kind!=='cancellation_fill'||!def.data.notifications?.email||def.data.recipientId!==c.userId||!row.publisherId||!await workflowParticipantsEligible(trx,c,def.data,row.publisherId)){
    await trx('workflowCancellationNotifications').where({id:candidate.id}).update({emailStatus:'skipped'});summary.skipped++;return;
   }
   const attempts=queued.attempts+1;
   try{await send({id:candidate.id,to:row.email,workspaceId:candidate.workspaceId,openingId:row.openingId,description:row.description});await trx('workflowCancellationNotifications').where({id:candidate.id}).update({emailStatus:'sent',attempts,sentAt:trx.fn.now()});summary.sent++;}
   catch{const failed=attempts>=5;await trx('workflowCancellationNotifications').where({id:candidate.id}).update({emailStatus:failed?'failed':'queued',attempts,nextAttemptAt:new Date(Date.now()+60000*2**(attempts-1))});summary[failed?'failed':'retryPending']++;}
  });
 }catch(e){if(e instanceof WorkspaceSuspendedError)continue;if(!(e instanceof AuthorizationAccessError))throw e;await db('workflowCancellationNotifications').where({id:candidate.id,emailStatus:'queued'}).update({emailStatus:'skipped'});summary.skipped++;}
 return summary;
}
