import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { permissionIds, calendarWeekdays, type CalendarBookingRules } from '@salesmora/contracts';
import { addCalendarDays, CalendarRevisionError } from '@salesmora/domain';
import { createDatabase } from '../database';
import { AuthorizationAccessError, initializeWorkspacePolicy, loadWorkspaceAuthorization, withWorkspaceAuthoritySnapshot, withWorkspaceAuthorization } from '../authorization/store';
import { migrateFreshBaseline } from '../baseline-runner';
import { createJob, mutateJob } from '../jobs/store';
import { createWorkOrder, mutateWorkOrder } from '../work-orders/mutations';
import { findCalendarBookingSlot, bookCalendarJob, resolveCalendarBookingWindows } from './booking';
import { readCalendarVisit } from './read';
import { scheduleCalendarVisit, linkCalendarWorkOrder, separateCalendarWorkOrder } from './commands';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use the isolated local test database.');
const name = `calendar_booking_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = '/' + name;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeURL.toString());
const workspaceId = randomUUID(), customerId = randomUUID(), users = { owner: randomUUID(), field: randomUUID(), crew: randomUUID(), admin: randomUUID() };
const enabled = [...permissionIds], identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
const rules: CalendarBookingRules = { durationMinutes: 60, gapMinutes: 30, horizonDays: 3, weekdays: [...calendarWeekdays], hours: { startTime: '08:00', endTime: '17:00' } };
const week = (startTime = '08:00', endTime = '17:00') => Object.fromEntries(calendarWeekdays.map(day => [day, { startTime, endTime }]));
let from: string, created = false, passed = 0;
const request = (jobId: string, changes: Partial<CalendarBookingRules> = {}) => ({ workspaceId, jobId, rules: { ...rules, ...changes } });
const command = (jobId: string, changes: Partial<CalendarBookingRules> = {}) => ({ ...request(jobId, changes), submissionId: randomUUID() });
const visitId = async (jobId: string) => (await db('calendarVisitRecords').where({ workspaceId, jobId }).whereNull('endedAt').first()).visitId as string;
const create = async (title = 'Booking fixture', changes = {}) => (await createJob(web, identity(), enabled, {workspaceId, submissionId: randomUUID(), customerId, title, primaryOwnerId: users.field, ...changes ,postalCode:'10001'})).jobId;
async function schedule(id: string, date: string | null, startTime = '08:00', durationMinutes = 60) {
  const current = await readCalendarVisit(web, identity(), enabled, id);
  return scheduleCalendarVisit(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), visitId: id, ...current.review!, schedule: { scheduledDate: date, arrivalWindow: date ? '08:00-10:00' : null, workTime: date ? { startTime, durationMinutes } : null } });
}
async function setHours(userId: string, startTime = '08:00', endTime = '17:00', unavailableDates: { startDate: string; endDate: string }[] = [], timezone = 'America/New_York') {
  await db('calendarPersonAvailability').where({ workspaceId, personId: userId }).update({ availability: JSON.stringify({ weeklyHours: week(startTime, endTime), unavailableDates }), timezone });
}
async function reset() {
  await db('visitNotifications').where({ workspaceId }).delete();
  await db('workOrders').where({ workspaceId }).delete(); await db('jobs').where({ workspaceId }).delete(); await db('calendarVisits').where({ workspaceId }).delete();
  await db('calendarBookingOperations').where({ workspaceId }).delete(); await db('calendarPersonAvailability').where({ workspaceId }).delete();
  await db('users').whereIn('id', Object.values(users)).update({ suspendedAt: null, suspendedReason: null });
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  await db('calendarPersonAvailability').insert(Object.values(users).map(personId => ({ workspaceId, personId, version: 1, timezone: 'America/New_York', availability: JSON.stringify({ weeklyHours: week(), unavailableDates: [] }) })));
  const today = (await db.raw(`SELECT to_char(current_timestamp AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS today`)).rows[0].today;
  from = addCalendarDays(today, 1);
}
async function check(label: string, run: () => Promise<void>) { await reset(); await run(); console.log('PASS ' + label); passed++; }
async function shared(issued = true) {
  const jobId = await create('Shared booking', { scheduledDate: from });
  const workOrderId = (await createWorkOrder(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), jobId, title: 'Shared crew work', assigneeId: users.crew })).workOrderId;
  if (issued) await mutateWorkOrder(web, identity(), enabled, { workspaceId, workOrderId, submissionId: randomUUID(), expectedVersion: 1, action: 'status', to: 'issued', confirmed: true });
  const target = await readCalendarVisit(web, identity(), enabled, await visitId(jobId));
  const orderVisit = (await db('calendarVisitRecords').where({ workspaceId, workOrderId }).whereNull('endedAt').first()).visitId;
  const source = await readCalendarVisit(web, identity(), enabled, orderVisit);
  await linkCalendarWorkOrder(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), visitId: target.id, ...target.review!, workOrderId, expectedWorkOrderVersion: source.review!.records[0].expectedVersion, sourceVisitId: source.id, expectedSourceVisitVersion: source.review!.expectedVisitVersion });
  await schedule(target.id, null); return { jobId, workOrderId, id: target.id };
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    const now = new Date(); await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: 'Booking ' + role, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'fixture', termsAcceptedAt: now })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Booking fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert(Object.entries(users).map(([role, userId]) => ({ workspaceId, userId, role: role === 'crew' ? 'field' : role })));
    await initializeWorkspacePolicy(trx, identity()); await trx('customers').insert({ id: customerId, workspaceId, name: 'Booking customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('read-only search finds the full team intersection without modifying a visit', async () => {
    await setHours(users.field, '09:00', '17:00'); await setHours(users.crew, '10:00', '16:00');
    const jobId = await create('Team search', { teamUserIds: [users.crew] });
    const before = await readCalendarVisit(web, identity(), enabled, await visitId(jobId));
    const sql: string[] = [], listener = (q: { sql: string }) => sql.push(q.sql); web.on('query', listener);
    const result = await findCalendarBookingSlot(web, identity(), enabled, request(jobId)); web.off('query', listener);
    assert.equal(result.status, 'found'); if (result.status !== 'found') throw Error('Expected a slot');
    assert.equal(result.slot.date, from); assert.equal(result.slot.startTime, '10:00'); assert.equal(result.slot.durationMinutes, 60);
    assert.deepEqual(await readCalendarVisit(web, identity(), enabled, before.id), before);
    assert.equal(sql.filter(text => text.includes('workspaceRolePolicies')).length, 1);
    assert.equal(sql.filter(text => text.includes('jsonb_to_recordset')).length, 1);
    assert.equal(sql.filter(text => text.includes('calendarPersonAvailability')).length, 1);
    console.log(`Booking search statements: ${sql.length}; actor authority loads: 1; availability batches: 1; clock batches: 1.`);
  });
  await check('unassigned, unknown hours, inactive people and limited authority fail closed', async () => {
    const empty = await create('Unassigned', { primaryOwnerId: null }); assert.deepEqual(await findCalendarBookingSlot(web, identity(), enabled, request(empty)), { status: 'no_slot', reasons: ['unassigned'] });
    const jobId = await create(); await db('calendarPersonAvailability').where({ workspaceId, personId: users.field }).delete();
    assert.deepEqual(await findCalendarBookingSlot(web, identity(), enabled, request(jobId)), { status: 'no_slot', reasons: ['unknown_hours'] });
    await db('users').where({ id: users.field }).update({ suspendedAt: new Date(), suspendedReason: 'Booking fixture' });
    assert.deepEqual(await findCalendarBookingSlot(web, identity(), enabled, request(jobId)), { status: 'no_slot', reasons: ['inactive_person'] });
    await assert.rejects(findCalendarBookingSlot(web, identity('field'), enabled, request(jobId)), AuthorizationAccessError);
    await assert.rejects(bookCalendarJob(web, identity(), enabled.filter(p => p !== 'workorders.schedule.update'), command(jobId)), AuthorizationAccessError);
    await assert.rejects(findCalendarBookingSlot(web, identity(), enabled, { ...request(jobId), workspaceId: randomUUID() }), AuthorizationAccessError);
  });
  await check('days off, per-person zones and earliest linked deadlines constrain the search', async () => {
    await setHours(users.field, '08:00', '17:00', [{ startDate: from, endDate: from }]);
    await setHours(users.crew, '08:00', '17:00', [], 'America/Los_Angeles');
    const jobId = await create('Timezone team', { teamUserIds: [users.crew] });
    const result = await findCalendarBookingSlot(web, identity(), enabled, request(jobId));
    assert.equal(result.status, 'found'); if (result.status !== 'found') throw Error('Expected a slot');
    assert.equal(result.slot.date, addCalendarDays(from, 1)); assert.equal(result.slot.startTime, '11:00');
    const due = await create('Deadline', { completionDeadline: from });
    assert.equal((await findCalendarBookingSlot(web, identity(), enabled, request(due))).status, 'no_slot');
  });
  await check('whole work intervals and saved gaps are checked independently of arrival windows', async () => {
    const busyJob = await create('Existing work', { scheduledDate: from }); await schedule(await visitId(busyJob), from, '08:00', 180);
    await db('calendarVisits').where({ workspaceId, id: await visitId(busyJob) }).update({ bookingGapMinutes: 60 });
    const jobId = await create(); const result = await findCalendarBookingSlot(web, identity(), enabled, request(jobId, { gapMinutes: 0 }));
    assert.equal(result.status, 'found'); if (result.status !== 'found') throw Error('Expected a slot'); assert.equal(result.slot.startTime, '12:00');
    const booked = await bookCalendarJob(web, identity(), enabled, command(jobId, { gapMinutes: 30 })); assert.equal(booked.status, 'booked');
    if (booked.status !== 'booked') throw Error('Expected booking'); assert.equal(booked.slot.startTime, '12:00');
    assert.equal((await db('calendarVisits').where({ id: booked.visitId }).first()).bookingGapMinutes, 30);
  });
  await check('unknown duration blocks the affected day without guessing its occupied time', async () => {
    await create('Unknown work', { scheduledDate: from, arrivalWindow: '08:00-10:00' });
    const jobId = await create(); const result = await findCalendarBookingSlot(web, identity(), enabled, request(jobId));
    assert.equal(result.status, 'found'); if (result.status !== 'found') throw Error('Expected a slot'); assert.equal(result.slot.date, addCalendarDays(from, 1));
    const blocked = await bookCalendarJob(web, identity(), enabled, command(jobId, { horizonDays: 1 })); assert.equal(blocked.status, 'no_slot');
    if (blocked.status === 'no_slot') assert(blocked.reasons.includes('unknown_work'));
    assert.equal((await readCalendarVisit(web, identity(), enabled, await visitId(jobId))).scheduledDate, null);
  });
  await check('shared visits book once for the union of Job and issued Work Order people', async () => {
    const { jobId, workOrderId, id } = await shared(); await setHours(users.crew, '10:00', '16:00');
    const input = command(jobId), result = await bookCalendarJob(web, identity(), enabled, input); assert.equal(result.status, 'booked');
    if (result.status !== 'booked') throw Error('Expected booking'); assert.equal(result.slot.startTime, '10:00');
    const visit = await readCalendarVisit(web, identity(), enabled, id); assert.equal(visit.records.length, 2); assert.equal(visit.workTime?.startTime, '10:00');
    const order = await db('workOrders').where({ id: workOrderId }).select(db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).first(); assert.equal(order.date, from);
    assert.equal((await db('jobs').where({ id: jobId }).first()).status, 'scheduled');
    assert.deepEqual(await bookCalendarJob(web, identity(), enabled, input), result);
    const notices = await db('visitNotifications').where({ workspaceId, operationId: input.submissionId }); assert.equal(notices.length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId, source: 'system' })).length, 1);
    await assert.rejects(bookCalendarJob(web, identity('admin'), enabled, input), CalendarRevisionError);
    await assert.rejects(bookCalendarJob(web, identity(), enabled, { ...input, rules: { ...rules, gapMinutes: 0 } }), CalendarRevisionError);
  });
  await check('concurrent bookings and exact retries cannot overlap or duplicate their writes', async () => {
    const a = await create('Concurrent A'), b = await create('Concurrent B'), first = command(a), second = command(b);
    const results = await Promise.all([bookCalendarJob(web, identity(), enabled, first), bookCalendarJob(web, identity(), enabled, second)]);
    assert(results.every(result => result.status === 'booked'));
    if (results[0].status !== 'booked' || results[1].status !== 'booked') throw Error('Expected bookings');
    const starts = results.map(result => result.status === 'booked' ? result.slot.startTime : '').sort(); assert.deepEqual(starts, ['08:00', '09:30']);
    const count = await db('calendarBookingOperations').where({ workspaceId }).count('* as count').first(); assert.equal(count!.count, '2');
    const repeat = await Promise.all([bookCalendarJob(web, identity(), enabled, first), bookCalendarJob(web, identity(), enabled, first)]); assert.deepEqual(repeat[0], repeat[1]);
    assert.equal((await db('calendarVisits').where({ id: results[0].visitId }).first()).version, results[0].visitVersion);
  });
  await check('commit recomputes a stale search and respects later manual changes without moving them', async () => {
    const jobId = await create(); const preview = await findCalendarBookingSlot(web, identity(), enabled, request(jobId)); assert.equal(preview.status, 'found');
    const occupied = await create('Manual work', { scheduledDate: from }); await schedule(await visitId(occupied), from, '08:00', 120);
    const before = await readCalendarVisit(web, identity(), enabled, await visitId(occupied));
    const result = await bookCalendarJob(web, identity(), enabled, command(jobId)); assert.equal(result.status, 'booked');
    if (result.status !== 'booked') throw Error('Expected booking'); assert.equal(result.slot.startTime, '10:30');
    assert.deepEqual(await readCalendarVisit(web, identity(), enabled, before.id), before);
    await schedule(result.visitId, from, '08:00', 60); // Manual overlap remains explicitly permitted by existing policy.
    const next = await create('After manual overlap'), searched = await findCalendarBookingSlot(web, identity(), enabled, request(next));
    assert.equal(searched.status, 'found'); if (searched.status !== 'found') throw Error('Expected a slot'); assert.equal(searched.slot.startTime, '10:30');
  });
  await check('assignment changes are reflected immediately without cached or copied occupancy', async () => {
    const occupied = await create('Reassigned work', { scheduledDate: from }); await schedule(await visitId(occupied), from, '08:00', 180);
    const jobId = await create('Crew job', { primaryOwnerId: users.crew });
    const before = await findCalendarBookingSlot(web, identity(), enabled, request(jobId)); assert.equal(before.status, 'found');
    if (before.status !== 'found') throw Error('Expected a slot'); assert.equal(before.slot.startTime, '08:00');
    const old = await db('jobs').where({ id: occupied }).first();
    await mutateJob(web, identity(), enabled, { workspaceId, jobId: occupied, expectedVersion: old.version, submissionId: randomUUID(), action: 'assign', primaryOwnerId: users.crew, teamUserIds: [] });
    const booked = await bookCalendarJob(web, identity(), enabled, command(jobId)); assert.equal(booked.status, 'booked');
    if (booked.status !== 'booked') throw Error('Expected booking'); assert.equal(booked.slot.startTime, '11:30');
    assert.equal((await db('jobs').where({ id: jobId }).first()).primaryOwnerId, users.crew);
    const fieldJob = await create('Former person now free'), available = await findCalendarBookingSlot(web, identity(), enabled, request(fieldJob));
    assert.equal(available.status, 'found'); if (available.status === 'found') assert.equal(available.slot.startTime, '08:00');
  });
  await check('scheduled jobs and ineligible shared Work Orders remain unchanged', async () => {
    const scheduled = await create('Already booked', { scheduledDate: from });
    assert.deepEqual(await bookCalendarJob(web, identity(), enabled, command(scheduled)), { status: 'no_slot', reasons: ['ineligible'] });
    const draft = await shared(false), before = await readCalendarVisit(web, identity(), enabled, draft.id);
    assert.deepEqual(await bookCalendarJob(web, identity(), enabled, command(draft.jobId)), { status: 'no_slot', reasons: ['ineligible'] });
    assert.deepEqual(await readCalendarVisit(web, identity(), enabled, draft.id), before);
  });
  await check('receipt failure rolls schedules, history and notices back atomically', async () => {
    const jobId = await create(), id = await visitId(jobId), before = await readCalendarVisit(web, identity(), enabled, id);
    await db.raw(`CREATE FUNCTION booking_fixture_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fixture receipt failure'; END $$`);
    await db.raw(`CREATE TRIGGER booking_fixture_fail BEFORE INSERT ON "calendarBookingOperations" FOR EACH ROW EXECUTE FUNCTION booking_fixture_fail()`);
    await assert.rejects(bookCalendarJob(web, identity(), enabled, command(jobId)));
    assert.deepEqual(await readCalendarVisit(web, identity(), enabled, id), before);
    assert.equal((await db('visitNotifications').where({ workspaceId }).count('* as count').first())!.count, '0');
    assert.equal((await db('jobActivity').where({ workspaceId, jobId, source: 'system' })).length, 0);
    await db.raw('DROP TRIGGER booking_fixture_fail ON "calendarBookingOperations"'); await db.raw('DROP FUNCTION booking_fixture_fail()');
  });
  await check('no-slot receipts do not silently retry when facts change, and replay checks current authority', async () => {
    const jobId = await create(); await db('calendarPersonAvailability').where({ workspaceId, personId: users.field }).delete();
    const input = command(jobId), result = await bookCalendarJob(web, identity(), enabled, input); assert.equal(result.status, 'no_slot');
    await db('calendarPersonAvailability').insert({ workspaceId, personId: users.field, version: 1, timezone: 'America/New_York', availability: JSON.stringify({ weeklyHours: week(), unavailableDates: [] }) });
    assert.deepEqual(await bookCalendarJob(web, identity(), enabled, input), result);
    assert.equal((await bookCalendarJob(web, identity(), enabled, command(jobId))).status, 'booked');
    await assert.rejects(bookCalendarJob(web, identity(), enabled.filter(p => p !== 'jobs.schedule.update'), input), AuthorizationAccessError);
  });
  await check('nested actor authority still delivers only currently authorized recipient notices', async () => {
    const jobId = await create('Nested actor', { teamUserIds: [users.crew] }), input = command(jobId);
    const fieldGrants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).delete();
    const result = await withWorkspaceAuthorization(web, identity(), enabled, true, trx => bookCalendarJob(trx, identity(), enabled, input), { reuseNestedAuthority: true });
    assert.equal(result.status, 'booked'); assert.equal((await db('visitNotifications').where({ workspaceId, operationId: input.submissionId })).length, 0);
    await db('workspaceRolePolicies').insert(fieldGrants);
    const next = await create('Nested actor valid', { teamUserIds: [users.crew] }), valid = command(next);
    await withWorkspaceAuthorization(web, identity(), enabled, true, trx => bookCalendarJob(trx, identity(), enabled, valid), { reuseNestedAuthority: true });
    assert.equal((await db('visitNotifications').where({ workspaceId, operationId: valid.submissionId })).length, 2);
  });
  await check('gap occupancy survives separation and is cleared with the shared schedule', async () => {
    const { jobId, workOrderId, id } = await shared(); const result = await bookCalendarJob(web, identity(), enabled, command(jobId)); assert.equal(result.status, 'booked');
    const current = await readCalendarVisit(web, identity(), enabled, id);
    const separated = await separateCalendarWorkOrder(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), visitId: id, ...current.review!, workOrderId,
      schedule: { scheduledDate: from, arrivalWindow: null } });
    assert.equal((await db('calendarVisits').where({ id: separated.visitId }).first()).bookingGapMinutes, 30);
    await db('calendarVisits').where({ id }).update({ bookingGapMinutes: 0 });
    const target = await readCalendarVisit(web, identity(), enabled, id), source = await readCalendarVisit(web, identity(), enabled, separated.visitId);
    await linkCalendarWorkOrder(web, identity(), enabled, { workspaceId, submissionId: randomUUID(), visitId: id, ...target.review!, workOrderId,
      expectedWorkOrderVersion: source.review!.records[0].expectedVersion, sourceVisitId: source.id, expectedSourceVisitVersion: source.review!.expectedVisitVersion });
    assert.equal((await db('calendarVisits').where({ id }).first()).bookingGapMinutes, 30);
    await schedule(id, null); assert.equal((await db('calendarVisits').where({ id }).first()).bookingGapMinutes, null);
    const snapshot = await db('calendarScheduleSnapshots').where({ workspaceId, visitId: id, reason: 'cleared' }).orderBy('createdAt', 'desc').first(); assert.equal(snapshot.bookingGapMinutes, 30);
  });
  await check('a stale page authority snapshot cannot bypass fresh booking authorization', async () => {
    const jobId = await create(), input = command(jobId);
    const snapshot = await loadWorkspaceAuthorization(web, identity(), enabled);
    const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.schedule.update' }).first();
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.schedule.update' }).delete();
    await assert.rejects(withWorkspaceAuthoritySnapshot(web, snapshot, () => bookCalendarJob(web, identity(), enabled, input)), AuthorizationAccessError);
    assert.equal((await db('jobs').where({ id: jobId }).first()).scheduledDate, null);
    await db('workspaceRolePolicies').insert(grant);
  });
  await check('strict batched clock resolution rejects DST gaps, repeated times and crossing windows', async () => {
    const rows = await db.transaction(trx => resolveCalendarBookingWindows(trx, [
      { key: 'gap', date: '2027-03-14', startTime: '02:30', endDate: '2027-03-14', endTime: '03:30', timezone: 'America/New_York', minutes: 60 },
      { key: 'fold', date: '2027-11-07', startTime: '01:30', endDate: '2027-11-07', endTime: '02:30', timezone: 'America/New_York', minutes: 60 },
      { key: 'cross', date: '2027-03-14', startTime: '01:00', endDate: '2027-03-14', endTime: '04:00', timezone: 'America/New_York', minutes: 180 },
      { key: 'valid', date: '2027-03-15', startTime: '08:00', endDate: '2027-03-15', endTime: '17:00', timezone: 'America/New_York', minutes: 540 },
    ]));
    assert.equal(rows[0].start, null); assert.equal(rows[1].start, null); assert.equal(rows[2].finish!.getTime() - rows[2].start!.getTime(), 120 * 60000);
    assert.equal(rows[3].finish!.getTime() - rows[3].start!.getTime(), 540 * 60000);
  });
  console.log(`Calendar booking: ${passed} runtime-role groups passed; no live booking entry point or model calls.`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
