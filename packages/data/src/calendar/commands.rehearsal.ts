import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { permissionIds } from "@salesmora/contracts";
import { CalendarRevisionError } from "@salesmora/domain";
import { createDatabase } from "../database";
import { AuthorizationAccessError, initializeWorkspacePolicy } from "../authorization/store";
import { createJob, mutateJob, readJob } from "../jobs/store";
import { createWorkOrder, mutateWorkOrder } from "../work-orders/mutations";
import { scheduleCalendarVisit, linkCalendarWorkOrder, separateCalendarWorkOrder, readWorkOrderCreationVisit, readWorkOrderVisitManagement, changeWorkOrderVisit } from "./commands";
import { readCalendar, readCalendarVisit, readCalendarAdvisories } from "./read";
import { CalendarSharedReviewRequiredError } from "./sync";
import { readNotifications, markNotificationRead, readNotificationPreferences, saveNotificationPreferences } from "../notifications/store";
import { processVisitEmails } from "../notifications/visits";
import { up as reconcile } from "../migrations/202610210003_calendar_reconcile";
const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") || connection === process.env.DATABASE_URL ||
    !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use the isolated local test database.");
const db = createDatabase(connection), workspaceId = randomUUID(), customerId = randomUUID();
const users = { owner: randomUUID(), field: randomUUID(), crew: randomUUID(), admin: randomUUID() };
const identity = (role: keyof typeof users = "owner") => ({ workspaceId, userId: users[role] });
const enabled = [...permissionIds];
let passed = 0, jobId = "", orderId = "";
const check = async (label: string, work: () => Promise<void>) => { await work(); console.log("PASS " + label); passed++; };
const source = async (table: string, id: string) => db(table).where({ workspaceId, id }).select("*", db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS "scheduledDate"`)).first();
const active = async (column: string, id: string) => (await db("calendarVisitRecords").where({ workspaceId, [column]: id }).whereNull("endedAt").first()).visitId as string;
async function review(visitId: string) {
  const visit = await db("calendarVisits").where({ workspaceId, id: visitId }).first();
  const links = await db("calendarVisitRecords").where({ workspaceId, visitId }).whereNull("endedAt").orderBy("id");
  const records = await Promise.all(links.map(async link => ({ type: link.jobId ? "job" as const : "work_order" as const, id: link.jobId ?? link.workOrderId,
    expectedVersion: (await source(link.jobId ? "jobs" : "workOrders", link.jobId ?? link.workOrderId)).version })));
  return { workspaceId, submissionId: randomUUID(), visitId, expectedVisitVersion: visit.version, records };
}
async function jobChange(extra: Record<string, unknown>) {
  return mutateJob(db, identity(), enabled, { workspaceId, jobId, submissionId: randomUUID(), expectedVersion: (await source("jobs", jobId)).version, ...extra });
}
async function orderChange(extra: Record<string, unknown>) {
  return mutateWorkOrder(db, identity(), enabled, { workspaceId, workOrderId: orderId, submissionId: randomUUID(), expectedVersion: (await source("workOrders", orderId)).version, ...extra });
}
try {
  await db.transaction(async trx => {
    const now = new Date();
    await trx("users").insert(Object.entries(users).map(([role, id]) => ({ id, name: `Calendar fixture ${role}`, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: "fixture", termsAcceptedAt: now })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: users.owner, businessName: "Calendar fixture", businessType: "plumbing", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert(Object.entries(users).map(([role, userId]) => ({ workspaceId, userId, role: role === "crew" ? "field" : role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx("customers").insert({ id: customerId, workspaceId, name: "Calendar fixture customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  await check("creation synchronizes independent visit identities and baseline snapshots", async () => {
    jobId = (await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Calendar fixture job", primaryOwnerId: users.field, teamUserIds: [users.crew],
      scheduledDate: "2026-11-01", arrivalWindow: "09:00-11:00" })).jobId;
    orderId = (await createWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId, title: "Calendar fixture order", assigneeId: users.field, source: { kind: "blank" } })).workOrderId;
    await orderChange({ action: "status", to: "issued", confirmed: true });
    await orderChange({ action: "assign", assigneeId: users.field, crewIds: [users.crew] });
    assert.notEqual(await active("jobId", jobId), await active("workOrderId", orderId));
    assert.equal((await db("calendarScheduleSnapshots").where({ workspaceId })).length, 2);
  });
  await check("creation visit choice is atomic, revision-bound, permission-checked and retry-safe", async () => {
    const ownJob = (await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Creation choice fixture", primaryOwnerId: users.owner, scheduledDate: "2026-11-05", arrivalWindow: "09:00-11:00" })).jobId;
    try {
      const preview = await readWorkOrderCreationVisit(db, identity(), enabled, ownJob);
      assert.ok(preview?.canJoin);
      assert.equal("review" in preview, false);
      const input = { workspaceId, jobId: ownJob, submissionId: randomUUID(), title: "Shared draft", visit: { kind: "job" as const, visitId: preview.id, revision: preview.revision } };
      // The new draft must also be schedulable: denial after insertion must roll the entire creation back.
      await db("workspaceRolePolicies").where({ workspaceId, role: "admin", permission: "workorders.schedule.update" }).delete();
      await assert.rejects(createWorkOrder(db, identity("admin"), enabled, { ...input, submissionId: randomUUID() }), AuthorizationAccessError);
      assert.equal(Number((await db("workOrders").where({ workspaceId, jobId: ownJob }).count("* as n").first())!.n), 0);
      await db("workspaceRolePolicies").insert({ workspaceId, role: "admin", permission: "workorders.schedule.update", scope: "workspace" });
      const result = await createWorkOrder(db, identity(), enabled, input);
      assert.equal(result.version, 2);
      assert.equal(await active("jobId", ownJob), await active("workOrderId", result.workOrderId));
      assert.equal((await source("workOrders", result.workOrderId)).scheduledDate, "2026-11-05");
      assert.deepEqual(await createWorkOrder(db, identity(), enabled, input), result);
      await assert.rejects(createWorkOrder(db, identity(), enabled, { ...input, title: "Changed retry" }));
      const count = Number((await db("workOrders").where({ workspaceId, jobId: ownJob }).count("* as n").first())!.n);
      // Adding membership changes the visit revision even though the Job's date and version did not change.
      await assert.rejects(createWorkOrder(db, identity(), enabled, { ...input, submissionId: randomUUID() }), CalendarRevisionError);
      assert.equal(Number((await db("workOrders").where({ workspaceId, jobId: ownJob }).count("* as n").first())!.n), count);
      const separate = await createWorkOrder(db, identity(), enabled, { ...input, submissionId: randomUUID(), visit: { kind: "separate" } });
      assert.notEqual(await active("jobId", ownJob), await active("workOrderId", separate.workOrderId));
      assert.equal((await source("workOrders", separate.workOrderId)).scheduledDate, null);
      const fresh = await readWorkOrderCreationVisit(db, identity("admin"), enabled, ownJob);
      assert.ok(fresh?.canJoin);
      await db("workspaceRolePolicies").where({ workspaceId, role: "admin", permission: "jobs.schedule.update" }).delete();
      const restricted = await readWorkOrderCreationVisit(db, identity("admin"), enabled, ownJob);
      assert.equal(restricted?.canJoin, false);
      assert.deepEqual(restricted?.references, [preview.references[0]]);
      await assert.rejects(createWorkOrder(db, identity("admin"), enabled, { ...input, submissionId: randomUUID(), visit: { kind: "job", visitId: fresh.id, revision: fresh.revision } }), CalendarRevisionError);
      await assert.rejects(readWorkOrderCreationVisit(db, identity("crew"), enabled, ownJob), AuthorizationAccessError);
      await db("workspaceRolePolicies").insert({ workspaceId, role: "admin", permission: "jobs.schedule.update", scope: "workspace" });
      assert.equal(Number((await db("workOrders").where({ workspaceId, jobId: ownJob }).count("* as n").first())!.n), count + 1);
    } finally {
      await db("workOrders").where({ workspaceId, jobId: ownJob }).delete();
      await db("jobs").where({ workspaceId, id: ownJob }).delete();
    }
  });
  await check("explicit link copies the Job visit and supports actor-bound retries", async () => {
    const target = await review(await active("jobId", jobId)), from = await review(await active("workOrderId", orderId));
    const input = { ...target, workOrderId: orderId, expectedWorkOrderVersion: from.records[0].expectedVersion, sourceVisitId: from.visitId, expectedSourceVisitVersion: from.expectedVisitVersion };
    const result = await linkCalendarWorkOrder(db, identity(), enabled, input);
    assert.deepEqual(await linkCalendarWorkOrder(db, identity(), enabled, input), result);
    assert.equal(await active("jobId", jobId), await active("workOrderId", orderId));
    assert.equal((await source("workOrders", orderId)).scheduledDate, "2026-11-01");
    await assert.rejects(linkCalendarWorkOrder(db, identity("admin"), enabled, input), CalendarRevisionError);
  });
  await check("legacy single-record controls cannot mutate a shared visit", async () => {
    const before = await source("jobs", jobId);
    await assert.rejects(jobChange({ action: "schedule", scheduledDate: "2026-11-02", arrivalWindow: null }), CalendarSharedReviewRequiredError);
    await assert.rejects(orderChange({ action: "schedule", scheduledDate: "2026-11-02", arrivalWindow: null }), CalendarSharedReviewRequiredError);
    assert.deepEqual(await source("jobs", jobId), before);
  });
  await check("shared scheduling updates every record once; retry never doubles writes", async () => {
    const input = { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: "2026-11-02", arrivalWindow: "10:00-12:00" } };
    const result = await scheduleCalendarVisit(db, identity("field"), enabled, input);
    assert.equal(result.records.length, 2);
    assert.deepEqual(await scheduleCalendarVisit(db, identity("field"), enabled, input), result);
    for (const [table, id] of [["jobs", jobId], ["workOrders", orderId]]) assert.equal((await source(table, id)).scheduledDate, "2026-11-02");
    await assert.rejects(scheduleCalendarVisit(db, identity("field"), enabled, { ...input, schedule: { scheduledDate: "2026-11-03", arrivalWindow: null } }), CalendarRevisionError);
  });
  await check("crew-only access and revoked grants cannot indirectly change another record", async () => {
    const input = { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: "2026-11-03", arrivalWindow: null } };
    await assert.rejects(scheduleCalendarVisit(db, identity("crew"), enabled, input), AuthorizationAccessError);
    await db("workspaceRolePolicies").where({ workspaceId, role: "field", permission: "workorders.schedule.update" }).delete();
    const before = await source("jobs", jobId);
    await assert.rejects(scheduleCalendarVisit(db, identity("field"), enabled, input), AuthorizationAccessError);
    assert.deepEqual(await source("jobs", jobId), before);
    await db("workspaceRolePolicies").insert({ workspaceId, role: "field", permission: "workorders.schedule.update", scope: "assigned_job" });
  });
  await check("primary responsibility is required on every linked resource and workspace claims cannot cross tenants", async () => {
    await orderChange({ action: "assign", assigneeId: users.owner, crewIds: [users.field, users.crew] });
    const input = { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: "2026-11-03", arrivalWindow: null } };
    const before = await source("jobs", jobId);
    await assert.rejects(scheduleCalendarVisit(db, identity("field"), enabled, input), AuthorizationAccessError);
    await assert.rejects(scheduleCalendarVisit(db, identity(), enabled, { ...input, workspaceId: randomUUID() }), AuthorizationAccessError);
    assert.deepEqual(await source("jobs", jobId), before);
    await orderChange({ action: "assign", assigneeId: users.field, crewIds: [users.crew] });
  });
  await check("full membership and individual versions invalidate stale reviews", async () => {
    const input = { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: "2026-11-03", arrivalWindow: null } };
    await assert.rejects(scheduleCalendarVisit(db, identity(), enabled, { ...input, records: input.records.slice(0, 1) }), CalendarRevisionError);
    await jobChange({ action: "note", body: "Version changed after Calendar review" });
    await assert.rejects(scheduleCalendarVisit(db, identity(), enabled, input), CalendarRevisionError);
  });
  await check("concurrent confirmations yield one commit and one conflict", async () => {
    const base = await review(await active("jobId", jobId));
    const results = await Promise.allSettled(["2026-11-03", "2026-11-04"].map(scheduledDate => scheduleCalendarVisit(db, identity(), enabled,
      { ...base, submissionId: randomUUID(), schedule: { scheduledDate, arrivalWindow: null } })));
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    assert(results.some(r => r.status === "rejected" && r.reason instanceof CalendarRevisionError));
  });
  await check("a failed resource write rolls back schedules, history and receipt together", async () => {
    const beforeJob = await source("jobs", jobId), beforeOrder = await source("workOrders", orderId);
    const snapshots = (await db("calendarScheduleSnapshots").where({ workspaceId })).length;
    const input = { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: "2027-01-01", arrivalWindow: null } };
    const constraint = `calendar_fixture_${randomUUID().replaceAll("-", "")}`;
    await db.raw(`ALTER TABLE "workOrders" ADD CONSTRAINT ?? CHECK (id <> '${orderId}'::uuid OR "scheduledDate" <> '2027-01-01')`, [constraint]);
    try { await assert.rejects(scheduleCalendarVisit(db, identity(), enabled, input)); }
    finally { await db.raw(`ALTER TABLE "workOrders" DROP CONSTRAINT ??`, [constraint]); }
    assert.deepEqual(await source("jobs", jobId), beforeJob); assert.deepEqual(await source("workOrders", orderId), beforeOrder);
    assert.equal((await db("calendarScheduleSnapshots").where({ workspaceId })).length, snapshots);
    assert.equal(await db("calendarOperations").where({ workspaceId, submissionId: input.submissionId }).first(), undefined);
  });
  await check("clear preserves lifecycle rules; separate leaves other schedules unchanged", async () => {
    await scheduleCalendarVisit(db, identity(), enabled, { ...await review(await active("jobId", jobId)), schedule: { scheduledDate: null, arrivalWindow: null } });
    assert.equal((await source("jobs", jobId)).status, "needs-scheduling");
    assert.equal((await source("workOrders", orderId)).status, "issued");
    const oldVisitId = await active("jobId", jobId), beforeJob = await source("jobs", jobId);
    const result = await separateCalendarWorkOrder(db, identity(), enabled, { ...await review(oldVisitId), workOrderId: orderId, schedule: { scheduledDate: "2026-11-05", arrivalWindow: "09:00-11:00" } });
    assert.notEqual(result.visitId, oldVisitId); assert.deepEqual(await source("jobs", jobId), beforeJob);
    assert.equal((await source("workOrders", orderId)).scheduledDate, "2026-11-05");
  });
  await check("closed shared records retain history; reopen always creates an independent visit", async () => {
    await jobChange({ action: "schedule", scheduledDate: "2026-11-06", arrivalWindow: null });
    const target = await review(await active("jobId", jobId)), from = await review(await active("workOrderId", orderId));
    await linkCalendarWorkOrder(db, identity(), enabled, { ...target, workOrderId: orderId, expectedWorkOrderVersion: from.records[0].expectedVersion, sourceVisitId: from.visitId, expectedSourceVisitVersion: from.expectedVisitVersion });
    const sharedId = await active("jobId", jobId);
    await jobChange({ action: "status", to: "completed", confirmed: true });
    const closed = await source("jobs", jobId);
    await orderChange({ action: "schedule", scheduledDate: "2026-11-07", arrivalWindow: null });
    assert.deepEqual(await source("jobs", jobId), closed);
    assert(await db("calendarScheduleSnapshots").where({ workspaceId, jobId, reason: "closed", scheduledDate: "2026-11-06" }).first());
    await jobChange({ action: "status", to: "scheduled", confirmed: true, reopenDeadline: null });
    assert.notEqual(await active("jobId", jobId), sharedId);
    assert.equal((await source("jobs", jobId)).scheduledDate, "2026-11-06");
    assert.equal(await active("workOrderId", orderId), sharedId);
  });
  await check("Work Order completion and reopen preserve history and separate identity", async () => {
    const old = await active("workOrderId", orderId);
    await orderChange({ action: "status", to: "in-progress" });
    await orderChange({ action: "complete", summary: "Fixture complete", followUp: "none", followUpNote: "", overrideReason: "" });
    assert(await db("calendarScheduleSnapshots").where({ workspaceId, workOrderId: orderId, reason: "closed" }).first());
    await orderChange({ action: "reopen", reason: "Fixture follow-up" });
    assert.notEqual(await active("workOrderId", orderId), old);
    assert.equal((await source("workOrders", orderId)).scheduledDate, "2026-11-07");
  });
  await check("a primary Work Order assignee may schedule their order without gaining parent Job access", async () => {
    const parent = await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Separate parent", primaryOwnerId: users.owner });
    const order = await createWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId: parent.jobId, title: "Direct assignment", assigneeId: users.crew, source: { kind: "blank" } });
    await mutateWorkOrder(db, identity(), enabled, { workspaceId, workOrderId: order.workOrderId, submissionId: randomUUID(), expectedVersion: order.version, action: "status", to: "issued", confirmed: true });
    const before = await source("jobs", parent.jobId);
    await assert.rejects(readJob(db, identity("crew"), enabled, parent.jobId), AuthorizationAccessError);
    await scheduleCalendarVisit(db, identity("crew"), enabled, { ...await review(await active("workOrderId", order.workOrderId)), schedule: { scheduledDate: "2026-11-09", arrivalWindow: null } });
    assert.deepEqual(await source("jobs", parent.jobId), before);
    await assert.rejects(readJob(db, identity("crew"), enabled, parent.jobId), AuthorizationAccessError);
  });
  await check("reconciliation refreshes stale independent baselines without altering source rows", async () => {
    await db("jobs").where({ workspaceId, id: jobId }).update({ scheduledDate: "2026-11-08" });
    const before = await source("jobs", jobId);
    await db.transaction(trx => reconcile(trx));
    assert.deepEqual(await source("jobs", jobId), before);
    const visit = await db("calendarVisits").where({ id: await active("jobId", jobId) }).select(db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).first();
    assert.equal(visit.date, "2026-11-08");
  });
  await check("SQL Calendar ranges, own scope and queue pagination apply permissions before counts", async () => {
    for (let index = 0; index < 23; index++) await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId,
      title: `Queue fixture ${index}`, primaryOwnerId: users.owner });
    const result = await readCalendar(db, identity(), enabled, { workspaceId, date: "2026-11-08" });
    assert.equal(result.weekDate, "2026-11-02"); assert.equal(result.entries.length, 2);
    assert.equal(result.unscheduledTotal, 24); assert.equal(result.unscheduled.length, 10); assert.equal(result.queuePages, 3);
    const second = await readCalendar(db, identity(), enabled, { workspaceId, date: "2026-11-08", queuePage: 2 });
    assert.equal(second.unscheduled.length, 10); assert(!second.unscheduled.some(v => result.unscheduled.some(a => a.id === v.id)));
    const last = await readCalendar(db, identity(), enabled, { workspaceId, date: "2026-11-08", queuePage: 999 });
    assert.equal(last.query.queuePage, 3); assert.equal(last.unscheduled.length, 4);
    const field = await readCalendar(db, identity("field"), enabled, { workspaceId, date: "2026-11-08", person: `member:${users.owner}` });
    assert.equal(field.scope, "own"); assert.equal(field.query.person, "me"); assert.equal(field.unscheduledTotal, 0);
    assert.deepEqual(field.members.map(p => p.id), [users.field]);
    const future = await createJob(db, identity(), enabled, { workspaceId,submissionId:randomUUID(),customerId,title:'Far future range fixture',primaryOwnerId:users.field,scheduledDate:'2030-01-01' });
    const queued = await createJob(db, identity(), enabled, { workspaceId,submissionId:randomUUID(),customerId,title:'All-week queue fixture',primaryOwnerId:users.field });
    for (const date of ['2026-11-08','2027-01-04']) {
      const scoped = await readCalendar(db,identity('field'),enabled,{ workspaceId,date });
      assert.equal(scoped.unscheduledTotal,1);assert(scoped.unscheduled.some(v=>v.records.some(r=>r.id===queued.jobId)));
      assert(!scoped.entries.some(v=>v.records.some(r=>r.id===future.jobId)));
    }
    const later = await readCalendar(db,identity('field'),enabled,{ workspaceId,date:'2030-01-01' });
    assert(later.entries.some(v=>v.records.some(r=>r.id===future.jobId)));assert.equal(later.unscheduledTotal,1);

    assert(field.entries.every(v => v.crew.every(p => p.id === users.field)));
    await assert.rejects(readCalendar(db, identity(), enabled.filter(p => p !== "calendar.read"), { workspaceId }), AuthorizationAccessError);
  });
  await check("hidden linked records never enter projections or grant shared scheduling authority", async () => {
    const parent = await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Restricted parent title", primaryOwnerId: users.owner,
      scheduledDate: "2026-11-09", completionDeadline: "2026-11-20", arrivalWindow: "09:00-11:00" });
    const order = await createWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId: parent.jobId, title: "Visible direct work", assigneeId: users.crew, source: { kind: "blank" } });
    await mutateWorkOrder(db, identity(), enabled, { workspaceId, workOrderId: order.workOrderId, submissionId: randomUUID(), expectedVersion: order.version, action: "status", to: "issued", confirmed: true });
    const target = await review(await active("jobId", parent.jobId)), from = await review(await active("workOrderId", order.workOrderId));
    await linkCalendarWorkOrder(db, identity(), enabled, { ...target, workOrderId: order.workOrderId, expectedWorkOrderVersion: from.records[0].expectedVersion, sourceVisitId: from.visitId, expectedSourceVisitVersion: from.expectedVisitVersion });
    const own = await readCalendarVisit(db, identity("crew"), enabled, target.visitId);
    assert.deepEqual(own.records.map(r => r.id), [order.workOrderId]); assert.equal(own.title, "Visible direct work");
    assert.equal(own.completionDeadline, null); assert.equal(own.canReschedule, false); assert.equal(own.review, null);
    assert(!JSON.stringify(own).includes(parent.jobId)); assert(!JSON.stringify(own).includes("Restricted parent title"));
    const owner = await readCalendar(db, identity(), enabled, { workspaceId, date: "2026-11-09", recordType: "job", person: `member:${users.crew}` });
    assert.equal(owner.entries.length, 1); assert.equal(owner.entries[0].records.length, 2);
    const filtered = await readCalendar(db, identity(), enabled, { workspaceId, date: "2026-11-09", status: "work_order:issued", customerQuery: "%_" });
    assert.equal(filtered.entries.length, 0); assert.equal(filtered.unscheduledTotal, 0);
    await assert.rejects(readCalendarVisit(db, identity("field"), enabled, target.visitId), AuthorizationAccessError);
    const none = await readCalendar(db, identity(), enabled.filter(p => p !== "jobs.read" && p !== "workorders.read"), { workspaceId, date: "2026-11-09" });
    assert.equal(none.entries.length, 0); assert.equal(none.unscheduledTotal, 0);
  });
  await check("advisories exclude the edited visit, warn for intersections and allow adjacent windows", async () => {
    const id = await active("jobId", jobId);
    const target = await readCalendarVisit(db, identity(), enabled, id);
    for (const arrivalWindow of ["08:00-10:00", "10:00-12:00", "12:00-14:00"] as const) await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId,
      title: "Warning fixture", primaryOwnerId: users.field, scheduledDate: "2026-11-10", arrivalWindow });
    const overlap = await readCalendarAdvisories(db, identity(), enabled, { workspaceId, visitId: id, revision: target.revision, schedule: { scheduledDate: "2026-11-10", arrivalWindow: "09:00-11:00" } });
    assert(overlap.messages.some(m => m.includes("overlapping"))); assert(overlap.messages.some(m => m.includes("4 visits")));
    const adjacent = await readCalendarAdvisories(db, identity(), enabled, { workspaceId, visitId: id, revision: target.revision, schedule: { scheduledDate: "2026-11-10", arrivalWindow: "14:00-16:00" } });
    assert(!adjacent.messages.some(m => m.includes("overlapping")));
    await assert.rejects(readCalendarAdvisories(db, identity(), enabled, { workspaceId, visitId: id, revision: "stale", schedule: { scheduledDate: null, arrivalWindow: null } }), CalendarRevisionError);
    const current = await readCalendarAdvisories(db, identity(), enabled, { workspaceId, visitId: id, revision: target.revision, schedule: { scheduledDate: target.scheduledDate, arrivalWindow: target.arrivalWindow } });
    assert.equal(current.messages.length, 0);
  });
  await check("managed join/separate previews and commands enforce complete authority and actor-bound retry", async () => {
    const j = (await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Managed visit fixture", primaryOwnerId: users.field,
      scheduledDate: "2026-11-12", arrivalWindow: "09:00-11:00" })).jobId;
    const w = (await createWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId: j, title: "Managed work order", assigneeId: users.field })).workOrderId;
    try {
      const preview = await readWorkOrderVisitManagement(db, identity(), enabled.filter(p => p !== "calendar.read" && p !== "workorders.create"), w);
      assert(preview.canJoin); assert(!preview.canSeparate); assert(preview.source && preview.target);
      const join = { workspaceId, submissionId: randomUUID(), workOrderId: w, kind: "join", sourceVisitId: preview.source.id, sourceRevision: preview.source.revision, visitId: preview.target.id, revision: preview.target.revision };
      const beforeJob = await source("jobs", j);
      await assert.rejects(changeWorkOrderVisit(db, identity(), enabled, { ...join, revision: "0".repeat(64) }), CalendarRevisionError);
      const result = await changeWorkOrderVisit(db, identity(), enabled, join);
      assert.deepEqual(await changeWorkOrderVisit(db, identity(), enabled, join), result);
      await assert.rejects(changeWorkOrderVisit(db, identity("admin"), enabled, join), CalendarRevisionError);
      assert.equal(await active("jobId", j), await active("workOrderId", w));
      assert.deepEqual(await source("jobs", j), beforeJob);
      const shared = await readWorkOrderVisitManagement(db, identity(), enabled, w);
      assert(shared.canSeparate); assert(!shared.canJoin); assert(shared.source);
      // A changed resource version invalidates the exact membership review, even when the date is unchanged.
      await mutateWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), workOrderId: w, expectedVersion: 2, action: "edit", title: "Updated managed order" });
      const split = { workspaceId, submissionId: randomUUID(), workOrderId: w, kind: "separate", visitId: shared.source.id, revision: shared.source.revision, scheduledDate: null, arrivalWindow: null };
      await assert.rejects(changeWorkOrderVisit(db, identity(), enabled, split), CalendarRevisionError);
      const fresh = await readWorkOrderVisitManagement(db, identity(), enabled, w); assert(fresh.source);
      const input = { ...split, revision: fresh.source.revision };
      const separate = await changeWorkOrderVisit(db, identity(), enabled, input);
      assert.deepEqual(await changeWorkOrderVisit(db, identity(), enabled, input), separate);
      assert.notEqual(await active("jobId", j), await active("workOrderId", w));
      assert.equal((await source("workOrders", w)).scheduledDate, null);
      assert.deepEqual(await source("jobs", j), beforeJob);
      const restricted = await readWorkOrderVisitManagement(db, identity("admin"), enabled.filter(p => p !== "jobs.read"), w);
      assert(!restricted.canJoin); assert.equal(restricted.target, null);
      assert.equal(restricted.source?.completionDeadline, null);
      // Revoke scheduling after preview; no partial membership/date write may commit.
      const next = await readWorkOrderVisitManagement(db, identity("admin"), enabled, w); assert(next.source && next.target);
      const claim = { ...join, submissionId: randomUUID(), sourceVisitId: next.source.id, sourceRevision: next.source.revision, revision: next.target.revision };
      const woBefore = await source("workOrders", w);
      await assert.rejects(changeWorkOrderVisit(db, identity("admin"), enabled.filter(p => p !== "jobs.schedule.update"), claim), AuthorizationAccessError);
      assert.deepEqual(await source("workOrders", w), woBefore);
      await assert.rejects(changeWorkOrderVisit(db, { ...identity(), workspaceId: randomUUID() }, enabled, claim), AuthorizationAccessError);
    } finally { await db("workOrders").where({ workspaceId, jobId: j }).delete(); await db("jobs").where({ workspaceId, id: j }).delete(); }
  });
  await check("combined notices scope counts/records, skip actors, honor preferences and deliver retry-safely", async () => {
    // Isolate the delivery scenario from earlier journeys in this fixture workspace.
    await db("visitNotifications").where({ workspaceId }).delete();
    await db("users").whereIn("id", Object.values(users)).update({ emailVerified: true });
    const j = (await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: "Notice fixture", primaryOwnerId: users.field, teamUserIds: [users.crew], scheduledDate: "2026-11-12", arrivalWindow: "09:00-11:00" })).jobId;
    const w = (await createWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId: j, title: "Notice order", assigneeId: users.field })).workOrderId;
    try {
      // Draft joins do not notify the crew; issued records participate in the combined event.
      const target = await review(await active("jobId", j)), from = await review(await active("workOrderId", w));
      await linkCalendarWorkOrder(db, identity(), enabled, { ...target, sourceVisitId: from.visitId, expectedSourceVisitVersion: from.expectedVisitVersion, workOrderId: w, expectedWorkOrderVersion: 1 });
      assert.equal((await db("visitNotifications").where({ workspaceId })).length, 0);
      await mutateWorkOrder(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), workOrderId: w, expectedVersion: 2, action: "status", to: "issued", confirmed: true });
      const input = { ...await review(await active("jobId", j)), schedule: { scheduledDate: "2026-11-13", arrivalWindow: "13:00-15:00" } };
      await scheduleCalendarVisit(db, identity(), enabled, input); await scheduleCalendarVisit(db, identity(), enabled, input);
      const rows = await db("visitNotifications").where({ workspaceId }); assert.equal(rows.length, 2);
      assert(!rows.some(r => r.userId === users.owner));
      const notices = (await readNotifications(db, identity("field"), enabled)).items.filter(n => n.kind === "visit");
      assert.equal(notices.length, 1); assert.equal(notices[0].records.length, 2);
      const crewNotices = (await readNotifications(db, identity("crew"), enabled)).items.filter(n => n.kind === "visit");
      assert.equal(crewNotices.length, 1); assert.equal(crewNotices[0].records.length, 2);
      const limited = (await readNotifications(db, identity("field"), enabled.filter(p => p !== "jobs.read"))).items.filter(n => n.kind === "visit");
      assert.equal(limited.length, 1); assert.deepEqual(limited[0].records.map(r => r.type), ["work_order"]);
      const hidden = await readNotifications(db, identity("field"), enabled.filter(p => p !== "jobs.read" && p !== "workorders.read"));
      assert.equal(hidden.unreadCount, 0); assert.equal(hidden.items.length, 0);
      await assert.rejects(markNotificationRead(db, identity("admin"), enabled, notices[0].id), AuthorizationAccessError);
      await markNotificationRead(db, identity("field"), enabled, notices[0].id);
      assert((await readNotifications(db, identity("field"), enabled)).items.find(n => n.id === notices[0].id)?.read);
      await saveNotificationPreferences(db, identity("crew"), enabled, { leadAssignedEmail: true, visitChangedEmail: false });
      // Old callers must not silently turn visit emails back on when updating lead emails.
      await saveNotificationPreferences(db, identity("crew"), enabled, { leadAssignedEmail: false });
      assert.equal((await readNotificationPreferences(db, identity("crew"), enabled)).visitChangedEmail, false);
      let calls = 0;
      await processVisitEmails(db, enabled, async mail => { assert.equal(mail.records.length, 2); calls++; throw Error("fake transient failure"); }, 100);
      assert.equal(calls, 1); assert.equal((await db("visitNotifications").where({ id: notices[0].id }).first()).attempts, 1);
      assert.equal((await db("visitNotifications").where({ userId: users.crew, workspaceId }).first()).emailStatus, "skipped");
      await db("visitNotifications").where({ id: notices[0].id }).update({ nextAttemptAt: db.fn.now() });
      await Promise.all([1, 2].map(() => processVisitEmails(db, enabled.filter(p => p !== "jobs.read"), async mail => { assert.deepEqual(mail.records.map(r => r.type), ["work_order"]); calls++; }, 100)));
      assert.equal(calls, 2); assert.equal((await db("visitNotifications").where({ id: notices[0].id }).first()).emailStatus, "sent");
      await processVisitEmails(db, enabled, async () => { calls++; }, 100); assert.equal(calls, 2);
      // A receipt failure after enqueue rolls back both schedule changes and newly enqueued notices.
      const doomed = { ...await review(await active("jobId", j)), schedule: { scheduledDate: "2026-11-15", arrivalWindow: null } };
      const priorCount = (await db("visitNotifications").where({ workspaceId })).length;
      const constraint = `notice_fixture_${randomUUID().replaceAll("-", "")}`;
      await db.raw(`ALTER TABLE "calendarOperations" ADD CONSTRAINT ?? CHECK ("submissionId" <> '${doomed.submissionId}'::uuid)`, [constraint]);
      try { await assert.rejects(scheduleCalendarVisit(db, identity(), enabled, doomed)); }
      finally { await db.raw(`ALTER TABLE "calendarOperations" DROP CONSTRAINT ??`, [constraint]); }
      assert.equal((await db("visitNotifications").where({ workspaceId })).length, priorCount);
      assert.equal((await source("jobs", j)).scheduledDate, "2026-11-13");
      // New queue entries must be suppressed on revoked access at delivery time too.
      await scheduleCalendarVisit(db, identity(), enabled, { ...await review(await active("jobId", j)), schedule: { scheduledDate: "2026-11-14", arrivalWindow: null } });
      await processVisitEmails(db, enabled.filter(p => p !== "jobs.read" && p !== "workorders.read"), async () => { throw Error("must not send"); }, 100);
      assert.equal((await db("visitNotifications").where({ workspaceId, emailStatus: "queued" })).length, 0);
    } finally { await db("workOrders").where({ workspaceId, jobId: j }).delete(); await db("jobs").where({ workspaceId, id: j }).delete(); }
  });
  console.log(`Calendar commands rehearsal passed (${passed} checks).`);
} finally {
  await db("workOrders").where({ workspaceId }).delete();
  await db("jobs").where({ workspaceId }).delete();
  await db("workspaces").where({ id: workspaceId }).delete();
  await db("users").whereIn("id", Object.values(users)).delete();
  await db.destroy();
}
