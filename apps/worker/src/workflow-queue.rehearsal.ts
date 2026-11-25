import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Queue } from "bullmq";
import { permissionIds, calendarWeekdays } from "@salesmora/contracts";
import { createDatabase, initializeWorkspacePolicy, changeWorkflow, editWorkflow, claimWorkflowQueue, createWorkOrder, createJob,mutateJob,readCalendarVisit,scheduleCalendarVisit } from "@salesmora/data";
import { migrateFreshBaseline } from "@salesmora/data/baseline-runner";
import { startWorkflowReminders, workflowQueueName } from "./workflow-reminders.js";

process.loadEnvFile(fileURLToPath(new URL("../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw new Error("Use a separate local test database.");
const redis = new URL(process.env.REDIS_URL ?? "redis://127.0.0.1:56379");
if (!['localhost','127.0.0.1'].includes(redis.hostname) || redis.port !== '56379' || redis.username || redis.password) throw new Error("Use local test Redis.");
const name = `workflow_redis_${randomUUID().replaceAll("-", "")}_test`;
const admin = createDatabase(connection), url = new URL(connection); url.pathname = "/" + name;
const db = createDatabase(url.toString()), workspaceId = randomUUID(), otherWorkspace = randomUUID(), owner = randomUUID(), otherOwner = randomUUID(), workflowId = randomUUID();
const config = { databaseURL: url.toString(), queueName: `workflow-test-${randomUUID()}`, connection: { host: redis.hostname, port: Number(redis.port) } };
const queue = new Queue(workflowQueueName(config), { connection: config.connection });
queue.on('error', () => {});
const baseURL = process.env.BETTER_AUTH_URL; process.env.BETTER_AUTH_URL = "http://127.0.0.1:3000";
let created = false, stop: (() => Promise<void>) | undefined, failNext = false;
const sent: string[] = [], attempts: string[] = [];
const subjects = new Map<string, string>();const brandedHandoffs=new Set<string>();
const send = async (mail: { idempotencyKey?: string; subject?: string;html?:string;attachments?:{cid?:string}[] }) => {
  if(mail.idempotencyKey?.startsWith('customer-schedule-')){assert(mail.html?.includes('cid:salesmora-logo'));assert(mail.attachments?.some(a=>a.cid==='salesmora-logo'));assert(mail.html?.includes('2 PM – 4 PM'));}
  if(mail.idempotencyKey?.startsWith('post-job-')){assert(mail.html?.includes('cid:salesmora-logo'));assert(mail.attachments?.some(a=>a.cid==='salesmora-logo'));}
  if(mail.idempotencyKey?.startsWith('customer-visit-')){assert(mail.html?.includes('cid:salesmora-logo'));assert(mail.attachments?.some(a=>a.cid==='salesmora-logo'));}
  if(mail.idempotencyKey?.startsWith('completion-handoff-')){assert(mail.html?.includes('cid:salesmora-logo'));assert(mail.attachments?.some(a=>a.cid==='salesmora-logo'));brandedHandoffs.add(mail.idempotencyKey);}
  attempts.push(mail.idempotencyKey!);
  if (failNext) { failNext = false; throw Error("Synthetic temporary transport failure"); }
  sent.push(mail.idempotencyKey!); subjects.set(mail.idempotencyKey!, mail.subject ?? ""); return { providerMessageId: "fictional-queue-transport" };
};
async function until(check: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 20000;
  do { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 75)); } while (Date.now() < deadline);
  throw Error(message);
}
const definition = (kind = "unassigned_lead") => ({ kind, businessDays: 1, recipientId: owner, recipientName: "Queue fixture", timezone: "America/New_York", notifications: { inApp: true, email: true } });
async function workflow(id: string, space = workspaceId, kind = "unassigned_lead") {
  await db("workflows").insert({ id, workspaceId: space, publisherId: owner, name: "Queue reminder", rule: "Notify office", status: "active", enrollAfter: new Date(0), definition: JSON.stringify(definition(kind)) });
}
async function lead(space = workspaceId, future = false) {
  const id = randomUUID();
  await db("leads").insert({ id, workspaceId: space, name: "Queue lead", email: "", phone: "", service: "Repair", submissionId: randomUUID(), submissionHash: "fixture", address: "", details: "", notes: "", source: "other", stage: "new",
    createdAt: new Date(future ? Date.now() + 1000 : Date.now() - 7 * 86400000) });
  return id;
}
async function emailSent(leadId: string) {
  return (await db("leadWorkflowNotifications").where({ leadId, emailStatus: "sent" }).count({ count: "*" }).first())?.count === "1";
}
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db("users").insert([owner, otherOwner].map(id => ({ id, name: "Queue fixture", email: `${id}@example.test`, emailVerified: true, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
  for (const id of [workspaceId, otherWorkspace]) {
    await db.transaction(async trx => {
    const ownerId = id === workspaceId ? owner : otherOwner;
    await trx("workspaces").insert({ id, ownerId, businessName: "Queue fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert({ workspaceId: id, userId: ownerId, role: "owner" });
    if (id !== workspaceId) await trx("workspaceMemberships").insert({ workspaceId: id, userId: owner, role: "admin" });
    await initializeWorkspacePolicy(trx, { workspaceId: id, userId: ownerId });
    });
  }
  await workflow(workflowId);
  stop = await startWorkflowReminders(db, config, { send });
  const first = await lead();
  await until(() => emailSent(first), "Committed source event did not wake the queue and send its reminder");
  assert.equal(sent.length, 1);
  const finished = await db("workflowQueueOutbox as o").join("workflowSteps as s", "s.id", "o.stepId").where("s.leadId", first).first("o.id", "o.version", "o.workspaceId");
  await queue.add("workflow-work", finished, { jobId: randomUUID(), removeOnComplete: true });
  await until(async () => (await queue.getJobCounts("active", "waiting")).active === 0 && (await queue.getJobCounts("active", "waiting")).waiting === 0, "Duplicate ticket did not settle");
  assert.equal(sent.length, 1, "duplicate jobs cannot redeliver completed work");
  // A held future step is preserved; events received while paused do not enroll.
  const held = await lead(workspaceId, true);
  await changeWorkflow(db, { userId: owner, workspaceId }, permissionIds, { workspaceId, id: workflowId, version: 1, action: "pause" });
  assert.equal((await db("workflowSteps").where({ leadId: held }).first()).status, "held");
  const duringPause = await lead(workspaceId, true);
  assert.equal(await db("workflowSteps").where({ leadId: duringPause }).first(), undefined);
  await changeWorkflow(db, { userId: owner, workspaceId }, permissionIds, { workspaceId, id: workflowId, version: 2, action: "resume" });
  await db("workflowSteps").where({ leadId: held }).update({ dueAt: new Date(0) });
  await until(() => emailSent(held), "Resumed future step did not run");
  // Email retry has its own persisted due time and keeps the same transport key.
  failNext = true;
  const retry = await lead(workspaceId, true);
  await db("workflowSteps").where({ leadId: retry }).update({ dueAt: new Date(0) });
  await until(async () => !!await db("leadWorkflowNotifications").where({ leadId: retry, attempts: 1, emailStatus: "queued" }).first(), "Transport retry was not persisted");
  await db("leadWorkflowNotifications").where({ leadId: retry }).update({ nextAttemptAt: new Date(0) });
  await until(() => emailSent(retry), "Retimed email retry was not queued");
  const retried = await db("leadWorkflowNotifications").where({ leadId: retry }).first();
  assert.equal(retried.attempts, 2);
  assert.equal(attempts.filter(key => key === `lead-workflow-notification-${retried.id}`).length, 2);
  // Queue loss: dispatch while paused, discard Redis state, expire the handoff lease and restart.
  await queue.pause();
  const recovered = await lead(workspaceId, true);
  await db("workflowSteps").where({ leadId: recovered }).update({ dueAt: new Date(0) });
  const recoveryStep = await db("workflowSteps").where({ leadId: recovered }).first();
  await until(async () => (await db("workflowQueueOutbox").where({ stepId: recoveryStep.id }).first()).nextDispatchAt.getTime() > Date.now() + 300000, "Queue handoff was not acknowledged");
  await stop(); stop = undefined;
  await queue.obliterate({ force: true });
  await db("workflowQueueOutbox").where({ stepId: recoveryStep.id }).update({ nextDispatchAt: new Date(0) });
  stop = await startWorkflowReminders(db, config, { send });
  await until(() => emailSent(recovered), "Lost Redis job was not recovered from the outbox");
  // Deleted workflow jobs are harmless, including tickets already waiting in Redis.
  const deletedWorkflow = randomUUID(); await workflow(deletedWorkflow, otherWorkspace);
  const canceled = await lead(otherWorkspace, true);
  const canceledStep = await db("workflowSteps").where({ leadId: canceled }).first();
  const [oldTicket] = await claimWorkflowQueue(db);
  await changeWorkflow(db, { userId: owner, workspaceId: otherWorkspace }, permissionIds, { workspaceId: otherWorkspace, id: deletedWorkflow, version: 1, action: "delete", confirmation: "confirm" });
  assert.equal((await db("workflowSteps").where({ id: canceledStep.id }).first()).status, "canceled");
  if (oldTicket) await queue.add("workflow-work", { id: oldTicket.id, workspaceId: oldTicket.workspaceId, version: oldTicket.version }, { jobId: randomUUID(), removeOnComplete: true });
  // Both estimate recipes use the same real queue and their existing email checks/renderers.
  const acceptedWorkflow = randomUUID(), followWorkflow = randomUUID();
  await workflow(acceptedWorkflow, otherWorkspace, "unscheduled_estimate"); await workflow(followWorkflow, otherWorkspace, "estimate_follow_up");
  const parent = await lead(otherWorkspace, true), acceptedId = randomUUID(), sentId = randomUUID(), snapshotId = randomUUID();
  await db("estimates").insert([{ id: acceptedId, workspaceId: otherWorkspace, parentType: "lead", leadId: parent, name: "Accepted queue fixture", status: "accepted", decidedAt: new Date() },
    { id: sentId, workspaceId: otherWorkspace, parentType: "lead", leadId: parent, name: "Sent queue fixture", status: "sent", validUntil: "2099-12-31" }]);
  await db("estimate_snapshots").insert({ id: snapshotId, workspaceId: otherWorkspace, estimateId: sentId, content: "{}", contentHash: "a".repeat(64) });
  const deliveryId = randomUUID();
  await db("estimate_deliveries").insert({ id: deliveryId, workspaceId: otherWorkspace, estimateId: sentId, snapshotId, status: "queued", recipient: "fixture@example.test", recipientHash: "a".repeat(64), idempotencyKey: randomUUID() });
  assert.equal(await db("workflowSteps").where({ workflowId: followWorkflow, estimateId: sentId }).first(), undefined);
  await db("estimate_deliveries").where({ id: deliveryId }).update({ status: "sent", sentAt: new Date() });
  await db("workflowSteps").whereIn("estimateId", [acceptedId, sentId]).update({ dueAt: new Date(0) });
  await until(async () => Number((await db("estimateNotifications").whereIn("estimateId", [acceptedId, sentId]).where({ emailStatus: "sent" }).count({ count: "*" }).first())?.count) === 2, "Estimate jobs did not deliver through the queue");
  assert.deepEqual((await db("estimateNotifications").whereIn("estimateId", [acceptedId, sentId]).orderBy("event").select("event")).map(row => row.event), ["awaiting_decision", "needs_scheduling"]);
  assert.equal(await db("leadWorkflowNotifications").where({ leadId: canceled }).first(), undefined);
  // Briefing occurrence uses the same durable outbox and targeted email worker. Manual origin
  // allows an immediate rehearsal on any weekday without pretending it is Monday morning.
  const briefingWorkflow = randomUUID(), briefingStep = randomUUID();
  await db("workflows").insert({ id: briefingWorkflow, workspaceId, publisherId: owner, name: "Monday briefing", rule: "Every Monday at 9 AM",
    status: "active", enrollAfter: new Date(), definition: JSON.stringify({ kind: "weekly_briefing", weekday: "monday", localTime: "09:00",
      recipientId: owner, recipientName: "Queue fixture", timezone: "America/New_York", notifications: { inApp: true, email: true } }) });
  const nextMonday = await db("workflowSteps").where({ workflowId: briefingWorkflow, origin: "scheduled", status: "queued" }).first();
  failNext = true;
  await db("workflowSteps").insert({ id: briefingStep, workspaceId, workflowId: briefingWorkflow, recordKind: "briefing", origin: "manual", status: "queued", dueAt: db.fn.now() });
  await until(async () => !!await db("workflowBriefingNotifications").where({ briefingId: briefingStep, attempts: 1, emailStatus: "queued" }).first(), "Briefing retry was not saved");
  await db("workflowBriefingNotifications").where({ briefingId: briefingStep }).update({ nextAttemptAt: new Date(0) });
  await until(async () => !!await db("workflowBriefingNotifications").where({ briefingId: briefingStep, emailStatus: "sent" }).first(), "Briefing did not save and email through Redis");
  const briefingNotice = await db("workflowBriefingNotifications").where({ briefingId: briefingStep }).first();
  assert(sent.includes(`workflow-briefing-${briefingNotice.id}`));
  assert.equal(attempts.filter(key => key === `workflow-briefing-${briefingNotice.id}`).length, 2);
  assert.equal((await db("workflowSteps").where({ id: nextMonday.id }).first()).dueAt.toISOString(), nextMonday.dueAt.toISOString());
  assert.equal((await db("workflowSteps").where({ workflowId: briefingWorkflow, origin: "scheduled", status: "queued" })).length, 1);
  const snapshot = await db("workflowBriefings").where({ id: briefingStep }).first(); assert(snapshot.snapshot.counts);
  // Publication enrolls an existing future booking in bounded jobs on the same queue.
  const visitWorkflow = randomUUID(), calendarJob = randomUUID(), calendarVisit = randomUUID();
  const date = (await db.raw("SELECT to_char((now() AT TIME ZONE 'America/New_York')::date + 1,'YYYY-MM-DD') AS date")).rows[0].date;
  await db("jobs").insert({ id: calendarJob, workspaceId, title: "Unassigned queue visit", customerName: "Fixture", service: "Repair", location: "", description: "", status: "scheduled", scheduledDate: date });
  // Use the canonical visit created by the Job's application path in other tests; explicit
  // records here exercise raw intake/import writes and the durable database adapters.
  await db("calendarVisits").insert({ id: calendarVisit, workspaceId, scheduledDate: date });
  await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId: calendarVisit, jobId: calendarJob });
  failNext = true;
  await db("workflows").insert({ id: visitWorkflow, workspaceId, publisherId: owner, name: "Unassigned visit", rule: "Day before at 9 AM", status: "active",
    enrollAfter: new Date(), definition: JSON.stringify({ kind: "unassigned_visit", calendarDaysBefore: 1, localTime: "09:00", recipientId: owner,
      recipientName: "Queue fixture", timezone: "America/New_York", notifications: { inApp: true, email: true } }) });
  await until(async () => !!await db("workflowSteps").where({ workflowId: visitWorkflow, visitId: calendarVisit }).first(), "Visit initialization did not run through Redis");
  await db("workflowSteps").where({ workflowId: visitWorkflow, visitId: calendarVisit, status: "queued" }).update({ dueAt: new Date(0) });
  await until(async () => !!await db("workflowVisitNotifications").where({ workflowId: visitWorkflow, emailStatus: "queued", attempts: 1 }).first(), "Visit email retry was not persisted");
  await db("workflowVisitNotifications").where({ workflowId: visitWorkflow }).update({ nextAttemptAt: new Date(0) });
  await until(async () => !!await db("workflowVisitNotifications").where({ workflowId: visitWorkflow, emailStatus: "sent" }).first(), "Visit reminder and email did not run through Redis");
  const visitNotice = await db("workflowVisitNotifications").where({ workflowId: visitWorkflow }).first();
  assert(sent.includes(`workflow-visit-${visitNotice.id}`));
  assert.equal(attempts.filter(key => key === `workflow-visit-${visitNotice.id}`).length, 2);
  assert.equal((await db("workflowVisitNotifications").where({ workflowId: visitWorkflow })).length, 1);
  const materialsWorkflow = randomUUID(), materialOrder = randomUUID();
  await db("workOrders").insert({ id: materialOrder, workspaceId, jobId: calendarJob, title: "Assigned material work", status: "issued", primaryAssigneeId: owner,
    createdBy: owner, issuedAt: new Date() });
  await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId: calendarVisit, workOrderId: materialOrder });
  await db("workOrderMaterials").insert({ id: randomUUID(), workspaceId, workOrderId: materialOrder, position: 0, name: "Fixture part", quantity: 1, unit: "each", status: "ordered" });
  failNext = true;
  await db("workflows").insert({ id: materialsWorkflow, workspaceId, publisherId: owner, name: "Visit materials", rule: "Materials day before at 8 AM", status: "active",
    enrollAfter: new Date(), definition: JSON.stringify({ kind: "visit_materials", calendarDaysBefore: 1, localTime: "08:00", recipientId: owner,
      recipientName: "Queue fixture", timezone: "America/New_York", notifications: { inApp: true, email: true } }) });
  await until(async () => !!await db("workflowSteps").where({ workflowId: materialsWorkflow, visitId: calendarVisit }).first(), "Materials initialization did not run through Redis");
  await db("workflowSteps").where({ workflowId: materialsWorkflow, visitId: calendarVisit, status: "queued" }).update({ dueAt: new Date(0) });
  await until(async () => !!await db("workflowVisitNotifications").where({ workflowId: materialsWorkflow, emailStatus: "queued", attempts: 1 }).first(), "Materials email retry was not persisted");
  await db("workflowVisitNotifications").where({ workflowId: materialsWorkflow }).update({ nextAttemptAt: new Date(0) });
  await until(async () => !!await db("workflowVisitNotifications").where({ workflowId: materialsWorkflow, emailStatus: "sent" }).first(), "Materials reminder and email did not run through Redis");
  const materialNotice = await db("workflowVisitNotifications").where({ workflowId: materialsWorkflow }).first();
  assert.equal(materialNotice.snapshot.reason, "materials");
  assert.equal(subjects.get(`workflow-visit-${materialNotice.id}`), "Materials need attention before a visit");
  assert.equal(attempts.filter(key => key === `workflow-visit-${materialNotice.id}`).length, 2);
  assert.equal((await db("workflowVisitNotifications").where({ workflowId: materialsWorkflow })).length, 1);
  const editWorkflowId = randomUUID(); await workflow(editWorkflowId);
  const editLead = await lead(workspaceId, true);
  const editingStep = await db("workflowSteps").where({ workflowId: editWorkflowId, leadId: editLead }).first();
  await db("workflowSteps").where({ id: editingStep.id }).update({ dueAt: new Date(Date.now() + 60_000) });
  let obsolete: { id: string; workspaceId: string; version: number } | undefined;
  await until(async () => {
    const ticket = await db("workflowQueueOutbox").where({ stepId: editingStep.id }).first();
    if (ticket && await queue.getJob(`${ticket.id}-${ticket.version}`)) { obsolete = { id: ticket.id, workspaceId: ticket.workspaceId, version: ticket.version }; return true; }
    return false;
  }, "Original delayed edit ticket was not dispatched");
  await editWorkflow(db, { workspaceId, userId: owner }, permissionIds, { workspaceId, id: editWorkflowId, version: 1, requestId: randomUUID(),
    values: { name: "Edited queue reminder", localTime: "08:00", businessDays: 2, recipientId: owner, notifications: { inApp: true, email: false } } });
  await queue.add("workflow-work", obsolete!, { jobId: randomUUID(), removeOnComplete: true });
  await until(async () => { const counts = await queue.getJobCounts("active", "waiting"); return counts.active === 0 && counts.waiting === 0; }, "Obsolete edit ticket did not settle");
  assert.equal((await db("leadWorkflowNotifications").where({ workflowId: editWorkflowId })).length, 0, "an old delayed ticket cannot send after editing");
  await db("workflowSteps").where({ id: editingStep.id }).update({ dueAt: new Date(0) });
  await until(async () => !!await db("leadWorkflowNotifications").where({ workflowId: editWorkflowId, emailStatus: "skipped" }).first(), "Edited reminder did not use the new channel settings");
  assert.equal((await db("leadWorkflowNotifications").where({ workflowId: editWorkflowId })).length, 1);
  // Routing assignment uses the same event-driven queue; the legacy assignment poller excludes it.
  const routingLead = randomUUID(), assignmentId = randomUUID();
  await db("leads").insert({ id: routingLead, workspaceId, ownerId: owner, name: "Routed queue lead", email: "", phone: "", service: "Repair", submissionId: randomUUID(), submissionHash: "queue-routing",
    address: "", details: "", notes: "", source: "website", stage: "new", createdAt: new Date() });
  await db("leadActivity").insert({ id: assignmentId, workspaceId, leadId: routingLead, actorId: owner, actorType: "assistant-confirmed", actorName: "Queue fixture", type: "assigned",
    changes: JSON.stringify({ from: null, to: "Queue fixture", ownerId: owner, toVersion: 1 }), createdAt: new Date() });
  await db("assignmentNotifications").insert({ id: assignmentId, workspaceId, leadId: routingLead, userId: owner, inApp: false });
  failNext = true;
  await db("assignmentEmailOutbox").insert({ id: assignmentId, workflowRouting: true });
  await until(async () => !!await db("assignmentEmailOutbox").where({ id: assignmentId, status: "queued", attempts: 1 }).first(), "Routing assignment retry was not persisted");
  await db("assignmentEmailOutbox").where({ id: assignmentId }).update({ nextAttemptAt: new Date(0) });
  await until(async () => !!await db("assignmentEmailOutbox").where({ id: assignmentId, status: "sent" }).first(), "Routing assignment email did not run through Redis");
  assert.equal(attempts.filter(key => key === `lead-assigned-${assignmentId}`).length, 2);
  assert.equal(sent.filter(key => key === `lead-assigned-${assignmentId}`).length, 1);
  assert((await db("workflowQueueOutbox").where({ assignmentNoticeId: assignmentId }).first()).completedAt);
  await db('workspaceMemberCoverage').insert({workspaceId,personId:owner,version:1});
  await db('workspaceMemberPostalCodes').insert({workspaceId,personId:owner,countryCode:'US',postalCode:'10001'});
  const bookingWorkflow=randomUUID(),bookingCustomer=randomUUID();
  await db('workspaceServices').insert({workspaceId,service:'Routine maintenance'}).onConflict(['workspaceId','service']).ignore();
  await db('calendarPersonAvailability').insert({workspaceId,personId:owner,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(calendarWeekdays.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})}).onConflict(['workspaceId','personId']).merge();
  await db('customers').insert({id:bookingCustomer,workspaceId,name:'Routine customer',type:'person',companyName:'',email:'',phone:'',location:'',internalNotes:''});
  await db('workflows').insert({id:bookingWorkflow,workspaceId,publisherId:owner,name:'Routine booking',rule:'Book assigned people',status:'active',enrollAfter:new Date(0),definition:JSON.stringify({kind:'routine_booking',service:'Routine maintenance',rules:{durationMinutes:60,gapMinutes:30,horizonDays:3,weekdays:[...calendarWeekdays],hours:{startTime:'08:00',endTime:'17:00'}},recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:true,email:true}})});
  const bookingJob=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Queue routine job',service:'Routine maintenance',primaryOwnerId:owner})).jobId;
  await until(async()=>!!await db('jobs').where({id:bookingJob,status:'scheduled'}).first(),'Routine job did not book through Redis');
  await until(async()=>!!await db('workflowBookingNotifications').where({jobId:bookingJob,emailStatus:'sent'}).first(),'Routine booking email did not run through Redis');
  const bookingNotice=await db('workflowBookingNotifications').where({jobId:bookingJob}).first();assert(sent.includes(`workflow-booking-${bookingNotice.id}`));
  await db('calendarPersonAvailability').where({workspaceId,personId:owner}).delete();
  const waitingJob=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Waiting routine job',service:'Routine maintenance',primaryOwnerId:owner})).jobId;
  await until(async()=>!!await db('workflowBookingNotifications').where({jobId:waitingJob,event:'no_slot',emailStatus:'sent'}).first(),'No-slot outcome did not deliver through Redis');
  await db('calendarPersonAvailability').insert({workspaceId,personId:owner,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(calendarWeekdays.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})});
  await until(async()=>!!await db('workflowBookingNotifications').where({jobId:waitingJob,event:'booked',emailStatus:'sent'}).first(),'Availability event did not recheck and book through Redis');
  const oldNoSlot=await db('workflowBookingNotifications').where({jobId:waitingJob,event:'no_slot'}).first();assert(oldNoSlot.readAt);assert.equal((await db('workflowBookingNotifications').where({jobId:waitingJob,event:'no_slot'})).length,1);
  const cancellationWorkflow=randomUUID();await db('workspaceServices').insert({workspaceId,service:'Cancellation repairs'});
  await db('workflows').insert({id:cancellationWorkflow,workspaceId,publisherId:owner,name:'Fill openings',rule:'Suggest replacements',status:'active',enrollAfter:new Date(0),definition:JSON.stringify({kind:'cancellation_fill',service:'Cancellation repairs',rules:{durationMinutes:60,gapMinutes:15},recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:true,email:true}})});
  const cancellationSource=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Cancellation source',service:'Cancellation repairs',primaryOwnerId:owner})).jobId;
  const sourceLink=await db('calendarVisitRecords').where({workspaceId,jobId:cancellationSource}).whereNull('endedAt').first();const sourceVisit=await readCalendarVisit(db,{workspaceId,userId:owner},permissionIds,sourceLink.visitId);
  const cancellationDate=(await db.raw(`SELECT to_char((now() AT TIME ZONE 'America/New_York')::date+5,'YYYY-MM-DD') AS date`)).rows[0].date;
  await scheduleCalendarVisit(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),visitId:sourceVisit.id,...sourceVisit.review!,schedule:{scheduledDate:cancellationDate,arrivalWindow:null,workTime:{startTime:'13:00',durationMinutes:120}}});
  const replacement=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Suggested replacement',service:'Cancellation repairs',primaryOwnerId:owner})).jobId;
  await mutateJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,jobId:cancellationSource,submissionId:randomUUID(),expectedVersion:(await db('jobs').where({id:cancellationSource}).first()).version,action:'status',to:'canceled',confirmed:true,cancellationReason:'customer-canceled'});
  await until(async()=>!!await db('workflowCancellationNotifications').where({workflowId:cancellationWorkflow,emailStatus:'sent'}).first(),'Cancellation review/email did not run through Redis');
  const cancellationNotice=await db('workflowCancellationNotifications').where({workflowId:cancellationWorkflow}).first();assert(sent.includes(`workflow-cancellation-${cancellationNotice.id}`));assert.equal((await db('jobs').where({id:replacement}).first()).status,'needs-scheduling');assert.equal((await db('workflowCancellationNotifications').where({workflowId:cancellationWorkflow})).length,1);
  const handoffWorkflow=randomUUID();await db('workflows').insert({id:handoffWorkflow,workspaceId,publisherId:owner,name:'Completion handoff',rule:'Notify on open work orders',status:'active',enrollAfter:new Date(0),definition:JSON.stringify({kind:'completion_handoff',recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:true,email:true}})});
  const handoffJob=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Handoff queue job',primaryOwnerId:owner})).jobId;
  await createWorkOrder(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),jobId:handoffJob,title:'Finish handoff inspection',assigneeId:owner,source:{kind:'blank'}});
  await mutateJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,jobId:handoffJob,submissionId:randomUUID(),expectedVersion:(await db('jobs').where({id:handoffJob}).first()).version,action:'status',to:'completed',confirmed:true});
  await until(async()=>!!await db('workflowHandoffNotifications').where({workflowId:handoffWorkflow,emailStatus:'sent'}).first(),'Completion handoff did not deliver through Redis');const hn=await db('workflowHandoffNotifications').where({workflowId:handoffWorkflow}).first();assert(brandedHandoffs.has(`completion-handoff-${hn.id}`));assert.equal(sent.filter(key=>key===`completion-handoff-${hn.id}`).length,1);assert((await db('workflowQueueOutbox').where({handoffNoticeId:hn.id}).first()).completedAt);
  const annualWorkflow=randomUUID();await db('workspaceServices').insert({workspaceId,service:'Annual queue service'});
  const annualJob=(await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Annual queue fixture',service:'Annual queue service',primaryOwnerId:owner})).jobId;
  let annualRow=await db('jobs').where({id:annualJob}).first();await mutateJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,jobId:annualJob,submissionId:randomUUID(),expectedVersion:annualRow.version,action:'status',to:'in-progress'});
  annualRow=await db('jobs').where({id:annualJob}).first();await mutateJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,jobId:annualJob,submissionId:randomUUID(),expectedVersion:annualRow.version,action:'status',to:'completed',confirmed:true});
  await db('workflows').insert({id:annualWorkflow,workspaceId,publisherId:owner,name:'Annual queue review',rule:'Review past customers',status:'active',definition:JSON.stringify({kind:'annual_service_review',service:'Annual queue service',rules:{firstReviewDate:'2030-04-22'},recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',localTime:'09:00',notifications:{inApp:true,email:true}})});
  const annualStep=await db('workflowSteps').where({workflowId:annualWorkflow,recordKind:'annual_review',status:'queued'}).first();assert(annualStep);
  const annualDate=(await db.raw(`SELECT to_char(now() AT TIME ZONE 'America/New_York','YYYY-MM-DD') date`)).rows[0].date;
  await db('workflowSteps').where({id:annualStep.id}).update({visitDate:annualDate,triggeredAt:new Date(),dueAt:new Date(0)});
  await until(async()=>!!await db('workflowServiceDueNotifications').where({workflowId:annualWorkflow,emailStatus:'sent'}).first(),'Annual review notification did not run through Redis');
  assert.equal((await db('workflowServiceDueCycles').where({workflowId:annualWorkflow})).length,1);
  assert.equal((await db('workflowSteps').where({workflowId:annualWorkflow,recordKind:'annual_review',status:'queued'})).length,1);
  assert.equal((await queue.getJobCounts("failed")).failed, 0, "no malformed or failed queue jobs may hide a stale-ticket regression");
  const customerWorkflow=randomUUID();
  await db('workspaces').where({id:workspaceId}).update({businessPhone:'555-010-0142'});
  await db('serviceOutreachCompany').insert({workspaceId,version:1,phone:'555-010-0142',email:'office@example.test'}).onConflict('workspaceId').merge({phone:'555-010-0142',email:'office@example.test'});
  await db('customers').where({id:bookingCustomer,workspaceId}).update({email:'customer@example.test'});
  await db('workflows').insert({id:customerWorkflow,workspaceId,publisherId:owner,name:'Customer visit queue reminder',rule:'Email customers before visits',status:'active',definition:JSON.stringify({kind:'customer_visit_reminder',calendarDaysBefore:1,localTime:'09:00',recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:false,email:true}})});
  await until(async()=>!!await db('workflowSteps').where({workflowId:customerWorkflow,recordKind:'customer_visit_init',status:'completed'}).first(),'Customer visit initialization did not complete');
  const customerDate=(await db.raw(`SELECT to_char((now() AT TIME ZONE 'America/New_York')::date+2,'YYYY-MM-DD') date`)).rows[0].date;
  const customerJob=await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Private customer visit job',primaryOwnerId:owner,scheduledDate:customerDate,arrivalWindow:'09:00-11:00'});
  const customerLink=await db('calendarVisitRecords').where({workspaceId,jobId:customerJob.jobId}).whereNull('endedAt').first();
  const customerStep=await db('workflowSteps').where({workflowId:customerWorkflow,visitId:customerLink.visitId,recordKind:'customer_visit',status:'queued'}).first();assert(customerStep);
  await db('workflowSteps').where({id:customerStep.id}).update({dueAt:new Date(0),triggeredAt:new Date()});
  try{await until(async()=>!!await db('customerVisitReminderDeliveries').where({workflowId:customerWorkflow,visitId:customerLink.visitId,status:'sent'}).first(),'Customer visit reminder did not send through Redis');}catch(error){console.log({step:await db('workflowSteps').where({id:customerStep.id}).select('status','dueAt','triggeredAt'),receipts:await db('customerVisitReminderDeliveries').where({workflowId:customerWorkflow}).select('status','attempts'),failed:(await queue.getJobs(['failed'])).map(job=>job.failedReason)});throw error;}
  const customerReceipt=await db('customerVisitReminderDeliveries').where({workflowId:customerWorkflow,visitId:customerLink.visitId}).first();assert(sent.includes(`customer-visit-${customerReceipt.id}`));

  const coldWorkflow=randomUUID();
  await db('workflows').insert({id:coldWorkflow,workspaceId,publisherId:owner,name:'Cold assigned leads',rule:'Notify the owner after inactivity',status:'active',definition:JSON.stringify({kind:'assigned_lead_cold',businessDays:3,localTime:'09:00',recipientMode:'owner',timezone:'America/New_York',notifications:{inApp:true,email:true}})});
  await until(async()=>!!await db('workflowSteps').where({workflowId:coldWorkflow,recordKind:'cold_lead_init',status:'completed'}).first(),'Cold lead initialization did not complete');
  const coldLead=await lead();await db('leads').where({id:coldLead}).update({ownerId:owner,lastActivityAt:new Date()});
  const coldStep=await db('workflowSteps').where({workflowId:coldWorkflow,leadId:coldLead,recordKind:'cold_lead',status:'queued'}).first();assert(coldStep);
  await db('workflowSteps').where({id:coldStep.id}).update({dueAt:new Date(0)});
  await until(async()=>!!await db('leadWorkflowNotifications').where({workflowId:coldWorkflow,leadId:coldLead,emailStatus:'sent'}).first(),'Cold lead reminder did not send through Redis');
  const coldNotice=await db('leadWorkflowNotifications').where({workflowId:coldWorkflow,leadId:coldLead}).first();assert.equal(subjects.get(`lead-workflow-notification-${coldNotice.id}`),'Assigned lead needs attention');
  assert.equal(sent.filter(key=>key===`lead-workflow-notification-${coldNotice.id}`).length,1);

  const postWorkflow=randomUUID();
  await db('workflows').insert({id:postWorkflow,workspaceId,publisherId:owner,name:'Post-job thank-you',rule:'Thank customers after finished work',status:'active',definition:JSON.stringify({kind:'post_job_thank_you',localTime:'09:00',recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:false,email:true},rules:{calendarDays:2,reviewUrl:'',messageChoice:'default',thankYouMessage:'Thank you for choosing us.'}})});
  const postJob=await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Private post-job fixture',primaryOwnerId:null});
  await db('jobs').where({workspaceId,id:postJob.jobId}).update({status:'completed'});
  const postStep=await db('workflowSteps').where({workflowId:postWorkflow,jobId:postJob.jobId,recordKind:'post_job',status:'queued'}).first();assert(postStep);
  await db('workflowSteps').where({id:postStep.id}).update({dueAt:new Date(0)});
  await until(async()=>!!await db('postJobDeliveries').where({workflowId:postWorkflow,jobId:postJob.jobId,status:'sent'}).first(),'Post-job thank-you did not send through Redis');
  const postKey=`post-job-${workspaceId}-${postJob.jobId}-${bookingCustomer}`;
  assert.equal(sent.filter(key=>key===postKey).length,1);assert.equal(subjects.get(postKey),'Thank you for choosing Queue fixture');
  assert.equal((await queue.getJobCounts('failed')).failed,0);

  const changeWorkflowId=randomUUID();
  await db('workflows').insert({id:changeWorkflowId,workspaceId,publisherId:owner,name:'Customer schedule changes',rule:'Email customers after schedule edits',status:'active',definition:JSON.stringify({kind:'customer_schedule_change',quietMinutes:5,maxBurstMinutes:15,recipientId:owner,recipientName:'Queue fixture',timezone:'America/New_York',notifications:{inApp:false,email:true}})});
  const changedJob=await createJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,submissionId:randomUUID(),customerId:bookingCustomer,postalCode:'10001',title:'Private schedule-change fixture',primaryOwnerId:null,scheduledDate:customerDate,arrivalWindow:'09:00-11:00'});
  assert.equal(await db('customerScheduleNotices').where({workflowId:changeWorkflowId}).first(),undefined);
  await mutateJob(db,{workspaceId,userId:owner},permissionIds,{workspaceId,jobId:changedJob.jobId,expectedVersion:1,submissionId:randomUUID(),action:'schedule',scheduledDate:customerDate,arrivalWindow:'13:00-15:00'});
  const changedLink=await db('calendarVisitRecords').where({workspaceId,jobId:changedJob.jobId}).whereNull('endedAt').first();
  await db('calendarVisits').where({workspaceId,id:changedLink.visitId}).update({arrivalWindow:'14:00-16:00'});
  const changeNotice=await db('customerScheduleNotices').where({workflowId:changeWorkflowId,status:'queued'}).first();assert(changeNotice);assert.equal(changeNotice.version,2);
  await db('customerScheduleNotices').where({id:changeNotice.id}).update({dueAt:new Date(0)});
  await until(async()=>!!await db('customerScheduleNotices').where({id:changeNotice.id,status:'sent'}).first(),'Customer schedule-change notice did not send through Redis');
  assert.equal(sent.filter(key=>key.startsWith(`customer-schedule-${changeNotice.id}-`)).length,1);
  assert.equal((await queue.getJobCounts('failed')).failed,0);

  console.log("Real Redis workflow queue: committed-event wakeup, delayed schedules, duplicate jobs, pause/resume/delete, email retries, queue-loss recovery, tenant isolation both estimate recipes saved briefing unassigned visit materials reminders routing assignment email retries, routine booking/no-slot availability rechecks, cancellation suggestions/email, branded completion handoff, annual customer review/digest, customer visit reminder emails, assigned-lead inactivity, post-job thank-you, coalesced customer schedule-change emails and stale edit ticket rejection passed with fake email transport.");
} finally {
  await stop?.(); await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); await db.destroy();
  if (created) await admin.raw("DROP DATABASE ?? WITH (FORCE)", [name]); await admin.destroy();
  if (baseURL === undefined) delete process.env.BETTER_AUTH_URL; else process.env.BETTER_AUTH_URL = baseURL;
}
