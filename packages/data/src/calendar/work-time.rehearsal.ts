import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { permissionIds } from "@salesmora/contracts";
import { CalendarRevisionError } from "@salesmora/domain";
import { createDatabase } from "../database";
import { AuthorizationAccessError, initializeWorkspacePolicy } from "../authorization/store";
import { createJob, mutateJob } from "../jobs/store";
import { createWorkOrder, mutateWorkOrder } from "../work-orders/mutations";
import { scheduleCalendarVisit, linkCalendarWorkOrder, separateCalendarWorkOrder } from "./commands";
import { proposeCalendarSchedule, readCalendarScheduleProposal, operateCalendarScheduleProposal } from "./proposals";
import { readCalendarVisit, readCalendarAdvisories } from "./read";
import { migrateFreshBaseline } from "../baseline-runner";
const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") || connection === process.env.DATABASE_URL ||
    !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use the isolated local test database.");
const name = `calendar_work_time_${randomUUID().replaceAll("-", "")}_test`;
const url = new URL(connection); url.pathname = `/${name}`;
const owner = createDatabase(connection), db = createDatabase(url.toString()), workspaceId = randomUUID(), customerId = randomUUID();
const runtimeURL = new URL(url); runtimeURL.searchParams.set("options", "-c role=salesmora_web"); const web = createDatabase(runtimeURL.toString());
let created = false;
const users = { owner: randomUUID(), field: randomUUID(), crew: randomUUID(), admin: randomUUID() };
const identity = (role: keyof typeof users = "owner") => ({ workspaceId, userId: users[role] });
const enabled = [...permissionIds];
let passed = 0;
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
try {
  await owner.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    const now = new Date();
    await trx("users").insert(Object.entries(users).map(([role, id]) => ({ id, name: `Calendar fixture ${role}`, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: "fixture", termsAcceptedAt: now })));
    await trx("workspaces").insert({ id: workspaceId, ownerId: users.owner, businessName: "Calendar fixture", businessType: "plumbing", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert(Object.entries(users).map(([role, userId]) => ({ workspaceId, userId, role: role === "crew" ? "field" : role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx("customers").insert({ id: customerId, workspaceId, name: "Calendar fixture customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
  });
  const create = async (title: string, date = '2027-03-12') => (await createJob(web, identity(), enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title,
    primaryOwnerId: users.field, scheduledDate: date, arrivalWindow: '09:00-11:00' })).jobId;
  const set = async (visitId: string, workTime: { startTime: string; durationMinutes: number } | null, date = '2027-03-12') => {
    const command = { ...await review(visitId), schedule: { scheduledDate: date, arrivalWindow: '09:00-11:00' as const, workTime } };
    const saved = await scheduleCalendarVisit(web, identity(), enabled, command); return { saved, command };
  };
  let j: string, v: string;
  await check('runtime save/read/retry preserves intent, timezone, UTC occupancy and shared snapshots', async () => {
    j = await create('Work time fixture'); v = await active('jobId', j);
    const { command } = await set(v, { startTime: '09:00', durationMinutes: 90 });
    await scheduleCalendarVisit(web, identity(), enabled, command);
    const current = await readCalendarVisit(web, identity(), enabled, v);
    assert.deepEqual(current.workTime, { startTime: '09:00', durationMinutes: 90 }); assert.equal(current.workTimezone, 'America/New_York');
    assert.equal(current.workStartsAt, '2027-03-12T14:00:00.000Z'); assert.equal(current.workEndsAt, '2027-03-12T15:30:00.000Z');
    assert.equal((await source('jobs', j)).version, 2);
    const old = await db('calendarScheduleSnapshots').where({ visitId: v, reason: 'rescheduled' }).first(); assert.equal(old.workTime, null);
    assert.deepEqual((await db('visitNotifications').where({ workspaceId, operationId: command.submissionId }).first()).after.workTime, current.workTime);
    await assert.rejects(scheduleCalendarVisit(web, identity(), enabled, { ...command, submissionId: randomUUID(), schedule: { ...command.schedule, workTime: null } }), CalendarRevisionError);
  });
  await check('full work overlaps beyond an arrival window are warned, adjacency is allowed and unknown work is explicit', async () => {
    await set(v, { startTime: '09:00', durationMinutes: 240 });
    const otherJob = await create('Other work time'), other = await active('jobId', otherJob), target = await readCalendarVisit(web, identity(), enabled, other);
    const advisory = (startTime: string) => readCalendarAdvisories(web, identity(), enabled, { workspaceId, visitId: other, revision: target.revision,
      schedule: { scheduledDate: '2027-03-12', arrivalWindow: '14:00-16:00', workTime: { startTime, durationMinutes: 60 } } });
    assert((await advisory('12:00')).messages.some(message => message.includes('overlapping planned work')));
    assert(!(await advisory('13:00')).messages.some(message => message.includes('overlapping planned work')));
    await create('Unknown duration'); assert((await advisory('14:00')).messages.some(message => message.includes('without recorded work time')));
    await assert.rejects(readCalendarAdvisories(web, identity(), enabled, { workspaceId, visitId: other, revision: 'old', schedule: { scheduledDate: '2027-03-12', arrivalWindow: null } }));
  });
  await check('date changes keep local work intent, cross DST correctly and clear removes occupied time', async () => {
    await scheduleCalendarVisit(web, identity(), enabled, { ...await review(v), schedule: { scheduledDate: '2027-03-15', arrivalWindow: null } });
    let current = await readCalendarVisit(web, identity(), enabled, v); assert.equal(current.workTime?.startTime, '09:00'); assert.equal(current.workStartsAt, '2027-03-15T13:00:00.000Z');
    await mutateJob(web, identity(), enabled, { workspaceId, jobId: j, submissionId: randomUUID(), expectedVersion: (await source('jobs',j)).version, action: 'schedule', scheduledDate: '2027-03-16', arrivalWindow: null });
    current = await readCalendarVisit(web, identity(), enabled, v); assert.equal(current.workStartsAt, '2027-03-16T13:00:00.000Z');
    await scheduleCalendarVisit(web, identity(), enabled, { ...await review(v), schedule: { scheduledDate: null, arrivalWindow: null, workTime: null } });
    current = await readCalendarVisit(web, identity(), enabled, v); assert.equal(current.workTime, null); assert.equal(current.workStartsAt, null); assert.equal(current.workEndsAt, null);
    const history = await db('calendarScheduleSnapshots').where({ visitId: v, reason: 'cleared' }).first(); assert.equal(history.workTime.startTime, '09:00');
  });
  await check('nonexistent/repeated/cross-transition work is rejected and occupancy cannot be forged', async () => {
    for (const [date,startTime,durationMinutes] of [['2027-03-14','02:30',60], ['2027-11-07','01:30',30], ['2027-03-14','01:30',120]] as const) {
      await assert.rejects(set(v, { startTime, durationMinutes }, date));
      assert.equal((await readCalendarVisit(web, identity(), enabled, v)).scheduledDate, null, 'failed save rolls the date/record/history back');
    }
    await set(v, { startTime: '09:00', durationMinutes: 60 });
    await web('calendarVisits').where({ workspaceId, id: v }).update({ workStartsAt: new Date(0), workEndsAt: new Date(60000) });
    const current = await readCalendarVisit(web, identity(), enabled, v); assert.equal(current.workStartsAt, '2027-03-12T14:00:00.000Z');
    await assert.rejects(web('calendarVisits').where({ workspaceId, id: v }).update({ workTime: JSON.stringify({ startTime: '09:00', durationMinutes: 60, ignoreConflicts: true }) }));
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/Chicago' });
    const unchanged = await readCalendarVisit(web, identity(), enabled, v); assert.equal(unchanged.workStartsAt, current.workStartsAt); assert.equal(unchanged.workTimezone, 'America/New_York');
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  });
  await check('shared work time stays on the visit, inherited separation is independent and revoked permissions block save', async () => {
    const order = (await createWorkOrder(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId: j, title: 'Shared work time', assigneeId: users.field, source: { kind: 'blank' } })).workOrderId;
    await mutateWorkOrder(web, identity(), enabled, { workspaceId, workOrderId: order, submissionId: randomUUID(), expectedVersion: 1, action: 'status', to: 'issued', confirmed: true });
    const from = await active('workOrderId', order), fromView = await review(from), toView = await review(v);
    await linkCalendarWorkOrder(web, identity(), enabled, { ...toView, workOrderId: order, expectedWorkOrderVersion: (await source('workOrders', order)).version, sourceVisitId: from, expectedSourceVisitVersion: fromView.expectedVisitVersion });
    const shared = await readCalendarVisit(web, identity(), enabled, v); assert.equal(shared.records.length, 2); assert.equal(shared.workTime?.durationMinutes, 60);
    const command = { ...await review(v), schedule: { scheduledDate: '2027-03-12', arrivalWindow: null, workTime: { startTime: '10:00', durationMinutes: 90 } } };
    await assert.rejects(scheduleCalendarVisit(web, identity(), enabled.filter(permission => permission !== 'workorders.schedule.update'), command), AuthorizationAccessError);
    await scheduleCalendarVisit(web, identity(), enabled, command);
    assert.equal((await readCalendarVisit(web, identity('field'), enabled, v)).workTime?.startTime, '10:00');
    const separate = await separateCalendarWorkOrder(web, identity(), enabled, { ...await review(v), workOrderId: order, schedule: { scheduledDate: '2027-03-15', arrivalWindow: null } });
    const separated = await readCalendarVisit(web, identity(), enabled, separate.visitId); assert.equal(separated.workTime?.startTime, '10:00'); assert.equal(separated.workStartsAt, '2027-03-15T14:00:00.000Z');
    assert.equal((await readCalendarVisit(web, identity(), enabled, v)).workStartsAt, '2027-03-12T15:00:00.000Z');
  });
  await check('assistant date reviews preserve planned work and clear reviews explicitly remove it', async () => {
    const prepare = async (clear: boolean) => {
      const turnId = randomUUID(), threadId = randomUUID();
      await db('chatThreads').insert({ id: threadId, workspaceId, userId: users.owner });
      await db('chatTurns').insert({ id: turnId, threadId, workspaceId, userId: users.owner, clientTurnId: randomUUID(), requestHash: 'work-time-proposal', surfaceKey: 'calendar', state: 'running', leaseUntil: new Date(Date.now() + 60000) });
      const result = await proposeCalendarSchedule(web, identity(), enabled, turnId, { operation: clear ? 'clear' : 'schedule', recordRef: v,
        scheduledDate: clear ? null : '2027-03-18', arrivalWindow: null, windowMode: clear ? 'unset' : 'keep' }, AbortSignal.timeout(10000));
      assert('proposalId' in result); if (!('proposalId' in result)) throw Error('Missing work-time review');
      await db('chatTurns').where({ id: turnId }).update({ state: 'completed' });
      return { proposalId: result.proposalId, inputHash: result.inputHash, visitId: result.visitId, revision: result.revision };
    };
    const binding = await prepare(false), proposal = await readCalendarScheduleProposal(web, identity(), enabled, binding);
    assert.deepEqual(proposal.draft.to.workTime, { startTime: '10:00', durationMinutes: 90 });
    await operateCalendarScheduleProposal(web, identity(), enabled, binding, 'confirm');
    assert.equal((await readCalendarVisit(web, identity(), enabled, v)).workStartsAt, '2027-03-18T14:00:00.000Z');
    const clearing = await prepare(true), clearReview = await readCalendarScheduleProposal(web, identity(), enabled, clearing);
    assert.equal(clearReview.draft.from.workTime?.startTime, '10:00'); assert.equal(clearReview.draft.to.workTime, null);
    await operateCalendarScheduleProposal(web, identity(), enabled, clearing, 'confirm');
    assert.equal((await readCalendarVisit(web, identity(), enabled, v)).workTime, null);
  });
  console.log(`Calendar planned work: ${passed} runtime-role groups passed; no model or external delivery used.`);
} finally {
  await Promise.all([db.destroy(), web.destroy()]); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy();
}
