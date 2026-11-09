import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import knex from 'knex';
import { leadReportExportInputSchema, permissionIds } from '@salesmora/contracts';
import { replayMigrations } from '../migration-replay';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { createLeadReportCSVExport, previewLeadReportExport, ReportExportLimitError } from './lead-export';
import { csvLine } from '../leads/csv';
import { withWorkspaceAuthorization } from '../authorization/store';
import { readLeadReportWithAuthorityInTransaction } from './lead-read';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const databaseName = `report_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${databaseName}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false, checks = 0;
const environment = ['REPORT_EXPORT_ROW_LIMIT', 'REPORT_EXPORT_BYTE_LIMIT', 'REPORT_EXPORT_DURATION_MS'] as const;
const previous = environment.map(key => process.env[key]);
async function check(name: string, run: () => Promise<void>) {
  if (process.argv.length > 2 && !process.argv.slice(2).some(fragment => name.includes(fragment))) return;
  await run(); checks++; console.log(`PASS ${name}`);
}
try {
  await admin.raw('CREATE DATABASE ??', [databaseName]); created = true;
  await replayMigrations(db);
  await db.transaction(async trx => {
    await trx('users').insert({ id: owner, name: 'CSV fixture owner', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'CSV fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'Europe/Warsaw' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
  });
  const seed = async (count: number, name = 'CSV fixture, "quoted" / Warsaw') => {
    await db('leads').insert(Array.from({ length: count }, (_, index) => ({
      id: randomUUID(), workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'fixture',
      name: index === 0 ? '=SUM(1,2)' : name, email: 'PRIVATE_EMAIL', phone: 'PRIVATE_PHONE', details: 'PRIVATE_DETAILS',
      notes: 'PRIVATE_NOTES', service: '', address: '', source: 'website', stage: 'new', ownerId: owner,
      createdAt: new Date(), lastActivityAt: new Date(),
    })));
  };
  const input = leadReportExportInputSchema.parse({ query: { workspaceId, view: 'pipeline',
    filters: { stages: [], owners: [], sources: [] }, selection: { kind: 'pipeline' } }, dataset: 'evidence' });
  const audit = (id: string) => db('reportExportAudit').where({ id }).first();
  await check('read export authority exposes current intersected scope and defaults to denial when disabled', async () => {
    const read = () => withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) =>
      readLeadReportWithAuthorityInTransaction(trx, context, { ...input.query, page: 1, pageSize: 25 }));
    assert.equal((await read()).exportScope, 'workspace');
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'assigned' });
    assert.equal((await read()).exportScope, 'assigned');
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'workspace' });
    const disabled = await withWorkspaceAuthorization(db, identity, enabled.filter(id => id !== 'reports.export'), false,
      (trx, context) => readLeadReportWithAuthorityInTransaction(trx, context, { ...input.query, page: 1, pageSize: 25 }));
    assert.equal(disabled.exportScope, null); assert.equal(disabled.report.view, 'pipeline');
  });
  const drain = async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader(), chunks: Uint8Array[] = [];
    while (true) { const next = await reader.read(); if (next.done) break; chunks.push(next.value); }
    return Buffer.concat(chunks).toString('utf8');
  };
  await check('empty evidence exports a complete header and immutable completed audit, not an interrupted success', async () => {
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    assert.equal(await drain(result.stream), '\uFEFF' + csvLine(result.columns));
    assert.equal((await result.completion).outcome, 'completed');
    assert.equal((await audit(result.id)).outcome, 'completed');
    await assert.rejects(db('reportExportAudit').where({ id: result.id }).update({ outcome: 'failed' }), /immutable/);
  });
  await seed(131);
  await check('CSV emits full rows, exact formula-safe UTF-8 columns and content-free successful audit', async () => {
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    const text = await drain(result.stream), completion = await result.completion;
    assert.equal(result.count, 131); assert.equal(completion.rowsSent, 131);
    assert.equal(text.split('\r\n').length, 133);
    assert.ok(text.startsWith('\uFEFF' + csvLine(result.columns)));
    assert.ok(text.includes(`"'=SUM(1,2)"`)); assert.ok(text.includes('""quoted""'));
    assert.ok(!text.includes('PRIVATE_'));
    const saved = await audit(result.id);
    assert.equal(Number(saved.bytesSent), Buffer.byteLength(text));
    assert.ok(!JSON.stringify(saved).includes('CSV fixture,'));
    assert.equal(saved.actorId, owner);
    assert.deepEqual(saved.selection.filters.owners, []);
  });
  await check('preview remains live and download rechecks native count and scope', async () => {
    const before = await previewLeadReportExport(db, identity, enabled, input);
    await seed(1); const result = await createLeadReportCSVExport(db, identity, enabled, input);
    assert.equal(result.count, before.count + 1); await drain(result.stream); await result.completion;
    await assert.rejects(createLeadReportCSVExport(db, identity, enabled.filter(id => id !== 'reports.export'), input), AuthorizationAccessError);
    await assert.rejects(createLeadReportCSVExport(db, { ...identity, workspaceId: randomUUID() }, enabled, input), AuthorizationAccessError);
  });
  await check('generation snapshot retains exact count and rows under concurrent Lead inserts during backpressure', async () => {
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    await seed(1);
    const text = await drain(result.stream); const completion = await result.completion;
    assert.equal(text.split('\r\n').length, result.count + 2); assert.equal(completion.rowsSent, result.count);
    assert.equal((await previewLeadReportExport(db, identity, enabled, input)).count, result.count + 1);
  });
  await check('row and byte caps reject explicitly and never finalize a truncated CSV as success', async () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '1';
    await assert.rejects(createLeadReportCSVExport(db, identity, enabled, input), ReportExportLimitError);
    const rejected = await db('reportExportAudit').where({ outcome: 'rejected' }).first();
    assert.ok(rejected.finishedAt); assert.equal(Number(rejected.rowsSent), 0);
    delete process.env.REPORT_EXPORT_ROW_LIMIT;
    process.env.REPORT_EXPORT_BYTE_LIMIT = '1024';
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    await assert.rejects(drain(result.stream), /could not be completed/);
    assert.equal((await result.completion).outcome, 'rejected'); assert.equal((await audit(result.id)).outcome, 'rejected');
    delete process.env.REPORT_EXPORT_BYTE_LIMIT;
  });
  await check('disconnect and request abort settle generation, record failure and release cursors/authority locks', async () => {
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    const reader = result.stream.getReader(); assert.equal((await reader.read()).done, false);
    await reader.cancel(); assert.equal((await result.completion).outcome, 'failed');
    assert.equal((await audit(result.id)).outcome, 'failed');
    const controller = new AbortController();
    const aborted = await createLeadReportCSVExport(db, identity, enabled, input, controller.signal);
    controller.abort(); await assert.rejects(drain(aborted.stream));
    assert.equal((await aborted.completion).outcome, 'failed');
    await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '1s'");
      await trx('workspaces').where({ id: workspaceId }).forUpdate().first();
    });
  });
  await check('generation timeout and audit failure surface stream errors after headers rather than success', async () => {
    process.env.REPORT_EXPORT_DURATION_MS = '300';
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    assert.equal((await result.completion).outcome, 'failed'); await assert.rejects(drain(result.stream));
    delete process.env.REPORT_EXPORT_DURATION_MS;
    await db.raw(`CREATE FUNCTION reject_report_completion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      IF NEW.outcome = 'completed' THEN RAISE EXCEPTION 'fixture audit failure'; END IF; RETURN NEW; END $$`);
    await db.raw(`CREATE TRIGGER reject_report_completion BEFORE UPDATE ON "reportExportAudit"
      FOR EACH ROW EXECUTE FUNCTION reject_report_completion()`);
    const failed = await createLeadReportCSVExport(db, identity, enabled, input);
    await assert.rejects(drain(failed.stream), /could not be completed/);
    assert.equal((await failed.completion).outcome, 'failed'); assert.equal((await audit(failed.id)).outcome, 'failed');
    await db.raw('DROP TRIGGER reject_report_completion ON "reportExportAudit"');
    await db.raw('DROP FUNCTION reject_report_completion()');
  });
  await check('authorization lock wait observes committed revocation, suspension and deletion instead of stale grants', async () => {
    await previewLeadReportExport(db, identity, enabled, input);
    const transaction = await db.transaction();
    try {
      await transaction('workspaces').where({ id: workspaceId }).forUpdate().first();
      const pending = createLeadReportCSVExport(db, identity, enabled, input);
      const denied = assert.rejects(pending, AuthorizationAccessError);
      let waiting = false;
      for (let attempt = 0; attempt < 100 && !waiting; attempt++) {
        waiting = (await db.raw(`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname = current_database()
          AND wait_event_type = 'Lock' AND query LIKE '%workspaces%') AS waiting`)).rows[0].waiting;
        if (!waiting) await setTimeout(10);
      }
      assert.ok(waiting, 'Export must actually wait for the authority lock before revocation commits.');
      await transaction('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      await transaction('workspacePolicies').where({ workspaceId }).increment('revision', 1);
      await transaction.commit(); await denied;
    } finally { if (!transaction.isCompleted()) await transaction.rollback(); }
    await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    for (const [table, key] of [['users', 'suspendedAt'], ['workspaces', 'suspendedAt'], ['users', 'deletionRequestedAt'],
      ['workspaces', 'deletionRequestedAt']] as const) {
      const id = table === 'users' ? owner : workspaceId;
      await db(table).where({ id }).update({ [key]: new Date(), ...(key === 'suspendedAt' ? { suspendedReason: 'Fixture suspension' } : {}) });
      await assert.rejects(createLeadReportCSVExport(db, identity, enabled, input), AuthorizationAccessError);
      await db(table).where({ id }).update({ [key]: null, ...(key === 'suspendedAt' ? { suspendedReason: null } : {}) });
    }
  });
  await check('download scope and archive authority recheck narrow evidence, with no raw owner text in audit selection', async () => {
    const baseline = await previewLeadReportExport(db, identity, enabled, input);
    await db('leads').where({ workspaceId }).orderBy('id').first().then(row => db('leads').where({ id: row.id }).update({ ownerId: null }));
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'assigned' });
    const selected = leadReportExportInputSchema.parse({ ...input, query: { ...input.query,
      filters: { ...input.query.filters, owners: [owner] } } });
    const result = await createLeadReportCSVExport(db, identity, enabled, selected);
    assert.equal(result.scope, 'assigned'); assert.equal(result.count, baseline.count - 1);
    await drain(result.stream); await result.completion;
    assert.ok(!JSON.stringify((await audit(result.id)).selection).includes(owner));
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'workspace' });
    const today = baseline.today;
    const intake = leadReportExportInputSchema.parse({ dataset: 'evidence', query: { workspaceId, view: 'intake',
      period: { from: today, to: today }, filters: input.query.filters, currentFilters: input.query.filters } });
    const row = await db('leads').where({ workspaceId }).first();
    await db('leads').where({ id: row.id }).update({ archivedAt: new Date() });
    const archived = await previewLeadReportExport(db, identity, enabled, intake);
    const reduced = await createLeadReportCSVExport(db, identity, enabled.filter(id => id !== 'leads.archive'), intake);
    assert.equal(archived.archiveVisibility, 'included'); assert.equal(reduced.archiveVisibility, 'excluded');
    assert.equal(reduced.count, archived.count - 1); await drain(reduced.stream); await reduced.completion;
    await db('leads').where({ id: row.id }).update({ archivedAt: null });
  });
  await check('concurrent exports queue within pool capacity and cancelled waiters do not starve later reads', async () => {
    const small = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 3 } });
    try {
      const first = await createLeadReportCSVExport(small, identity, enabled, input);
      const controller = new AbortController();
      const queued = createLeadReportCSVExport(small, identity, enabled, input, controller.signal);
      const denied = assert.rejects(queued);
      controller.abort(); await denied;
      const next = createLeadReportCSVExport(small, identity, enabled, input);
      await drain(first.stream); await first.completion;
      const second = await next; await drain(second.stream);
      assert.equal((await second.completion).outcome, 'completed');
    } finally { await small.destroy(); }
  });
  await check('pre-header authority loss fails explicitly after the durable started audit', async () => {
    await db.raw(`CREATE FUNCTION revoke_report_export() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      DELETE FROM "workspaceRolePolicies" WHERE "workspaceId" = NEW."workspaceId" AND permission = 'reports.export';
      UPDATE "workspacePolicies" SET revision = revision + 1 WHERE "workspaceId" = NEW."workspaceId";
      RETURN NEW; END $$`);
    await db.raw(`CREATE TRIGGER revoke_report_export AFTER INSERT ON "reportExportAudit"
      FOR EACH ROW EXECUTE FUNCTION revoke_report_export()`);
    await assert.rejects(createLeadReportCSVExport(db, identity, enabled, input), AuthorizationAccessError);
    const saved = await db('reportExportAudit').orderBy('createdAt', 'desc').first();
    assert.equal(saved.outcome, 'failed'); assert.equal(Number(saved.rowsSent), 0); assert.ok(saved.finishedAt);
    await db.raw('DROP TRIGGER revoke_report_export ON "reportExportAudit"');
    await db.raw('DROP FUNCTION revoke_report_export()');
    await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
  });
  await check('failure-audit outage retains durable started evidence and logs the explicit failure without content', async () => {
    await db.raw(`CREATE FUNCTION reject_report_finalization() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      RAISE EXCEPTION 'fixture failure audit outage'; END $$`);
    await db.raw(`CREATE TRIGGER reject_report_finalization BEFORE UPDATE ON "reportExportAudit"
      FOR EACH ROW EXECUTE FUNCTION reject_report_finalization()`);
    const result = await createLeadReportCSVExport(db, identity, enabled, input);
    assert.equal((await audit(result.id)).outcome, 'started');
    const log = console.error, messages: unknown[][] = [];
    try {
      console.error = (...args: unknown[]) => { messages.push(args); };
      await result.stream.cancel();
      assert.equal((await result.completion).outcome, 'failed');
    } finally { console.error = log; }
    assert.equal((await audit(result.id)).outcome, 'started');
    assert.deepEqual(messages, [['Report CSV failure audit could not be stored; started evidence is retained.']]);
    await db.raw('DROP TRIGGER reject_report_finalization ON "reportExportAudit"');
    await db.raw('DROP FUNCTION reject_report_finalization()');
  });
  await check('50,000-row cursor generation records measured duration/bytes and preserves full-result counts', async () => {
    const existing = Number((await db('leads').where({ workspaceId }).count('* as count').first())?.count);
    for (let offset = existing; offset < 50000; offset += 1000) await seed(Math.min(1000, 50000 - offset), 'Measured fictional Lead');
    const start = performance.now(), result = await createLeadReportCSVExport(db, identity, enabled, input);
    let bytes = 0; const reader = result.stream.getReader();
    while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; }
    const completion = await result.completion;
    assert.equal(completion.outcome, 'completed'); assert.equal(completion.rowsSent, 50000);
    assert.ok(bytes <= result.limits.bytes); assert.ok(performance.now() - start < result.limits.durationMs);
    console.log(`MEASURE rows=50000 bytes=${bytes} durationMs=${Math.round(performance.now() - start)}`);
  });
  console.log(`${checks} Leads CSV streaming database journeys passed.`);
} finally {
  environment.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [databaseName]);
  await admin.destroy();
}
