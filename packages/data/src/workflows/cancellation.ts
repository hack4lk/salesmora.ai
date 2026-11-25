import {createHash,randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {calendarAvailabilitySchema,calendarWeekdays,cancellationBookingSchema,cancellationOpeningResultSchema,workflowDefinitionSchema,type AuthorizationContext,type PermissionId,type WorkflowDefinition,type CancellationOpeningResult} from '@salesmora/contracts';
import {calendarWorkTimeSummary,addCalendarDays,canReadWorkflowRecords,canPublishWorkflow,findCommonCalendarSlot,CalendarRevisionError,type CalendarBookingBusy,type CalendarBookingInterval} from '@salesmora/domain';
import {AuthorizationAccessError,withCurrentWorkspaceMutation,withWorkspaceAuthorization,type WorkspaceIdentity} from '../authorization/store';
import {scopedCalendarRecordsQuery,readCalendarVisitInTransaction} from '../calendar/read';
import {resolveCalendarBookingWindows} from '../calendar/booking';
import {mutateJobInTransaction} from '../jobs/store';
import {scheduleCalendarVisitInTransaction} from '../calendar/commands';
import {workflowParticipantsEligible} from './execution';
import {WorkflowDraftError} from './recipients';

type Definition=Extract<WorkflowDefinition,{kind:'cancellation_fill'}>;
export async function cancellationOptions(trx:Knex.Transaction,context:AuthorizationContext){
 if(!canPublishWorkflow(context,'cancellation_fill'))throw new AuthorizationAccessError();
 const rows=(await trx.raw(`SELECT
 (SELECT coalesce(jsonb_agg(jsonb_build_object('value',service,'label',name) ORDER BY name),'[]') FROM "workspaceServices" WHERE "workspaceId"=? AND "archivedAt" IS NULL) services,
 (SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name,'role',m.role) ORDER BY u.name,u.id),'[]') FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=? AND u."deletionRequestedAt" IS NULL AND u."suspendedAt" IS NULL) people`,[context.workspaceId,context.workspaceId])).rows[0];
 return {services:rows.services,availabilityReady:true,recipients:rows.people.filter((p:{id:string;role:AuthorizationContext['membership']['role']})=>canReadWorkflowRecords({...context,userId:p.id,membership:{workspaceId:context.workspaceId,userId:p.id,role:p.role}},'cancellation_fill')).map((p:{id:string;name:string})=>({id:p.id,name:p.name}))};
}
export async function assertCancellation(trx:Knex.Transaction,context:AuthorizationContext,service:string,exceptId?:string,active=true){
 const options=await cancellationOptions(trx,context);
 if(!options.services.some((s:{value:string})=>s.value===service))throw new WorkflowDraftError('Choose a current workspace service.');
 if(active&&await trx('workflows').where({workspaceId:context.workspaceId,status:'active'}).whereNull('deletedAt').whereRaw("definition->>'kind'='cancellation_fill' AND definition->>'service'=?",[service]).modify(q=>{if(exceptId)q.whereNot('id',exceptId);}).first('id'))throw new WorkflowDraftError('This service already has a cancellation workflow. Edit or pause it first.');
}
export async function readCancellationOptions(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[]){return withWorkspaceAuthorization(db,identity,enabled,false,(trx,c)=>cancellationOptions(trx,c));}

async function openingRow(trx:Knex.Transaction,context:AuthorizationContext,id:string){
 if(!canReadWorkflowRecords(context,'cancellation_fill'))throw new AuthorizationAccessError();
 const row=await trx('workflowCancellationOpenings as o').join('workflows as w',q=>q.on('w.workspaceId','o.workspaceId').andOn('w.id','o.workflowId')).join('workspaceServices as c',q=>q.on('c.workspaceId','w.workspaceId').andOn('c.id','w.serviceId')).join('workspaces as ws','ws.id','o.workspaceId')
 .where({'o.id':id,'o.workspaceId':context.workspaceId}).select('o.*','w.status as workflowStatus','w.version as currentVersion','w.definition','w.publisherId','w.serviceId','w.deletedAt','c.name as serviceName','c.archivedAt','ws.timezone as currentTimezone',trx.raw(`to_char(o.date,'YYYY-MM-DD') date,to_char(now() AT TIME ZONE o.timezone,'YYYY-MM-DD') today, (o.date::timestamp AT TIME ZONE o.timezone) AS "expiresAt"`)).first();
 if(!row)throw new AuthorizationAccessError();
 row.definition=workflowDefinitionSchema.parse(row.definition);
 if(row.definition.kind!=='cancellation_fill')throw new AuthorizationAccessError();
 return row;
}
function openingState(row:Awaited<ReturnType<typeof openingRow>>):CancellationOpeningResult['state']{
 if(row.status==='filled')return 'filled';
 if(row.workflowStatus==='paused'&&!row.deletedAt)return 'paused';
 return row.status!=='open'||row.deletedAt||row.workflowStatus!=='active'||row.workflowVersion!==row.currentVersion||row.date<=row.today||row.archivedAt||row.timezone!==row.currentTimezone?'expired':'open';
}
/** Bounded candidates, one people/availability batch, one complete occupancy batch, one clock batch. */
async function suggestionsFor(trx:Knex.Transaction,context:AuthorizationContext,row:Awaited<ReturnType<typeof openingRow>>){
 const definition=row.definition as Definition,crew=row.crew as {id:string;name:string}[],crewIds=crew.map(p=>p.id);
 if(crewIds.length>100)return {suggestions:[],limited:true};
 const candidates=await trx('jobs as j').join('calendarVisitRecords as r',q=>q.on('r.workspaceId','j.workspaceId').andOn('r.jobId','j.id')).join('calendarVisits as v',q=>q.on('v.workspaceId','r.workspaceId').andOn('v.id','r.visitId'))
 .where({'j.workspaceId':context.workspaceId,'j.serviceId':row.serviceId,'j.status':'needs-scheduling'}).whereNull('j.scheduledDate').whereNull('v.scheduledDate').whereNull('r.endedAt').whereNotIn('j.id',row.sourceJobIds)
 .whereNotNull('j.postalCode').where('j.countryCode','US').where(q=>q.whereNull('j.completionDeadline').orWhere('j.completionDeadline','>=',row.date)).whereNotExists(trx('calendarVisitRecords as other').select(trx.raw('1')).whereRaw('other."workspaceId"=r."workspaceId" AND other."visitId"=r."visitId" AND other.id<>r.id').whereNull('other.endedAt'))
 .select('j.postalCode','j.countryCode','j.id','j.version','j.jobNumber','j.title','j.customerName','v.id as visitId',trx.raw(`ARRAY(SELECT DISTINCT p FROM unnest(ARRAY[j."primaryOwnerId"]::text[] || ARRAY(SELECT t."userId" FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id)) p WHERE p IS NOT NULL) people`)).orderBy('j.createdAt').orderBy('j.id').limit(101);
 const limited=candidates.length>100,pool=candidates.slice(0,100);
 if(!pool.length||!crewIds.length)return {suggestions:[],limited};
 const members=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').leftJoin('calendarPersonAvailability as a',q=>q.on('a.workspaceId','m.workspaceId').andOn('a.personId','m.userId')).leftJoin('serviceQualifiedWorkers as q',q=>q.on('q.workspaceId','m.workspaceId').andOn('q.personId','m.userId').andOnVal('q.serviceId',row.serviceId))
 .where('m.workspaceId',context.workspaceId).whereIn('m.userId',crewIds).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').select('m.userId','u.name','a.availability','a.timezone','q.priority',trx.raw(`ARRAY(SELECT p."postalCode" FROM "workspaceMemberPostalCodes" p WHERE p."workspaceId"=m."workspaceId" AND p."personId"=m."userId" AND p."countryCode"='US') AS coverage`)).orderBy('q.priority').orderBy('m.userId').forShare('u');
 const from=addCalendarDays(row.date,-2),to=addCalendarDays(row.date,2);
 const occupied=await trx.with('busy',scopedCalendarRecordsQuery(trx,context,{from,to})).from('busy').whereNotNull('scheduledDate').whereRaw('people && ?::text[]',[crewIds]).select('visitId','people','workStartsAt','workEndsAt','bookingGapMinutes','scheduledDate').limit(10001);
 if(occupied.length>10000)return {suggestions:[],limited:true};
 const byVisit=new Map<string,(typeof occupied)[number]>();for(const b of occupied){const previous=byVisit.get(b.visitId);byVisit.set(b.visitId,previous?{...b,people:[...new Set([...previous.people,...b.people])],bookingGapMinutes:Math.max(previous.bookingGapMinutes??0,b.bookingGapMinutes??0)}:b);}
 const busyRows=[...byVisit.values()];
 const windows:Parameters<typeof resolveCalendarBookingWindows>[1][number][]=[];
 for(const member of members){const parsed=calendarAvailabilitySchema.safeParse(member.availability);if(!parsed.success||!parsed.data.weeklyHours)continue;
  for(let day=from;day<=to;day=addCalendarDays(day,1)){const hours=parsed.data.weeklyHours[calendarWeekdays[(new Date(day+'T12:00:00Z').getUTCDay()+6)%7]];
   if(hours&&!parsed.data.unavailableDates.some(range=>range.startDate<=day&&range.endDate>=day)){const mins=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3));windows.push({key:member.userId,date:day,startTime:hours.startTime,endDate:day,endTime:hours.endTime,timezone:member.timezone,minutes:mins(hours.endTime)-mins(hours.startTime)});}}
 }
 for(const date of new Set<string>(busyRows.filter(b=>!b.workStartsAt||!b.workEndsAt).map(b=>b.scheduledDate)))windows.push({key:'unknown:'+date,date,startTime:'00:00',endDate:addCalendarDays(date,1),endTime:'00:00',timezone:row.timezone,minutes:-1});
 const valid=new Map<string,CalendarBookingInterval[]>();for(const w of await resolveCalendarBookingWindows(trx,windows)){if(w.start&&w.finish&&(w.minutes===-1||w.finish.getTime()-w.start.getTime()===w.minutes*60000))valid.set(w.key,[...(valid.get(w.key)??[]),{start:w.start.getTime(),finish:w.finish.getTime()}]);}
 const suggestions:{suggestion:CancellationOpeningResult['suggestions'][number];start:number;order:number}[]=[];
 for(const [order,candidate] of pool.entries()){
  const assigned=candidate.people as string[];if(assigned.some(id=>!crewIds.includes(id)))continue;
  const groups=assigned.length?[assigned]:members.filter(m=>m.priority!==null).map(m=>[m.userId]);
  let best:{ids:string[];slot:CalendarBookingInterval}|undefined;
  for(const ids of groups){if(ids.some(id=>!valid.get(id)?.length||!members.find(member=>member.userId===id)?.coverage.includes(candidate.postalCode)))continue;
   const busy:CalendarBookingBusy[]=[];let unknown=false;for(const b of busyRows){if(!b.people.some((id:string)=>ids.includes(id)))continue;const interval=b.workStartsAt&&b.workEndsAt?{start:new Date(b.workStartsAt).getTime(),finish:new Date(b.workEndsAt).getTime()}:valid.get('unknown:'+b.scheduledDate)?.[0];if(!interval){unknown=true;break;}busy.push({...interval,gapMinutes:b.bookingGapMinutes??0});}
   if(unknown)continue;
   const slot=findCommonCalendarSlot({windows:[{start:new Date(row.startsAt).getTime(),finish:new Date(row.endsAt).getTime()}],people:ids.map(id=>valid.get(id)??[]),busy,durationMinutes:definition.rules.durationMinutes,gapMinutes:definition.rules.gapMinutes});
   if(slot&&(!best||slot.start<best.slot.start))best={ids,slot};
  }
  if(!best)continue;
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:row.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(best.slot.start));
  suggestions.push({order,start:best.slot.start,suggestion:{jobId:candidate.id,jobVersion:candidate.version,number:`J-${String(candidate.jobNumber).padStart(4,'0')}`,title:candidate.title,customerName:candidate.customerName,workTime:{startTime:parts,durationMinutes:definition.rules.durationMinutes},people:best.ids.map(id=>({id,name:members.find(m=>m.userId===id)!.name})),assignment:assigned.length?'preserved':'qualified'}});
 }
 return {suggestions:suggestions.sort((a,b)=>a.start-b.start||a.order-b.order).slice(0,5).map(s=>s.suggestion),limited};
}
async function projection(trx:Knex.Transaction,context:AuthorizationContext,row:Awaited<ReturnType<typeof openingRow>>){
 const state=openingState(row),eligible=await workflowParticipantsEligible(trx,context,row.definition,row.publisherId);
 const matching=state==='open'&&eligible?await suggestionsFor(trx,context,row):{suggestions:[],limited:false};
 return cancellationOpeningResultSchema.parse({opening:{id:row.id,revision:String(row.workflowVersion)+':'+row.sourceVersion,date:row.date,timezone:row.timezone,workTime:row.workTime,service:row.serviceName,crew:row.crew,expiresAt:new Date(row.expiresAt).toISOString()},...matching,state:eligible?state:'expired',canRead:true,canBook:eligible&&state==='open'});
}
export async function readCancellationOpeningInTransaction(trx:Knex.Transaction,c:AuthorizationContext,id:string){return projection(trx,c,await openingRow(trx,c,id));}
export async function readCancellationOpening(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],id:string){return withWorkspaceAuthorization(db,identity,enabled,false,async(trx,c)=>projection(trx,c,await openingRow(trx,c,id)));}
export async function confirmCancellationBooking(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown){
 const input=cancellationBookingSchema.parse(raw);if(input.workspaceId!==identity.workspaceId)throw new AuthorizationAccessError();
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 return withCurrentWorkspaceMutation(db,identity,enabled,async(trx,context)=>{
  const row=await openingRow(trx,context,input.openingId);
  const previous=await trx('workflowCancellationBookings').where({workspaceId:context.workspaceId,requestId:input.requestId}).first();
  if(previous){if(previous.actorId!==context.userId||previous.hash!==hash)throw new CalendarRevisionError();return previous.result;}
  const view=await projection(trx,context,row),candidate=view.suggestions.find(s=>s.jobId===input.jobId&&s.jobVersion===input.jobVersion);
  if(!view.canBook||!candidate||input.openingRevision!==view.opening.revision||input.date!==row.date||input.timezone!==row.timezone||JSON.stringify(input.workTime)!==JSON.stringify(candidate.workTime)||JSON.stringify(input.personIds)!==JSON.stringify(candidate.people.map(p=>p.id)))throw new CalendarRevisionError();
  if(candidate.assignment==='qualified')await mutateJobInTransaction(trx,context,{workspaceId:context.workspaceId,jobId:input.jobId,submissionId:input.requestId,expectedVersion:input.jobVersion,action:'assign',primaryOwnerId:input.personIds[0],teamUserIds:[]},'ui');
  const link=await trx('calendarVisitRecords').where({workspaceId:context.workspaceId,jobId:input.jobId}).whereNull('endedAt').first('visitId');
  const target=await readCalendarVisitInTransaction(trx,context,link.visitId);
  if(!target.review||target.records.length!==1||target.scheduledDate)throw new CalendarRevisionError();
  const saved=await scheduleCalendarVisitInTransaction(trx,context,{workspaceId:context.workspaceId,submissionId:input.requestId,visitId:target.id,...target.review,schedule:{scheduledDate:input.date,arrivalWindow:null,workTime:input.workTime}},'ui',(row.definition as Definition).rules.gapMinutes);
  if(candidate.assignment==='qualified')await trx('jobNotifications').where({workspaceId:context.workspaceId,operationId:input.requestId,event:'assignment'}).delete();
  await trx('workflowCancellationOpenings').where({workspaceId:context.workspaceId,id:row.id,status:'open'}).update({status:'filled',bookedJobId:input.jobId});
  await trx('workflowCancellationNotifications').where({workspaceId:context.workspaceId,openingId:row.id}).update({readAt:trx.fn.now(),emailStatus:trx.raw(`CASE WHEN "emailStatus"='queued' THEN 'skipped' ELSE "emailStatus" END`)});
  const result={jobId:input.jobId,visitId:saved.visitId};
  await trx('workflowCancellationBookings').insert({workspaceId:context.workspaceId,requestId:input.requestId,actorId:context.userId,openingId:row.id,hash,result:JSON.stringify(result)});return result;
 });
}
export async function processCancellationStep(db:Knex,workspaceId:string,stepId:string,publisherId:string,enabled:readonly PermissionId[]){
 try{return await withCurrentWorkspaceMutation(db,{workspaceId,userId:publisherId},enabled,async(trx,c)=>{
  const step=await trx('workflowSteps').where({id:stepId,workspaceId,status:'queued'}).where('dueAt','<=',trx.fn.now()).first();if(!step)return {delivered:0,deferred:false};
  const row=await openingRow(trx,c,step.openingId),view=await projection(trx,c,row);let delivered=0;
  if(view.canBook&&view.suggestions.length){const work=view.opening.workTime;const day=new Intl.DateTimeFormat('en-US',{timeZone:row.timezone,weekday:'long',month:'short',day:'numeric'}).format(new Date(row.startsAt));const description=`${day} · ${calendarWorkTimeSummary(work)?.range} · ${row.timezone}. Review matching unscheduled jobs before booking.`;
   const inserted=await trx('workflowCancellationNotifications').insert({id:randomUUID(),workspaceId,workflowId:row.workflowId,openingId:row.id,userId:row.definition.recipientId,description,inApp:row.definition.notifications?.inApp??true,emailStatus:row.definition.notifications?.email?'queued':'skipped'}).onConflict(['openingId','userId']).ignore().returning('id');delivered=inserted.length;}
  await trx('workflowSteps').where({id:stepId,workspaceId}).update({status:'completed'});return {delivered,deferred:false};
 });}catch(error){if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowSteps').where({id:stepId,workspaceId,status:'queued'}).update({status:'skipped'});return {delivered:0,deferred:false};}
}
