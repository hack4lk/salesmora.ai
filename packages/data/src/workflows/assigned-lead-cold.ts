import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { workflowDefinitionSchema, type AuthorizationContext, type PermissionId, type WorkflowDefinition, type WorkspaceRole } from '@salesmora/contracts';
import { canPublishWorkflow, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation } from '../authorization/store';
export type ColdLeadDefinition=Extract<WorkflowDefinition,{kind:'assigned_lead_cold'}>;
/** One bounded membership projection checks the current publisher and current dynamic/fixed recipient. */
export async function coldLeadRecipient(trx:Knex.Transaction,c:AuthorizationContext,d:ColdLeadDefinition,publisherId:string,ownerId:string){
 const recipientId=d.recipientMode==='owner'?ownerId:d.recipientId!;
 const people=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where('m.workspaceId',c.workspaceId).whereIn('m.userId',[publisherId,recipientId,ownerId]).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').select<{userId:string;role:WorkspaceRole}[]>('m.userId','m.role');
 const publisher=people.find(p=>p.userId===publisherId),recipient=people.find(p=>p.userId===recipientId);
 if(!publisher||!recipient||!people.some(p=>p.userId===ownerId))return;
 const forPerson=(p:{userId:string;role:WorkspaceRole})=>({...c,userId:p.userId,membership:{...p,workspaceId:c.workspaceId}});
 if(!canPublishWorkflow(forPerson(publisher),'assigned_lead_cold'))return;
 const scope=resolveAuthorizedCollectionScope(forPerson(recipient),'leads.read');
 return scope.allowed&&(scope.scope==='workspace'||d.recipientMode==='owner'&&scope.scope==='assigned'&&recipientId===ownerId)?recipientId:undefined;
}
export async function processAssignedLeadCold(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]){
 try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
  const step=await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).where('dueAt','<=',trx.fn.now()).first();if(!step)return {delivered:0,deferred:false};
  const w=await trx('workflows as w').join('workspaces as ws','ws.id','w.workspaceId').where({'w.workspaceId':workspaceId,'w.id':step.workflowId}).first('w.*','ws.timezone as currentTimezone');const parsed=workflowDefinitionSchema.safeParse(w?.definition);
  if(!w||w.status!=='active'||w.deletedAt||!parsed.success||parsed.data.kind!=='assigned_lead_cold'||parsed.data.timezone!==w.currentTimezone||!canPublishWorkflow(c,'assigned_lead_cold')){await trx('workflowSteps').where({workspaceId,id:stepId}).update({status:'skipped'});return {delivered:0,deferred:false};}
  const d=parsed.data;
  if(step.recordKind==='cold_lead_init'){
   const rows=await trx('leads').where({workspaceId}).whereNotNull('ownerId').whereNull('archivedAt').whereIn('stage',['new','contacted','estimate-sent']).modify(q=>{if(step.cursorId)q.where('id','>',step.cursorId);}).select<{id:string}[]>('id').orderBy('id').limit(100);
   if(rows.length)await trx.raw('SELECT workflow_cold_lead_sync(?,id,?) FROM unnest(?::uuid[]) id',[workspaceId,w.id,rows.map(r=>r.id)]);
   await trx('workflowSteps').where({workspaceId,id:stepId}).update({status:rows.length===100?'queued':'completed',dueAt:trx.fn.now(),...(rows.length?{cursorId:rows.at(-1)!.id}:{})});return {delivered:0,deferred:false};
  }
  const lead=await trx('leads').where({workspaceId,id:step.leadId}).whereNull('archivedAt').whereIn('stage',['new','contacted','estimate-sent']).where({ownerId:step.coldOwnerId}).whereRaw('"lastActivityAt"=(SELECT "triggeredAt" FROM "workflowSteps" WHERE "workspaceId"=? AND id=?)',[workspaceId,stepId]).first('id','ownerId');
  const recipient=lead?await coldLeadRecipient(trx,c,d,publisherId,lead.ownerId):undefined;
  if(!lead||!recipient){await trx('workflowSteps').where({workspaceId,id:stepId}).update({status:'skipped'});return {delivered:0,deferred:false};}
  const notices=await trx('leadWorkflowNotifications').insert({id:randomUUID(),workspaceId,workflowId:w.id,workflowVersion:w.version,leadId:lead.id,ownerId:lead.ownerId,userId:recipient,activityAt:trx.raw('(SELECT "triggeredAt" FROM "workflowSteps" WHERE "workspaceId"=? AND id=?)',[workspaceId,stepId]),businessDays:d.businessDays,inApp:d.notifications?.inApp??true,emailStatus:d.notifications?.email?'queued':'skipped'}).onConflict().ignore().returning('id');
  await trx('workflowSteps').where({workspaceId,id:stepId}).update({status:'completed'});return {delivered:notices.length,deferred:false};
 });}catch(error){if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}

export async function assignedLeadColdOptions(trx:Knex.Transaction,c:AuthorizationContext){
 if(!canPublishWorkflow(c,'assigned_lead_cold'))throw new AuthorizationAccessError();
 const people=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where('m.workspaceId',c.workspaceId).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').select<{id:string;name:string;role:WorkspaceRole}[]>('u.id','u.name','m.role').orderBy('u.name').limit(500);
 const roles=new Map<WorkspaceRole,boolean>();return {recipients:people.filter(p=>{if(!roles.has(p.role)){const scope=resolveAuthorizedCollectionScope({...c,userId:p.id,membership:{workspaceId:c.workspaceId,userId:p.id,role:p.role}},'leads.read');roles.set(p.role,scope.allowed&&scope.scope==='workspace');}return roles.get(p.role);}).map(({id,name})=>({id,name}))};
}
