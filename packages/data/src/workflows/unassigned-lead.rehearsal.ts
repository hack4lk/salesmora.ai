import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds } from "@salesmora/contracts";
import { AuthorizationAccessError, initializeWorkspacePolicy, withWorkspaceAuthorization } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { prepareWorkflowInTransaction, decideWorkflow, WorkflowDraftError } from "./proposals";
import { processWorkflowReminders } from "./execution";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { changeWorkflowNotifications } from "./notifications";
import { processLeadWorkflowEmails } from "../notifications/lead-workflows";
import { readNotifications, markNotificationRead } from "../notifications/store";
import { readWorkflows, changeWorkflow, WorkflowConflictError } from "./store";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw new Error("Use a separate local _test database.");
const name = `leads_workflow_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection });
const url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const workspaceId = randomUUID(), otherWorkspace = randomUUID(), owner = randomUUID(), other = randomUUID(), field = randomUUID();
const identity = { userId: owner, workspaceId }, enabled = [...permissionIds];
const leadOnly = enabled.filter(id => id !== "estimates.read");
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, other, field].map(id => ({ id, name: id === owner ? "Ava Morgan" : "Field Teammate",
      email: `${id}@example.test`, emailVerified: true, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx("workspaces").insert([{ id: workspaceId, ownerId: owner }, { id: otherWorkspace, ownerId: other }].map(row => ({ ...row,
      businessName: "Lead workflow fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" })));
    await trx("workspaceMemberships").insert([{ workspaceId, userId: owner, role: "owner" }, { workspaceId, userId: field, role: "field" },
      { workspaceId: otherWorkspace, userId: other, role: "owner" }]);
    await initializeWorkspacePolicy(trx, identity);
    await initializeWorkspacePolicy(trx, { userId: other, workspaceId: otherWorkspace });
  });
  async function prepare(recipient = "me") {
    const threadId = randomUUID(), turnId = randomUUID();
    await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
    await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "lead-workflow",
      surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
    return withWorkspaceAuthorization(db, identity, leadOnly, true, (trx, context) => prepareWorkflowInTransaction(trx, context,
      { threadId, turnId }, { kind: "unassigned_lead", name: "New lead still unassigned", businessDays: 1, recipient }));
  }
  async function lead(at = "2026-11-06T18:00:00Z", extra: Record<string, unknown> = {}) {
    const id = randomUUID();
    await db("leads").insert({ id, workspaceId, name: "Workflow fixture lead", email: "", phone: "", service: "Repair", submissionId: randomUUID(),
      submissionHash: "fixture", address: "", details: "", source: "other", notes: "", stage: "new", createdAt: new Date(at), ...extra });
    return id;
  }
  await assert.rejects(prepare("Field Teammate"), WorkflowDraftError, "assigned-only recipient cannot read unassigned leads");
  const draft = await prepare();
  assert.match(draft.rule, /new lead is still unassigned/);
  assert.deepEqual(draft.definition.notifications, { inApp: true, email: true });
  const command = { workspaceId, id: draft.id, inputHash: draft.inputHash, decision: "confirm" };
  await assert.rejects(decideWorkflow(db, identity, enabled.filter(id => id !== "leads.read"), command), AuthorizationAccessError);
  await decideWorkflow(db, identity, leadOnly, command);
  await decideWorkflow(db, identity, leadOnly, command);
  const input = { workspaceId, id: draft.id, version: 1 };
  const old = await lead("2026-10-01T12:00:00Z");
  const due = await lead();
  assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 0, "no retroactive enrollment on publish");
  await db("workflows").where({ id: draft.id }).update({ enrollAfter: new Date("2026-11-01T00:00:00Z") });
  await db.raw("SELECT workflow_enroll_record(?, 'unassigned_lead', ?, ?)", [workspaceId, due, new Date("2026-11-06T18:00:00Z")]); // Explicit migration/backfill adapter; production never rescans.
  const assigned = await lead(undefined, { ownerId: owner }), won = await lead(undefined, { stage: "won" }), lost = await lead(undefined, { stage: "lost" });
  const archived = await lead(undefined, { archivedAt: new Date() }), cross = await lead(undefined, { workspaceId: otherWorkspace });
  assert.deepEqual(await processWorkflowReminders(db, leadOnly), { delivered: 1, failed: 0 });
  assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 0, "duplicate tick does not repeat");
  const step = await db("workflowSteps").where({ workflowId: draft.id, leadId: due }).first();
  assert.equal(step.recordKind, "lead"); assert.equal(step.estimateId, null);
  assert.equal(step.dueAt.toISOString(), "2026-11-09T22:00:00.000Z", "Friday creation -> Monday 5 PM local");
  assert.equal(await db("workflowSteps").where({ workflowId: draft.id, leadId: old }).first(), undefined);
  assert.equal(await db("workflowSteps").where({ workflowId: draft.id, leadId: cross }).first(), undefined);
  for (const leadId of [assigned, won, lost]) assert.equal((await db("workflowSteps").where({ workflowId: draft.id, leadId }).first()).status, "skipped");
  assert.equal(await db("leadWorkflowNotifications").where({ leadId: archived }).first(), undefined);
  const list = await readWorkflows(db, identity, leadOnly, { workspaceId });
  assert.equal(list.rows[0].canRunNow, true, "Lead permission without Estimate permission can run");
  const inbox = await readNotifications(db, identity, leadOnly);
  assert.equal(inbox.items[0].kind, "lead_workflow");
  assert.equal((await readNotifications(db, { userId: field, workspaceId }, enabled)).items.length, 0);
  await assert.rejects(markNotificationRead(db, { userId: other, workspaceId: otherWorkspace }, enabled, inbox.items[0].id), AuthorizationAccessError);
  await markNotificationRead(db, identity, leadOnly, inbox.items[0].id);
  await markNotificationRead(db, identity, leadOnly, inbox.items[0].id);
  assert.equal((await readNotifications(db, identity, leadOnly)).items.length, 0);
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async mail => { assert.equal(mail.leadId, due); })).sent, 1, "reading in-app does not stop chosen email");
  // Exact manual snapshot, current eligibility, cross-workspace and record-kind checks.
  const manual = await lead("2026-10-01T12:00:00Z"), assignAfterReview = await lead("2026-10-01T12:00:00Z");
  const review = await previewWorkflowRun(db, identity, leadOnly, input);
  assert.equal(review.matchedCount, 3); assert.match(review.actionSummary, /3 unassigned leads/);
  const unreviewed = await lead("2026-10-01T12:00:00Z");
  await db("leads").where({ id: assignAfterReview }).update({ ownerId: owner });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled.filter(id => id !== "leads.read"), { ...input, previewId: review.id }), AuthorizationAccessError);
  const results = await Promise.all([1, 2].map(() => confirmWorkflowRun(db, identity, leadOnly, { ...input, previewId: review.id })));
  assert.equal(results[0].completedCount, 2); assert.equal(results[0].skippedCount, 1); assert.deepEqual(results[0], results[1]);
  assert.equal(await db("leadWorkflowNotifications").where({ leadId: unreviewed }).first(), undefined);
  assert(await db("leadWorkflowNotifications").where({ leadId: manual }).first());
  const typedReview = await previewWorkflowRun(db, identity, leadOnly, input);
  await db("workflowManualRuns").where({ id: typedReview.id }).update({ recordKind: "estimate" });
  await assert.rejects(confirmWorkflowRun(db, identity, leadOnly, { ...input, previewId: typedReview.id }), AuthorizationAccessError);
  // Assignment after notification creation stops pending email.
  await db("leadWorkflowNotifications").where({ leadId: old }).update({ emailStatus: "skipped" });
  await db("leads").where({ id: manual }).update({ ownerId: owner });
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => { throw Error("Must not send assigned reminder"); })).skipped, 1);
  // Each email rechecks preferences, verification, active workflow and current stage.
  async function queue() {
    await db("leadWorkflowNotifications").update({ emailStatus: "skipped" });
    const id = await lead();
    assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 1); return id;
  }
  await queue(); await db("notificationPreferences").insert({ userId: owner, leadAssignedEmail: false });
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => { throw Error("Opted out"); })).skipped, 1);
  await db("notificationPreferences").where({ userId: owner }).update({ leadAssignedEmail: true });
  await queue(); await db("users").where({ id: owner }).update({ emailVerified: false });
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => { throw Error("Unverified"); })).skipped, 1);
  await db("users").where({ id: owner }).update({ emailVerified: true });
  const stageChange = await queue(); await db("leads").where({ id: stageChange }).update({ stage: "lost" });
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => { throw Error("Lost"); })).skipped, 1);
  await queue();
  assert.equal((await processLeadWorkflowEmails(db, enabled.filter(id => id !== "workflows.publish"), async () => { throw Error("Publisher lost access"); })).skipped, 1);
  const retry = await queue();
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => { throw Error("Transient transport"); })).retryPending, 1);
  await db("leadWorkflowNotifications").where({ leadId: retry }).update({ nextAttemptAt: new Date(0) });
  assert.equal((await processLeadWorkflowEmails(db, leadOnly, async () => {})).sent, 1);
  // In-app only, email only, and stopping already queued mail via a channel edit.
  await changeWorkflowNotifications(db, identity, leadOnly, { ...input, notifications: { inApp: true, email: false } });
  const inApp = await queue();
  assert.equal((await db("leadWorkflowNotifications").where({ leadId: inApp }).first()).emailStatus, "skipped");
  await changeWorkflowNotifications(db, identity, leadOnly, { ...input, version: 2, notifications: { inApp: false, email: true } });
  const emailOnly = await queue();
  assert.equal((await readNotifications(db, identity, leadOnly)).items.some(item => item.kind === "lead_workflow" && item.leadId === emailOnly), false);
  await changeWorkflowNotifications(db, identity, leadOnly, { ...input, version: 3, notifications: { inApp: true, email: false } });
  assert.equal((await db("leadWorkflowNotifications").where({ leadId: emailOnly }).first()).emailStatus, "skipped");
  // Held work, missed reminders, during-pause intake, stale manual previews and delete.
  const pending = await lead(new Date().toISOString());
  assert.equal((await processWorkflowReminders(db, leadOnly)).failed, 0);
  const beforePause = await previewWorkflowRun(db, identity, leadOnly, { ...input, version: 4 });
  await changeWorkflow(db, identity, leadOnly, { ...input, version: 4, action: "pause" });
  assert.equal((await db("workflowSteps").where({ leadId: pending }).first()).status, "held");
  await db("workflowSteps").where({ leadId: pending }).update({ dueAt: new Date(0) });
  const duringPause = await lead(new Date().toISOString());
  assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 0);
  await assert.rejects(confirmWorkflowRun(db, identity, leadOnly, { ...input, version: 4, previewId: beforePause.id }), WorkflowConflictError);
  await changeWorkflow(db, identity, leadOnly, { ...input, version: 5, action: "resume" });
  assert.equal((await db("workflowSteps").where({ leadId: pending }).first()).status, "skipped");
  assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 0);
  assert.equal(await db("workflowSteps").where({ workflowId: draft.id, leadId: duringPause }).first(), undefined);
  const afterResume = await lead(new Date(Date.now() + 1000).toISOString());
  await processWorkflowReminders(db, leadOnly);
  await changeWorkflow(db, identity, leadOnly, { ...input, version: 6, action: "delete", confirmation: "confirm" });
  assert.equal((await db("workflowSteps").where({ leadId: afterResume }).first()).status, "canceled");
  assert.equal((await processWorkflowReminders(db, leadOnly)).delivered, 0);
  // Large accounts retain the same bounded, exact review contract.
  const boundedDraft = await prepare();
  await decideWorkflow(db, identity, leadOnly, { workspaceId, id: boundedDraft.id, inputHash: boundedDraft.inputHash, decision: "confirm" });
  await db("leads").insert(Array.from({ length: 105 }, () => ({ id: randomUUID(), workspaceId, name: "Bounded lead fixture", email: "", phone: "", service: "Repair",
    submissionId: randomUUID(), submissionHash: "fixture", address: "", details: "", source: "other", notes: "", stage: "new" })));
  const boundedInput = { workspaceId, id: boundedDraft.id, version: 1 };
  const boundedReview = await previewWorkflowRun(db, identity, leadOnly, boundedInput);
  assert.equal(boundedReview.matchedCount, 100);
  assert.equal((await confirmWorkflowRun(db, identity, leadOnly, { ...boundedInput, previewId: boundedReview.id })).completedCount, 100);
  console.log("Unassigned lead publication, weekday timing, scope, exact manual runs, deduplication, inbox/read behavior, email preferences/rechecks/retry, channels and lifecycle passed.");
} finally {
  await db.destroy();
  if (created) await admin.raw("DROP DATABASE ??", [name]);
  await admin.destroy();
}
