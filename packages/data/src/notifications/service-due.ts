import type {Knex} from 'knex';
import {workflowDefinitionSchema,type AuthorizationContext,type PermissionId} from '@salesmora/contracts';
import {canReadWorkflowRecords} from '@salesmora/domain';
import {AuthorizationAccessError,WorkspaceSuspendedError,withWorkspaceAuthorization} from '../authorization/store';
import {workflowParticipantsEligible} from '../workflows/execution';
import {dueRows,openServiceWork,canSendServiceEmail,dueCompany} from '../workflows/service-due';
import {withoutSuspendedWorkspaces} from '../accounts/workspace-hold';
import type {EmailMessage} from '../email/transport';
import {configuredEmailSender} from '../email/transport';
import {renderServiceDueEmail,renderServiceOutreachEmail} from '../email/workflow-service-due';
export function serviceDueNotificationQuery(trx:Knex.Transaction,c:AuthorizationContext,emailOnly=false){const q=trx('workflowServiceDueNotifications as n').join('workflows as w',j=>j.on('w.workspaceId','n.workspaceId').andOn('w.id','n.workflowId')).join('workspaceServices as service',j=>j.on('service.workspaceId','w.workspaceId').andOn('service.id','w.serviceId')).where({'n.workspaceId':c.workspaceId,'n.userId':c.userId,'w.status':'active'}).whereNull('w.deletedAt').whereNull('service.archivedAt').whereRaw('w.version=n."workflowVersion"');q.whereRaw(`(w.definition->>'kind'<>'annual_service_review' OR n."createdAt">=coalesce((SELECT max(s."triggeredAt") FROM "workflowSteps" s WHERE s."workspaceId"=w."workspaceId" AND s."workflowId"=w.id AND s."recordKind"='annual_review' AND s.status='completed'),n."createdAt"))`);if(!emailOnly)q.where('n.inApp',true);if(!canReadWorkflowRecords(c,'service_due'))q.whereRaw('false');return q;}
export async function processServiceDueEmail(db:Knex,enabled:readonly PermissionId[],target:{id:string;workspaceId:string},customer:boolean,baseURL:string,send:(message:EmailMessage)=>Promise<unknown>){
 const table=customer?'serviceOutreachDeliveries':'workflowServiceDueNotifications';
 const identity=await withoutSuspendedWorkspaces(db(table),`${table}.workspaceId`).where({...target,emailStatus:'queued'}).where('nextAttemptAt','<=',db.fn.now()).first('userId');if(!identity)return;
 try{await withWorkspaceAuthorization(db,{workspaceId:target.workspaceId,userId:identity.userId},enabled,false,async(trx,c)=>{
  const n=await trx(table).where({...target,emailStatus:'queued'}).where('nextAttemptAt','<=',trx.fn.now()).forUpdate().skipLocked().first();if(!n)return;
  const w=await trx('workflows as w').join('workspaceServices as s',q=>q.on('s.workspaceId','w.workspaceId').andOn('s.id','w.serviceId')).join('workspaces as ws','ws.id','w.workspaceId').where({'w.id':n.workflowId,'w.workspaceId':c.workspaceId}).select('w.*','s.name as serviceName','s.archivedAt','ws.timezone as currentTimezone','ws.businessPhone').first();
  const def=workflowDefinitionSchema.safeParse(w?.definition);let valid=!!w&&w.status==='active'&&!w.deletedAt&&!w.archivedAt&&w.version===n.workflowVersion&&def.success&&['service_due','annual_service_review'].includes(def.data.kind)&&def.data.timezone===w.currentTimezone&&await workflowParticipantsEligible(trx,c,def.data,w.publisherId);
  let message:EmailMessage|undefined;
  if(customer&&valid){
   valid=canSendServiceEmail(c);const row=await dueRows(trx,c,w.id).where({'d.id':n.cycleId,'d.status':'due','d.version':n.cycleVersion}).whereRaw(`NOT ${openServiceWork}`).where(q=>q.whereNull('p.unsubscribed').orWhere('p.unsubscribed',false)).first('cust.email');
   const stored=await trx('serviceEmailReviews as r').join('serviceEmailTemplates as t',j=>j.on('t.workspaceId','r.workspaceId').andOnVal('t.serviceId',w.serviceId).andOnVal('t.purpose',def.success&&def.data.kind==='annual_service_review'?'annual':'repeat')).where({'r.workspaceId':c.workspaceId,'r.id':n.reviewId}).first('r.review','r.tokens','r.companyVersion','t.version as templateVersion');const company=await dueCompany(trx,c,w.businessPhone);
   valid=valid&&!!row&&row.email===n.address&&!!stored&&stored.review.templateVersion===stored.templateVersion&&stored.companyVersion===company.version&&stored.tokens.company.phone===company.phone&&stored.tokens.company.email===company.email&&stored.review.from===configuredEmailSender(baseURL);
   if(valid)message={to:n.address,...renderServiceOutreachEmail({baseURL,subject:n.subject,body:n.body,unsubscribeToken:stored.tokens.unsubscribe[n.cycleId]}),replyTo:n.replyTo,idempotencyKey:`service-outreach-${n.id}`};
  }else if(!customer&&valid){const user=await trx('users as u').leftJoin('notificationPreferences as p','p.userId','u.id').where('u.id',c.userId).first('u.email','u.emailVerified','p.jobActivityEmail');valid=!!user?.emailVerified&&user.jobActivityEmail!==false&&def.success&&!!def.data.notifications?.email&&def.data.recipientId===c.userId;
   if(valid)message={to:user.email,...renderServiceDueEmail({baseURL,workspaceId:c.workspaceId,workflowId:w.id,service:w.serviceName,count:n.count,annual:def.success&&def.data.kind==='annual_service_review'}),idempotencyKey:`service-due-${n.id}`};
  }
  if(!valid||!message){await trx(table).where({id:n.id}).update({emailStatus:'skipped'});if(customer)await trx('workflowServiceDueCycles').where({workspaceId:c.workspaceId,id:n.cycleId,emailStatus:'queued'}).update({emailStatus:'failed'});return;}
  const attempts=n.attempts+1;try{await send(message);await trx(table).where({id:n.id}).update({emailStatus:'sent',attempts,sentAt:trx.fn.now()});if(customer)await trx('workflowServiceDueCycles').where({workspaceId:c.workspaceId,id:n.cycleId}).update({emailStatus:'sent'});}
  catch{const failed=attempts>=5;await trx(table).where({id:n.id}).update({emailStatus:failed?'failed':'queued',attempts,nextAttemptAt:new Date(Date.now()+60000*2**(attempts-1))});if(customer&&failed)await trx('workflowServiceDueCycles').where({workspaceId:c.workspaceId,id:n.cycleId}).update({emailStatus:'failed'});}
 });}catch(e){if(e instanceof WorkspaceSuspendedError)return;if(!(e instanceof AuthorizationAccessError))throw e;const skipped=await db(table).where({...target,emailStatus:'queued'}).update({emailStatus:'skipped'}).returning(customer?'cycleId':'id');if(customer&&skipped.length)await db('workflowServiceDueCycles').where({workspaceId:target.workspaceId,id:skipped[0].cycleId,emailStatus:'queued'}).update({emailStatus:'failed'});}
}
