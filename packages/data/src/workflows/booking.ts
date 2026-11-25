import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { workflowDefinitionSchema, type AuthorizationContext, type WorkspaceRole, type PermissionId } from '@salesmora/contracts';
import { canSelectWorkflowWorker,canPublishWorkflow, canReceiveWorkflow } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation, withWorkspaceAuthorization } from '../authorization/store';
import { WorkflowDraftError } from './recipients';
import { workflowParticipantsEligible } from './execution';
import { bookCalendarJob } from '../calendar/booking';

export const canSelectBookingWorkers=canSelectWorkflowWorker;
export async function routineBookingOptions(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!canPublishWorkflow(context,'routine_booking')) throw new AuthorizationAccessError();
  const facts=(await trx.raw(`SELECT
    (SELECT coalesce(jsonb_agg(jsonb_build_object('service',service,'name',name,'qualified',(SELECT count(*)::int FROM "serviceQualifiedWorkers" q JOIN users u ON u.id=q."personId" WHERE q."workspaceId"="workspaceServices"."workspaceId" AND q."serviceId"="workspaceServices".id AND u."deletionRequestedAt" IS NULL AND u."suspendedAt" IS NULL)) ORDER BY name),'[]'::jsonb) FROM "workspaceServices" WHERE "workspaceId"=? AND "archivedAt" IS NULL) AS services,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name,'role',m.role) ORDER BY u.name,u.id),'[]'::jsonb) FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=? AND u."deletionRequestedAt" IS NULL AND u."suspendedAt" IS NULL) AS people,
    EXISTS(SELECT 1 FROM "calendarPersonAvailability" a JOIN "workspaceMemberships" m ON m."workspaceId"=a."workspaceId" AND m."userId"=a."personId" JOIN users u ON u.id=m."userId" WHERE a."workspaceId"=? AND u."deletionRequestedAt" IS NULL AND u."suspendedAt" IS NULL AND a.availability->'weeklyHours' IS NOT NULL AND a.availability->'weeklyHours'<>'null'::jsonb) AS hours`,[context.workspaceId,context.workspaceId,context.workspaceId])).rows[0];
  const services: {service:string;name:string;qualified:number}[]=facts.services,people:{id:string;name:string;role:WorkspaceRole}[]=facts.people,hours=facts.hours;
  return { canSelectWorkers:canSelectBookingWorkers(context),qualifiedWorkerCounts:Object.fromEntries(services.map(s=>[s.service,s.qualified])),services: services.map(row=>({ value:row.service as string,label:row.name as string })), availabilityReady:!!hours,
    recipients:people.filter(p=>canReceiveWorkflow({...context,userId:p.id,membership:{workspaceId:context.workspaceId,userId:p.id,role:p.role}},'routine_booking')).map(p=>({id:p.id as string,name:p.name as string})) };
}
export async function assertRoutineBooking(trx: Knex.Transaction,context: AuthorizationContext,service:string,exceptId?:string,checkActive=true,requireHours=true,assignmentMode?:'assigned'|'qualified_if_unassigned') {
  const options=await routineBookingOptions(trx,context);
  if(!options.services.some(item=>item.value===service)) throw new WorkflowDraftError('Choose a current service from your workspace.');
  if(assignmentMode==='qualified_if_unassigned'){if(!canSelectBookingWorkers(context))throw new AuthorizationAccessError();if(requireHours&&!options.qualifiedWorkerCounts[service])throw new WorkflowDraftError('Choose qualified workers for this service in Settings before publishing.');}
  if(requireHours&&!options.availabilityReady) throw new WorkflowDraftError('Set working hours in Calendar before publishing this booking workflow.');
  const existing=checkActive?await trx('workflows').where({workspaceId:context.workspaceId,status:'active'}).whereNull('deletedAt').whereRaw("definition->>'kind'='routine_booking' AND definition->>'service'=?",[service]).modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'):undefined;
  if(existing)throw new WorkflowDraftError('This service already has an active booking workflow. Edit or pause it first.');
}
export async function readRoutineBookingOptions(db:Knex,identity:{workspaceId:string;userId:string},enabled:readonly PermissionId[]) {
  return withWorkspaceAuthorization(db,identity,enabled,false,(trx,context)=>routineBookingOptions(trx,context));
}
export async function processRoutineBookingStep(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]) {
  try { return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,context)=>{
    const row=await trx('workflowSteps as s').join('workflows as w',q=>q.on('w.workspaceId','s.workspaceId').andOn('w.id','s.workflowId')).join('jobs as j',q=>q.on('j.workspaceId','s.workspaceId').andOn('j.id','s.jobId'))
      .where({'s.workspaceId':workspaceId,'s.id':stepId,'s.status':'queued','w.status':'active'}).where('s.dueAt','<=',trx.fn.now())
      .select('s.workflowId','s.jobId','s.bookingAttemptId','s.bookingResult','w.version','w.definition','w.publisherId','w.enrollAfter','j.createdAt','j.service','j.serviceId','w.serviceId as workflowServiceId',
        trx.raw(`to_char(s."bookingFrom",'YYYY-MM-DD') AS "fromDate",to_char(s."bookingThrough",'YYYY-MM-DD') AS "throughDate"`)).first();
    if(!row)return {delivered:0,deferred:false};
    const definition=workflowDefinitionSchema.parse(row.definition);
    if(definition.kind!=='routine_booking'||row.publisherId!==context.userId||!await workflowParticipantsEligible(trx,context,definition,row.publisherId)||new Date(row.createdAt)<=new Date(row.enrollAfter))throw new AuthorizationAccessError();
    if(definition.assignmentMode==='qualified_if_unassigned'&&!canSelectBookingWorkers(context))throw new AuthorizationAccessError();
    const workspace=await trx('workspaces').where({id:workspaceId}).select('timezone',trx.raw(`to_char(now() AT TIME ZONE timezone,'YYYY-MM-DD') AS today`)).first();
    const service=await trx('workspaceServices').where({workspaceId,service:definition.service}).whereNull('archivedAt').first('service');
    if(!service||!row.serviceId||row.serviceId!==row.workflowServiceId||workspace.timezone!==definition.timezone||row.throughDate<=workspace.today){
      await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'skipped'});
      if(!service||workspace.timezone!==definition.timezone)await trx('workflows').where({id:row.workflowId,workspaceId}).update({executionIssue:'Service or timezone changed. Edit this workflow to review its booking settings.'});
      return {delivered:0,deferred:false};
    }
    const result=await bookCalendarJob(trx,{workspaceId,userId:context.userId},enabled,{workspaceId,jobId:row.jobId,submissionId:row.bookingAttemptId,rules:definition.rules},{fromDate:row.fromDate,throughDate:row.throughDate,...(definition.assignmentMode?{assignmentMode:definition.assignmentMode}:{})});
    if(result.status==='no_slot' && result.reasons.includes('ineligible')) {await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'skipped',bookingResult:JSON.stringify(result)});return {delivered:0,deferred:false};}
    const event=result.status==='booked'?'booked':'no_slot';
    const [notice]=await trx('workflowBookingNotifications').insert({workspaceId,workflowId:row.workflowId,stepId,jobId:row.jobId,userId:definition.recipientId,event,
      snapshot:JSON.stringify({result,timezone:definition.timezone,throughDate:row.throughDate}),inApp:definition.notifications?.inApp??true,emailStatus:definition.notifications?.email?'queued':'skipped'})
      .onConflict(['stepId','userId','event']).ignore().returning('id');
    if(result.status==='booked') {
      await trx('workflowBookingNotifications').where({workspaceId,stepId,event:'no_slot'}).update({readAt:trx.fn.now(),emailStatus:trx.raw("CASE WHEN \"emailStatus\"='queued' THEN 'skipped' ELSE \"emailStatus\" END")});
      // Coalesce the scheduling contact's ordinary notice before either channel can be delivered.
      await trx('visitNotifications').where({workspaceId,userId:definition.recipientId,operationId:row.bookingAttemptId}).delete();
      await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'completed',bookingResult:JSON.stringify(result)});
    } else {
      const permanent=false;
      const next=trx.raw(`((now() AT TIME ZONE ?)::date + 1)::timestamp AT TIME ZONE ?`,[definition.timezone,definition.timezone]);
      await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:permanent?'skipped':'queued',bookingResult:JSON.stringify(result),dueAt:next,bookingAttemptId:randomUUID()});
    }
    await trx('workflows').where({workspaceId,id:row.workflowId}).update({executionIssue:null});
    return {delivered:notice?1:0,deferred:false};
  }); } catch(error) {
    if(!(error instanceof AuthorizationAccessError))throw error;
    await db.transaction(async trx=>{await trx('workspaces').where({id:workspaceId}).forUpdate().first('id');await trx('workflows').where({workspaceId}).whereIn('id',trx('workflowSteps').where({workspaceId,id:stepId}).select('workflowId')).update({executionIssue:'Booking could not run. Review workflow permissions and the notification recipient.'});await trx('workflowSteps').where({workspaceId,id:stepId,status:'queued'}).update({status:'skipped'});});
    return {delivered:0,deferred:false};
  }
}

export async function resolveRoutineBookingService(trx:Knex.Transaction,context:AuthorizationContext,reference:string) {
  if(!canPublishWorkflow(context,'routine_booking'))throw new AuthorizationAccessError();
  const rows:{id:string;service:string;name:string}[]=await trx('workspaceServices').where({workspaceId:context.workspaceId}).whereNull('archivedAt').select('id','service','name').orderBy('name');
  const identified=rows.find(row=>row.id===reference);if(identified)return identified.service;
  const named=rows.filter(row=>row.name.toLowerCase()===reference.trim().toLowerCase());if(named.length===1)return named[0].service;
  const exact=rows.find(row=>row.service===reference);if(exact)return exact.service;
  const matches=rows.filter(row=>(row.service.toLowerCase()===reference.trim().toLowerCase()||row.name.toLowerCase()===reference.trim().toLowerCase()));if(matches.length===1)return matches[0].service;
  throw new WorkflowDraftError(`Choose an exact service from your workspace${rows.length?': '+rows.slice(0,5).map(row=>row.name).join(', '):'. Add a service in business settings first.'}`);
}
