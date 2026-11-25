import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Knex } from 'knex';
import { workflowDefinitionSchema, scheduleChangeSnapshotSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { canPublishWorkflow, canReadWorkflowRecords } from '@salesmora/domain';
import { AuthorizationAccessError, WorkspaceSuspendedError, withCurrentWorkspaceMutation } from '../authorization/store';
import { configuredEmailSender } from '../email/transport';
import { renderCustomerScheduleChange } from '../email/customer-schedule-change';
import { customerVisitOptions, type CustomerVisitTransport } from './customer-visits';
import { WorkflowDraftError } from './recipients';
const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
const contactReady=(c:{name:string;phone:string;email:string})=>!!c.name.trim()&&!!c.phone.trim()&&z.email().safeParse(c.email).success;
export const scheduleChangeOptions=(trx:Knex.Transaction,c:AuthorizationContext,baseURL:string)=>customerVisitOptions(trx,c,baseURL,'customer_schedule_change');
export async function assertScheduleChange(trx:Knex.Transaction,c:AuthorizationContext,exceptId?:string){
 const options=await scheduleChangeOptions(trx,c,process.env.BETTER_AUTH_URL??'');
 if(!options.senderReady||!contactReady(options.company))throw new WorkflowDraftError('Set up your email sender and company contact details before publishing.');
 if(await trx('workflows').where({workspaceId:c.workspaceId}).whereIn('status',['active','paused']).whereNull('deletedAt').whereRaw("definition->>'kind'='customer_schedule_change'").modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'))throw new WorkflowDraftError('A customer schedule-change workflow already exists. Edit or resume it instead.');
}
export function scheduleChangeNotificationQuery(trx:Knex.Transaction,c:AuthorizationContext){
 const q=trx('customerScheduleNotifications as n').join('jobs as j',p=>p.on('j.workspaceId','n.workspaceId').andOn('j.id','n.jobId')).where({'n.workspaceId':c.workspaceId,'n.userId':c.userId});
 if(!canReadWorkflowRecords(c,'customer_schedule_change'))q.whereRaw('false');return q;
}
/** One current customer-safe projection and one durable receipt; no model call or polling. */
export async function processCustomerScheduleChange(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[],transport?:CustomerVisitTransport){
 try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
  const n=await trx('customerScheduleNotices as n').join('workflowSteps as s',p=>p.on('s.workspaceId','n.workspaceId').andOn('s.id','n.id')).join('workflows as w',p=>p.on('w.workspaceId','n.workspaceId').andOn('w.id','n.workflowId')).join('workspaces as ws','ws.id','n.workspaceId')
   .where({'n.workspaceId':workspaceId,'n.id':stepId,'n.status':'queued','s.status':'queued'}).where('s.dueAt','<=',trx.fn.now()).first('n.*','w.definition','w.status as workflowStatus','w.publisherId','w.deletedAt','ws.timezone');
  if(!n){await trx('workflowSteps as s').where({'s.workspaceId':workspaceId,'s.id':stepId,'s.status':'queued','s.recordKind':'schedule_change'}).whereNotExists(trx('customerScheduleNotices as receipt').select(trx.raw('1')).whereRaw('receipt."workspaceId"=s."workspaceId" AND receipt.id=s.id')).update({status:'skipped'});return {delivered:0,deferred:false};}
  const finish=(status='skipped')=>trx('customerScheduleNotices').where({workspaceId,id:n.id,status:'queued'}).update({status});
  const definition=workflowDefinitionSchema.safeParse(n.definition);
  if(n.workflowStatus!=='active'||n.deletedAt||n.publisherId!==publisherId||!definition.success||definition.data.kind!=='customer_schedule_change'||!canPublishWorkflow(c,'customer_schedule_change')){await finish();return {delivered:0,deferred:false};}
  const refs=z.array(z.object({type:z.enum(['job','work_order']),id:z.uuid(),jobId:z.uuid()}).strict()).min(1).max(1000).safeParse(n.sourceRefs);
  async function notify(reason:string){const first=refs.success?refs.data[0]:z.object({jobId:z.uuid()}).safeParse(Array.isArray(n.sourceRefs)?n.sourceRefs[0]:null).data;if(!first)return;const job=await trx('jobs').where({workspaceId,id:first.jobId}).first('id');if(job)await trx('customerScheduleNotifications').insert({id:randomUUID(),workspaceId,noticeId:n.id,jobId:job.id,userId:publisherId,reason}).onConflict('noticeId').ignore();}
  if(!refs.success||n.sourceIssue){await notify(n.sourceIssue??'The visit links need a manual review.');await finish();return {delivered:0,deferred:false};}
  if(definition.data.timezone!==n.timezone){await notify('The workspace timezone changed. Review this workflow before sending schedule notices.');await finish();return {delivered:0,deferred:false};}
  const ids=[...new Set(refs.data.map(r=>r.jobId))];
  const jobs=await trx('jobs').where({workspaceId}).whereIn('id',ids).select('id','customerId','status');
  if(jobs.length!==ids.length||jobs.some(j=>j.customerId!==n.customerId)){await notify('The customer relationship changed. Review the visit before contacting the customer.');await finish();return {delivered:0,deferred:false};}
  const projection=(await trx.raw('SELECT workflow_schedule_projection(?,NULL,?::jsonb,?) states',[workspaceId,JSON.stringify(refs.data),n.customerId])).rows[0].states as {visitId:string;schedule:{date:string|null;arrivalWindow:string|null}}[];
  const states=new Set(projection.map(p=>JSON.stringify(p.schedule)));
  let current:unknown=projection[0]?.schedule.date?projection[0].schedule:null;
  if(!projection.length){const canceledOrder=refs.data.filter(r=>r.type==='work_order').map(r=>r.id);const canceled=jobs.some(j=>j.status==='canceled')||canceledOrder.length>0&&!!await trx('workOrders').where({workspaceId,status:'canceled'}).whereIn('id',canceledOrder).first('id');if(!canceled){await finish();return {delivered:0,deferred:false};}current=null;}
  const snapshot=scheduleChangeSnapshotSchema.safeParse({before:n.before,after:n.after});
  // JSON object property order cannot define schedule equality.
  const same=(a:unknown,b:unknown)=>{const x=z.object({date:z.string(),arrivalWindow:z.string().nullable()}).nullable().safeParse(a),y=z.object({date:z.string(),arrivalWindow:z.string().nullable()}).nullable().safeParse(b);return x.success&&y.success&&(x.data?.date??null)===(y.data?.date??null)&&(x.data?.arrivalWindow??null)===(y.data?.arrivalWindow??null);};
  if(states.size>1||!snapshot.success||!same(current,n.after)||same(n.before,n.after)){await notify('The current visit no longer matches this saved update.');await finish();return {delivered:0,deferred:false};}
  const today=(await trx.raw(`SELECT to_char(statement_timestamp() AT TIME ZONE ?,'YYYY-MM-DD') date`,[definition.data.timezone])).rows[0].date;
  if(snapshot.data.before.date<today&&(!snapshot.data.after||snapshot.data.after.date<today)){await finish();return {delivered:0,deferred:false};}
  const customer=await trx('customers').where({workspaceId,id:n.customerId}).first('name','email','archivedAt');
  if(!customer||customer.archivedAt||!customer.name.trim()||!z.email().safeParse(customer.email).success){await notify('Customer email or contact details are missing or unavailable.');await finish();return {delivered:0,deferred:false};}
  const preferences=await trx('customerSchedulePreferences').where({workspaceId,customerId:n.customerId}).first('disabled');if(preferences?.disabled){await finish();return {delivered:0,deferred:false};}
  const setup=await scheduleChangeOptions(trx,c,transport?.baseURL??process.env.BETTER_AUTH_URL??'');
  if(!setup.senderReady||!contactReady(setup.company)){await notify('Company email settings need attention.');await finish();return {delivered:0,deferred:false};}
  if(!transport)throw Error('Customer schedule updates require a configured transport.');
  const hash=digest(JSON.stringify([customer.name,customer.email,setup.company,configuredEmailSender(transport.baseURL),snapshot.data,definition.data.timezone]));
  if(n.payloadHash&&n.payloadHash!==hash){await notify('Customer or email details changed during a delivery retry.');await finish();return {delivered:0,deferred:false};}
  await trx('customerScheduleNotices').where({workspaceId,id:n.id}).update({payloadHash:hash});const attempts=n.attempts+1;
  try{await transport.send({to:customer.email,...renderCustomerScheduleChange({baseURL:transport.baseURL,token:n.token,company:setup.company.name,phone:setup.company.phone,email:setup.company.email,name:customer.name,timezone:definition.data.timezone,snapshot:snapshot.data}),replyTo:setup.company.email,idempotencyKey:`customer-schedule-${n.id}-${hash}`});await trx('customerScheduleNotices').where({workspaceId,id:n.id}).update({status:'sent',attempts,sentAt:trx.fn.now()});return {delivered:1,deferred:false};}
  catch{const failed=attempts>=5;await trx('customerScheduleNotices').where({workspaceId,id:n.id}).update({status:failed?'failed':'queued',attempts,dueAt:new Date(Date.now()+60000*2**(attempts-1))});if(failed)await notify('The customer schedule update could not be delivered.');return {delivered:0,deferred:false};}
 });}catch(e){if(e instanceof WorkspaceSuspendedError)return {delivered:0,deferred:true};if(!(e instanceof AuthorizationAccessError))throw e;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
export async function unsubscribeScheduleChanges(db:Knex,token:string){
 if(!/^[a-f0-9]{64}$/.test(token))return false;
 return db.transaction(async trx=>{const row=await trx('customerScheduleNotices').where({unsubscribeHash:digest(token)}).first('workspaceId','customerId');if(!row)return false;await trx('workspaces').where({id:row.workspaceId}).forUpdate().first('id');await trx('customerSchedulePreferences').insert({...row,disabled:true}).onConflict(['workspaceId','customerId']).merge({disabled:true});await trx('customerScheduleNotices').where({...row,status:'queued'}).update({status:'skipped'});return true;});
}
