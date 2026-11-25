import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { AuthorizationContext, PermissionId } from '@salesmora/contracts';
import { canPublishWorkflow } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation } from '../authorization/store';
import { WorkflowDraftError } from './recipients';
import { dueRows, dueWorkflow, openServiceWork } from './service-due';
import { workflowParticipantsEligible } from './execution';
export async function assertAnnualReview(trx: Knex.Transaction,c:AuthorizationContext,service:string,date:string,time:string,timezone:string,exceptId?:string,active=true,requireFuture=true){
  if(!canPublishWorkflow(c,'annual_service_review'))throw new AuthorizationAccessError();
  const row=await trx('workspaceServices').where({workspaceId:c.workspaceId,service}).whereNull('archivedAt').first('id');
  if(!row)throw new WorkflowDraftError('Choose a current workspace service.');
  const clock=(await trx.raw('SELECT workflow_annual_instant(?::date,?::time,?) AS at,statement_timestamp() AS now',[date,time,timezone])).rows[0];
  if(!clock.at)throw new WorkflowDraftError('That review time falls on a clock change. Choose another send time.');
  if(requireFuture&&clock.at<=clock.now)throw new WorkflowDraftError('Choose a future review date and time.');
  if(active&&await trx('workflows').where({workspaceId:c.workspaceId,serviceId:row.id,status:'active'}).whereNull('deletedAt').whereRaw("definition->>'kind'='annual_service_review' AND right(definition->'rules'->>'firstReviewDate',5)=?",[date.slice(5)]).modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'))throw new WorkflowDraftError('This service already has an annual review on that date. Edit or pause it first.');
}
/** One annual occurrence builds its customer cohort in bounded, idempotent batches. */
export async function processAnnualReview(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]){
  try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
    const step=await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued',recordKind:'annual_review'}).where('dueAt','<=',trx.fn.now()).first('*',trx.raw(`to_char("visitDate",'YYYY-MM-DD') AS "occurrenceDate",statement_timestamp()>"triggeredAt"+interval '3 hours' AS expired`));
    if(!step)return {delivered:0,deferred:false};
    const w=await dueWorkflow(trx,c,step.workflowId);
    if(w.definition.kind!=='annual_service_review')throw new AuthorizationAccessError();
    if(w.status!=='active'||w.archivedAt||w.currentTimezone!==w.definition.timezone||step.expired||!await workflowParticipantsEligible(trx,c,w.definition,w.publisherId)){
      await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'skipped'});return {delivered:0,deferred:false};
    }
    const batch=await trx('jobs as j').join('customers as cust',q=>q.on('cust.workspaceId','j.workspaceId').andOn('cust.id','j.customerId'))
      .where({'j.workspaceId':workspaceId,'j.serviceId':w.serviceId,'j.status':'completed'}).whereNull('cust.archivedAt').whereNotNull('j.customerId')
      .whereExists(trx('jobActivity as a').select(trx.raw('1')).whereRaw('a."workspaceId"=j."workspaceId" AND a."jobId"=j.id').where({'a.type':'status'}).whereRaw("a.changes->>'to'='completed'").where('a.createdAt','<=',step.triggeredAt))
      .modify(q=>{if(step.cursorId)q.where('j.customerId','>',step.cursorId);}).distinct('j.customerId').orderBy('j.customerId').limit(200);
    if(batch.length)await trx.raw(`INSERT INTO "workflowServiceDueCycles" ("workspaceId","workflowId","customerId","serviceId","jobId","activityId","completedAt","dueDate","reminderOn","reviewDate")
      SELECT DISTINCT ON(j."customerId") j."workspaceId",?::uuid,j."customerId",j."serviceId",j.id,a.id,a."createdAt",?::date,?::date,?::date FROM jobs j JOIN "jobActivity" a ON a."workspaceId"=j."workspaceId" AND a."jobId"=j.id AND a.type='status' AND a.changes->>'to'='completed'
      WHERE j."workspaceId"=? AND j."serviceId"=? AND j."customerId"=ANY(?::uuid[]) AND j.status='completed' AND a."createdAt"<=? ORDER BY j."customerId",a."createdAt" DESC,a.id DESC ON CONFLICT DO NOTHING`,[w.id,step.occurrenceDate,step.occurrenceDate,step.occurrenceDate,workspaceId,w.serviceId,batch.map(r=>r.customerId),step.triggeredAt]);
    if(batch.length===200){await trx('workflowSteps').where({id:stepId,workspaceId}).update({cursorId:batch.at(-1)!.customerId,dueAt:trx.fn.now()});return {delivered:0,deferred:false};}
    await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'completed'});
    const count=Number((await dueRows(trx,c,w.id).where({'d.status':'due'}).whereRaw(`NOT ${openServiceWork}`).count('* as n').first())?.n??0);
    if(count){await trx('workflowServiceDueNotifications').insert({id:randomUUID(),workspaceId,workflowId:w.id,workflowVersion:w.version,userId:w.definition.recipientId,stepId,count,inApp:w.definition.notifications?.inApp??true,emailStatus:w.definition.notifications?.email?'queued':'skipped'}).onConflict('stepId').ignore();
      await trx('workflowServiceDueCycles').where({workspaceId,workflowId:w.id,reviewDate:step.occurrenceDate}).update({notifiedAt:trx.fn.now()});}
    return {delivered:count?1:0,deferred:false};
  });}catch(error){if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
