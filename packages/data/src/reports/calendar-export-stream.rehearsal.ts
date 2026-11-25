import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import knex from 'knex';
import { calendarExportInputSchema, permissionIds } from '@salesmora/contracts';
import { migrateFreshBaseline } from '../baseline-runner';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { createJob } from '../jobs/store';
import { csvLine } from '../leads/csv';
import { createCalendarCSVExport, previewCalendarExport, ReportExportLimitError } from './calendar-export';
import { down as rollbackBaseline } from '../baseline-migrations/202611150001_fresh_baseline';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const databaseName = `calendar_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${databaseName}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
const environment = ['REPORT_EXPORT_ROW_LIMIT', 'REPORT_EXPORT_BYTE_LIMIT', 'REPORT_EXPORT_DURATION_MS'] as const;
const previous = environment.map(key => process.env[key]);
let created = false, checks = 0, today = '';
async function check(name: string, run: () => Promise<void>) {
  if (process.argv.length > 2 && !process.argv.slice(2).some(fragment => name.includes(fragment))) return;
  await run(); checks++; console.log(`PASS ${name}`);
}
async function drain(stream: ReadableStream<Uint8Array>) {
  const chunks: Uint8Array[] = [], reader = stream.getReader();
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      chunks.push(next.value);
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally { reader.releaseLock(); }
}
try {
  await admin.raw('CREATE DATABASE ??', [databaseName]); created = true;
  await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    await trx('users').insert({ id: owner, name: 'Calendar CSV fixture owner', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Calendar CSV fixture',
      businessType: 'test', postalCode: '', serviceRange: '', timezone: 'Europe/Warsaw' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'PRIVATE_CUSTOMER', type: 'person',
      companyName: '', email: 'private@example.test', phone: '', location: '', internalNotes: 'PRIVATE_NOTES' });
    today = (await trx.raw(`SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw', 'YYYY-MM-DD') AS today`)).rows[0].today;
  });
  const seed = (title: string) => db.transaction(trx => createJob(trx, identity, enabled, {postalCode:'10001',
    workspaceId, submissionId: randomUUID(), customerId, title, primaryOwnerId: owner,
    scheduledDate: today, arrivalWindow: '09:00-11:00',
  }));
  await seed('=SUM(1,2)');
  await seed('Calendar CSV second fixture');
  const input = calendarExportInputSchema.parse({ dataset: 'visits', query: {
    workspaceId, view: 'calendar-scheduled', selected: 'visits', period: { from: today, to: today },
    filters: { participants: [owner], recordTypes: ['job'] },
  } });
  const audit = (id: string) => db('reportExportAudit').where({ id }).first();

  await check('Calendar live preview, generation and immutable audit agree without record or participant content', async () => {
    const before = await previewCalendarExport(db, identity, enabled, input);
    assert.equal(before.count, 2);
    await seed('Added after preview');
    const result = await createCalendarCSVExport(db, identity, enabled, input);
    const text = await drain(result.stream), completion = await result.completion;
    assert.equal(result.count, 3);
    assert.equal(result.generation.count, 3);
    assert.equal(result.generation.id, result.id);
    assert.equal(completion.outcome, 'completed');
    assert.equal(completion.rowsSent, 3);
    assert.equal(completion.bytesSent, Buffer.byteLength(text));
    assert(text.startsWith('\uFEFF' + csvLine(result.columns)));
    assert.equal(text.split('\r\n').length, 5);
    assert(text.includes("'=SUM(1,2)"));
    assert(!text.includes('PRIVATE_'));
    const saved = await audit(result.id);
    assert.equal(saved.report, 'calendar');
    assert.equal(saved.outcome, 'completed');
    assert.equal(saved.scope, 'workspace');
    assert.deepEqual(saved.outputScopes, before.outputScopes);
    assert.equal(Number(saved.count), result.count);
    assert.equal(Number(saved.rowsSent), completion.rowsSent);
    assert.equal(Number(saved.bytesSent), completion.bytesSent);
    assert(!JSON.stringify(saved.selection).includes(owner));
    assert.deepEqual(saved.selection.query.filters.participants, [createHash('sha256').update(owner).digest('hex')]);
    assert(!JSON.stringify(saved.selection).includes('Added after preview'));
    await assert.rejects(db('reportExportAudit').where({ id: result.id }).update({ outcome: 'failed' }), /immutable/);
    await assert.rejects(db('reportExportAudit').where({ id: result.id }).delete(), /immutable/);
  });
  await check('Calendar default-off and revoked export access reject preview and generation', async () => {
    const permissions = enabled.filter(id => id !== 'reports.export');
    await assert.rejects(previewCalendarExport(db, identity, permissions, input), AuthorizationAccessError);
    await assert.rejects(createCalendarCSVExport(db, identity, permissions, input), AuthorizationAccessError);
    await previewCalendarExport(db, identity, enabled, input);
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).delete();
    await assert.rejects(createCalendarCSVExport(db, identity, enabled, input), AuthorizationAccessError);
    await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'jobs.export', scope: 'workspace' });
  });
  await check('Calendar row-cap rejection retains audit evidence before offering a stream', async () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '1';
    try {
      await assert.rejects(createCalendarCSVExport(db, identity, enabled, input), ReportExportLimitError);
      const saved = await db('reportExportAudit').where({ report: 'calendar', outcome: 'rejected' }).orderBy('createdAt', 'desc').first();
      assert(saved.finishedAt);
      assert.equal(Number(saved.rowsSent), 0);
      assert.equal(Number(saved.bytesSent), 0);
    } finally { delete process.env.REPORT_EXPORT_ROW_LIMIT; }
  });
  await check('Calendar byte-cap rejection errors the stream and records rejected completion', async () => {
    process.env.REPORT_EXPORT_BYTE_LIMIT = '1';
    try {
      const result = await createCalendarCSVExport(db, identity, enabled, input);
      await assert.rejects(drain(result.stream), /could not be completed/);
      assert.equal((await result.completion).outcome, 'rejected');
      const saved = await audit(result.id);
      assert.equal(saved.outcome, 'rejected');
      assert.equal(Number(saved.bytesSent), 0);
    } finally { delete process.env.REPORT_EXPORT_BYTE_LIMIT; }
  });
  await check('Calendar backpressure and cancellation never finalize successful delivery', async () => {
    const result = await createCalendarCSVExport(db, identity, enabled, input);
    await setTimeout(25);
    assert.equal((await audit(result.id)).outcome, 'started');
    const reader = result.stream.getReader();
    assert.equal((await reader.read()).done, false);
    await reader.cancel();
    const completion = await result.completion;
    assert.equal(completion.outcome, 'failed');
    assert.equal(completion.rowsSent, 0);
    assert.equal((await audit(result.id)).outcome, 'failed');
    reader.releaseLock();
  });
  await check('Calendar request cancellation interrupts blocked generation and leaves failed audit', async () => {
    const request = new AbortController();
    const result = await createCalendarCSVExport(db, identity, enabled, input, request.signal);
    request.abort();
    await assert.rejects(drain(result.stream), /could not be completed/);
    assert.equal((await result.completion).outcome, 'failed');
    assert.equal((await audit(result.id)).outcome, 'failed');
  });
  await check('Calendar duration limit interrupts unconsumed backpressure and persists failed completion', async () => {
    process.env.REPORT_EXPORT_DURATION_MS = '2000';
    try {
      const result = await createCalendarCSVExport(db, identity, enabled, input);
      assert.equal((await result.completion).outcome, 'failed');
      assert.equal((await audit(result.id)).outcome, 'failed');
      await assert.rejects(drain(result.stream), /could not be completed/);
    } finally { delete process.env.REPORT_EXPORT_DURATION_MS; }
  });
  await check('Calendar own scope and empty current-only output complete under migrated audit constraints', async () => {
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
    try {
      const result = await createCalendarCSVExport(db, identity, enabled, input);
      await drain(result.stream);
      assert.equal((await result.completion).outcome, 'completed');
      assert.equal((await audit(result.id)).scope, 'own');
      assert.deepEqual(result.generation.scope, { kind: 'own', viewerId: owner });
      const empty = calendarExportInputSchema.parse({ dataset: 'visits', query: {
        workspaceId, view: 'calendar-unscheduled', selected: 'visits',
      } });
      const zero = await createCalendarCSVExport(db, identity, enabled, empty);
      const text = await drain(zero.stream);
      assert.equal((await zero.completion).outcome, 'completed');
      assert.equal(zero.count, 0);
      assert.equal(text, '\uFEFF' + csvLine(zero.columns));
      assert.equal(zero.generation.dateBasis, 'current-unscheduled');
    } finally {
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
    }
  });
  await check('Forward-only baseline preserves retained Calendar evidence and scope checks', async () => {
    const result = await createCalendarCSVExport(db, identity, enabled, input);
    await drain(result.stream);
    assert.equal((await result.completion).outcome, 'completed');
    await assert.rejects(rollbackBaseline(), /forward-only/);
    const saved = await audit(result.id);
    assert.equal(saved.outcome, 'completed');
    await assert.rejects(db('reportExportAudit').insert({ ...saved, id: randomUUID(), scope: 'assigned' }), /check constraint/);
  });
  await check('50,000 scheduled visits complete under default Calendar export limits', async () => {
    for (const key of environment) delete process.env[key];
    const date = (await db.raw<{ rows: { date: string }[] }>(
      `SELECT to_char(?::date - 10, 'YYYY-MM-DD') AS date`, [today],
    )).rows[0]!.date;
    await db.transaction(async trx => {
      await trx.raw(`CREATE TEMP TABLE calendar_measurement ON COMMIT DROP AS
        SELECT gen_random_uuid() AS job_id, gen_random_uuid() AS visit_id, gen_random_uuid() AS link_id
        FROM generate_series(1, 50000)`);
      await trx.raw(`INSERT INTO jobs (id, "workspaceId", "jobNumber", "customerId", "customerName", title,
          service, location, description, status, "primaryOwnerId", "createdBy", "scheduledDate", "arrivalWindow")
        SELECT job_id, ?::uuid, 1, ?::uuid, 'Fixture', 'Measured visit',
          '', '', '', 'scheduled', ?, ?, ?::date, '09:00-11:00' FROM calendar_measurement`,
      [workspaceId, customerId, owner, owner, date]);
      await trx.raw(`INSERT INTO "calendarVisits" (id, "workspaceId", "scheduledDate", "arrivalWindow")
        SELECT visit_id, ?::uuid, ?::date, '09:00-11:00' FROM calendar_measurement`, [workspaceId, date]);
      await trx.raw(`INSERT INTO "calendarVisitRecords" (id, "workspaceId", "visitId", "jobId")
        SELECT link_id, ?::uuid, visit_id, job_id FROM calendar_measurement`, [workspaceId]);
    });
    for (const table of ['jobs', 'calendarVisits', 'calendarVisitRecords', 'jobTeamMembers', 'workOrders',
      'workspaceMemberships', 'users']) await db.raw('ANALYZE ??', [table]);
    const selection = calendarExportInputSchema.parse({ dataset: 'visits', query: {
      workspaceId, view: 'calendar-scheduled', selected: 'visits', period: { from: date, to: date },
    } });
    const started = performance.now();
    const result = await createCalendarCSVExport(db, identity, enabled, selection);
    assert.deepEqual(result.limits, { rows: 50000, bytes: 33554432, durationMs: 30000 });
    const reader = result.stream.getReader();
    let bytes = 0, lines = 0, previousByte = -1;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        bytes += next.value.byteLength;
        for (const byte of next.value) {
          if (previousByte === 13 && byte === 10) lines++;
          previousByte = byte;
        }
      }
    } catch (error) {
      console.log('MEASUREMENT FAILURE', JSON.stringify({
        durationMs: Math.round(performance.now() - started), bytes, lines, completion: await result.completion,
      }));
      throw error;
    }
    const completion = await result.completion, durationMs = Math.round(performance.now() - started);
    assert.equal(result.count, 50000);
    assert.equal(completion.outcome, 'completed');
    assert.equal(completion.rowsSent, 50000);
    assert.equal(lines, 50001);
    assert.equal(previousByte, 10);
    assert.equal(completion.bytesSent, bytes);
    assert(bytes <= result.limits.bytes);
    assert(durationMs < result.limits.durationMs);
    const saved = await audit(result.id);
    assert.equal(saved.outcome, 'completed');
    assert.equal(Number(saved.rowsSent), 50000);
    assert.equal(Number(saved.bytesSent), bytes);
    console.log(`MEASURE scheduledVisits=50000 bytes=${bytes} durationMs=${durationMs}`);
  });
  console.log(`${checks} Calendar CSV streaming database journeys passed.`);
} finally {
  environment.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [databaseName]);
  await admin.destroy();
}
