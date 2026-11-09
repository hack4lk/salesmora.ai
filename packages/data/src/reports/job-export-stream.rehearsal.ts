import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import knex from 'knex';
import { jobReportExportInputSchema, permissionIds } from '@salesmora/contracts';
import { replayMigrations } from '../migration-replay';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { createJob } from '../jobs/store';
import { csvLine } from '../leads/csv';
import { createJobReportCSVExport, previewJobReportExport, ReportExportLimitError } from './job-export';
import { down as rollbackJobsAudit } from '../migrations/202611100001_report_export_audit_jobs';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const databaseName = `jobs_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${databaseName}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
const environment = ['REPORT_EXPORT_ROW_LIMIT', 'REPORT_EXPORT_BYTE_LIMIT', 'REPORT_EXPORT_DURATION_MS'] as const;
const previous = environment.map(key => process.env[key]);
let created = false, checks = 0;
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
  await replayMigrations(db);
  await db.transaction(async trx => {
    await trx('users').insert({ id: owner, name: 'Jobs CSV owner', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Jobs CSV fixture',
      businessType: 'test', postalCode: '', serviceRange: '', timezone: 'Europe/Warsaw' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'PRIVATE_CUSTOMER', type: 'person',
      companyName: '', email: 'private@example.test', phone: '', location: '', internalNotes: 'PRIVATE_NOTES' });
  });
  const seed = (title: string) => db.transaction(trx => createJob(trx, identity, enabled, {
    workspaceId, submissionId: randomUUID(), customerId, title, primaryOwnerId: owner, service: 'PRIVATE_SERVICE',
  }));
  await seed('=SUM(1,2)');
  await seed('Jobs CSV second fixture');
  const input = jobReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'workload', filters: { statuses: [], owners: [`member:${owner}`], services: ['service:PRIVATE_SERVICE'] },
    selection: { kind: 'group', group: 'service', id: 'service:PRIVATE_SERVICE' },
  } });
  const audit = (id: string) => db('reportExportAudit').where({ id }).first();
  await check('Jobs live recount, complete stream and immutable audit exclude selection content', async () => {
    const before = await previewJobReportExport(db, identity, enabled, input);
    assert.equal(before.count, 2);
    await seed('Added after preview');
    const result = await createJobReportCSVExport(db, identity, enabled, input);
    const text = await drain(result.stream), completion = await result.completion;
    assert.equal(result.count, 3);
    assert.equal(result.generation.count, 3);
    assert.equal(result.generation.id, result.id);
    assert.deepEqual(completion, { outcome: 'completed', rowsSent: 3, bytesSent: Buffer.byteLength(text) });
    assert(text.startsWith('\uFEFF' + csvLine(result.columns)));
    assert.equal(text.split('\r\n').length, 5);
    assert(text.includes('J-0001 / =SUM(1,2)'));
    assert(!text.includes('PRIVATE_CUSTOMER'));
    assert(!text.includes('PRIVATE_NOTES'));
    const saved = await audit(result.id);
    assert.equal(saved.report, 'jobs');
    assert.equal(saved.outcome, 'completed');
    assert.equal(saved.scope, 'workspace');
    assert.deepEqual(saved.outputScopes, { jobs: 'workspace', archiveVisibility: 'included' });
    assert.equal(Number(saved.count), 3);
    assert.equal(Number(saved.rowsSent), 3);
    assert.equal(Number(saved.bytesSent), completion.bytesSent);
    assert(!JSON.stringify(saved.selection).includes(owner));
    assert(!JSON.stringify(saved.selection).includes('PRIVATE_SERVICE'));
    assert(!JSON.stringify(saved.selection).includes('Added after preview'));
    const hash = (value: string) => createHash('sha256').update(value).digest('hex');
    assert.deepEqual(saved.selection.query.filters.owners, [hash(`member:${owner}`)]);
    assert.deepEqual(saved.selection.query.filters.services, [hash('service:PRIVATE_SERVICE')]);
    assert.equal(saved.selection.query.selection.id, hash('service:PRIVATE_SERVICE'));
    await assert.rejects(db('reportExportAudit').where({ id: result.id }).update({ outcome: 'failed' }), /immutable/);
    await assert.rejects(db('reportExportAudit').where({ id: result.id }).delete(), /immutable/);
  });
  await check('Jobs export permissions and workspace are checked again at generation', async () => {
    await previewJobReportExport(db, identity, enabled, input);
    for (const permission of ['reports.export', 'reports.read', 'jobs.read', 'jobs.export'] as const) {
      const disabled = enabled.filter(id => id !== permission);
      await assert.rejects(previewJobReportExport(db, identity, disabled, input), AuthorizationAccessError);
      await assert.rejects(createJobReportCSVExport(db, identity, disabled, input), AuthorizationAccessError);
    }
    await assert.rejects(previewJobReportExport(db, { ...identity, workspaceId: randomUUID() }, enabled, input), AuthorizationAccessError);
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).delete();
    try { await assert.rejects(createJobReportCSVExport(db, identity, enabled, input), AuthorizationAccessError); }
    finally { await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'jobs.export', scope: 'workspace' }); }
  });
  await check('Jobs row and byte caps record rejected audit evidence', async () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '1';
    try {
      await assert.rejects(createJobReportCSVExport(db, identity, enabled, input), ReportExportLimitError);
      const saved = await db('reportExportAudit').where({ report: 'jobs', outcome: 'rejected' }).orderBy('createdAt', 'desc').first();
      assert(saved.finishedAt);
      assert.equal(Number(saved.rowsSent), 0);
    } finally { delete process.env.REPORT_EXPORT_ROW_LIMIT; }
    process.env.REPORT_EXPORT_BYTE_LIMIT = '1';
    try {
      const result = await createJobReportCSVExport(db, identity, enabled, input);
      await assert.rejects(drain(result.stream), /could not be completed/);
      assert.equal((await result.completion).outcome, 'rejected');
      assert.equal((await audit(result.id)).outcome, 'rejected');
    } finally { delete process.env.REPORT_EXPORT_BYTE_LIMIT; }
  });
  await check('Jobs cancellation, request abort and timeout persist failed audit', async () => {
    const result = await createJobReportCSVExport(db, identity, enabled, input);
    await setTimeout(25);
    assert.equal((await audit(result.id)).outcome, 'started');
    const reader = result.stream.getReader();
    assert.equal((await reader.read()).done, false);
    await reader.cancel();
    assert.equal((await result.completion).outcome, 'failed');
    assert.equal((await audit(result.id)).outcome, 'failed');
    reader.releaseLock();
    const request = new AbortController();
    const aborted = await createJobReportCSVExport(db, identity, enabled, input, request.signal);
    request.abort();
    await assert.rejects(drain(aborted.stream), /could not be completed/);
    assert.equal((await aborted.completion).outcome, 'failed');
    assert.equal((await audit(aborted.id)).outcome, 'failed');
    process.env.REPORT_EXPORT_DURATION_MS = '2000';
    try {
      const timeout = await createJobReportCSVExport(db, identity, enabled, input);
      assert.equal((await timeout.completion).outcome, 'failed');
      assert.equal((await audit(timeout.id)).outcome, 'failed');
      await assert.rejects(drain(timeout.stream), /could not be completed/);
    } finally { delete process.env.REPORT_EXPORT_DURATION_MS; }
  });
  await check('Jobs assigned scope and empty evidence complete under migrated audit constraints', async () => {
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'assigned' });
    try {
      const result = await createJobReportCSVExport(db, identity, enabled, input);
      await drain(result.stream);
      assert.equal((await result.completion).outcome, 'completed');
      assert.equal((await audit(result.id)).scope, 'assigned');
      assert.equal(result.generation.scope, 'assigned');
      const empty = jobReportExportInputSchema.parse({ dataset: 'evidence', query: {
        workspaceId, view: 'workload', filters: { statuses: [], owners: [], services: [] },
        selection: { kind: 'metric', metric: 'overdue' },
      } });
      const zero = await createJobReportCSVExport(db, identity, enabled, empty);
      assert.equal(await drain(zero.stream), '\uFEFF' + csvLine(zero.columns));
      assert.equal((await zero.completion).outcome, 'completed');
      assert.equal(zero.count, 0);
    } finally {
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'workspace' });
    }
  });
  await check('Jobs audit rollback refuses retained evidence without changing the migrated constraint', async () => {
    const result = await createJobReportCSVExport(db, identity, enabled, input);
    await drain(result.stream);
    assert.equal((await result.completion).outcome, 'completed');
    await assert.rejects(db.transaction(rollbackJobsAudit), /violated by some row/);
    const saved = await audit(result.id);
    assert.equal(saved.outcome, 'completed');
    await assert.rejects(db('reportExportAudit').insert({ ...saved, id: randomUUID(), scope: 'own' }), /check constraint/);
  });
  await check('50,000 current workload Jobs complete under default export limits', async () => {
    for (const key of environment) delete process.env[key];
    await db.raw(`INSERT INTO jobs (id, "workspaceId", "jobNumber", "customerId", "customerName", title,
      service, location, description, status, "primaryOwnerId", "createdBy")
      SELECT gen_random_uuid(), ?::uuid, 1, ?::uuid, 'Fixture', 'Measured Job',
        'Measured service', '', '', 'in-progress', ?, ? FROM generate_series(1, 50000)`,
    [workspaceId, customerId, owner, owner]);
    for (const table of ['jobs', 'jobTeamMembers', 'users']) await db.raw('ANALYZE ??', [table]);
    const selection = jobReportExportInputSchema.parse({ dataset: 'evidence', query: {
      workspaceId, view: 'workload', filters: { statuses: [], owners: [], services: ['service:Measured service'] },
      selection: { kind: 'metric', metric: 'active' },
    } });
    const started = performance.now();
    const result = await createJobReportCSVExport(db, identity, enabled, selection);
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
    } finally { reader.releaseLock(); }
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
    console.log(`MEASURE workloadJobs=50000 bytes=${bytes} durationMs=${durationMs}`);
  });
  console.log(`${checks} Jobs CSV streaming database journeys passed.`);
} finally {
  environment.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [databaseName]);
  await admin.destroy();
}
