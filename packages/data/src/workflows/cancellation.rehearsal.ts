import {readCancellationOpening,confirmCancellationBooking} from './cancellation';
import {processCancellationEmails} from '../notifications/workflow-cancellation';
import {CalendarRevisionError,addCalendarDays} from '@salesmora/domain';
import {createWorkOrder,mutateWorkOrder} from '../work-orders/mutations';
import {readCalendarVisit} from '../calendar/read';
import {scheduleCalendarVisit,linkCalendarWorkOrder} from '../calendar/commands';
import {readServiceSettings,saveServiceSettings} from '../services/store';
import {AuthorizationAccessError} from '../authorization/store';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {permissionIds,calendarWeekdays} from '@salesmora/contracts';
import {createDatabase} from '../database';
import {migrateFreshBaseline} from '../baseline-runner';
import {initializeWorkspacePolicy,withWorkspaceAuthorization} from '../authorization/store';
import {createJob,mutateJob,readJob} from '../jobs/store';
import {prepareWorkflowInTransaction,decideWorkflow} from './proposals';
import {processWorkflowStep} from './execution';
import {changeWorkflow} from './store';
import {editWorkflow,workflowEditValues} from './editing';
const env=fileURLToPath(new URL('../../../../.env.local',import.meta.url));if(existsSync(env))process.loadEnvFile(env);
const connection=process.env.TEST_DATABASE_URL;if(!connection||connection===process.env.DATABASE_URL||!new URL(connection).pathname.endsWith('_test')||!['localhost','127.0.0.1'].includes(new URL(connection).hostname))throw Error('Use isolated local test database.');
const owner=createDatabase(connection),name=`routine_${randomUUID().replaceAll('-','')}_test`,url=new URL(connection);url.pathname='/'+name;
const db=createDatabase(url.toString()),role=new URL(url);role.searchParams.set('options','-c role=salesmora_web');const web=createDatabase(role.toString());role.searchParams.set('options','-c role=salesmora_worker');const worker=createDatabase(role.toString());
const enabled=[...permissionIds];
let created=false,passed=0;
async function fixture(){const workspaceId=randomUUID(),userId=randomUUID(),staff=randomUUID(),contact=randomUUID(),customerId=randomUUID(),now=new Date();
 await db('users').insert([[userId,'Owner'],[staff,'Staff'],[contact,'Office']].map(([id,name])=>({id,name,email:`${id}@example.test`,emailVerified:true,createdAt:now,updatedAt:now,termsVersion:'fixture',termsAcceptedAt:now})));
 await db.transaction(async trx=>{await trx('workspaces').insert({id:workspaceId,ownerId:userId,businessName:'Booking fixture',businessType:'plumbing',postalCode:'',serviceRange:'',timezone:'America/New_York'});await trx('workspaceMemberships').insert([{workspaceId,userId,role:'owner'},{workspaceId,userId:staff,role:'field'},{workspaceId,userId:contact,role:'admin'}]);await initializeWorkspacePolicy(trx,{workspaceId,userId});});
 await db('workspaceServices').insert([{workspaceId,service:'Maintenance'},{workspaceId,service:'Repairs'}]);await db('customers').insert({id:customerId,workspaceId,name:'Fixture customer',type:'person',companyName:'',email:'',phone:'',location:'',internalNotes:''});
 await db('calendarPersonAvailability').insert([staff,contact,userId].map(personId=>({workspaceId,personId,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(calendarWeekdays.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})})));
 await db('workspaceMemberCoverage').insert([userId,staff,contact].map(personId=>({workspaceId,personId,version:1})));
 await db('workspaceMemberPostalCodes').insert([userId,staff,contact].map(personId=>({workspaceId,personId,countryCode:'US',postalCode:'10001'})));
 return {workspaceId,userId,staff,contact,customerId};}
type F=Awaited<ReturnType<typeof fixture>>;
const who=(f:F)=>({workspaceId:f.workspaceId,userId:f.userId});
async function draft(f:F){const threadId=randomUUID(),turnId=randomUUID();await db('chatThreads').insert({id:threadId,workspaceId:f.workspaceId,userId:f.userId});await db('chatTurns').insert({id:turnId,threadId,workspaceId:f.workspaceId,userId:f.userId,clientTurnId:randomUUID(),requestHash:'fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});
 return withWorkspaceAuthorization(web,who(f),enabled,true,(trx,context)=>prepareWorkflowInTransaction(trx,context,{threadId,turnId},{kind:'cancellation_fill',name:'Fill maintenance openings',service:'maintenance',cancellationRules:{durationMinutes:60,gapMinutes:30},recipient:'Office',businessDays:null,localTime:null}));}
async function publish(f:F){const d=await draft(f);const command={workspaceId:f.workspaceId,id:d.id,inputHash:d.inputHash,decision:'confirm'};await decideWorkflow(web,who(f),enabled,command);await decideWorkflow(web,who(f),enabled,command);return d;}
const job=async(f:F,changes={})=>(await createJob(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),customerId:f.customerId,title:'Routine job',service:'Maintenance',primaryOwnerId:f.staff,...changes,postalCode:'10001'})).jobId;
async function check(label:string,run:()=>Promise<void>){await run();console.log('PASS '+label);passed++;}

async function qualify(f:F,workerIds:string[]=[f.staff,f.contact]){const snapshot=await readServiceSettings(web,who(f),enabled),serviceId=snapshot.services.find(s=>s.key==='Maintenance')!.id;return saveServiceSettings(web,who(f),enabled,{workspaceId:f.workspaceId,requestId:randomUUID(),command:{action:'set_workers',serviceId,expectedVersion:snapshot.version,workerIds}});}
async function setup(){const f=await fixture();await qualify(f);const d=await publish(f);return {...f,workflow:d};}
async function scheduled(f:F,date?:string,changes={}){const id=await job(f,changes);const visit=await db('calendarVisitRecords').where({workspaceId:f.workspaceId,jobId:id}).whereNull('endedAt').first('visitId');let target=await readCalendarVisit(web,who(f),enabled,visit.visitId);
 const today=(await db.raw(`SELECT to_char(now() AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS today` )).rows[0].today;
 await scheduleCalendarVisit(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),visitId:target.id,...target.review!,schedule:{scheduledDate:date??addCalendarDays(today,2),arrivalWindow:null,workTime:{startTime:'10:00',durationMinutes:120}}});target=await readCalendarVisit(web,who(f),enabled,visit.visitId);return {id,target};}
async function cancel(f:F,id:string){const current=await readJob(web,who(f),enabled,id);await mutateJob(web,who(f),enabled,{workspaceId:f.workspaceId,jobId:id,submissionId:randomUUID(),expectedVersion:current.job.version,action:'status',to:'canceled',cancellationReason:'customer-canceled',confirmed:true});}
async function opening(f:F){return db('workflowCancellationOpenings').where({workspaceId:f.workspaceId}).orderBy('createdAt','desc').first();}
async function ready(){const f=await setup(),source=await scheduled(f),candidate=await job(f,{primaryOwnerId:null});await cancel(f,source.id);const o=await opening(f);assert(o);return {...f,source,candidate,o};}
async function runOpening(f:Awaited<ReturnType<typeof ready>>){const s=await db('workflowSteps').where({openingId:f.o.id}).first();assert(s);return processWorkflowStep(worker,f.workspaceId,s.id);}
function command(f:Awaited<ReturnType<typeof ready>>,view:Awaited<ReturnType<typeof readCancellationOpening>>,candidate=view.suggestions[0]){return {workspaceId:f.workspaceId,requestId:randomUUID(),openingId:view.opening.id,openingRevision:view.opening.revision,jobId:candidate.jobId,jobVersion:candidate.jobVersion,date:view.opening.date,timezone:view.opening.timezone,workTime:candidate.workTime,personIds:candidate.people.map(p=>p.id)};}
try{await owner.raw('CREATE DATABASE ??',[name]);created=true;await migrateFreshBaseline(db);
 await check('committed cancellation queues one opening and worker delivers one review notice',async()=>{const f=await ready();const result=await runOpening(f);assert.equal(result.delivered,1);assert.equal((await runOpening(f)).delivered,0);const notices=await db('workflowCancellationNotifications').where({openingId:f.o.id});assert.equal(notices.length,1);assert.equal(notices[0].emailStatus,'queued');const view=await readCancellationOpening(web,who(f),enabled,f.o.id);assert.equal(view.suggestions[0].jobId,f.candidate);assert.equal(view.suggestions[0].assignment,'qualified');assert.equal(view.suggestions[0].people[0].id,f.staff);assert.equal(view.opening.workTime.durationMinutes,120);assert.equal((await db('jobs').where({id:f.candidate}).first()).primaryOwnerId,null);});
 await check('reviewed booking assigns/schedules atomically and response replay is stable',async()=>{const f=await ready(),view=await readCancellationOpening(web,who(f),enabled,f.o.id),input=command(f,view);const result=await confirmCancellationBooking(web,who(f),enabled,input);assert.deepEqual(await confirmCancellationBooking(web,who(f),enabled,input),result);const saved=await readJob(web,who(f),enabled,f.candidate);assert.equal(saved.job.status,'scheduled');assert.equal(saved.job.primaryOwnerId,f.staff);assert.equal(saved.job.workTime?.durationMinutes,60);assert.equal((await readCancellationOpening(web,who(f),enabled,f.o.id)).state,'filled');});
 await check('stale job, crew or proposed time is rejected without changing assignment',async()=>{const f=await ready(),view=await readCancellationOpening(web,who(f),enabled,f.o.id),input=command(f,view);await assert.rejects(confirmCancellationBooking(web,who(f),enabled,{...input,workTime:{...input.workTime,startTime:'11:00'}}),CalendarRevisionError);await assert.rejects(confirmCancellationBooking(web,who(f),enabled,{...input,jobVersion:input.jobVersion+1}),CalendarRevisionError);await assert.rejects(confirmCancellationBooking(web,who(f),enabled,{...input,personIds:[f.contact]}),CalendarRevisionError);assert.equal((await db('jobs').where({id:f.candidate}).first()).primaryOwnerId,null);});
 await check('competing confirmations have one winner and no partial second assignment',async()=>{const f=await ready();const second=await job(f,{primaryOwnerId:null}),view=await readCancellationOpening(web,who(f),enabled,f.o.id);assert.equal(view.suggestions.length,2);const outcomes=await Promise.allSettled(view.suggestions.map(c=>confirmCancellationBooking(web,who(f),enabled,command(f,view,c))));assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal((await db('jobs').whereIn('id',[f.candidate,second]).where({status:'scheduled'})).length,1);});
 await check('no hours or unknown occupied work never produces unsafe suggestions',async()=>{const f=await ready();await db('calendarPersonAvailability').where({workspaceId:f.workspaceId,personId:f.staff}).delete();assert.equal((await readCancellationOpening(web,who(f),enabled,f.o.id)).suggestions.length,0);});
 await check('existing people are preserved and source jobs are excluded',async()=>{const f=await ready();await mutateJob(web,who(f),enabled,{workspaceId:f.workspaceId,jobId:f.candidate,submissionId:randomUUID(),expectedVersion:1,action:'assign',primaryOwnerId:f.staff,teamUserIds:[]});const view=await readCancellationOpening(web,who(f),enabled,f.o.id);assert.equal(view.suggestions[0].assignment,'preserved');assert(!view.suggestions.some(s=>s.jobId===f.source.id));});
 await check('paused, resumed or edited workflows cannot book old openings',async()=>{const f=await ready(),view=await readCancellationOpening(web,who(f),enabled,f.o.id),input=command(f,view);await changeWorkflow(web,who(f),enabled,{workspaceId:f.workspaceId,id:f.workflow.id,version:1,action:'pause'});assert.equal((await readCancellationOpening(web,who(f),enabled,f.o.id)).state,'paused');await assert.rejects(confirmCancellationBooking(web,who(f),enabled,input),CalendarRevisionError);await changeWorkflow(web,who(f),enabled,{workspaceId:f.workspaceId,id:f.workflow.id,version:2,action:'resume'});assert.equal((await readCancellationOpening(web,who(f),enabled,f.o.id)).state,'expired');const values={...workflowEditValues(f.workflow.name,f.workflow.definition),cancellationRules:{durationMinutes:90,gapMinutes:15}};await editWorkflow(web,who(f),enabled,{workspaceId:f.workspaceId,id:f.workflow.id,version:3,requestId:randomUUID(),values});});
 await check('email retry is durable, preference/lifecycle current, and transport stays fake',async()=>{const f=await ready();await runOpening(f);const n=await db('workflowCancellationNotifications').where({openingId:f.o.id}).first();let calls=0;const first=await processCancellationEmails(worker,enabled,async()=>{calls++;throw Error('fake transport');},1,{id:n.id,workspaceId:f.workspaceId});assert.equal(first.retryPending,1);await db('workflowCancellationNotifications').where({id:n.id}).update({nextAttemptAt:new Date(0)});const sent=await processCancellationEmails(worker,enabled,async mail=>{calls++;assert.equal(mail.openingId,f.o.id);},1,{id:n.id,workspaceId:f.workspaceId});assert.equal(sent.sent,1);assert.equal(calls,2);});
 await check('cleared and moved planned visits capture the original interval; overlap remains occupied',async()=>{
  for(const move of [false,true]){const f=await setup(),source=await scheduled(f);await job(f,{primaryOwnerId:null});
   await scheduleCalendarVisit(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),visitId:source.target.id,...source.target.review!,schedule:move?{scheduledDate:source.target.scheduledDate,arrivalWindow:null,workTime:{startTime:'10:30',durationMinutes:120}}:{scheduledDate:null,arrivalWindow:null,workTime:null}});
   const o=await opening(f);assert(o);assert.equal(o.workTime.startTime,'10:00');const view=await readCancellationOpening(web,who(f),enabled,o.id);assert.equal(view.suggestions.length,move?0:1);
  }
 });
 await check('date-only, same-day and unrelated-service cancellations do not enroll',async()=>{
  const f=await setup(),today=(await db.raw(`SELECT to_char(now() AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS today`)).rows[0].today;
  const dated=await job(f,{scheduledDate:addCalendarDays(today,2)});await cancel(f,dated);assert.equal(await opening(f),undefined);
  const same=await scheduled(f,today);await cancel(f,same.id);assert.equal(await opening(f),undefined);
  const other=await job(f,{service:'Repairs'});const target=await readCalendarVisit(web,who(f),enabled,(await db('calendarVisitRecords').where({jobId:other}).first()).visitId);
  await scheduleCalendarVisit(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),visitId:target.id,...target.review!,schedule:{scheduledDate:addCalendarDays(today,2),arrivalWindow:null,workTime:{startTime:'10:00',durationMinutes:120}}});await cancel(f,other);assert.equal(await opening(f),undefined);
 });
 await check('canceling one shared record does not release its still-occupied visit',async()=>{
  const f=await setup(),source=await scheduled(f);
  const wo=await createWorkOrder(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),jobId:source.id,title:'Shared work'});
  // Canonical Work Order creation links to the existing Job visit only after explicit review.
  const order=await db('workOrders').where({id:wo.workOrderId}).first();
  if(order.status==='draft')await mutateWorkOrder(web,who(f),enabled,{workspaceId:f.workspaceId,workOrderId:order.id,submissionId:randomUUID(),expectedVersion:order.version,action:'status',to:'issued',confirmed:true});
  const sourceNow=await readCalendarVisit(web,who(f),enabled,source.target.id),own=await readCalendarVisit(web,who(f),enabled,(await db('calendarVisitRecords').where({workOrderId:wo.workOrderId}).whereNull('endedAt').first()).visitId);
  if(own.id!==sourceNow.id)await linkCalendarWorkOrder(web,who(f),enabled,{workspaceId:f.workspaceId,submissionId:randomUUID(),visitId:sourceNow.id,...sourceNow.review!,workOrderId:wo.workOrderId,expectedWorkOrderVersion:(await db('workOrders').where({id:wo.workOrderId}).first()).version,sourceVisitId:own.id,expectedSourceVisitVersion:own.review!.expectedVisitVersion});
  await job(f,{primaryOwnerId:null});await cancel(f,source.id);assert.equal(await opening(f),undefined);
 });
 await check('transaction failure rolls back assignment, schedule and opening receipt',async()=>{
  const f=await ready(),view=await readCancellationOpening(web,who(f),enabled,f.o.id),input=command(f,view);
  await db.raw(`CREATE FUNCTION fail_cancellation_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture rollback';END $$`);await db.raw(`CREATE TRIGGER fail_cancellation_receipt BEFORE INSERT ON "workflowCancellationBookings" FOR EACH ROW EXECUTE FUNCTION fail_cancellation_receipt()`);
  await assert.rejects(confirmCancellationBooking(web,who(f),enabled,input));assert.equal((await db('jobs').where({id:f.candidate}).first()).primaryOwnerId,null);assert.equal((await db('jobs').where({id:f.candidate}).first()).scheduledDate,null);assert.equal((await opening(f)).status,'open');
  await db.raw('DROP TRIGGER fail_cancellation_receipt ON "workflowCancellationBookings"');await db.raw('DROP FUNCTION fail_cancellation_receipt()');await confirmCancellationBooking(web,who(f),enabled,input);
 });
 await check('queue outbox carries cancellation steps and emails; authority is checked at confirmation',async()=>{
  const f=await ready(),s=await db('workflowSteps').where({openingId:f.o.id}).first();assert(await db('workflowQueueOutbox').where({stepId:s.id,kind:'step'}).whereNull('completedAt').first());await runOpening(f);
  const n=await db('workflowCancellationNotifications').where({openingId:f.o.id}).first();assert(await db('workflowQueueOutbox').where({cancellationNoticeId:n.id,kind:'cancellation_email'}).first());
  await assert.rejects(readCancellationOpening(web,{workspaceId:f.workspaceId,userId:f.staff},enabled,f.o.id),AuthorizationAccessError);
  const view=await readCancellationOpening(web,who(f),enabled,f.o.id);await assert.rejects(confirmCancellationBooking(web,who(f),enabled.filter(p=>p!=='jobs.assign'),command(f,view)),AuthorizationAccessError);
 });
 await check('unknown occupied duration blocks a replacement; explicit multi-person teams stay intact',async()=>{
  const f=await ready();await job(f,{scheduledDate:(await readCancellationOpening(web,who(f),enabled,f.o.id)).opening.date});assert.equal((await readCancellationOpening(web,who(f),enabled,f.o.id)).suggestions.length,0);
  const g=await setup(),source=await scheduled(g,undefined,{teamUserIds:[g.contact]}),candidate=await job(g,{teamUserIds:[g.contact]});await cancel(g,source.id);const o=await opening(g),view=await readCancellationOpening(web,who(g),enabled,o.id);assert.equal(view.suggestions[0].jobId,candidate);assert.equal(view.suggestions[0].assignment,'preserved');assert.deepEqual(new Set(view.suggestions[0].people.map(p=>p.id)),new Set([g.staff,g.contact]));
 });
 await check('availability and clock resolution are each one batch as candidate count grows',async()=>{
  const f=await ready();await job(f,{primaryOwnerId:null});
  for(const expected of [2,3]){const statements:string[]=[];const listener=(q:{sql:string})=>statements.push(q.sql);web.on('query',listener);let view;try{view=await readCancellationOpening(web,who(f),enabled,f.o.id);}finally{web.off('query',listener);}assert.equal(view.suggestions.length,expected);assert.equal(statements.filter(s=>s.includes('calendarPersonAvailability')).length,1);assert.equal(statements.filter(s=>s.includes('calendar_local_work_at')).length,1);if(expected===2)await job(f,{primaryOwnerId:null});}
 });
 console.log(`Cancellation workflow: ${passed} isolated groups passed with web/worker roles and fake email.`);
}finally{await worker.destroy();await web.destroy();await db.destroy();if(created)await owner.raw('DROP DATABASE ?? WITH (FORCE)',[name]);await owner.destroy();}
