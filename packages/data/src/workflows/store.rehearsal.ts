import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds } from "@salesmora/contracts";
import { AuthorizationAccessError, initializeWorkspacePolicy, withWorkspaceAuthorization } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { processWorkflowReminders } from "./execution";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { changeWorkflowNotifications } from "./notifications";
import { processEstimateNotificationEmails } from "../notifications/estimates";
import { readNotifications, markNotificationRead } from "../notifications/store";
import { readWorkflows, changeWorkflow, WorkflowConflictError } from "./store";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw new Error("Use a separate local _test database.");
const name = `workflows_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection });
const url = new URL(connection);
url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const workspaceId = randomUUID(), otherWorkspace = randomUUID();
const owner = randomUUID(), other = randomUUID(), office = randomUUID(), field = randomUUID();
const identity = { userId: owner, workspaceId };
const enabled = [...permissionIds];
const id = randomUUID();
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]);
  created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, other, office, field].map(id => ({
      id, name: "Workflow fixture", email: `${id}@example.test`, termsVersion: "fixture",
      termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx("workspaces").insert([{ id: workspaceId, ownerId: owner }, { id: otherWorkspace, ownerId: other }].map(row => ({
      ...row, businessName: "Workflows fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York",
    })));
    await trx("workspaceMemberships").insert([
      { workspaceId, userId: owner, role: "owner" }, { workspaceId: otherWorkspace, userId: other, role: "owner" },
      { workspaceId, userId: office, role: "office" }, { workspaceId, userId: field, role: "field" },
    ]);
    await trx("workspaces").where({ id: workspaceId }).update({ planOverride: "premium", planOverrideReason: "Fixture", planOverrideId: randomUUID(), planOverrideEndsAt: new Date(Date.now() + 86400000) });
    await initializeWorkspacePolicy(trx, identity);
    await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspace, userId: other });
    await trx("workflows").insert({ id, workspaceId, name: "Reminder", rule: "Notify the office.", status: "active" });
    await trx("workflowSteps").insert([-3600000, 3600000].map(delay => ({
      id: randomUUID(), workspaceId, workflowId: id, status: "queued", dueAt: new Date(Date.now() + delay),
    })));
  });
  const list = () => readWorkflows(db, identity, enabled, { workspaceId });
  assert.equal((await list()).rows[0].pendingCount, 2);
  assert.deepEqual((await readWorkflows(db, { userId: office, workspaceId }, enabled, { workspaceId })).rows[0].allowedActions, []);
  await assert.rejects(readWorkflows(db, { userId: field, workspaceId }, enabled, { workspaceId }), AuthorizationAccessError);
  await assert.rejects(readWorkflows(db, identity, [], { workspaceId }), AuthorizationAccessError);
  await assert.rejects(changeWorkflow(db, { userId: office, workspaceId }, enabled, { workspaceId, id, version: 1, action: "pause" }), AuthorizationAccessError);
  await assert.rejects(changeWorkflow(db, { userId: other, workspaceId: otherWorkspace }, enabled,
    { workspaceId: otherWorkspace, id, version: 1, action: "pause" }), AuthorizationAccessError);
  await assert.rejects(changeWorkflow(db, identity, enabled, { workspaceId, id, version: 1, action: "delete" }));
  const concurrent = await Promise.allSettled([1, 2].map(() => changeWorkflow(db, identity, enabled, { workspaceId, id, version: 1, action: "pause" })));
  assert.equal(concurrent.filter(result => result.status === "fulfilled").length, 1);
  assert(concurrent.some(result => result.status === "rejected" && result.reason instanceof WorkflowConflictError));
  assert.equal(Number((await db("workflowSteps").where({ workflowId: id, status: "held" }).count({ count: "*" }).first())?.count), 2);
  await changeWorkflow(db, identity, enabled, { workspaceId, id, version: 2, action: "resume" });
  assert.equal(Number((await db("workflowSteps").where({ workflowId: id, status: "skipped" }).count({ count: "*" }).first())?.count), 1);
  await changeWorkflow(db, identity, enabled, { workspaceId, id, version: 3, action: "delete", confirmation: "confirm" });
  assert.equal((await list()).rows.length, 0);
  assert.equal(Number((await db("workflowSteps").where({ workflowId: id, status: "canceled" }).count({ count: "*" }).first())?.count), 1);
  assert.equal(Number((await db("workflowLifecycleAudit").where({ workflowId: id }).count({ count: "*" }).first())?.count), 3);
  const threadId = randomUUID(), turnId = randomUUID();
  await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(),
    requestHash: "fixture", surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(),
    proposalFamilies: JSON.stringify(["workflow"]) });
  const prepare = () => withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId }, { name: "Approved estimate reminder", businessDays: 1, recipient: "me" }));
  const proposal = await prepare();
  assert.equal((await list()).rows.length, 0, "preparing does not activate a workflow");
  const decision = { workspaceId, id: proposal.id, inputHash: proposal.inputHash, decision: "confirm" };
  await assert.rejects(decideWorkflow(db, identity, enabled, { ...decision, inputHash: "0".repeat(64) }), AuthorizationAccessError);
  await assert.rejects(decideWorkflow(db, { userId: other, workspaceId: otherWorkspace }, enabled,
    { ...decision, workspaceId: otherWorkspace }), AuthorizationAccessError);
  const published = await decideWorkflow(db, identity, enabled, decision);
  assert.equal(published?.state, "confirmed");
  assert.deepEqual(published?.definition.notifications, { inApp: true, email: true }, "new workflows default to both channels");
  await decideWorkflow(db, identity, enabled, decision);
  assert.equal((await list()).rows.length, 1, "repeat confirmation is idempotent");
  await db("workflows").where({ id: proposal.id }).update({ enrollAfter: new Date(Date.now() - 10 * 86400000) });
  const leadId = randomUUID(), estimateId = randomUUID();
  await db("leads").insert({ id: leadId, workspaceId, name: "Fixture lead", email: "", phone: "", service: "Repair",
    submissionId: randomUUID(), submissionHash: "fixture", address: "", details: "", source: "other", notes: "", stage: "new" });
  await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId,
    name: "Fixture quote", status: "accepted", decidedAt: new Date(Date.now() - 5 * 86400000) });
  const first = await processWorkflowReminders(db);
  assert.equal(first.failed, 0);
  assert.equal(first.delivered, 1);
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "a second tick cannot duplicate a notice");
  assert.equal(Number((await db("estimateNotifications").where({ estimateId, event: "needs_scheduling" }).count({ count: "*" }).first())?.count), 1);
  const scheduledEstimate = randomUUID();
  await db("estimates").insert({ id: scheduledEstimate, workspaceId, parentType: "lead", leadId,
    name: "Scheduled quote", status: "accepted", decidedAt: new Date(Date.now() - 5 * 86400000) });
  await db("jobs").insert({ id: randomUUID(), workspaceId, title: "Scheduled job", customerName: "Fixture",
    service: "Repair", location: "", description: "", status: "scheduled", scheduledDate: "2026-12-01",
    acceptedEstimateId: scheduledEstimate });
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "scheduled estimates are skipped");
  assert.equal((await db("workflowSteps").where({ workflowId: proposal.id, estimateId: scheduledEstimate }).first("status")).status, "skipped");
  const blockedEstimate = randomUUID();
  await db("estimates").insert({ id: blockedEstimate, workspaceId, parentType: "lead", leadId,
    name: "Access check", status: "accepted", decidedAt: new Date(Date.now() - 5 * 86400000) });
  assert.equal((await processWorkflowReminders(db, enabled.filter(permission => permission !== "estimates.read"))).delivered, 0);
  assert.equal(Number((await db("estimateNotifications").where({ estimateId: blockedEstimate }).count({ count: "*" }).first())?.count), 0);
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, action: "pause" });
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "paused workflows do not enroll or deliver");
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 2, action: "resume" });
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "resume excludes approvals received during pause");
  await db("estimates").where({ id: blockedEstimate }).update({ archivedAt: new Date() });
  const fridayEstimate = randomUUID();
  await db("workflows").where({ id: proposal.id }).update({ enrollAfter: new Date("2026-11-01T00:00:00Z") });
  await db("estimates").insert({ id: fridayEstimate, workspaceId, parentType: "lead", leadId,
    name: "Weekday timing", status: "accepted", decidedAt: new Date("2026-11-06T18:00:00Z") });
  assert.equal((await processWorkflowReminders(db)).failed, 0);
  const timing = await db("workflowSteps").where({ workflowId: proposal.id, estimateId: fridayEstimate }).first<{ dueAt: Date }>("dueAt");
  assert.equal(timing?.dueAt.toISOString(), "2026-11-09T22:00:00.000Z");
  // Manual runs are prospective reviews of existing records, with no side effects until confirmed.
  const currentWorkflow = await db("workflows").where({ id: proposal.id }).first("version", "enrollAfter");
  const runInput = { workspaceId, id: proposal.id, version: currentWorkflow.version };
  assert.equal((await list()).rows[0].canRunNow, true);
  assert.equal((await readWorkflows(db, { userId: office, workspaceId }, enabled, { workspaceId })).rows[0].canRunNow, false);
  const manualIds = Array.from({ length: 4 }, () => randomUUID());
  await db("estimates").insert(manualIds.map((id, index) => ({ id, workspaceId, parentType: "lead", leadId,
    name: `Manual fixture ${index}`, status: "accepted", decidedAt: new Date("2026-10-01T12:00:00Z") })));
  await db("workflowSteps").insert({ id: randomUUID(), workspaceId, workflowId: proposal.id,
    estimateId: manualIds[0], dueAt: new Date(Date.now() + 30 * 86400000), status: "queued" });
  const review = await previewWorkflowRun(db, identity, enabled, runInput);
  assert.equal(review.matchedCount, 4, "includes old approvals and queued future work");
  assert.equal(Number((await db("estimateNotifications").whereIn("estimateId", manualIds).count({ count: "*" }).first())?.count), 0);
  const unreviewedId = randomUUID();
  await db("estimates").insert({ id: unreviewedId, workspaceId, parentType: "lead", leadId,
    name: "Created after preview", status: "accepted", decidedAt: new Date() });
  await db("jobs").insert({ id: randomUUID(), workspaceId, title: "Booked after preview", customerName: "Fixture",
    service: "Repair", location: "", description: "", status: "scheduled", scheduledDate: "2026-12-01", acceptedEstimateId: manualIds[2] });
  await db("estimates").where({ id: manualIds[3] }).update({ archivedAt: new Date() });
  await assert.rejects(previewWorkflowRun(db, { userId: office, workspaceId }, enabled, runInput), AuthorizationAccessError);
  await assert.rejects(confirmWorkflowRun(db, identity, enabled.filter(p => p !== "workflows.manage"), { ...runInput, previewId: review.id }), AuthorizationAccessError);
  await assert.rejects(confirmWorkflowRun(db, { userId: other, workspaceId: otherWorkspace }, enabled,
    { ...runInput, workspaceId: otherWorkspace, previewId: review.id }), AuthorizationAccessError);
  await db("workspaceMemberships").insert({ workspaceId, userId: other, role: "admin" });
  await assert.rejects(confirmWorkflowRun(db, { userId: other, workspaceId }, enabled, { ...runInput, previewId: review.id }), AuthorizationAccessError);
  const receipts = await Promise.all([1, 2].map(() => confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: review.id })));
  assert.deepEqual(receipts[0], receipts[1], "concurrent and lost-response retries return the same receipt");
  assert.equal(receipts[0].completedCount, 2);
  assert.equal(receipts[0].skippedCount, 2);
  assert.equal(Number((await db("estimateNotifications").whereIn("estimateId", manualIds).count({ count: "*" }).first())?.count), 2);
  assert.equal(Number((await db("estimateNotifications").where({ estimateId: unreviewedId }).count({ count: "*" }).first())?.count), 0, "never expands the reviewed set");
  assert.equal((await db("workflows").where({ id: proposal.id }).first("enrollAfter")).enrollAfter.getTime(), currentWorkflow.enrollAfter.getTime());
  const expired = await previewWorkflowRun(db, identity, enabled, runInput);
  assert.equal(expired.matchedCount, 1, "delivered reminders are excluded from later previews");
  await db("workflowManualRuns").where({ id: expired.id }).update({ expiresAt: new Date(0) });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: expired.id }), WorkflowConflictError);
  const stale = await previewWorkflowRun(db, identity, enabled, runInput);
  await changeWorkflow(db, identity, enabled, { ...runInput, action: "pause" });
  await assert.rejects(previewWorkflowRun(db, identity, enabled, runInput), WorkflowConflictError);
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: stale.id }), WorkflowConflictError);
  await changeWorkflow(db, identity, enabled, { ...runInput, version: runInput.version + 1, action: "resume" });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: stale.id }), WorkflowConflictError);
  const updatedInput = { ...runInput, version: runInput.version + 2 };
  const finalPreview = await previewWorkflowRun(db, identity, enabled, updatedInput);
  assert.equal((await confirmWorkflowRun(db, identity, enabled, { ...updatedInput, previewId: finalPreview.id })).completedCount, 1);
  assert.equal((await previewWorkflowRun(db, identity, enabled, updatedInput)).matchedCount, 0);
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "scheduled ticks cannot redeliver manual notices");
  // The preview and execution stay bounded even for a larger workspace.
  const bulkIds = Array.from({ length: 105 }, () => randomUUID());
  await db("estimates").insert(bulkIds.map(id => ({ id, workspaceId, parentType: "lead", leadId,
    name: "Batch fixture", status: "accepted", decidedAt: new Date("2026-10-01T12:00:00Z") })));
  const bulkPreview = await previewWorkflowRun(db, identity, enabled, updatedInput);
  assert.equal(bulkPreview.matchedCount, 100);
  assert.equal((await confirmWorkflowRun(db, identity, enabled, { ...updatedInput, previewId: bulkPreview.id })).completedCount, 100);
  assert.equal((await previewWorkflowRun(db, identity, enabled, updatedInput)).matchedCount, 5);
  console.log("Manual workflow review, scope isolation, permission rechecks, expiry, version conflicts, bounded batches and duplicate-safe delivery passed.");
  // Exercise real notification queues with a fake transport; never send external email.
  await db("estimateNotifications").where({ workspaceId }).update({ emailStatus: "skipped" });
  await db("users").where({ id: owner }).update({ emailVerified: true });
  let channelVersion = updatedInput.version;
  async function channels(inApp: boolean, email: boolean) {
    const result = await changeWorkflowNotifications(db, identity, enabled,
      { workspaceId, id: proposal.id, version: channelVersion, notifications: { inApp, email } });
    channelVersion = result.version;
  }
  async function emit(inApp = true, email = true) {
    await channels(inApp, email);
    const estimateId = randomUUID();
    await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId,
      name: "Channel fixture", status: "accepted", decidedAt: new Date() });
    await db("workflowSteps").where({ workflowId: proposal.id, estimateId }).update({ dueAt: new Date(0) });
    assert.equal((await processWorkflowReminders(db)).delivered, 1);
    return db("estimateNotifications").where({ workspaceId, estimateId, event: "needs_scheduling" }).first();
  }
  const emails: string[] = [];
  const deliver = (permissions = enabled) => processEstimateNotificationEmails(db, permissions, async mail => { emails.push(mail.id); });
  const both = await emit();
  assert.equal(both.inApp, true); assert.equal(both.emailStatus, "queued");
  await markNotificationRead(db, identity, enabled, both.id);
  const afterRead = await readNotifications(db, identity, enabled);
  assert.equal(afterRead.items.some(item => item.id === both.id), false, "read notices are removed from the UI feed");
  const readNotice = await db("estimateNotifications").where({ id: both.id }).first();
  assert.ok(readNotice.readAt, "the notification history is retained");
  assert.equal(readNotice.emailStatus, "queued", "marking read does not alter email delivery");
  assert.equal((await deliver()).sent, 1);
  assert.equal((await deliver()).sent, 0, "email queue cannot redeliver a sent notice");
  const onlyEmail = await emit(false, true);
  assert.equal(onlyEmail.inApp, false);
  assert.equal((await readNotifications(db, identity, enabled)).items.some(item => item.id === onlyEmail.id), false, "email-only notices stay out of the bell");
  assert.equal((await deliver()).sent, 1, "email-only notices still reach the email worker");
  const onlyApp = await emit(true, false);
  assert.equal(onlyApp.emailStatus, "skipped");
  assert.equal((await readNotifications(db, identity, enabled)).items.some(item => item.id === onlyApp.id), true);
  assert.equal((await deliver()).sent, 0);
  const booked = await emit();
  await db("jobs").insert({ id: randomUUID(), workspaceId, title: "Booked before email", customerName: "Fixture", service: "Repair", location: "", description: "",
    status: "scheduled", scheduledDate: "2026-12-01", acceptedEstimateId: booked.estimateId });
  assert.equal((await deliver()).skipped, 1, "email rechecks scheduled visits");
  const disabledEmail = await emit();
  await channels(true, false);
  assert.equal((await db("estimateNotifications").where({ id: disabledEmail.id }).first()).emailStatus, "skipped");
  assert.equal((await deliver()).sent, 0);
  const pausedMail = await emit();
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: channelVersion, action: "pause" }); channelVersion++;
  assert.equal((await deliver()).skipped, 1, "paused workflows cannot send queued emails");
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: channelVersion, action: "resume" }); channelVersion++;
  assert.equal((await db("estimateNotifications").where({ id: pausedMail.id }).first()).emailStatus, "skipped");
  await db("notificationPreferences").insert({ userId: owner, leadAssignedEmail: true, estimateEmail: false });
  await emit();
  assert.equal((await deliver()).skipped, 1, "recipient email opt-out is respected");
  await db("notificationPreferences").where({ userId: owner }).update({ estimateEmail: true });
  await db("users").where({ id: owner }).update({ emailVerified: false });
  await emit();
  assert.equal((await deliver()).skipped, 1, "unverified email addresses are skipped");
  await db("users").where({ id: owner }).update({ emailVerified: true });
  await emit();
  assert.equal((await deliver(enabled.filter(p => p !== "workflows.publish"))).skipped, 1, "email rechecks publisher access");
  await assert.rejects(changeWorkflowNotifications(db, { workspaceId, userId: office }, enabled,
    { workspaceId, id: proposal.id, version: channelVersion, notifications: { inApp: true, email: true } }), AuthorizationAccessError);
  await assert.rejects(changeWorkflowNotifications(db, identity, enabled,
    { workspaceId, id: proposal.id, version: 1, notifications: { inApp: true, email: true } }), WorkflowConflictError);
  await assert.rejects(changeWorkflowNotifications(db, identity, enabled,
    { workspaceId, id: proposal.id, version: channelVersion, notifications: { inApp: false, email: false } }));
  const channelTurn = randomUUID();
  await db("chatTurns").insert({ id: channelTurn, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(),
    requestHash: "channel-fixture", surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
  const channelDraft = await withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId: channelTurn }, { name: "Channel selection fixture", businessDays: 1, recipient: "me" }));
  const selected = await decideWorkflow(db, identity, enabled, { workspaceId, id: channelDraft.id, inputHash: channelDraft.inputHash,
    decision: "confirm", notifications: { inApp: false, email: true } });
  assert.deepEqual(selected?.definition.notifications, { inApp: false, email: true }, "publication uses the explicitly selected channels");
  assert.deepEqual((await db("workflows").where({ id: channelDraft.id }).first("definition")).definition.notifications, { inApp: false, email: true });
  await changeWorkflow(db, identity, enabled, { workspaceId, id: channelDraft.id, version: 1, action: "delete", confirmation: "confirm" });
  assert.equal(emails.length, 2);
  console.log("Workflow in-app/email choices, default channels, email-only visibility, queue delivery, opt-out, verification and current eligibility passed.");
  // Read history must not occupy the first page or hide older unread reminders.
  await db("estimateNotifications").where({ workspaceId }).update({ readAt: db.fn.now() });
  const unreadIds = await db("estimateNotifications").where({ workspaceId, userId: owner, inApp: true })
    .orderBy("createdAt").limit(2).pluck("id");
  await db("estimateNotifications").whereIn("id", unreadIds).update({ readAt: null });
  const unreadFeed = await readNotifications(db, identity, enabled);
  assert.equal(unreadFeed.unreadCount, 2);
  assert.equal(unreadFeed.items.length, 2);
  assert.equal(unreadFeed.hasMore, false);
  assert(unreadFeed.items.every(item => unreadIds.includes(item.id)));
  console.log("Read notifications are retained in history, excluded before paging, and absent from the UI feed.");
  // Follow-up recipe: real publication/queue/manual-run services, with synthetic transport receipts.
  const followTurn = randomUUID();
  await db("chatTurns").insert({ id: followTurn, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(),
    requestHash: "follow-up-fixture", surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
  const followDraft = await withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId: followTurn }, { kind: "estimate_follow_up", name: "Awaiting a decision", businessDays: 2, recipient: "me" }));
  assert.equal(followDraft.definition.kind, "estimate_follow_up");
  assert.match(followDraft.rule, /sent estimate still has no recorded decision/);
  await decideWorkflow(db, identity, enabled, { workspaceId, id: followDraft.id, inputHash: followDraft.inputHash, decision: "confirm" });
  await db("workflows").where({ id: followDraft.id }).update({ enrollAfter: new Date("2026-11-01T00:00:00Z") });
  const followInput = { workspaceId, id: followDraft.id, version: 1 };
  assert.equal((await list()).rows.find(row => row.id === followDraft.id)?.canRunNow, true);
  async function sentFixture(deliveries: { status: string; at?: string }[] = [{ status: "sent", at: "2026-11-06T18:00:00Z" }], status = "sent") {
    const estimateId = randomUUID(), snapshotId = randomUUID();
    await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId, name: "Follow-up fixture", status,
      sentAt: new Date("2026-10-01T12:00:00Z"), validUntil: "2099-12-31" });
    // Workflow eligibility reads delivery metadata, never renders this fixture snapshot.
    await db("estimate_snapshots").insert({ id: snapshotId, workspaceId, estimateId, content: "{}", contentHash: "a".repeat(64) });
    for (const item of deliveries) await db("estimate_deliveries").insert({ id: randomUUID(), workspaceId, estimateId, snapshotId,
      status: item.status, recipient: "fixture@example.test", recipientHash: "a".repeat(64), idempotencyKey: randomUUID(),
      sentAt: item.status === "sent" ? new Date(item.at!) : null, queuedAt: new Date("2026-10-01T12:00:00Z") });
    return estimateId;
  }
  const sentId = await sentFixture([{ status: "failed" }, { status: "sent", at: "2026-11-06T18:00:00Z" }, { status: "sent", at: "2026-11-17T18:00:00Z" }]);
  const failedOnly = await sentFixture([{ status: "failed" }]), queuedOnly = await sentFixture([{ status: "queued" }]);
  const publishedOnly = await sentFixture([], "published");
  const beforePublication = await sentFixture([{ status: "sent", at: "2026-10-30T18:00:00Z" }, { status: "sent", at: "2026-11-17T18:00:00Z" }]);
  const firstFollowTick = await processWorkflowReminders(db);
  assert.equal(firstFollowTick.failed, 0); assert.equal(firstFollowTick.delivered, 1);
  const followStep = await db("workflowSteps").where({ workflowId: followDraft.id, estimateId: sentId }).first();
  assert.equal(followStep.dueAt.toISOString(), "2026-11-10T22:00:00.000Z", "first successful send anchors two weekdays at workspace 5 PM");
  assert.equal((await db("estimateNotifications").where({ workflowId: followDraft.id, estimateId: sentId }).first()).event, "awaiting_decision");
  assert.equal((await processWorkflowReminders(db)).delivered, 0, "resends do not create repeat reminders");
  assert.equal(Number((await db("workflowSteps").where({ workflowId: followDraft.id }).whereIn("estimateId", [failedOnly, queuedOnly, publishedOnly, beforePublication]).count({ count: "*" }).first())?.count), 0,
    "queued/failed/link-only or pre-publication first sends never enroll");
  for (const stopped of ["accepted", "declined", "expired", "superseded", "void", "archived"]) {
    const estimateId = await sentFixture();
    await db("workflowSteps").where({ workflowId: followDraft.id, estimateId }).update({ dueAt: new Date(0) });
    await db("estimates").where({ id: estimateId }).update(stopped === "expired" ? { validUntil: "2026-01-01" }
      : stopped === "archived" ? { archivedAt: new Date() } : { status: stopped });
    const tick = await processWorkflowReminders(db);
    assert.equal(tick.failed, 0); assert.equal(tick.delivered, 0, `skip ${stopped}`);
    assert.equal((await db("workflowSteps").where({ workflowId: followDraft.id, estimateId }).first()).status, "skipped");
  }
  const manualFollow = await sentFixture();
  const followPreview = await previewWorkflowRun(db, identity, enabled, followInput);
  assert.equal(followPreview.matchedCount, 2, "manual run includes eligible first sends from before publication");
  assert.match(followPreview.actionSummary, /sent estimates without a recorded decision/);
  const afterFollowPreview = await sentFixture();
  await db("estimates").where({ id: manualFollow }).update({ status: "declined" });
  const followResult = await confirmWorkflowRun(db, identity, enabled, { ...followInput, previewId: followPreview.id });
  assert.equal(followResult.completedCount, 1); assert.equal(followResult.skippedCount, 1);
  assert.deepEqual(await confirmWorkflowRun(db, identity, enabled, { ...followInput, previewId: followPreview.id }), followResult);
  assert.equal(await db("estimateNotifications").where({ workflowId: followDraft.id, estimateId: afterFollowPreview }).first(), undefined,
    "new sends cannot enter an already reviewed manual run");
  assert.equal((await processWorkflowReminders(db)).delivered, 1);
  await db("estimateNotifications").where({ workspaceId }).update({ emailStatus: "skipped" });
  const stillAwaiting = await sentFixture();
  assert.equal((await processWorkflowReminders(db)).delivered, 1);
  const followEmails: string[] = [];
  assert.equal((await processEstimateNotificationEmails(db, enabled, async mail => { followEmails.push(mail.event); })).sent, 1);
  assert.deepEqual(followEmails, ["awaiting_decision"]);
  assert.equal((await db("estimateNotifications").where({ workflowId: followDraft.id, estimateId: stillAwaiting }).first()).emailStatus, "sent");
  const decidedBeforeEmail = await sentFixture();
  assert.equal((await processWorkflowReminders(db)).delivered, 1);
  await db("estimates").where({ id: decidedBeforeEmail }).update({ status: "accepted" });
  assert.equal((await processEstimateNotificationEmails(db, enabled, async () => { throw new Error("Do not send after decision"); })).skipped, 1);
  const pausePreview = await previewWorkflowRun(db, identity, enabled, followInput);
  await changeWorkflow(db, identity, enabled, { ...followInput, action: "pause" });
  const duringPause = await sentFixture();
  assert.equal((await processWorkflowReminders(db)).delivered, 0);
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { ...followInput, previewId: pausePreview.id }), WorkflowConflictError);
  await changeWorkflow(db, identity, enabled, { ...followInput, version: 2, action: "resume" });
  assert.equal((await processWorkflowReminders(db)).delivered, 0);
  assert.equal(await db("workflowSteps").where({ workflowId: followDraft.id, estimateId: duringPause }).first(), undefined);
  await changeWorkflow(db, identity, enabled, { ...followInput, version: 3, action: "delete", confirmation: "confirm" });
  console.log("Estimate follow-up publication, successful-send timing, failed/queued sends, resends, stop conditions, manual scope, channel delivery and lifecycle passed.");
  await db("workflows").insert(Array.from({ length: 26 }, (_, index) => ({
    id: randomUUID(), workspaceId, name: `Retained workflow ${index}`, rule: "Fixture", status: "paused",
  })));
  const allWorkflows = await readWorkflows(db, identity, enabled, { workspaceId });
  assert.equal(allWorkflows.total, 27);
  assert.equal(allWorkflows.rows.length, 27);
  assert.equal(allWorkflows.capacity.used, 27);
  assert.equal(allWorkflows.capacity.limit, 25);
  await assert.rejects(readWorkflows(db, identity, enabled, { workspaceId, page: 2 }));
  console.log("Workflow draft review, exact confirmation, idempotent publication, reminder delivery, and weekday timing passed.");
  console.log("Workflow tenant isolation, permissions, concurrent commands, pending steps, and typed deletion passed.");
} finally {
  await db.destroy();
  if (created) await admin.raw("DROP DATABASE ??", [name]);
  await admin.destroy();
}
