import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { permissionIds } from '@salesmora/contracts';
import { CalendarRevisionError } from '@salesmora/domain';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { readCalendarAvailability, saveCalendarAvailability } from '../calendar/availability';
import { readTeamSettings, saveTeamMember, TeamSettingsConflict, TeamSettingsInvalid } from './settings';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use an isolated local test database.');
const name = `team_settings_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = '/' + name;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeURL.toString());
const workspaceId = randomUUID(), otherWorkspaceId = randomUUID();
const users = { owner: randomUUID(), admin: randomUUID(), office: randomUUID(), field: randomUUID(), other: randomUUID() };
const identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
const enabled = [...permissionIds];
const off = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
const hours = { weeklyHours: { ...off, monday: { startTime: '08:00', endTime: '17:00' } }, unavailableDates: [] };
const read = () => readTeamSettings(web, identity(), enabled);
const current = async (id = users.field) => (await read()).members.find(member => member.id === id)!;
const coverageCommand = async (codes = ['00501', '10001']) => ({ workspaceId, requestId: randomUUID(), command: { personId: users.field, coverage: { revision: (await current()).coverageRevision, countryCode: 'US', postalCodes: codes } } });
let created = false, passed = 0;
async function check(label: string, run: () => Promise<void>) { await run(); console.log('PASS ' + label); passed++; }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    const now = new Date();
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: 'Team ' + role, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'fixture', termsAcceptedAt: now })));
    await trx('workspaces').insert([{ id: workspaceId, ownerId: users.owner, businessName: 'Team fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' },
      { id: otherWorkspaceId, ownerId: users.other, businessName: 'Other workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }]);
    await trx('workspaceMemberships').insert(Object.entries(users).filter(([role]) => role !== 'other').map(([role, userId]) => ({ workspaceId, userId, role })));
    await trx('workspaceMemberships').insert({ workspaceId: otherWorkspaceId, userId: users.other, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity()); await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspaceId, userId: users.other });
  });
  await check('bounded team projection has one authority load and no per-member reads', async () => {
    const queries: string[] = [], listener = (query: { sql: string }) => queries.push(query.sql); web.on('query', listener);
    const result = await read(); web.off('query', listener);
    assert.equal(result.members.length, 4); assert.equal(result.members[0].availability.weeklyHours, null);
    assert.equal(queries.filter(sql => sql.includes('workspaceRolePolicies')).length, 1);
    assert.equal(queries.filter(sql => sql.includes('workspaceMemberPostalCodes')).length, 1);
    console.log(`Team page statements ${queries.length}, authority loads 1, member projections 1 (including transaction control).`);
    const onePage = await readTeamSettings(web, identity(), enabled, { page: 100, pageSize: 10 }); assert.equal(onePage.page, 1);
    await assert.rejects(readTeamSettings(web, identity(), enabled, { pageSize: 1000 }), TeamSettingsInvalid);
  });
  await check('permissions, workspace isolation and nonmember targets are enforced', async () => {
    await assert.rejects(readTeamSettings(web, identity('field'), enabled), AuthorizationAccessError);
    await assert.rejects(readTeamSettings(web, identity('office'), enabled), AuthorizationAccessError);
    const input = await coverageCommand();
    await assert.rejects(saveTeamMember(web, identity('office'), enabled, input), AuthorizationAccessError);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { ...input, command: { ...input.command, personId: users.other } }), AuthorizationAccessError);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { ...input, workspaceId: otherWorkspaceId }), AuthorizationAccessError);
    await assert.rejects(readTeamSettings(web, { workspaceId: otherWorkspaceId, userId: users.owner }, enabled), AuthorizationAccessError);
  });
  await check('coverage normalization, exact retry and changed-payload replay are durable', async () => {
    const input = await coverageCommand(['10001-1234', '00501', '10001']); const result = await saveTeamMember(web, identity(), enabled, input);
    assert.deepEqual(result.workZipCodes, ['00501', '10001']); assert.deepEqual(await saveTeamMember(web, identity(), enabled, input), result);
    assert.equal((await db('workspaceMemberCoverage').where({ workspaceId, personId: users.field }).first()).version, 1);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { ...input, command: { ...input.command, coverage: { ...input.command.coverage, postalCodes: ['10002'] } } }), TeamSettingsConflict);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { ...input, requestId: randomUUID() }), TeamSettingsConflict);
  });
  await check('both edited sections commit once and are visible through Calendar', async () => {
    const before = await current(); const input = { workspaceId, requestId: randomUUID(), command: { personId: users.field,
      availability: { revision: before.revision, timezone: before.timezone, value: hours }, coverage: { revision: before.coverageRevision, countryCode: 'US', postalCodes: ['10002'] } } };
    const sql: string[] = [], listener = (query: { sql: string }) => sql.push(query.sql); web.on('query', listener);
    const saved = await saveTeamMember(web, identity(), enabled, input); web.off('query', listener);
    assert.equal(sql.filter(text => text.includes('workspaceRolePolicies')).length, 1);
    assert.deepEqual(saved.availability, hours); assert.deepEqual(saved.workZipCodes, ['10002']);
    const calendar = await readCalendarAvailability(web, identity(), enabled, users.field); assert.equal(calendar.revision, saved.revision); assert.deepEqual(calendar.availability, hours);
    assert.equal((await db('calendarAvailabilityOperations').where({ workspaceId, submissionId: input.requestId }).count('* as count').first())!.count, '1');
    assert.deepEqual(await saveTeamMember(web, identity(), enabled, input), saved);
    console.log(`Combined save statements ${sql.length}, authority loads 1 (including transaction control).`);
  });
  await check('Calendar writes invalidate Team revisions and stale combined changes write neither section', async () => {
    const stale = await current();
    await saveCalendarAvailability(web, identity(), enabled, { workspaceId, personId: users.field, submissionId: randomUUID(), revision: stale.revision, timezone: stale.timezone, availability: { weeklyHours: off, unavailableDates: [] } });
    assert.notEqual((await current()).revision, stale.revision);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { workspaceId, requestId: randomUUID(), command: { personId: users.field,
      availability: { revision: stale.revision, timezone: stale.timezone, value: hours }, coverage: { revision: stale.coverageRevision, countryCode: 'US', postalCodes: ['99999'] } } }), TeamSettingsConflict);
    assert.deepEqual((await current()).workZipCodes, ['10002']);
    await assert.rejects(saveCalendarAvailability(web, identity(), enabled, { workspaceId, personId: users.field, submissionId: randomUUID(), revision: stale.revision, timezone: stale.timezone, availability: hours }), CalendarRevisionError);
  });
  await check('history failure rolls back availability and coverage together', async () => {
    const before = await current();
    await db.raw(`CREATE FUNCTION team_history_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fixture failure'; END $$`);
    await db.raw(`CREATE TRIGGER team_history_fail BEFORE INSERT ON "teamSettingsOperations" FOR EACH ROW EXECUTE FUNCTION team_history_fail()`);
    await assert.rejects(saveTeamMember(web, identity(), enabled, { workspaceId, requestId: randomUUID(), command: { personId: users.field,
      availability: { revision: before.revision, timezone: before.timezone, value: hours }, coverage: { revision: before.coverageRevision, countryCode: 'US', postalCodes: ['99999'] } } }));
    assert.deepEqual(await current(), before);
    await db.raw('DROP TRIGGER team_history_fail ON "teamSettingsOperations"'); await db.raw('DROP FUNCTION team_history_fail()');
  });
  await check('concurrent stale writes cannot both win; overlapping member ZIPs are allowed', async () => {
    const one = await coverageCommand(['10003']); const two = { ...one, requestId: randomUUID(), command: { ...one.command, coverage: { ...one.command.coverage, postalCodes: ['10004'] } } };
    const results = await Promise.allSettled([saveTeamMember(web, identity(), enabled, one), saveTeamMember(web, identity(), enabled, two)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const [code] = (await current()).workZipCodes, admin = await current(users.admin);
    const saved = await saveTeamMember(web, identity(), enabled, { workspaceId, requestId: randomUUID(), command: { personId: users.admin, coverage: { revision: admin.coverageRevision, countryCode: 'US', postalCodes: [code] } } });
    assert.deepEqual(saved.workZipCodes, [code]);
  });
  await check('empty coverage stays empty, malformed codes reject, and removed members cannot replay', async () => {
    const invalid = await coverageCommand(['Manhattan']); await assert.rejects(saveTeamMember(web, identity(), enabled, invalid), TeamSettingsInvalid);
    const input = await coverageCommand([]); assert.deepEqual((await saveTeamMember(web, identity(), enabled, input)).workZipCodes, []);
    await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
    await assert.rejects(saveTeamMember(web, identity(), enabled, input), AuthorizationAccessError);
    assert.equal((await db('workspaceMemberPostalCodes').where({ workspaceId, personId: users.field }).count('* as count').first())!.count, '0');
  });
  await check('explicit Team settings authority does not depend on or widen Calendar read access', async () => {
    const withoutCalendar = enabled.filter(permission => permission !== 'calendar.read');
    const member = (await readTeamSettings(web, identity(), withoutCalendar)).members.find(person => person.id === users.admin)!;
    const result = await saveTeamMember(web, identity(), withoutCalendar, { workspaceId, requestId: randomUUID(), command: { personId: users.admin,
      availability: { revision: member.revision, timezone: member.timezone, value: hours } } });
    assert.deepEqual(result.availability, hours);
    await assert.rejects(readCalendarAvailability(web, identity(), withoutCalendar, users.admin), AuthorizationAccessError);
  });
  console.log(`Team settings: ${passed} runtime-role groups passed; shared databases untouched.`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
