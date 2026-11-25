import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds, type WorkOrderMaterialView } from "@salesmora/contracts";
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { createJob } from "../jobs/store";
import { createWorkOrder, mutateWorkOrder } from "../work-orders/mutations";
import { readWorkOrderCreationVisit } from "../calendar/commands";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { initializeWorkflowVisits } from "./visits";
import { processWorkflowStep } from "./execution";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { changeWorkflow } from "./store";
import { readNotifications, markNotificationRead, saveNotificationPreferences } from "../notifications/store";
import { processWorkflowVisitEmails } from "../notifications/workflow-visits";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use a separate local _test database.");
const name = `visit_materials_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const owner = randomUUID(), field = randomUUID(), workspaceId = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, field].map(id => ({ id, name: id === owner ? "Materials Owner" : "Field Reader", email: `${id}@example.test`, emailVerified: true,
      termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Materials fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert([{ workspaceId, userId: owner, role: "owner" }, { workspaceId, userId: field, role: "field" }]);
    await initializeWorkspacePolicy(trx, identity);
    await trx("customers").insert({ id: customerId, workspaceId, name: "Materials customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  async function order(jobId: string) {
    const choice = await readWorkOrderCreationVisit(db, identity, enabled, jobId); assert(choice?.canJoin);
    return (await createWorkOrder(db, identity, enabled, { workspaceId, submissionId: randomUUID(), jobId, title: "Install faucet", assigneeId: owner,
      visit: { kind: "job", visitId: choice.id, revision: choice.revision } })).workOrderId;
  }
  async function job(date = "2027-03-15") {
    const result = await createJob(db, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: "Kitchen repair", primaryOwnerId: owner, scheduledDate: date });
    const record = await db("calendarVisitRecords").where({ jobId: result.jobId }).whereNull("endedAt").first("visitId");
    return { jobId: result.jobId, visitId: record.visitId as string, orderId: await order(result.jobId) };
  }
  async function materials(workOrderId: string, statuses: WorkOrderMaterialView["status"][]) {
    const row = await db("workOrders").where({ id: workOrderId }).first("version");
    await mutateWorkOrder(db, identity, enabled, { workspaceId, workOrderId, submissionId: randomUUID(), expectedVersion: row.version, action: "materials",
      materials: statuses.map((status, index) => ({ name: `Part ${index}`, quantity: index + 1, unit: "each", status, note: "PRIVATE_MATERIAL_NOTE", customerPriceCents: 9999, costCents: 1234 })) });
  }
  async function issue(workOrderId: string) {
    const row = await db("workOrders").where({ id: workOrderId }).first("version");
    await mutateWorkOrder(db, identity, enabled, { workspaceId, workOrderId, submissionId: randomUUID(), expectedVersion: row.version, action: "status", to: "issued", confirmed: true });
  }
  const existing = await job(); await materials(existing.orderId, ["needed", "needed", "ordered", "on-hand", "used"]); await issue(existing.orderId);
  const threadId = randomUUID(); await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  async function prepare(recipient = "me", permissions = enabled) {
    const turnId = randomUUID();
    await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "materials-fixture",
      surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
    return withWorkspaceAuthorization(db, identity, permissions, true, (trx, context) => prepareWorkflowInTransaction(trx, context, { threadId, turnId },
      { kind: "visit_materials", name: "Visit materials need attention", businessDays: null, localTime: "08:00", recipient }));
  }
  await assert.rejects(prepare("Field Reader"));
  await assert.rejects(prepare("me", enabled.filter(id => id !== "workorders.read")), AuthorizationAccessError);
  const draft = await prepare(); assert(draft.rule.includes("8 AM")); assert.deepEqual(draft.definition.notifications, { inApp: true, email: true });
  await decideWorkflow(db, identity, enabled, { workspaceId, id: draft.id, inputHash: draft.inputHash, decision: "confirm" });
  const step = (visitId: string) => db("workflowSteps").where({ workflowId: draft.id, visitId, recordKind: "visit" }).orderBy("visitDate", "desc").first();
  const initializer = await db("workflowSteps").where({ workflowId: draft.id, recordKind: "visit_init", status: "queued" }).first(); assert(initializer);
  const statements: string[] = []; const countQuery = (query: { sql: string }) => statements.push(query.sql);
  db.on("query", countQuery); await initializeWorkflowVisits(db, workspaceId, initializer.id); db.off("query", countQuery);
  assert(statements.length <= 12, `bounded initialization used ${statements.length} statements`);
  assert.equal((await step(existing.visitId)).dueAt.toISOString(), "2027-03-14T12:00:00.000Z", "custom time across DST, assigned visit still eligible");
  assert(await db("workflowQueueOutbox").where({ stepId: (await step(existing.visitId)).id, completedAt: null }).first());
  await materials(existing.orderId, ["on-hand", "used"]); assert.equal((await step(existing.visitId)).status, "canceled");
  await materials(existing.orderId, ["ordered"]); assert.equal((await step(existing.visitId)).status, "queued", "list replacement rearms one existing occurrence");
  await materials(existing.orderId, []); assert.equal((await step(existing.visitId)).status, "canceled", "empty list is not missing materials");
  await db("workOrderTasks").insert({ id: randomUUID(), workspaceId, workOrderId: existing.orderId, label: "Install during visit", required: true, done: false, position: 0 });
  assert.equal((await previewWorkflowRun(db, identity, enabled, { workspaceId, id: draft.id, version: 1 })).matchedCount, 0, "required on-site tasks are not material readiness");
  await materials(existing.orderId, ["needed", "needed", "ordered", "on-hand"]);
  for (let index = 0; index < 5; index++) { const id = await order(existing.jobId); await materials(id, ["ordered"]); await issue(id); }
  const preview = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: draft.id, version: 1 }); assert.equal(preview.matchedCount, 1, "shared visit counts once");
  assert(preview.actionSummary.includes("materials marked Needed or Ordered"));
  const run = { workspaceId, id: draft.id, version: 1, previewId: preview.id };
  assert.equal((await confirmWorkflowRun(db, identity, enabled, run)).completedCount, 1);
  assert.equal((await confirmWorkflowRun(db, identity, enabled, run)).completedCount, 1, "duplicate confirmation returns receipt");
  let notice = await db("workflowVisitNotifications").where({ workflowId: draft.id, visitId: existing.visitId }).first();
  assert.equal(notice.snapshot.reason, "materials"); assert.equal(notice.snapshot.recordLabels.length, 5); assert.equal(notice.snapshot.totalRecords, 6);
  assert(notice.snapshot.recordLabels.some((label: string) => label.includes("2 Needed, 1 Ordered")));
  assert(!JSON.stringify(notice.snapshot).includes("PRIVATE_MATERIAL_NOTE")); assert(!JSON.stringify(notice.snapshot).includes("9999"));
  assert((await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id));
  let emails = 0;
  await processWorkflowVisitEmails(db, enabled, async mail => { emails++; assert.equal(mail.snapshot.reason, "materials"); }, 1, { id: notice.id, workspaceId });
  assert.equal(emails, 1);
  await markNotificationRead(db, identity, enabled, notice.id);
  assert(!(await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id));
  await materials(existing.orderId, ["ordered"]);
  assert.equal((await step(existing.visitId)).status, "completed", "a new issue cannot resend the same delivered visit/date");
  const candidate = await job("2027-11-08"); await materials(candidate.orderId, ["needed"]);
  assert.equal(await step(candidate.visitId), undefined, "Draft work orders excluded");
  await issue(candidate.orderId); assert.equal((await step(candidate.visitId)).dueAt.toISOString(), "2027-11-07T13:00:00.000Z", "issue event and fall DST");
  const stale = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: draft.id, version: 1 }); assert.equal(stale.matchedCount, 1);
  await materials(candidate.orderId, ["on-hand"]);
  assert.equal((await confirmWorkflowRun(db, identity, enabled, { workspaceId, id: draft.id, version: 1, previewId: stale.id })).completedCount, 0, "current state rechecked on confirmation");
  await materials(candidate.orderId, ["ordered"]);
  await db("calendarVisits").where({ id: candidate.visitId }).update({ scheduledDate: "2027-11-09" });
  assert.equal((await db("workflowSteps").where({ workflowId: draft.id, visitId: candidate.visitId, visitDate: "2027-11-08" }).first()).status, "canceled");
  const scheduled = await step(candidate.visitId); await db("workflowSteps").where({ id: scheduled.id }).update({ dueAt: new Date(Date.now() - 1000) });
  assert.equal((await processWorkflowStep(db, workspaceId, scheduled.id)).delivered, 1);
  notice = await db("workflowVisitNotifications").where({ workflowId: draft.id, visitId: candidate.visitId }).first();
  await saveNotificationPreferences(db, identity, enabled, { leadAssignedEmail: true, workflowVisitEmail: true, workflowMaterialsEmail: false });
  assert.equal((await processWorkflowVisitEmails(db, enabled, async () => { throw Error("opt-out ignored"); }, 1, { id: notice.id, workspaceId })).skipped, 1);
  await materials(candidate.orderId, ["on-hand"]);
  assert(!(await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id), "resolved material counts disappear from feed");
  const blocked = await job(); await materials(blocked.orderId, ["ordered"]); await issue(blocked.orderId);
  await db("workOrders").where({ id: blocked.orderId }).update({ archivedAt: new Date() }); assert.equal((await step(blocked.visitId)).status, "canceled");
  await db("workOrders").where({ id: blocked.orderId }).update({ archivedAt: null }); assert.equal((await step(blocked.visitId)).status, "queued");
  const starting = await db("workOrders").where({ id: blocked.orderId }).first("version");
  await mutateWorkOrder(db, identity, enabled, { workspaceId, workOrderId: blocked.orderId, submissionId: randomUUID(), expectedVersion: starting.version,
    action: "status", to: "in-progress" });
  const closing = await db("workOrders").where({ id: blocked.orderId }).first("version");
  await mutateWorkOrder(db, identity, enabled, { workspaceId, workOrderId: blocked.orderId, submissionId: randomUUID(), expectedVersion: closing.version,
    action: "complete", summary: "Completed fixture" }); assert.equal((await step(blocked.visitId)).status, "canceled");
  await changeWorkflow(db, identity, enabled, { workspaceId, id: draft.id, version: 1, action: "pause" });
  await changeWorkflow(db, identity, enabled, { workspaceId, id: draft.id, version: 2, action: "resume" });
  assert(await db("workflowSteps").where({ workflowId: draft.id, recordKind: "visit_init", status: "queued" }).first());
  await changeWorkflow(db, identity, enabled, { workspaceId, id: draft.id, version: 3, action: "delete", confirmation: "confirm" });
  assert.equal(Number((await db("workflowSteps").where({ workflowId: draft.id }).whereIn("status", ["queued", "held"]).count({ count: "*" }).first())?.count), 0);
  console.log(`Visit materials: custom times/DST, initialization (${statements.length} statements), actual list replacement/issue events, assigned/shared visits, bounded counts, empty/task exclusions, manual/scheduled delivery, email/preferences, stale state, archive/completion and lifecycle passed.`);
} finally {
  await db.destroy(); if (created) await admin.raw("DROP DATABASE ??", [name]); await admin.destroy();
}
