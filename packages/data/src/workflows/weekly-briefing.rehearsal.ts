import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds } from "@salesmora/contracts";
import { AuthorizationAccessError, initializeWorkspacePolicy, withWorkspaceAuthorization } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { processWorkflowStep } from "./execution";
import { previewWorkflowRun, confirmWorkflowRun } from "./manual-runs";
import { generateWorkflowBriefing, readWorkflowBriefingInTransaction } from "./briefings";
import { readNotifications, markNotificationRead, saveNotificationPreferences } from "../notifications/store";
import { processWorkflowBriefingEmails } from "../notifications/workflow-briefings";
import { changeWorkflow, WorkflowConflictError } from "./store";
import { createJob } from "../jobs/store";
import { readCalendarUnscheduledReportInTransaction } from "../reports/calendar-unscheduled";
import { readTeamLeadsReportInTransaction } from "../reports/team-leads";
import { readEstimateCurrentReportInTransaction } from "../reports/estimate-current";
import { renderWorkflowBriefingEmail } from "../email/workflow-briefing";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw new Error("Use a separate local _test database.");
const name = `weekly_briefing_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const owner = randomUUID(), field = randomUUID(), workspaceId = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert([owner, field].map(id => ({ id, name: id === owner ? "Briefing Owner" : "Field Reader", email: `${id}@example.test`,
      emailVerified: true, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Briefing fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert([{ workspaceId, userId: owner, role: "owner" }, { workspaceId, userId: field, role: "field" }]);
    await initializeWorkspacePolicy(trx, identity);
    await trx("customers").insert({ id: customerId, workspaceId, name: "Briefing customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  // Monday scheduling uses local calendar arithmetic across DST; same-day publication before 9 is supported.
  for (const [anchor, expected] of [["2026-03-06T20:00:00Z", "2026-03-09T13:00:00.000Z"],
    ["2026-10-30T20:00:00Z", "2026-11-02T14:00:00.000Z"], ["2026-11-02T13:59:00Z", "2026-11-02T14:00:00.000Z"],
    ["2026-11-02T14:00:00Z", "2026-11-09T14:00:00.000Z"]]) {
    assert.equal((await db.raw("SELECT workflow_next_monday(?, 'America/New_York') AS next", [anchor])).rows[0].next.toISOString(), expected);
  }
  const threadId = randomUUID(), turnId = randomUUID();
  await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "fixture",
    surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
  const proposal = await withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId }, { kind: "weekly_briefing", name: "Monday briefing", businessDays: null, recipient: "me" }));
  assert.deepEqual(proposal.definition.notifications, { inApp: true, email: true });
  await assert.rejects(withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    prepareWorkflowInTransaction(trx, context, { threadId, turnId }, { kind: "weekly_briefing", name: "Invalid recipient", businessDays: null, recipient: "Field Reader" })));
  await decideWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, inputHash: proposal.inputHash, decision: "confirm" });
  const pending = () => db("workflowSteps").where({ workflowId: proposal.id, origin: "scheduled", status: "queued" }).first();
  const initial = await pending(); assert(initial);
  assert(await db("workflowQueueOutbox").where({ stepId: initial.id, kind: "step" }).first());
  const empty = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  assert.deepEqual(empty.briefing?.counts, { inactiveLeads: 0, awaitingEstimates: 0, unscheduledJobs: 0, dueSoonJobs: 0 });
  const runInput = { workspaceId, id: proposal.id, version: 1, previewId: empty.id };
  assert.equal((await confirmWorkflowRun(db, identity, enabled, runInput)).completedCount, 1);
  assert.equal((await confirmWorkflowRun(db, identity, enabled, runInput)).completedCount, 1, "duplicate confirmation reuses receipt");
  assert.equal((await pending()).dueAt.toISOString(), initial.dueAt.toISOString());
  const read = (id = empty.id, userId = owner, permissions = enabled) => withWorkspaceAuthorization(db, { workspaceId, userId }, permissions, false,
    (trx, context) => readWorkflowBriefingInTransaction(trx, context, id));
  assert.deepEqual((await read()).counts, empty.briefing?.counts);
  await assert.rejects(read(empty.id, field), AuthorizationAccessError);
  await assert.rejects(read(empty.id, owner, enabled.filter(id => id !== "calendar.read")), AuthorizationAccessError);
  const stale = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  await db("workflowManualRuns").where({ id: stale.id }).update({ expiresAt: new Date(0) });
  await assert.rejects(confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: stale.id }), WorkflowConflictError);
  const leadId = randomUUID();
  await db("leads").insert({ id: leadId, workspaceId, submissionId: randomUUID(), submissionHash: "fixture", name: "Inactive", email: "", phone: "", service: "Repair", address: "", details: "", notes: "", source: "other", stage: "new", lastActivityAt: new Date(Date.now() - 8 * 86400000) });
  const job = await createJob(db, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: "Needs scheduling", primaryOwnerId: null });
  await db("jobs").where({ id: job.jobId }).update({ completionDeadline: db.raw("(now() AT TIME ZONE 'America/New_York')::date + 7") });
  const today = (await db.raw("SELECT to_char(now() AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS today")).rows[0].today;
  for (const offset of [0, -1, 8]) {
    const dated = await createJob(db, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: `Deadline ${offset}`, primaryOwnerId: null, scheduledDate: today });
    await db("jobs").where({ id: dated.jobId }).update({ completionDeadline: db.raw("(now() AT TIME ZONE 'America/New_York')::date + ?::int", [offset]) });
  }
  const estimateId = randomUUID();
  await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId, name: "Link-only current estimate", status: "published", publishedAt: new Date(),
    estimateNumber: 1 });
  await db("leads").where({ id: leadId }).update({ createdAt: new Date(Date.now() - 9 * 86400000), lastActivityAt: new Date(Date.now() - 8 * 86400000) });
  const snapshot = await withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const statements: string[] = [], observe = (query: { sql: string }) => statements.push(query.sql);
    trx.on("query", observe);
    const result = await generateWorkflowBriefing(trx, context, "America/New_York");
    trx.off("query", observe);
    assert(statements.length <= 3, `Briefing aggregates used ${statements.length} statements`);
    console.log(`Briefing aggregate query budget: ${statements.length} SQL statements, no extra authentication, no AI.`);
    const leads = await readTeamLeadsReportInTransaction(trx, context, { workspaceId, view: "team-leads", selected: { kind: "queue", queue: "inactive" }, page: 1, pageSize: 25 });
    const estimates = await readEstimateCurrentReportInTransaction(trx, context, { workspaceId, view: "estimate-current", selected: "awaiting", page: 1, pageSize: 25 });
    const calendar = await readCalendarUnscheduledReportInTransaction(trx, context, { workspaceId, view: "calendar-unscheduled", selected: "jobs", page: 1, pageSize: 25, filters: { participants: [], recordTypes: [] } });
    assert.equal(result.counts.inactiveLeads, leads.rows.length);
    assert.equal(result.counts.awaitingEstimates, estimates.counts.awaiting);
    assert.equal(result.counts.unscheduledJobs, calendar.counts.jobs);
    return result;
  });
  assert.deepEqual(snapshot.counts, { inactiveLeads: 1, awaitingEstimates: 1, unscheduledJobs: 1, dueSoonJobs: 2 });
  const preview = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  await db("leads").where({ id: leadId }).update({ stage: "won" });
  await confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: preview.id });
  assert.deepEqual((await read(preview.id)).counts, snapshot.counts, "sends reviewed snapshot, not recomputed counts");
  const notices = await readNotifications(db, identity, enabled);
  const notice = notices.items.find(item => item.kind === "workflow_briefing" && item.briefingId === preview.id); assert(notice);
  await markNotificationRead(db, identity, enabled, notice.id);
  assert(!(await readNotifications(db, identity, enabled)).items.some(item => item.id === notice.id));
  let sent = 0;
  await processWorkflowBriefingEmails(db, enabled, async mail => {
    const email = renderWorkflowBriefingEmail({ ...mail, baseURL: "https://app.example.test" });
    assert(email.text.includes(`/workflows/briefings/${mail.briefingId}?workspace=${workspaceId}`)); sent++;
  });
  assert.equal(sent, 2);
  await saveNotificationPreferences(db, identity, enabled, { leadAssignedEmail: true, workflowBriefingEmail: false });
  const optedOut = await previewWorkflowRun(db, identity, enabled, { workspaceId, id: proposal.id, version: 1 });
  await confirmWorkflowRun(db, identity, enabled, { ...runInput, previewId: optedOut.id });
  assert.equal((await processWorkflowBriefingEmails(db, enabled, async () => { throw Error("Must not send"); })).skipped, 1);
  assert((await readNotifications(db, identity, enabled)).items.some(item => item.kind === "workflow_briefing" && item.briefingId === optedOut.id));
  // An overdue occurrence is skipped and advances to one future Monday, never replaying missed weeks.
  await db("workflowSteps").where({ id: initial.id }).update({ dueAt: new Date("2026-01-05T14:00:00Z") });
  assert.equal((await processWorkflowStep(db, workspaceId, initial.id, [])).delivered, 0);
  assert.equal((await db("workflowSteps").where({ id: initial.id }).first()).status, "skipped");
  assert((await pending()).dueAt.getTime() > Date.now());
  assert.equal((await db("workflowSteps").where({ workflowId: proposal.id, origin: "scheduled", status: "queued" })).length, 1);
  await db.raw("SELECT workflow_schedule_briefing(?, ?)", [workspaceId, proposal.id]);
  assert.equal((await db("workflowSteps").where({ workflowId: proposal.id, origin: "scheduled", status: "queued" })).length, 1, "duplicate scheduling keeps one next occurrence");
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 1, action: "pause" });
  assert.equal(await pending(), undefined);
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 2, action: "resume" }); assert(await pending());
  await changeWorkflow(db, identity, enabled, { workspaceId, id: proposal.id, version: 3, action: "delete", confirmation: "confirm" });
  assert.equal(await pending(), undefined);
  assert.deepEqual((await read(preview.id)).counts, snapshot.counts, "soft deletion preserves delivered snapshots");
  console.log("Weekly briefing: DST, publication, immutable/manual snapshots, native report parity, query budget, current access, unread list, email preferences, recurrence and lifecycle passed.");
} finally {
  await db.destroy(); if (created) await admin.raw("DROP DATABASE ??", [name]); await admin.destroy();
}
