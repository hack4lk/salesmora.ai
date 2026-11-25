import {randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {completionHandoffSnapshotSchema,completionHandoffOptionsSchema,workflowDefinitionSchema,type AuthorizationContext,type PermissionId,type WorkspaceRole} from '@salesmora/contracts';
import {canPublishWorkflow,canReceiveWorkflow,canReadWorkflowRecords} from '@salesmora/domain';
import {AuthorizationAccessError,WorkspaceSuspendedError,withCurrentWorkspaceMutation,withWorkspaceAuthorization} from '../authorization/store';
import {workflowParticipantsEligible} from './execution';
import type {EmailMessage} from '../email/transport';
import {renderCompletionHandoffEmail} from '../email/workflow-completion-handoff';
import {withoutSuspendedWorkspaces} from '../accounts/workspace-hold';
export async function completionHandoffOptions(trx:Knex.Transaction,c:AuthorizationContext){
 if(!canPublishWorkflow(c,'completion_handoff'))throw new AuthorizationAccessError();
 const members=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where('m.workspaceId',c.workspaceId).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').orderBy('u.name').orderBy('u.id').select<{id:string;name:string;role:WorkspaceRole}[]>('u.id','u.name','m.role').limit(500);
 const roles=new Map<WorkspaceRole,boolean>();return completionHandoffOptionsSchema.parse({recipients:members.filter(p=>{if(!roles.has(p.role))roles.set(p.role,canReceiveWorkflow({...c,userId:p.id,membership:{workspaceId:c.workspaceId,userId:p.id,role:p.role}},'completion_handoff'));return roles.get(p.role);}).map(({id,name})=>({id,name}))});
}
const currentCompletion=`(SELECT a.id FROM "jobActivity" a WHERE a."workspaceId"=j."workspaceId" AND a."jobId"=j.id AND a.type='status' AND a.changes->>'to'='completed' ORDER BY a."createdAt" DESC,a.id DESC LIMIT 1)`;
export function handoffNotificationQuery(trx:Knex.Transaction,c:AuthorizationContext,emailOnly=false){
 const q=trx('workflowHandoffNotifications as n').join('workflows as w',j=>j.on('w.workspaceId','n.workspaceId').andOn('w.id','n.workflowId')).join('jobs as j',r=>r.on('j.workspaceId','n.workspaceId').andOn('j.id','n.jobId')).where({'n.workspaceId':c.workspaceId,'n.userId':c.userId,'w.status':'active','j.status':'completed'}).whereNull('w.deletedAt').whereRaw(`w.version=n."workflowVersion" AND n."completionActivityId"=${currentCompletion}`).whereExists(trx('workOrders as wo').select(trx.raw('1')).whereRaw('wo."workspaceId"=j."workspaceId" AND wo."jobId"=j.id').whereNull('wo.archivedAt').whereIn('wo.status',['draft','issued','in-progress']));
 if(!emailOnly)q.where('n.inApp',true);if(!canReadWorkflowRecords(c,'completion_handoff'))q.whereRaw('false');return q;
}
export async function processCompletionHandoffStep(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]){
 try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
  const s=await trx('workflowSteps as s').join('workflows as w',j=>j.on('w.workspaceId','s.workspaceId').andOn('w.id','s.workflowId')).join('jobs as j',r=>r.on('j.workspaceId','s.workspaceId').andOn('j.id','s.jobId')).where({'s.workspaceId':workspaceId,'s.id':stepId,'s.status':'queued','s.recordKind':'handoff'}).where('s.dueAt','<=',trx.fn.now()).select('s.*','w.definition','w.publisherId','w.version as workflowVersion','w.status as workflowStatus','w.deletedAt',trx.raw(`j.status='completed' AND s."completionActivityId"=${currentCompletion} eligible`),trx.raw('workflow_handoff_snapshot(j."workspaceId",j.id) snapshot')).first();
  if(!s)return {delivered:0,deferred:false};
  const def=workflowDefinitionSchema.safeParse(s.definition),snapshot=completionHandoffSnapshotSchema.safeParse(s.snapshot);
  if(s.workflowStatus!=='active'||s.deletedAt||!s.eligible||!def.success||def.data.kind!=='completion_handoff'||!snapshot.success||!s.publisherId||!await workflowParticipantsEligible(trx,c,def.data,s.publisherId)){await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
  const inserted=await trx('workflowHandoffNotifications').insert({id:randomUUID(),workspaceId,workflowId:s.workflowId,workflowVersion:s.workflowVersion,stepId,jobId:s.jobId,completionActivityId:s.completionActivityId,userId:def.data.recipientId,snapshot:JSON.stringify(snapshot.data),inApp:def.data.notifications?.inApp??true,emailStatus:def.data.notifications?.email?'queued':'skipped'}).onConflict('stepId').ignore().returning('id');
  await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'completed'});return {delivered:inserted.length,deferred:false};
 });}catch(e){if(e instanceof WorkspaceSuspendedError)return {delivered:0,deferred:true};if(!(e instanceof AuthorizationAccessError))throw e;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
export async function processCompletionHandoffEmail(db:Knex,enabled:readonly PermissionId[],target:{workspaceId:string;id:string},baseURL:string,send:(m:EmailMessage)=>Promise<unknown>){
 const identity=await withoutSuspendedWorkspaces(db('workflowHandoffNotifications'),'workflowHandoffNotifications.workspaceId').where({...target,emailStatus:'queued'}).where('nextAttemptAt','<=',db.fn.now()).first('userId');if(!identity)return;
 try{await withWorkspaceAuthorization(db,{workspaceId:target.workspaceId,userId:identity.userId},enabled,false,async(trx,c)=>{
  const queued=await trx('workflowHandoffNotifications').where({...target,emailStatus:'queued'}).where('nextAttemptAt','<=',trx.fn.now()).forUpdate().skipLocked().first();if(!queued)return;
  const row=await handoffNotificationQuery(trx,c,true).join('users as u','u.id','n.userId').leftJoin('notificationPreferences as p','p.userId','u.id').where('n.id',target.id).select(trx.raw('workflow_handoff_snapshot(j."workspaceId",j.id) snapshot'),'w.definition','w.publisherId','u.email','u.emailVerified','p.jobActivityEmail').first(),def=workflowDefinitionSchema.safeParse(row?.definition),snapshot=completionHandoffSnapshotSchema.safeParse(row?.snapshot);
  if(!row?.emailVerified||row.jobActivityEmail===false||!def.success||def.data.kind!=='completion_handoff'||!def.data.notifications?.email||def.data.recipientId!==c.userId||!snapshot.success||!row.publisherId||!await workflowParticipantsEligible(trx,c,def.data,row.publisherId)){await trx('workflowHandoffNotifications').where(target).update({emailStatus:'skipped'});return;}
  const attempts=queued.attempts+1;try{await send({to:row.email,...renderCompletionHandoffEmail({baseURL,workspaceId:c.workspaceId,snapshot:snapshot.data}),idempotencyKey:`completion-handoff-${target.id}`});await trx('workflowHandoffNotifications').where(target).update({emailStatus:'sent',attempts,sentAt:trx.fn.now()});}catch{await trx('workflowHandoffNotifications').where(target).update({emailStatus:attempts>=5?'failed':'queued',attempts,nextAttemptAt:new Date(Date.now()+60000*2**(attempts-1))});}
 });}catch(e){if(e instanceof WorkspaceSuspendedError)return;if(!(e instanceof AuthorizationAccessError))throw e;await db('workflowHandoffNotifications').where({...target,emailStatus:'queued'}).update({emailStatus:'skipped'});}
}
