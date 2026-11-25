import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Knex } from 'knex';
import { workflowDefinitionSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { canPublishWorkflow, canReadWorkflowRecords } from '@salesmora/domain';
import { AuthorizationAccessError, WorkspaceSuspendedError, withCurrentWorkspaceMutation } from '../authorization/store';
import { configuredEmailSender } from '../email/transport';
import { renderPostJobThankYou } from '../email/post-job-thank-you';
import { customerVisitOptions, type CustomerVisitTransport } from './customer-visits';
import { WorkflowDraftError } from './recipients';
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
const contactReady=(company:{name:string;phone:string;email:string})=>!!company.name.trim()&&!!company.phone.trim()&&z.email().safeParse(company.email).success;
export const postJobOptions=(trx:Knex.Transaction,c:AuthorizationContext,baseURL:string)=>customerVisitOptions(trx,c,baseURL,'post_job_thank_you');
export async function assertPostJob(trx:Knex.Transaction,c:AuthorizationContext,exceptId?:string) {
  const options=await postJobOptions(trx,c,process.env.BETTER_AUTH_URL??'');
  if(!options.senderReady||!contactReady(options.company))throw new WorkflowDraftError('Set up your email sender and company contact details before publishing.');
  if(await trx('workflows').where({workspaceId:c.workspaceId}).whereIn('status',['active','paused']).whereNull('deletedAt').whereRaw("definition->>'kind'='post_job_thank_you'").modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'))throw new WorkflowDraftError('A post-job thank-you already exists. Edit or resume it instead.');
}
export function postJobNotificationQuery(trx:Knex.Transaction,c:AuthorizationContext) {
  const q=trx('postJobNotifications as n').join('jobs as j',join=>join.on('j.workspaceId','n.workspaceId').andOn('j.id','n.jobId')).where({'n.workspaceId':c.workspaceId,'n.userId':c.userId});
  if(!canReadWorkflowRecords(c,'post_job_thank_you'))q.whereRaw('false');return q;
}
/** One persisted occurrence, current authority and source state, no execution-time model or polling. */
export async function processPostJob(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[],transport?:CustomerVisitTransport) {
  try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
    const step=await trx('workflowSteps as s').join('workflows as w',j=>j.on('w.workspaceId','s.workspaceId').andOn('w.id','s.workflowId')).join('workspaces as ws','ws.id','w.workspaceId')
      .leftJoin('postJobPeriods as p',j=>j.on('p.workspaceId','s.workspaceId').andOn('p.workflowId','s.workflowId').andOn('p.jobId','s.jobId'))
      .where({'s.workspaceId':workspaceId,'s.id':stepId,'s.status':'queued','s.recordKind':'post_job'}).where('s.dueAt','<=',trx.fn.now())
      .first('s.*','w.definition','w.status as workflowStatus','w.deletedAt','w.publisherId','ws.timezone',trx.raw('p.finished AND p."readyAt"=s."triggeredAt" AND workflow_post_job_finished(s."workspaceId",s."jobId") AS eligible'));
    if(!step)return {delivered:0,deferred:false};
    const finish=()=>trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'completed'});
    const def=workflowDefinitionSchema.safeParse(step.definition);
    if(!step.eligible||step.workflowStatus!=='active'||step.deletedAt||step.publisherId!==publisherId||!def.success||def.data.kind!=='post_job_thank_you'||!def.data.rules.messageChoice||def.data.timezone!==step.timezone||!canPublishWorkflow(c,'post_job_thank_you')){
      await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};
    }
    const clock=(await trx.raw('SELECT workflow_annual_instant((?::timestamptz AT TIME ZONE ?)::date+?::int,?::time,?) due',[step.triggeredAt,def.data.timezone,def.data.rules.calendarDays,def.data.localTime,def.data.timezone])).rows[0];
    if(!clock.due){await trx('workflowSteps').where({workspaceId,id:stepId}).update({status:'skipped'});return {delivered:0,deferred:false};}
    async function notify(reason:string){await trx('postJobNotifications').insert({id:randomUUID(),workspaceId,workflowId:step.workflowId,stepId,jobId:step.jobId,userId:publisherId,reason}).onConflict('stepId').ignore();}
    const customer=await trx('jobs as j').leftJoin('customers as cust',join=>join.on('cust.workspaceId','j.workspaceId').andOn('cust.id','j.customerId')).where({'j.workspaceId':workspaceId,'j.id':step.jobId}).first('cust.id','cust.name','cust.email','cust.archivedAt');
    if(!customer?.id||customer.archivedAt||!customer.name?.trim()||!z.email().safeParse(customer.email).success){await notify('Customer email or contact details are missing or unavailable.');await finish();return {delivered:0,deferred:false};}
    await trx('postJobPreferences').insert({workspaceId,customerId:customer.id}).onConflict(['workspaceId','customerId']).ignore();
    const preference=await trx('postJobPreferences').where({workspaceId,customerId:customer.id}).forUpdate().first();
    if(preference.disabled){await finish();return {delivered:0,deferred:false};}
    const options=await postJobOptions(trx,c,transport?.baseURL??process.env.BETTER_AUTH_URL??'');
    if(!options.senderReady||!contactReady(options.company)){await notify('Company email settings need attention.');await finish();return {delivered:0,deferred:false};}
    if(!transport)throw Error('Post-job delivery requires a configured transport.');
    const changedCustomer=await trx('postJobDeliveries').where({workspaceId,jobId:step.jobId,status:'queued'}).whereNot('customerId',customer.id).where('attempts','>',0).first('id');
    if(changedCustomer){await trx('postJobDeliveries').where({workspaceId,id:changedCustomer.id}).update({status:'skipped'});await notify('The linked customer changed during a delivery retry.');await finish();return {delivered:0,deferred:false};}
    const token=randomBytes(32).toString('base64url');
    await trx('postJobDeliveries').insert({id:randomUUID(),workspaceId,workflowId:step.workflowId,jobId:step.jobId,customerId:customer.id,token,unsubscribeHash:digest(token)}).onConflict(['workspaceId','jobId','customerId']).ignore();
    const receipt=await trx('postJobDeliveries').where({workspaceId,jobId:step.jobId,customerId:customer.id}).forUpdate().first();
    if(receipt.status!=='queued'){await finish();return {delivered:0,deferred:false};}
    if(receipt.nextAttemptAt>new Date()){await trx('workflowSteps').where({workspaceId,id:stepId}).update({dueAt:receipt.nextAttemptAt});return {delivered:0,deferred:false};}
    const otherPending=await trx('postJobDeliveries as d').where({'d.workspaceId':workspaceId,'d.customerId':customer.id,'d.status':'queued','d.includeReview':true}).whereNot('d.id',receipt.id).whereExists(trx('workflowSteps as s').select(trx.raw('1')).whereRaw('s."workspaceId"=d."workspaceId" AND s."jobId"=d."jobId" AND s."recordKind"=?',['post_job']).whereIn('s.status',['queued','held'])).first('d.id');
    if(receipt.includeReview&&preference.lastReviewAt&&Date.now()-new Date(preference.lastReviewAt).getTime()<90*86400000){await trx('postJobDeliveries').where({workspaceId,id:receipt.id}).update({status:'skipped'});await notify('A review request was already sent during this delivery retry.');await finish();return {delivered:0,deferred:false};}
    const includeReview=receipt.includeReview??(!!def.data.rules.reviewUrl&&!otherPending&&(!preference.lastReviewAt||Date.now()-new Date(preference.lastReviewAt).getTime()>=90*86400000));
    const fingerprint=digest(JSON.stringify([options.company,configuredEmailSender(transport.baseURL),customer.id,customer.name,customer.email,def.data.rules.thankYouMessage,def.data.rules.reviewUrl,includeReview]));
    if(receipt.payloadHash&&receipt.payloadHash!==fingerprint){await trx('postJobDeliveries').where({id:receipt.id,workspaceId}).update({status:'skipped'});await notify('Customer or email details changed during a delivery retry.');await finish();return {delivered:0,deferred:false};}
    await trx('postJobDeliveries').where({id:receipt.id,workspaceId}).update({payloadHash:fingerprint,includeReview});
    const attempts=receipt.attempts+1;
    try{
      await transport.send({to:customer.email,...renderPostJobThankYou({baseURL:transport.baseURL,token:receipt.token,company:options.company.name,phone:options.company.phone,email:options.company.email,name:customer.name,message:def.data.rules.thankYouMessage,reviewUrl:includeReview?def.data.rules.reviewUrl:''}),replyTo:options.company.email,idempotencyKey:`post-job-${workspaceId}-${step.jobId}-${customer.id}`});
      await trx('postJobDeliveries').where({id:receipt.id,workspaceId}).update({status:'sent',attempts,sentAt:trx.fn.now()});
      if(includeReview)await trx('postJobPreferences').where({workspaceId,customerId:customer.id}).update({lastReviewAt:trx.fn.now()});
      await finish();return {delivered:1,deferred:false};
    }catch{
      const failed=attempts>=5,next=new Date(Date.now()+60000*2**(attempts-1));
      await trx('postJobDeliveries').where({id:receipt.id,workspaceId}).update({status:failed?'failed':'queued',attempts,nextAttemptAt:next});
      if(failed){await notify('The customer thank-you could not be delivered.');await finish();}else await trx('workflowSteps').where({workspaceId,id:stepId}).update({dueAt:next});
      return {delivered:0,deferred:false};
    }
  });}catch(error){if(error instanceof WorkspaceSuspendedError)return {delivered:0,deferred:true};if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
/** Possession authorizes only this email-purpose opt-out, with no public record lookup response. */
export async function unsubscribePostJob(db:Knex,token:string) {
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))return false;
  return db.transaction(async trx=>{
    const row=await trx('postJobDeliveries').where({unsubscribeHash:digest(token)}).first('workspaceId','customerId');if(!row)return false;
    await trx('workspaces').where({id:row.workspaceId}).forUpdate().first('id');
    await trx('postJobPreferences').insert({...row,disabled:true}).onConflict(['workspaceId','customerId']).merge({disabled:true});
    await trx('postJobDeliveries').where({...row,status:'queued'}).update({status:'skipped'});return true;
  });
}
