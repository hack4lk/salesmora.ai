import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Knex } from 'knex';
import { customerVisitOptionsSchema, permissionIds, workflowDefinitionSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize, canPublishWorkflow } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation } from '../authorization/store';
import { serviceDueCommandSchema } from '@salesmora/contracts';
import { configuredEmailSender, type EmailMessage } from '../email/transport';
import { renderCustomerVisitReminder } from '../email/customer-visit-reminder';
import { dueCompany } from './service-due';
import { WorkflowDraftError } from './recipients';
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
const companyContactReady=(company:{name:string;phone:string;email:string})=>!!company.name.trim()&&!!company.phone.trim()&&z.email().safeParse(company.email).success;
export async function customerVisitOptions(trx:Knex.Transaction,c:AuthorizationContext,baseURL:string,kind:'customer_visit_reminder'|'post_job_thank_you'|'customer_schedule_change'='customer_visit_reminder'){
 if(!canPublishWorkflow(c,kind))throw new AuthorizationAccessError();
 const ws=await trx('workspaces').where({id:c.workspaceId}).first('businessName','businessPhone');const company=await dueCompany(trx,c,ws?.businessPhone);
 return customerVisitOptionsSchema.parse({canConfigureCompany:authorize(c,{permission:'settings.business.update'}).allowed,company:{version:company.version,name:ws?.businessName??'',phone:company.phone,email:company.email},senderReady:!!configuredEmailSender(baseURL)});
}
export async function assertCustomerVisit(trx:Knex.Transaction,c:AuthorizationContext,exceptId?:string){
 const options=await customerVisitOptions(trx,c,process.env.BETTER_AUTH_URL??'');
 if(!options.senderReady||!companyContactReady(options.company))throw new WorkflowDraftError('Set up your email sender and company contact details in Customer email settings before publishing.');
 if(await trx('workflows').where({workspaceId:c.workspaceId}).whereIn('status',['active','paused']).whereNull('deletedAt').whereRaw("definition->>'kind'='customer_visit_reminder'").modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'))throw new WorkflowDraftError('A customer visit reminder already exists. Edit or resume it instead.');
}
export type CustomerVisitTransport={baseURL:string;send:(message:EmailMessage)=>Promise<unknown>};
/** A bounded customer send batch owns its current-source checks and retry handoff. */
export async function processCustomerVisit(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]=permissionIds,transport?:CustomerVisitTransport){
 try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
  const step=await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).where('dueAt','<=',trx.fn.now()).first('*',trx.raw(`to_char("visitDate",'YYYY-MM-DD') AS date`));if(!step)return {delivered:0,deferred:false};
  const w=await trx('workflows as w').join('workspaces as ws','ws.id','w.workspaceId').where({'w.workspaceId':workspaceId,'w.id':step.workflowId}).first('w.*','ws.timezone as currentTimezone');const def=workflowDefinitionSchema.safeParse(w?.definition);
  if(!w||w.status!=='active'||w.deletedAt||!def.success||def.data.kind!=='customer_visit_reminder'||def.data.timezone!==w.currentTimezone||!canPublishWorkflow(c,'customer_visit_reminder')){await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'skipped'});return {delivered:0,deferred:false};}
  if(step.recordKind==='customer_visit_init'){
   const rows=await trx('calendarVisits').where({workspaceId}).whereNotNull('scheduledDate').whereRaw(`"scheduledDate">(now() AT TIME ZONE ?)::date`,[def.data.timezone]).modify(q=>{if(step.cursorDate&&step.cursorId)q.whereRaw('("scheduledDate",id)>(?::date,?::uuid)',[step.cursorDate,step.cursorId]);}).select('id',trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).orderBy('scheduledDate').orderBy('id').limit(100);
   if(rows.length)await trx.raw('SELECT workflow_customer_visit_sync(?,id,?) FROM unnest(?::uuid[]) id',[workspaceId,w.id,rows.map((r:{id:string})=>r.id)]);
   const last=rows.at(-1);await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:rows.length===100?'queued':'completed',dueAt:trx.fn.now(),...(last?{cursorDate:last.date,cursorId:last.id}:{})});return {delivered:0,deferred:false};
  }
  const visit=await trx('calendarVisits').where({workspaceId,id:step.visitId}).first('*',trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date,statement_timestamp() AT TIME ZONE ? AS clock`,[def.data.timezone]));
  const timing=(await trx.raw(`SELECT statement_timestamp() < ?::timestamptz+interval '3 hours' AND (?::date>(statement_timestamp() AT TIME ZONE ?)::date) AS valid`,[step.triggeredAt,step.date,def.data.timezone])).rows[0];
  if(!visit||visit.date!==step.date||!timing.valid){await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'skipped'});return {delivered:0,deferred:false};}
  const source=trx.raw('workflow_customer_visit_customers(?,?) AS src',[workspaceId,step.visitId]);
  const customers=await trx.select('cust.id','cust.name','cust.email','cust.archivedAt','p.disabled').from(source).leftJoin('customers as cust',j=>j.on('cust.id','src.customerId').andOnVal('cust.workspaceId',workspaceId)).leftJoin('customerVisitReminderPreferences as p',j=>j.on('p.customerId','cust.id').andOnVal('p.workspaceId',workspaceId)).orderByRaw('cust.id NULLS FIRST').limit(101);
  // A pathological shared visit is not expanded into an unbounded email batch.
  const options=await customerVisitOptions(trx,c,transport?.baseURL??process.env.BETTER_AUTH_URL??'');
  const reasons=new Set<string>();if(customers.length>100)reasons.add('This visit has too many linked customers to send safely.');
  if(!visit.arrivalWindow)reasons.add('Arrival window is missing.');
  if(!options.senderReady||!companyContactReady(options.company))reasons.add('Company email settings need attention.');
  let sent=0,retry:Date|undefined;
  for(const customer of customers.slice(0,100)){
   if(!customer.id||customer.archivedAt||!customer.name||!customer.email||!z.email().safeParse(customer.email).success){reasons.add('Customer contact is missing or unavailable.');continue;}
   if(customer.disabled)continue;
   if(reasons.size&&(!visit.arrivalWindow||!options.senderReady||!companyContactReady(options.company)||customers.length>100))continue;
   if(!transport)throw Error('Customer visit delivery requires a configured transport.');
   const token=randomBytes(32).toString('base64url');
   await trx('customerVisitReminderDeliveries').insert({id:randomUUID(),workspaceId,workflowId:w.id,visitId:step.visitId,visitDate:step.date,customerId:customer.id,token,unsubscribeHash:digest(token)}).onConflict(['workspaceId','visitId','visitDate','customerId']).ignore();
   const receipt=await trx('customerVisitReminderDeliveries').where({workspaceId,visitId:step.visitId,visitDate:step.date,customerId:customer.id}).forUpdate().first();
   if(receipt.status!=='queued')continue;
   if(receipt.nextAttemptAt>new Date()){retry=!retry||receipt.nextAttemptAt<retry?receipt.nextAttemptAt:retry;continue;}
   const fingerprint=digest(JSON.stringify([options.company,configuredEmailSender(transport.baseURL),customer.name,customer.email,step.date,visit.arrivalWindow,def.data.timezone]));
   if(receipt.payloadHash&&receipt.payloadHash!==fingerprint){await trx('customerVisitReminderDeliveries').where({workspaceId,id:receipt.id}).update({status:'skipped'});reasons.add('Visit or contact details changed during a delivery retry.');continue;}
   await trx('customerVisitReminderDeliveries').where({workspaceId,id:receipt.id}).update({payloadHash:fingerprint,address:customer.email});
   const attempts=receipt.attempts+1;
   try{await transport.send({to:customer.email,...renderCustomerVisitReminder({baseURL:transport.baseURL,token:receipt.token,company:options.company.name,phone:options.company.phone,email:options.company.email,name:customer.name,date:step.date,arrivalWindow:visit.arrivalWindow,timezone:def.data.timezone}),replyTo:options.company.email,idempotencyKey:`customer-visit-${receipt.id}`});
    await trx('customerVisitReminderDeliveries').where({workspaceId,id:receipt.id}).update({status:'sent',address:customer.email,attempts,sentAt:trx.fn.now()});sent++;
   }catch{const failed=attempts>=5,next=new Date(Date.now()+60000*2**(attempts-1));await trx('customerVisitReminderDeliveries').where({workspaceId,id:receipt.id}).update({status:failed?'failed':'queued',attempts,nextAttemptAt:next});if(failed)reasons.add('A customer reminder could not be delivered.');else retry=!retry||next<retry?next:retry;}
  }
  if(reasons.size){const labels=[...reasons].slice(0,5);await trx('workflowVisitNotifications').insert({id:randomUUID(),workspaceId,workflowId:w.id,stepId,visitId:step.visitId,scheduledDate:step.date,userId:publisherId,inApp:true,emailStatus:'skipped',snapshot:JSON.stringify({reason:'customer_reminder',title:'Customer reminder not sent',customerName:'',scheduledDate:step.date,arrivalWindow:visit.arrivalWindow,timezone:def.data.timezone,recordLabels:labels,totalRecords:labels.length})}).onConflict(['workspaceId','workflowId','visitId','scheduledDate','userId']).ignore();}
  await trx('workflowSteps').where({id:stepId,workspaceId}).update(retry?{dueAt:retry}:{status:'completed'});return {delivered:sent,deferred:false};
 });}catch(error){if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
export async function unsubscribeVisitReminder(db:Knex,token:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return false;
 return db.transaction(async trx=>{const row=await trx('customerVisitReminderDeliveries').where({unsubscribeHash:digest(token)}).first('workspaceId','customerId');if(!row)return false;
  // Serialize preference changes with delivery without making the public token a record-reading authority.
  await trx('workspaces').where({id:row.workspaceId}).forUpdate().first('id');
  await trx('customerVisitReminderPreferences').insert({...row,disabled:true}).onConflict(['workspaceId','customerId']).merge({disabled:true});await trx('customerVisitReminderDeliveries').where(row).where({status:'queued'}).update({status:'skipped'});return true;});
}

export async function saveCustomerVisitCompany(trx:Knex.Transaction,c:AuthorizationContext,raw:unknown,baseURL:string,kind:'customer_visit_reminder'|'post_job_thank_you'|'customer_schedule_change'='customer_visit_reminder'){
 if(!canPublishWorkflow(c,kind)||!authorize(c,{permission:'settings.business.update'}).allowed)throw new AuthorizationAccessError();
 const input=serviceDueCommandSchema.parse(raw);if(input.action!=='company')throw new WorkflowDraftError('Choose company contact details.');
 const current=await customerVisitOptions(trx,c,baseURL,kind);
 if(input.expectedVersion!==current.company.version)throw new WorkflowDraftError('Company contact details changed. Reload this review.');
 await trx('serviceOutreachCompany').insert({workspaceId:c.workspaceId,version:current.company.version+1,phone:input.phone,email:input.email}).onConflict('workspaceId').merge({version:current.company.version+1,phone:input.phone,email:input.email});
 await trx('workspaces').where({id:c.workspaceId}).update({businessPhone:input.phone});return customerVisitOptions(trx,c,baseURL,kind);
}
