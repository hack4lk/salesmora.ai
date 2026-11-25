import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { permissionIds, workflowRecipeSchema } from "@salesmora/contracts";
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { processWorkflowStep } from "./execution";
import { createJob } from "../jobs/store";
import { processWorkflowBriefingEmails } from "../notifications/workflow-briefings";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use a separate local _test database.");
const name = `workflow_time_${randomUUID().replaceAll("-", "")}_test`;
const admin = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const owner = randomUUID(), workspaceId = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx("users").insert({ id: owner, name: "Time Owner", email: `${owner}@example.test`, emailVerified: true,
      termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Time fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert({ workspaceId, userId: owner, role: "owner" });
    await initializeWorkspacePolicy(trx, identity);
    await trx("customers").insert({ id: customerId, workspaceId, name: "Time customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  const threadId = randomUUID();
  await db("chatThreads").insert({ id: threadId, workspaceId, userId: owner });
  const workflows = new Map<string, string>();
  for (const kind of workflowRecipeSchema.options.filter(kind => kind !== "lead_routing")) {
    const raw = { kind, name: `${kind} time`, businessDays: ["unassigned_visit", "visit_materials", "weekly_briefing"].includes(kind) ? null : 1, recipient: "me" };
    const prepare = async (input: unknown) => {
      const turnId = randomUUID();
      await db("chatTurns").insert({ id: turnId, threadId, workspaceId, userId: owner, clientTurnId: randomUUID(), requestHash: "time-fixture",
        surfaceKey: "workflows.list", state: "completed", leaseUntil: new Date(), proposalFamilies: JSON.stringify(["workflow"]) });
      return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
        prepareWorkflowInTransaction(trx, context, { threadId, turnId }, input));
    };
    const fallback = await prepare(raw);
    assert.equal(("localTime" in fallback.definition ? fallback.definition.localTime : undefined), ["unassigned_visit", "visit_materials", "weekly_briefing"].includes(kind) ? "09:00" : "17:00");
    const draft = await prepare({ ...raw, localTime: "07:00" });
    assert.equal(("localTime" in draft.definition ? draft.definition.localTime : undefined), "07:00");
    const command = { workspaceId, id: draft.id, inputHash: draft.inputHash, decision: "confirm", localTime: "08:15" };
    await assert.rejects(decideWorkflow(db, identity, enabled, { ...command, localTime: "25:00" }));
    await assert.rejects(decideWorkflow(db, { ...identity, workspaceId: randomUUID() }, enabled, command), AuthorizationAccessError);
    const saved = await decideWorkflow(db, identity, enabled, command);
    assert.equal((saved && "localTime" in saved.definition ? saved.definition.localTime : undefined), "08:15");
    assert(saved?.rule.includes("8:15 AM"));
    const repeated = await decideWorkflow(db, identity, enabled, { ...command, localTime: "22:00" });
    assert.equal((repeated && "localTime" in repeated.definition ? repeated.definition.localTime : undefined), "08:15", "duplicate publication cannot change the chosen time");
    const persisted = await db("workflows").where({ id: draft.id }).first();
    assert.equal(("localTime" in persisted.definition ? persisted.definition.localTime : undefined), "08:15"); assert.equal(persisted.rule, saved?.rule);
    workflows.set(kind, draft.id);
  }
  await db("workflows").where({ workspaceId }).update({ enrollAfter: new Date("2026-01-01T00:00:00Z") });
  const leadId = randomUUID();
  const lead = (id: string, date: string) => ({ id, workspaceId, name: "Time lead", email: "", phone: "", service: "Repair", submissionId: randomUUID(),
    submissionHash: "fixture", address: "", details: "", source: "other", notes: "", stage: "new", createdAt: new Date(date) });
  await db("leads").insert(lead(leadId, "2027-03-12T18:00:00Z"));
  const estimateId = randomUUID();
  await db("estimates").insert({ id: estimateId, workspaceId, parentType: "lead", leadId, name: "Time estimate", status: "accepted", decidedAt: new Date("2027-03-12T18:00:00Z") });
  await db.raw("SELECT workflow_enroll_record(?, 'estimate_follow_up', ?, ?)", [workspaceId, estimateId, "2027-03-12T18:00:00Z"]);
  for (const kind of ["unassigned_lead", "unscheduled_estimate", "estimate_follow_up"]) {
    const step = await db("workflowSteps").where({ workflowId: workflows.get(kind), [kind === "unassigned_lead" ? "leadId" : "estimateId"]: kind === "unassigned_lead" ? leadId : estimateId }).first();
    assert.equal(step.dueAt.toISOString(), "2027-03-15T12:15:00.000Z", `${kind} uses selected time after business-day delay and DST`);
    const queued = await db("workflowQueueOutbox").where({ stepId: step.id, completedAt: null }).first();
    assert.equal(queued.availableAt.toISOString(), step.dueAt.toISOString());
  }
  const visitWorkflow = workflows.get("unassigned_visit")!;
  async function visit(date: string) {
    const job = await createJob(db, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: "Time visit", primaryOwnerId: null, scheduledDate: date });
    const record = await db("calendarVisitRecords").where({ jobId: job.jobId }).whereNull("endedAt").first();
    return (await db("workflowSteps").where({ workflowId: visitWorkflow, visitId: record.visitId, recordKind: "visit" }).first()).dueAt.toISOString();
  }
  assert.equal(await visit("2027-03-15"), "2027-03-14T12:15:00.000Z", "day-before Sunday uses custom time across spring DST");
  assert.equal(await visit("2027-11-08"), "2027-11-07T13:15:00.000Z", "fall DST keeps workspace wall-clock time");
  await db("workflows").where({ id: visitWorkflow }).update({ definition: db.raw(`jsonb_set(definition, '{localTime}', '"02:30"')`) });
  assert.equal(await visit("2027-03-15"), "2027-03-14T07:30:00.000Z", "missing spring hour shifts forward by the DST gap");
  await db("workflows").where({ id: visitWorkflow }).update({ definition: db.raw(`jsonb_set(definition, '{localTime}', '"01:30"')`) });
  assert.equal(await visit("2027-11-08"), "2027-11-07T06:30:00.000Z", "repeated fall hour uses the standard-time occurrence once");
  for (const [anchor, zone, time, expected] of [
    ["2027-03-08T12:00:00Z", "America/New_York", "08:15", "2027-03-08T13:15:00.000Z"],
    ["2027-03-08T14:00:00Z", "America/New_York", "08:15", "2027-03-15T12:15:00.000Z"],
    ["2027-11-01T13:00:00Z", "America/New_York", "08:15", "2027-11-08T13:15:00.000Z"],
    ["2027-03-07T12:00:00Z", "Asia/Kathmandu", "00:00", "2027-03-07T18:15:00.000Z"],
  ]) assert.equal((await db.raw("SELECT workflow_next_monday(?, ?, ?::time) AS due", [anchor, zone, time])).rows[0].due.toISOString(), expected);
  const briefingId = workflows.get("weekly_briefing")!;
  const briefingStep = await db("workflowSteps").where({ workflowId: briefingId, origin: "scheduled", status: "queued" }).first();
  assert.equal((await db.raw(`SELECT to_char(?::timestamptz AT TIME ZONE 'America/New_York','HH24:MI') AS time`, [briefingStep.dueAt])).rows[0].time, "08:15");
  // A briefing at a chosen afternoon/evening time must not expire at the old fixed noon deadline.
  await db("workflowSteps").where({ id: briefingStep.id }).update({ dueAt: new Date(Date.now() - 60 * 60_000) });
  assert.equal((await processWorkflowStep(db, workspaceId, briefingStep.id)).delivered, 1);
  let emails = 0;
  await processWorkflowBriefingEmails(db, enabled, async () => { emails++; });
  assert.equal(emails, 1);
  const next = await db("workflowSteps").where({ workflowId: briefingId, origin: "scheduled", status: "queued" }).first();
  assert(next && next.id !== briefingStep.id);
  assert.equal((await db.raw(`SELECT to_char(?::timestamptz AT TIME ZONE 'America/New_York','HH24:MI') AS time`, [next.dueAt])).rows[0].time, "08:15");
  await db("workflows").where({ id: workflows.get("unassigned_lead") }).update({ definition: db.raw("definition - 'localTime'") });
  const legacyLead = randomUUID(); await db("leads").insert(lead(legacyLead, "2027-03-19T18:00:00Z"));
  const legacyStep = await db("workflowSteps").where({ workflowId: workflows.get("unassigned_lead"), leadId: legacyLead }).first();
  assert.equal(legacyStep.dueAt.toISOString(), "2027-03-22T21:00:00.000Z", "legacy reminder stays at 5 PM");
  await assert.rejects(db("workflows").where({ id: visitWorkflow }).update({ definition: db.raw(`jsonb_set(definition, '{localTime}', '"25:00"')`) }));
  console.log("Workflow send times: all recipes, reviewed override, idempotency, access, defaults, queue timestamps, DST gap/fold, recurrence and briefing/email freshness passed.");
} finally {
  await db.destroy(); if (created) await admin.raw("DROP DATABASE ??", [name]); await admin.destroy();
}
