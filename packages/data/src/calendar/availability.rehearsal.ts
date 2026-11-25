import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { permissionIds, CalendarContractError } from '@salesmora/contracts';
import { CalendarRevisionError } from '@salesmora/domain';
import { createDatabase } from '../database';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { migrateFreshBaseline } from '../baseline-runner';
import { createJob } from '../jobs/store';
import { readCalendarAvailability, saveCalendarAvailability } from './availability';
import { readCalendarVisit, readCalendarAdvisories } from './read';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use the isolated local test database.');
const name = `calendar_availability_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = '/' + name;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeURL.toString());
const workspaceId = randomUUID(), customerId = randomUUID();
const users = { owner: randomUUID(), admin: randomUUID(), office: randomUUID(), field: randomUUID(), other: randomUUID() };
const identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
const enabled = [...permissionIds];
const off = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
const availability = { weeklyHours: { ...off, monday: { startTime: '08:00', endTime: '17:00' } }, unavailableDates: [{ startDate: '2026-12-24', endDate: '2026-12-25' }] };
const read = (role: keyof typeof users = 'owner', personId = users.field) => readCalendarAvailability(web, identity(role), enabled, personId);
const command = async (overrides = {}) => { const current = await read(); return { workspaceId, personId: users.field, submissionId: randomUUID(), revision: current.revision, timezone: current.timezone, availability, ...overrides }; };
let created = false, passed = 0;
async function check(label: string, run: () => Promise<void>) { await run(); console.log('PASS ' + label); passed++; }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    const now = new Date();
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: 'Availability ' + role, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'fixture', termsAcceptedAt: now })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Availability fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert(Object.entries(users).filter(([role]) => role !== 'other').map(([role, userId]) => ({ workspaceId, userId, role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Availability customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('unknown hours and person visibility follow the current Calendar scope', async () => {
    const current = await read(); assert.equal(current.canEdit, true); assert.equal(current.availability.weeklyHours, null);
    assert.equal((await read('field')).canEdit, false); assert.equal((await read('office')).canEdit, false);
    await assert.rejects(read('field', users.owner), AuthorizationAccessError);
    await assert.rejects(read('owner', users.other), AuthorizationAccessError);
    await assert.rejects(readCalendarAvailability(web, { ...identity(), workspaceId: randomUUID() }, enabled, users.field), AuthorizationAccessError);
    await assert.rejects(readCalendarAvailability(web, identity(), enabled.filter(p => p !== 'calendar.read'), users.field), AuthorizationAccessError);
  });
  await check('save/reopen, exact retries and history commit once with one authority load', async () => {
    const input = await command(); const sql: string[] = [], record = (query: { sql: string }) => sql.push(query.sql); web.on('query', record);
    const saved = await saveCalendarAvailability(web, identity(), enabled, input); web.off('query', record);
    assert.equal(sql.filter(text => text.includes('workspaceRolePolicies')).length, 1);
    console.log(`Availability save statements: ${sql.length}, authority loads: 1 (including transaction control).`);
    assert.deepEqual(saved.availability, availability); assert.notEqual(saved.revision, input.revision);
    assert.deepEqual((await read()).availability, availability);
    assert.deepEqual(await saveCalendarAvailability(web, identity(), enabled, input), saved);
    assert.equal((await db('calendarPersonAvailability').where({ workspaceId, personId: users.field }).first()).version, 1);
    assert.equal((await db('calendarAvailabilityOperations').where({ workspaceId }).count('* as count').first())!.count, '1');
    await assert.rejects(saveCalendarAvailability(web, identity('admin'), enabled, input), CalendarRevisionError);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, { ...input, availability: { weeklyHours: null, unavailableDates: [] } }), CalendarRevisionError);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled.filter(p => p !== 'settings.business.update'), input), AuthorizationAccessError);
  });
  await check('stale/invalid/timezone-forged edits fail without changing stored rules', async () => {
    const input = await command(); await saveCalendarAvailability(web, identity(), enabled, input);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, { ...input, submissionId: randomUUID() }), CalendarRevisionError);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, await command({ timezone: 'UTC' })), CalendarRevisionError);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, await command({ availability: { weeklyHours: { ...off, monday: { startTime: '17:00', endTime: '08:00' } }, unavailableDates: [] } })), CalendarContractError);
    await assert.rejects(saveCalendarAvailability(web, identity('field'), enabled, await command()), AuthorizationAccessError);
  });
  await check('concurrent confirmations have one winner, while duplicate receipts replay once', async () => {
    const input = await command(), second = { ...input, submissionId: randomUUID() };
    const result = await Promise.allSettled([saveCalendarAvailability(web, identity(), enabled, input), saveCalendarAvailability(web, identity(), enabled, second)]);
    assert.equal(result.filter(item => item.status === 'fulfilled').length, 1);
    assert(result.some(item => item.status === 'rejected' && item.reason instanceof CalendarRevisionError));
    const retry = await command(), before = (await db('calendarPersonAvailability').where({ workspaceId, personId: users.field }).first()).version;
    const replay = await Promise.all([saveCalendarAvailability(web, identity(), enabled, retry), saveCalendarAvailability(web, identity(), enabled, retry)]);
    assert.deepEqual(replay[0], replay[1]); assert.equal((await db('calendarPersonAvailability').where({ workspaceId, personId: users.field }).first()).version, before + 1);
  });
  await check('history failure rolls the availability write back', async () => {
    const before = await read();
    await db.raw(`CREATE FUNCTION availability_fixture_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fixture history failure'; END $$`);
    await db.raw(`CREATE TRIGGER availability_fixture_fail BEFORE INSERT ON "calendarAvailabilityOperations" FOR EACH ROW EXECUTE FUNCTION availability_fixture_fail()`);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, await command({ availability: { weeklyHours: null, unavailableDates: [] } })));
    assert.deepEqual(await read(), before);
    await db.raw('DROP TRIGGER availability_fixture_fail ON "calendarAvailabilityOperations"'); await db.raw('DROP FUNCTION availability_fixture_fail()');
  });
  await check('advisories batch team availability, check entire work and leave appointments unchanged', async () => {
    const jobId = (await createJob(web, identity(), enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Availability test', primaryOwnerId: users.field, scheduledDate: '2026-11-23' })).jobId;
    const visitId = (await db('calendarVisitRecords').where({ workspaceId, jobId }).whereNull('endedAt').first()).visitId;
    const visit = await readCalendarVisit(web, identity(), enabled, visitId);
    const advisory = (date: string, startTime: string) => readCalendarAdvisories(web, identity(), enabled, { workspaceId, visitId, revision: visit.revision,
      schedule: { scheduledDate: date, arrivalWindow: null, workTime: { startTime, durationMinutes: 60 } } });
    const sql: string[] = [], record = (query: { sql: string }) => sql.push(query.sql); web.on('query', record);
    const fits = await advisory('2026-11-23', '08:00'); web.off('query', record);
    assert(!fits.messages.some(message => /outside recorded|does not work|availability is unknown/.test(message)));
    assert.equal(sql.filter(text => text.includes('workspaceRolePolicies')).length, 1);
    assert.equal(sql.filter(text => text.includes('calendarPersonAvailability')).length, 1);
    console.log(`Availability advisory statements: ${sql.length}, authority loads: 1, team availability batches: 1 (including transaction control).`);
    assert((await advisory('2026-11-23', '16:30')).messages.some(message => message.includes('outside recorded working hours')));
    assert((await advisory('2026-11-24', '08:00')).messages.some(message => message.includes('does not work')));
    assert((await advisory('2026-12-25', '08:00')).messages.some(message => message.includes('recorded unavailable dates')));
    await saveCalendarAvailability(web, identity(), enabled, await command({ availability: { weeklyHours: null, unavailableDates: [] } }));
    assert((await advisory('2026-11-23', '08:00')).messages.some(message => message.includes('availability is unknown')));
    assert.deepEqual(await readCalendarVisit(web, identity(), enabled, visitId), visit);
    const teamJob = (await createJob(web, identity(), enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Full team availability', primaryOwnerId: users.field,
      teamUserIds: [users.admin, users.office], scheduledDate: '2026-11-23' })).jobId;
    const teamVisitId = (await db('calendarVisitRecords').where({ workspaceId, jobId: teamJob }).whereNull('endedAt').first()).visitId;
    const teamVisit = await readCalendarVisit(web, identity(), enabled, teamVisitId);
    const teamSql: string[] = [], recordTeam = (query: { sql: string }) => teamSql.push(query.sql); web.on('query', recordTeam);
    const teamWarnings = await readCalendarAdvisories(web, identity(), enabled, { workspaceId, visitId: teamVisitId, revision: teamVisit.revision,
      schedule: { scheduledDate: '2026-11-23', arrivalWindow: null, workTime: { startTime: '08:00', durationMinutes: 60 } } });
    web.off('query', recordTeam);
    assert.equal(teamWarnings.messages.filter(message => message.includes('availability is unknown')).length, 3);
    assert.equal(teamSql.filter(text => text.includes('calendarPersonAvailability')).length, 1);
    assert.equal(teamSql.filter(text => text.includes('workspaceRolePolicies')).length, 1);
    assert.equal(teamSql.length, sql.length, 'adding assigned people must not add queries');
  });
  await check('timezone changes preserve saved local rules and invalidate pending edits; removed people cannot replay', async () => {
    const pending = await command(); await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/Chicago' });
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, pending), CalendarRevisionError);
    assert.equal((await read()).timezone, 'America/New_York');
    const input = await command(); await saveCalendarAvailability(web, identity(), enabled, input);
    await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
    await assert.rejects(read(), AuthorizationAccessError); await assert.rejects(saveCalendarAvailability(web, identity(), enabled, input), AuthorizationAccessError);
  });
  console.log(`Calendar availability: ${passed} runtime-role groups passed; shared databases untouched.`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
