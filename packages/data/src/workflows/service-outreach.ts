import {createHash,randomBytes,randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {serviceDueCommandSchema,serviceEmailReviewSchema,serviceEmailTextSchema,type AuthorizationContext,type PermissionId,type ServiceEmailMessage} from '@salesmora/contracts';
import {authorize,validServiceEmail,previewServiceEmail,canEditWorkflow} from '@salesmora/domain';
import {AuthorizationAccessError,withCurrentWorkspaceMutation,type WorkspaceIdentity} from '../authorization/store';
import {WorkflowConflictError} from './store';
import {WorkflowDraftError} from './recipients';
import {dueWorkflow,dueCompany,dueRows,selectDueRows,dueCustomer,canSendServiceEmail,serviceDueOperation} from './service-due';
import {configuredEmailSender} from '../email/transport';
const digest=(value:unknown)=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export async function outreachFacts(trx:Knex.Transaction,c:AuthorizationContext,w:Awaited<ReturnType<typeof dueWorkflow>>){return {company:await dueCompany(trx,c,w.businessPhone),template:await trx('serviceEmailTemplates').where({workspaceId:c.workspaceId,serviceId:w.serviceId,purpose:w.definition.kind==='annual_service_review'?'annual':'repeat'}).first('id','version','subject','body')};}
async function eligibleMessages(trx:Knex.Transaction,c:AuthorizationContext,w:Awaited<ReturnType<typeof dueWorkflow>>,cycles:{id:string;version:number}[]){
 const rows=await dueRows(trx,c,w.id).whereIn('d.id',cycles.map(v=>v.id)).where('d.dueDate','<=',w.today).select(...selectDueRows(trx,w.definition.timezone));
 const sent=await trx('serviceOutreachDeliveries').where({workspaceId:c.workspaceId}).whereIn('cycleId',cycles.map(v=>v.id)).select('cycleId');
 return cycles.map(cycle=>{const raw=rows.find(r=>r.id===cycle.id),row=raw?dueCustomer(raw,w.today):undefined;const reason=!row?'Reminder no longer available':row.version!==cycle.version?'Reminder changed':row.exclusion??(row.status!=='due'&&row.status!=='failed'?'Reminder is not available for outreach':sent.some(s=>s.cycleId===cycle.id)?'Email already queued or attempted for this cycle':undefined);return {row,reason};});
}
function requireActive(w:Awaited<ReturnType<typeof dueWorkflow>>){if(w.status!=='active'||w.archivedAt||w.definition.timezone!==w.currentTimezone)throw new WorkflowDraftError('Resume and review the current workflow before continuing.');}
export async function changeServiceDue(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],workflowId:string,requestId:string,raw:unknown,baseURL:string){
 const command=serviceDueCommandSchema.parse(raw);if(command.action==='generate')throw new WorkflowDraftError('Use the draft endpoint.');
 return withCurrentWorkspaceMutation(db,identity,enabled,async(trx,c)=>{
  const w=await dueWorkflow(trx,c,workflowId);requireActive(w);
  if(command.action==='resolve'&&!canEditWorkflow(c,'service_due')||command.action!=='resolve'&&!canSendServiceEmail(c))throw new AuthorizationAccessError();
  return serviceDueOperation(trx,c,requestId,{workflowId,command},async()=>{
   const facts=await outreachFacts(trx,c,w);
   if(command.action==='company'){
    if(!authorize(c,{permission:'settings.business.update'}).allowed)throw new AuthorizationAccessError();if(command.expectedVersion!==facts.company.version)throw new WorkflowConflictError();
    await trx('serviceOutreachCompany').insert({workspaceId:c.workspaceId,version:facts.company.version+1,email:command.email,phone:command.phone}).onConflict('workspaceId').merge({version:facts.company.version+1,email:command.email,phone:command.phone});await trx('workspaces').where({id:c.workspaceId}).update({businessPhone:command.phone});return {ok:true};
   }
   if(command.action==='template'){
    if(w.definition.kind==='annual_service_review'&&/\{Due date\}/.test(command.text.subject+command.text.body))throw new WorkflowDraftError('Annual reviews do not establish a due date. Remove the Due date field.');
    if(command.serviceId!==w.serviceId||command.templateId!==facts.template.id||command.expectedVersion!==facts.template.version||!validServiceEmail(command.text))throw new WorkflowConflictError();
    await trx('serviceEmailTemplates').where({id:facts.template.id,workspaceId:c.workspaceId}).update({...command.text,version:facts.template.version+1});return {ok:true};
   }
   if(command.action==='resolve'){
    const row=await dueRows(trx,c,w.id).where('d.id',command.cycleId).first('d.version','d.status','d.emailStatus');if(!row||row.version!==command.expectedVersion||row.status!=='due'||row.emailStatus==='queued'||row.emailStatus==='sent')throw new WorkflowConflictError();
    if(command.resolution==='snooze'&&(!command.date||!/^\d{4}-\d{2}-\d{2}$/.test(command.date)||command.date<=w.today||!Number.isFinite(Date.parse(command.date))))throw new WorkflowDraftError('Choose a future reminder date.');
    await trx('workflowServiceDueCycles').where({workspaceId:c.workspaceId,id:command.cycleId}).update(command.resolution==='dismiss'?{status:'dismissed',version:row.version+1}:{reminderOn:command.date,notifiedAt:null,version:row.version+1});if(command.resolution==='snooze')await trx.raw('SELECT workflow_service_schedule(?,?,?::date)',[c.workspaceId,w.id,command.date]);return {ok:true};
   }
   const from=configuredEmailSender(baseURL),company=facts.company;
   const senderReady=!!from&&!!company.phone&&!!company.email;
   if(command.action==='prepare'){
    if(command.templateId!==facts.template.id||command.templateVersion!==facts.template.version)throw new WorkflowConflictError();
    const current=await eligibleMessages(trx,c,w,command.cycles),tokens:Record<string,string>={},messages:ServiceEmailMessage[]=[],excluded:{name:string;reason:string}[]=[],addresses=new Set<string>();
    for(const item of current){if(!item.row||item.reason){excluded.push({name:item.row?.name??'Unavailable customer',reason:item.reason??'Unavailable'});continue;}
     const row=item.row;if(addresses.has(row.email!.toLowerCase())){excluded.push({name:row.name,reason:'This email address is already selected'});continue;}addresses.add(row.email!.toLowerCase());tokens[row.id]=randomBytes(32).toString('base64url');
     messages.push({cycleId:row.id,cycleVersion:row.version,customerId:row.customerId,name:row.name,to:row.email!,...previewServiceEmail(facts.template,w.serviceName,row,company)});
    }
    const id=randomUUID(),revision=randomUUID(),expiresAt=new Date(Date.now()+15*60000).toISOString();const review=serviceEmailReviewSchema.parse({id,revision,expiresAt,templateId:facts.template.id,templateVersion:facts.template.version,from:from??'Email sender unavailable',replyTo:company.email,senderReady,messages,excluded});
    await trx('serviceEmailReviews').insert({id,workspaceId:c.workspaceId,workflowId:w.id,workflowVersion:w.version,actorId:c.userId,companyVersion:company.version,revision,review:JSON.stringify(review),tokens:JSON.stringify({unsubscribe:tokens,company}),expiresAt});return review;
   }
   const stored=await trx('serviceEmailReviews').where({workspaceId:c.workspaceId,id:command.reviewId,workflowId:w.id,actorId:c.userId}).forUpdate().first();
   if(!stored||stored.revision!==command.revision)throw new WorkflowConflictError();
   if(command.action==='send'&&stored.result)return stored.result;
   const review=serviceEmailReviewSchema.parse(stored.review);
   if(new Date(stored.expiresAt).getTime()<=Date.now()||stored.workflowVersion!==w.version||stored.companyVersion!==company.version||JSON.stringify([stored.tokens.company.version,stored.tokens.company.phone,stored.tokens.company.email])!==JSON.stringify([company.version,company.phone,company.email])||review.templateVersion!==facts.template.version||!senderReady||review.from!==from||review.replyTo!==company.email)throw new WorkflowConflictError();
   const current=await eligibleMessages(trx,c,w,review.messages.map(m=>({id:m.cycleId,version:m.cycleVersion})));
   if(current.some(item=>item.reason)||current.some(item=>{const message=review.messages.find(m=>m.cycleId===item.row!.id);return message?.to!==item.row!.email||message?.customerId!==item.row!.customerId;}))throw new WorkflowConflictError();
   if(command.action==='revise'){
    if(command.messages.length!==review.messages.length||command.messages.some(message=>{const old=review.messages.find(m=>m.cycleId===message.cycleId);return !old||old.cycleVersion!==message.cycleVersion||old.customerId!==message.customerId||old.to!==message.to||old.name!==message.name;} )||new Set(command.messages.map(m=>m.cycleId)).size!==review.messages.length)throw new WorkflowConflictError();
    const next=serviceEmailReviewSchema.parse({...review,messages:command.messages,revision:randomUUID()});await trx('serviceEmailReviews').where({id:stored.id}).update({revision:next.revision,review:JSON.stringify(next)});return next;
   }
   if(!review.messages.length)throw new WorkflowConflictError();
   const result=[];for(const message of review.messages){
    serviceEmailTextSchema.parse({subject:message.subject,body:message.body});if(/[{}]/.test(message.subject+message.body))throw new WorkflowDraftError('Fill in the company contact details before sending.');
    await trx('serviceOutreachDeliveries').insert({id:randomUUID(),workspaceId:c.workspaceId,workflowId:w.id,workflowVersion:w.version,userId:c.userId,cycleId:message.cycleId,cycleVersion:message.cycleVersion+1,customerId:message.customerId,reviewId:stored.id,address:message.to,subject:message.subject,body:message.body,replyTo:company.email,unsubscribeHash:digest(stored.tokens.unsubscribe[message.cycleId]),emailStatus:'queued'});
    await trx('workflowServiceDueCycles').where({workspaceId:c.workspaceId,id:message.cycleId,version:message.cycleVersion}).update({emailStatus:'queued',version:message.cycleVersion+1});result.push({cycleId:message.cycleId,name:message.name,status:'queued'});
   }
   await trx('serviceEmailReviews').where({id:stored.id}).update({result:JSON.stringify(result)});return result;
  });
 });
}
export async function unsubscribeServiceEmail(db:Knex,token:string){if(!/^[A-Za-z0-9_-]{43}$/.test(token))return false;return db.transaction(async trx=>{
 const row=await trx('serviceOutreachDeliveries').where({unsubscribeHash:digest(token)}).first('workspaceId','customerId');if(!row)return false;
 await trx('workspaces').where({id:row.workspaceId}).forUpdate().first('id');
 await trx('serviceOutreachPreferences').insert({...row,unsubscribed:true}).onConflict(['workspaceId','customerId']).merge({unsubscribed:true,updatedAt:trx.fn.now()});await trx('serviceOutreachDeliveries').where(row).where({emailStatus:'queued'}).update({emailStatus:'skipped'});return true;
 });}
