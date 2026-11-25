import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds } from "@salesmora/contracts";
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { editWorkflow, readWorkflowEditData, workflowEditValues } from "./editing";
import { WorkflowConflictError, changeWorkflow } from "./store";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { readWorkflowQueueEntry } from "./queue";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use a separate local _test database.");
const name = `workflow_edit_${randomUUID().replaceAll("-", "")}_test`;
const adminDb = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const owner = randomUUID(), teammate = randomUUID(), field = randomUUID(), workspaceId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
// This rehearsal covers the original date-based staff recipes; event/service recipes have dedicated fixtures.
const reminderKinds=['unscheduled_estimate','estimate_follow_up','unassigned_lead','weekly_briefing','unassigned_visit','visit_materials'] as const;
let created = false;
try {
  await adminDb.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, teammate, field].map(id => ({ id, name: id === owner ? "Edit Owner" : id === teammate ? "Edit Teammate" : "Field Reader",
      email: `${id}@example.test`, emailVerified: true, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Edit fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert([{ workspaceId, userId: owner, role: "owner" }, { workspaceId, userId: teammate, role: "admin" }, { workspaceId, userId: field, role: "field" }]);
    await initializeWorkspacePolicy(trx, identity);
  });
  await db('workspaceSubscriptions').insert({workspaceId,plan:'premium',status:'active',catalogVersion:'fixture',paidThrough:new Date(Date.now()+86400000)});
  const threadId = randomUUID(); await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  async function prepare(input: unknown) {
    const turnId = randomUUID(); await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "edit-fixture",
      surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
    return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => prepareWorkflowInTransaction(trx, context, { threadId, turnId }, input));
  }
  const workflows = new Map<string, string>();
  for (const kind of reminderKinds) {
    const draft = await prepare({ kind, name: `${kind} reminder`, businessDays: ["unassigned_visit", "visit_materials", "weekly_briefing"].includes(kind) ? null : 1, recipient: "me" });
    await decideWorkflow(db, identity, enabled, { workspaceId, id: draft.id, inputHash: draft.inputHash, decision: "confirm" }); workflows.set(kind, draft.id);
  }
  const lead = async (at = "2027-03-12T18:00:00Z") => {
    const id = randomUUID(); await db("leads").insert({ id, workspaceId, name: "Edit lead", email: "", phone: "", service: "Repair", submissionId: randomUUID(), submissionHash: "fixture",
      address: "", details: "", source: "other", notes: "", stage: "new", createdAt: new Date(at) }); return id;
  };
  const leadId = await lead(), estimateId = randomUUID();
  await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId, name: "Edit estimate", status: "accepted", decidedAt: new Date("2027-03-12T18:00:00Z") });
  await db.raw("SELECT workflow_enroll_record(?, 'estimate_follow_up', ?, ?)", [workspaceId, estimateId, "2027-03-12T18:00:00Z"]);
  const jobId = randomUUID(), visitId = randomUUID(), orderId = randomUUID();
  await db("jobs").insert({ id: jobId, workspaceId, title: "Edit visit", customerName: "Fixture", service: "Repair", location: "", description: "", status: "scheduled", scheduledDate: "2027-03-15" });
  await db("calendarVisits").insert({ id: visitId, workspaceId, scheduledDate: "2027-03-15" });
  await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId });
  await db("workOrders").insert({ id: orderId, workspaceId, jobId, title: "Edit material work", status: "issued", createdBy: owner, issuedAt: new Date() });
  await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, workOrderId: orderId });
  await db("workOrderMaterials").insert({ id: randomUUID(), workspaceId, workOrderId: orderId, position: 0, name: "Fixture part", quantity: 1, unit: "each", status: "needed" });
  for (const kind of reminderKinds) {
    const id = workflows.get(kind)!;
    let version = 1;
    if (kind === "estimate_follow_up") { await changeWorkflow(db, identity, enabled, { workspaceId, id, version, action: "pause" }); version++; }
    const data = await readWorkflowEditData(db, identity, enabled, { workspaceId, id, version });
    assert.deepEqual(data.recipients.map(person => person.id).sort(), [owner, teammate].sort());
    await assert.rejects(readWorkflowEditData(db, { workspaceId, userId: field }, enabled, { workspaceId, id, version }), AuthorizationAccessError);
    const pending = await db("workflowSteps").where({ workflowId: id }).whereIn("status", ["queued", "held"]).whereNot("recordKind", "visit_init").first(); assert(pending, kind);
    const ticket = await db("workflowQueueOutbox").where({ stepId: pending.id }).first(); assert(ticket);
    const values = { ...workflowEditValues(data.workflow.name, data.workflow.definition), name: `Updated ${kind}`, localTime: "07:30", recipientId: teammate,
      businessDays: "businessDays" in data.workflow.definition ? 2 : null, notifications: { inApp: true, email: true } };
    const command = { workspaceId, id, version, requestId: randomUUID(), values };
    await assert.rejects(editWorkflow(db, identity, enabled.filter(permission => permission !== "workflows.publish"), command), AuthorizationAccessError);
    await assert.rejects(editWorkflow(db, identity, enabled, { ...command, values: { ...values, kind: "weekly_briefing" } }));
    const saved = await editWorkflow(db, identity, enabled, command);
    assert.equal(saved.row.version, version + 1); assert.equal(saved.definition.kind, kind); assert.equal(saved.definition.recipientId, teammate);
    assert.equal(saved.row.status, kind === "estimate_follow_up" ? "paused" : "active"); assert(saved.row.rule.includes("7:30 AM"));
    const retimed = await db("workflowSteps").where({ id: pending.id }).first();
    assert.equal(retimed.status, pending.status, "saving preserves held/queued state");
    if (["unassigned_lead", "unscheduled_estimate", "estimate_follow_up"].includes(kind)) assert.equal(retimed.dueAt.toISOString(), "2027-03-16T11:30:00.000Z");
    else if (kind !== "weekly_briefing") assert.equal(retimed.dueAt.toISOString(), "2027-03-14T11:30:00.000Z");
    else assert.equal((await db.raw(`SELECT to_char(?::timestamptz AT TIME ZONE 'America/New_York','ID HH24:MI') AS local`, [retimed.dueAt])).rows[0].local, "1 07:30");
    assert.equal(await readWorkflowQueueEntry(db, { id: ticket.id, workspaceId, version: ticket.version }), undefined, "old queue tickets are invalidated");
    assert.deepEqual(await editWorkflow(db, identity, enabled, command), saved, "retry does not duplicate an edit");
    await assert.rejects(editWorkflow(db, identity, enabled, { ...command, values: { ...values, localTime: "22:00" } }), WorkflowConflictError);
    await assert.rejects(editWorkflow(db, identity, enabled, { ...command, requestId: randomUUID() }), WorkflowConflictError);
    await assert.rejects(readWorkflowEditData(db, identity, enabled, { workspaceId, id, version }), WorkflowConflictError);
    const noop = await editWorkflow(db, identity, enabled, { workspaceId, id, version: saved.row.version, requestId: randomUUID(), values: workflowEditValues(saved.row.name, saved.definition) });
    assert.equal(noop.row.version, saved.row.version, "unchanged settings do not create a revision");
    const audit = await db("workflowEditAudit").where({ workflowId: id }).first();
    assert.equal(audit.before.definition.recipientId, owner); assert.equal(audit.after.definition.recipientId, teammate);
  }
  const materialId = workflows.get("visit_materials")!;
  const materialData = await readWorkflowEditData(db, identity, enabled, { workspaceId, id: materialId, version: 2 });
  await editWorkflow(db, identity, enabled, { workspaceId, id: materialId, version: 2, requestId: randomUUID(),
    values: { ...workflowEditValues(materialData.workflow.name, materialData.workflow.definition), notifications: { inApp: false, email: true } } });
  const channelDraft = await prepare({ operation: "edit", workflowRef: materialId, localTime: "08:45", notifications: { inApp: null, email: true } });
  assert.deepEqual(channelDraft.definition.notifications, { inApp: false, email: true }, "one-channel edits preserve the other saved flag");
  await decideWorkflow(db, identity, enabled, { workspaceId, id: channelDraft.id, inputHash: channelDraft.inputHash, decision: "cancel" });
  assert.equal((await db("workflows").where({ id: materialId }).first()).definition.localTime, "07:30", "Cancel never applies a proposed edit");
  const id = workflows.get("unassigned_lead")!;
  const preview = await previewWorkflowRun(db, identity, enabled, { workspaceId, id, version: 2 });
  await confirmWorkflowRun(db, identity, enabled, { workspaceId, id, version: 2, previewId: preview.id });
  const completed = await db("workflowSteps").where({ workflowId: id, status: "completed" }).first(); assert(completed);
  const oldNotice = await db("leadWorkflowNotifications").where({ workflowId: id, emailStatus: "queued" }).first(); assert(oldNotice);
  const current = await readWorkflowEditData(db, identity, enabled, { workspaceId, id, version: 2 });
  const renamed = await editWorkflow(db, identity, enabled, { workspaceId, id, version: 2, requestId: randomUUID(),
    values: { ...workflowEditValues(current.workflow.name, current.workflow.definition), name: "Renamed lead reminder" } });
  assert.equal((await db("leadWorkflowNotifications").where({ id: oldNotice.id }).first()).emailStatus, "queued", "renaming does not drop a completed reminder's pending email");
  const values = { ...workflowEditValues(renamed.row.name, renamed.definition), localTime: "10:00", recipientId: owner, businessDays: 3 };
  const second = await editWorkflow(db, identity, enabled, { workspaceId, id, version: renamed.row.version, requestId: randomUUID(), values });
  assert.equal((await db("workflowSteps").where({ id: completed.id }).first()).dueAt.toISOString(), completed.dueAt.toISOString());
  assert.equal((await db("workflowSteps").where({ id: completed.id }).first()).status, "completed");
  assert.equal((await db("leadWorkflowNotifications").where({ id: oldNotice.id }).first()).userId, teammate, "completed in-app history is not moved to the new recipient");
  assert.equal((await db("leadWorkflowNotifications").where({ id: oldNotice.id }).first()).emailStatus, "skipped", "old unsent email cannot send using changed settings");
  const nextLead = await lead();
  assert.equal((await db("workflowSteps").where({ workflowId: id, leadId: nextLead }).first()).dueAt.toISOString(), "2027-03-17T14:00:00.000Z");
  await db("leads").where({ id: nextLead }).update({ createdAt: new Date("2027-03-19T18:00:00Z") });
  const third = await editWorkflow(db, identity, enabled, { workspaceId, id, version: second.row.version, requestId: randomUUID(), values: { ...values, businessDays: 4 } });
  assert.equal((await db("workflowSteps").where({ workflowId: id, leadId: nextLead }).first()).dueAt.toISOString(), "2027-03-18T14:00:00.000Z", "delay edits retain the original event anchor");
  await assert.rejects(prepare({ operation: "edit", workflowRef: id, kind: null, name: null, recipient: null, notifications: null, businessDays: null, localTime: null }));
  const editDraft = await prepare({ operation: "edit", workflowRef: id, kind: null, name: null, recipient: null, notifications: null, businessDays: null, localTime: "08:15" });
  assert.equal(editDraft.definition.recipientId, owner); assert.equal(editDraft.editing?.version, third.row.version);
  assert.equal((await db("workflows").where({ id }).first()).definition.localTime, "10:00", "preparation saves no edit");
  const edited = await decideWorkflow(db, identity, enabled, { workspaceId, id: editDraft.id, inputHash: editDraft.inputHash, decision: "confirm" });
  assert.equal((edited && "localTime" in edited.definition ? edited.definition.localTime : undefined), "08:15"); assert.equal((await db("workflows").where({ id }).first()).definition.localTime, "08:15");
  assert.equal(Number((await db("workflows").where({ workspaceId }).count({ count: "*" }).first())?.count), 6, "assistant edits do not create another workflow");
  const stale = await prepare({ operation: "edit", workflowRef: id, localTime: "09:45" });
  const currentRow = await db("workflows").where({ id }).first();
  await changeWorkflow(db, identity, enabled, { workspaceId, id, version: currentRow.version, action: "pause" });
  await assert.rejects(decideWorkflow(db, identity, enabled, { workspaceId, id: stale.id, inputHash: stale.inputHash, decision: "confirm" }), WorkflowConflictError);
  await assert.rejects(prepare({ operation: "edit", workflowRef: id, kind: "weekly_briefing" }));
  const pendingReview = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: workflows.get("unscheduled_estimate")!, version: 2 });
  const estimateCurrent = await readWorkflowEditData(db, identity, enabled, { workspaceId, id: workflows.get("unscheduled_estimate")!, version: 2 });
  await editWorkflow(db, identity, enabled, { workspaceId, id: workflows.get("unscheduled_estimate")!, version: 2, requestId: randomUUID(), values: { ...workflowEditValues(estimateCurrent.workflow.name, estimateCurrent.workflow.definition), name: "Renamed once more" } });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { workspaceId, id: workflows.get("unscheduled_estimate")!, version: 2, previewId: pendingReview.id }), WorkflowConflictError);
  console.log("Workflow editing: all six recipes, recipient scopes, paused state, anchored retiming/DST, stale queue tickets, retry receipts, completed history/unsent email, assistant review and stale edit/manual previews passed.");
} finally {
  await db.destroy(); if (created) await adminDb.raw("DROP DATABASE ??", [name]); await adminDb.destroy();
}
