import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds, notificationResultSchema } from "@salesmora/contracts";
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { createJob } from "../jobs/store";
import { createWorkOrder } from "../work-orders/mutations";
import { readWorkOrderCreationVisit } from "../calendar/commands";
import { readCalendar } from "../calendar/read";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { initializeWorkflowVisits } from "./visits";
import { processWorkflowStep } from "./execution";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { changeWorkflow, WorkflowConflictError } from "./store";
import { readNotifications, markNotificationRead, saveNotificationPreferences } from "../notifications/store";
import { processWorkflowVisitEmails } from "../notifications/workflow-visits";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use a separate local _test database.");
const name = `workflow_visit_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const owner = randomUUID(), crew = randomUUID(), workspaceId = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, crew].map(id => ({ id, name: id === owner ? "Visit Owner" : "Field Reader", email: `${id}@example.test`,
      emailVerified: true, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Visit fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert([{ workspaceId, userId: owner, role: "owner" }, { workspaceId, userId: crew, role: "field" }]);
    await initializeWorkspacePolicy(trx, identity);
    await trx("customers").insert({ id: customerId, workspaceId, name: "Visit customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  const tomorrow = (await db.raw(`SELECT to_char((now() AT TIME ZONE 'America/New_York')::date + 1,'YYYY-MM-DD') AS date`)).rows[0].date;
  async function job(title: string, date = "2027-03-15", assigned: string | null = null) {
    const result = await createJob(db, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title, primaryOwnerId: assigned, scheduledDate: date });
    const record = await db("calendarVisitRecords").where({ workspaceId, jobId: result.jobId }).whereNull("endedAt").first("visitId");
    return { id: result.jobId, visitId: record.visitId as string };
  }
  const existing = await job("Existing future booking");
  const threadId = randomUUID(), turnId = randomUUID();
  await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "fixture",
    surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
  const proposal = await withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId }, { kind: "unassigned_visit", name: "Upcoming visit has no assignee", businessDays: null, recipient: "me" }));
  assert.equal(proposal.rule, "Notify Visit Owner at 9 AM the day before a visit if nobody is assigned.");
  await decideWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, inputHash: proposal.inputHash, decision: "confirm" });
  const initialization = await db("workflowSteps").where({ workflowId: proposal.id, recordKind: "visit_init", status: "queued" }).first(); assert(initialization);
  const queries: string[] = [], observe = (query: { sql: string }) => queries.push(query.sql);
  db.on("query", observe);
  assert.equal((await initializeWorkflowVisits(db, workspaceId, initialization.id)).enrolled, 1);
  db.off("query", observe);
  assert(queries.length <= 12, `Initialization exceeded its statement budget: ${queries.length}`);
  console.log(`Visit initialization statements including transaction/authorization: ${queries.length}`);
  const step = (visitId: string, date?: string) => db("workflowSteps").where({ workflowId: proposal.id, visitId }).modify(q => { if (date) q.where("visitDate", date); }).orderBy("dueAt", "desc").first();
  assert.equal((await step(existing.visitId)).dueAt.toISOString(), "2027-03-14T13:00:00.000Z", "Sunday at 9 AM across spring DST");
  const autumn = await job("Autumn booking", "2027-11-08");
  assert.equal((await step(autumn.visitId)).dueAt.toISOString(), "2027-11-07T14:00:00.000Z", "Sunday at 9 AM across fall DST");
  const assigned = await job("Assigned booking", "2027-03-15", crew);
  assert.equal(await step(assigned.visitId), undefined);
  const supporting = await job("Supporting team counts");
  await db("jobTeamMembers").insert({ workspaceId, jobId: supporting.id, userId: crew });
  assert.equal((await step(supporting.visitId)).status, "canceled");
  await db("jobTeamMembers").where({ workspaceId, jobId: supporting.id, userId: crew }).delete();
  assert.equal((await step(supporting.visitId)).status, "queued");
  // Native Calendar's unassigned filter and workflow eligibility agree for shared visits.
  const choice = await readWorkOrderCreationVisit(db, identity, enabled, existing.id); assert(choice?.canJoin);
  const order = await createWorkOrder(db, identity, enabled, { workspaceId, submissionId: randomUUID(), jobId: existing.id,
    title: "Shared work", assigneeId: crew, visit: { kind: "job", visitId: choice.id, revision: choice.revision } });
  assert.equal((await step(existing.visitId)).status, "canceled", "assigned Work Order covers shared visit");
  await db("workOrders").where({ id: order.workOrderId }).update({ primaryAssigneeId: null });
  const assignedCrew = await db("workOrderCrew").where({ workOrderId: order.workOrderId }).select("userId");
  if (assignedCrew.length) await db("workOrderCrew").where({ workOrderId: order.workOrderId }).delete();
  assert.equal((await step(existing.visitId)).status, "queued");
  const calendar = await readCalendar(db, identity, enabled, { workspaceId, date: "2027-03-15", person: "unassigned" });
  const nativeIds = calendar.entries.map(v => v.id);
  assert(nativeIds.includes(existing.visitId)); assert(!nativeIds.includes(assigned.visitId));
  assert.equal((await db.raw("SELECT workflow_visit_unassigned(?,?) AS eligible", [workspaceId, existing.visitId])).rows[0].eligible, true);
  for (let n = 0; n < 5; n++) {
    const current = await readWorkOrderCreationVisit(db, identity, enabled, existing.id); assert(current?.canJoin);
    await createWorkOrder(db, identity, enabled, { workspaceId, submissionId: randomUUID(), jobId: existing.id,
      title: `Shared extra ${n}`, assigneeId: null, visit: { kind: "job", visitId: current.id, revision: current.revision } });
  }
  const currentStep = await step(existing.visitId);
  await db("workflowSteps").where({ id: currentStep.id }).update({ dueAt: new Date(0) });
  assert.equal((await processWorkflowStep(db, workspaceId, currentStep.id)).delivered, 1);
  assert.equal((await processWorkflowStep(db, workspaceId, currentStep.id)).delivered, 0);
  const notice = await db("workflowVisitNotifications").where({ workflowId: proposal.id, visitId: existing.visitId }).first();
  assert.equal(notice.snapshot.totalRecords, 7); assert.equal(notice.snapshot.recordLabels.length, 5, "notice projection remains bounded for large shared visits");
  assert(await db("workflowQueueOutbox").where({ kind: "visit_email", visitNoticeId: notice.id }).first());
  const feed = notificationResultSchema.parse(await readNotifications(db, identity, enabled));
  assert.equal(feed.items.filter(item => item.kind === "workflow_visit" && item.visitId === existing.visitId).length, 1);
  assert(!(await readNotifications(db, identity, enabled.filter(p => p !== "workorders.read"))).items.some(item => item.kind === "workflow_visit"));
  await markNotificationRead(db, identity, enabled, notice.id);
  assert(!(await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id));
  let sent = 0;
  assert.equal((await processWorkflowVisitEmails(db, enabled, async mail => { assert.equal(mail.snapshot.totalRecords, 7); sent++; })).sent, 1);
  assert.equal(sent, 1);
  // Losing visibility of one linked record hides the entire old projection, never stale labels.
  await db("workflowVisitNotifications").where({ id: notice.id }).update({ readAt: null });
  await db("workOrders").where({ id: order.workOrderId }).update({ archivedAt: new Date() });
  assert(!(await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id));
  await db("workOrders").where({ id: order.workOrderId }).update({ archivedAt: null });
  await markNotificationRead(db, identity, enabled, notice.id);

  await db("calendarVisits").where({ id: existing.visitId }).update({ scheduledDate: "2027-03-16" });
  assert.equal((await step(existing.visitId, "2027-03-16")).status, "queued");
  await db("calendarVisits").where({ id: existing.visitId }).update({ scheduledDate: "2027-03-15" });
  assert.equal((await step(existing.visitId, "2027-03-15")).status, "completed", "returning to delivered date does not resend");
  const manual = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  assert(manual.matchedCount >= 2);
  await db("calendarVisits").where({ id: autumn.visitId }).update({ scheduledDate: "2027-11-09" });
  const late = await job("Created after preview");
  const receipt = await confirmWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, previewId: manual.id });
  assert(receipt.completedCount >= 1); assert(receipt.skippedCount >= 1);
  assert.equal(await db("workflowVisitNotifications").where({ visitId: late.visitId }).first(), undefined);
  assert.deepEqual(await confirmWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, previewId: manual.id }), receipt);
  await assert.rejects(previewWorkflowRun(db, { workspaceId, userId: crew }, enabled, { workspaceId, id: proposal.id, version: 1 }), AuthorizationAccessError);
  const expired = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  await db("workflowManualRuns").where({ id: expired.id }).update({ expiresAt: new Date(0) });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, previewId: expired.id }), WorkflowConflictError);
  // Assignment after enqueue suppresses the selected email.
  await db("jobTeamMembers").insert({ workspaceId, jobId: supporting.id, userId: crew });
  const skipped = await processWorkflowVisitEmails(db, enabled, async () => { throw Error("Synthetic retry"); }); assert(skipped.skipped >= 1);
  const overdue = await job("Cleared schedule"); const old = await step(overdue.visitId);
  await db("calendarVisits").where({ id: overdue.visitId }).update({ scheduledDate: null });
  assert.equal((await step(overdue.visitId)).status, "canceled");
  assert.equal((await processWorkflowStep(db, workspaceId, old.id)).delivered, 0);
  const lateScheduled = await job("Tomorrow late booking", tomorrow);
  assert((await step(lateScheduled.visitId)).dueAt.getTime() <= Date.now() + 86400000);
  await saveNotificationPreferences(db, identity, enabled, { leadAssignedEmail: true, workflowVisitEmail: false });
  const lateStep = await step(lateScheduled.visitId); await db("workflowSteps").where({ id: lateStep.id }).update({ dueAt: new Date(0) });
  await processWorkflowStep(db, workspaceId, lateStep.id);
  assert((await processWorkflowVisitEmails(db, enabled, async () => { throw Error("Opted out"); })).skipped >= 1);
  // More than one batch, and a concurrent event moving behind the cursor, do not lose a visit.
  const bulk = Array.from({ length: 106 }, () => ({ jobId: randomUUID(), visitId: randomUUID() }));
  await db.transaction(async trx => {
    await trx("jobs").insert(bulk.map(row => ({ id: row.jobId, workspaceId, title: "Batch visit", customerName: "Fixture", service: "Repair", location: "", description: "", status: "scheduled", scheduledDate: "2099-01-05" })));
    await trx("calendarVisits").insert(bulk.map(row => ({ id: row.visitId, workspaceId, scheduledDate: "2099-01-05" })));
    await trx("calendarVisitRecords").insert(bulk.map(row => ({ id: randomUUID(), workspaceId, visitId: row.visitId, jobId: row.jobId })));
  });
  const second = randomUUID();
  await db("workflows").insert({ id: second, workspaceId, publisherId: owner, name: "Batch enrollment", rule: "Day before at 9 AM", status: "active",
    definition: JSON.stringify(proposal.definition), enrollAfter: new Date() });
  const init = await db("workflowSteps").where({ workflowId: second, recordKind: "visit_init", status: "queued" }).first();
  assert.equal((await initializeWorkflowVisits(db, workspaceId, init.id)).enrolled, 100);
  assert.equal((await db("workflowSteps").where({ id: init.id }).first()).status, "queued");
  const seeded = new Set((await db("workflowSteps").where({ workflowId: second, recordKind: "visit" }).select("visitId")).map(row => row.visitId));
  const moved = bulk.find(row => !seeded.has(row.visitId)); assert(moved);
  await db("calendarVisits").where({ id: moved.visitId }).update({ scheduledDate: "2027-03-17" });
  await initializeWorkflowVisits(db, workspaceId, init.id);
  assert.equal((await db("workflowSteps").where({ id: init.id }).first()).status, "completed");
  assert(await db("workflowSteps").where({ workflowId: second, visitId: moved.visitId, visitDate: "2027-03-17", status: "queued" }).first());
  const eligible = await db("calendarVisits").where({ workspaceId }).whereRaw(`"scheduledDate" > (now() AT TIME ZONE 'America/New_York')::date AND workflow_visit_unassigned("workspaceId",id)`).count({ count: "*" }).first();
  assert.equal((await db("workflowSteps").where({ workflowId: second, recordKind: "visit", status: "queued" })).length, Number(eligible?.count));
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, action: "pause" });
  const paused = await job("Scheduled while paused"); assert.equal(await step(paused.visitId), undefined);
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 2, action: "resume" });
  const restart = await db("workflowSteps").where({ workflowId: proposal.id, recordKind: "visit_init", status: "queued" }).first(); assert(restart);
  await initializeWorkflowVisits(db, workspaceId, restart.id); assert(await step(paused.visitId));
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 3, action: "delete", confirmation: "confirm" });
  assert.equal((await db("workflowSteps").where({ workflowId: proposal.id, status: "queued" })).length, 0);
  console.log("Unassigned visit: publication, bounded initialization, native shared-visit eligibility, DST/weekends, event changes, exact manual dates, notification/read/email access/preferences and lifecycle passed.");
} finally { await db.destroy(); if (created) await admin.raw("DROP DATABASE ??", [name]); await admin.destroy(); }
