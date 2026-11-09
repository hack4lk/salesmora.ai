import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { leadSourceExportInputSchema, permissionIds, type EstimateFrozenSnapshot } from '@salesmora/contracts';
import { replayMigrations } from '../migration-replay';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { createLeadSourceCSVExport, previewLeadSourceExport, ReportExportLimitError } from './lead-source-export';
import { csvLine } from '../leads/csv';
import { estimateSnapshotHash } from '../estimates/sharing-paper';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) {
  throw new Error('Use a separate local _test database.');
}
const databaseName = `source_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection);
url.pathname = `/${databaseName}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), enabled = [...permissionIds];
const identity = { workspaceId, userId: owner };
const environment = ['REPORT_EXPORT_ROW_LIMIT', 'REPORT_EXPORT_BYTE_LIMIT', 'REPORT_EXPORT_DURATION_MS'] as const;
const previous = environment.map(key => process.env[key]);
let created = false, checks = 0;

async function check(name: string, run: () => Promise<void>) {
  if (process.argv.length > 2 && !process.argv.slice(2).some(fragment => name.includes(fragment))) return;
  await run();
  checks++;
  console.log(`PASS ${name}`);
}

async function drain(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    chunks.push(next.value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

try {
  await admin.raw('CREATE DATABASE ??', [databaseName]);
  created = true;
  await replayMigrations(db);
  let today = '';
  await db.transaction(async trx => {
    await trx('users').insert({
      id: owner, name: 'Source CSV fixture owner', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    });
    await trx('workspaces').insert({
      id: workspaceId, ownerId: owner, businessName: 'Source CSV fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'Europe/Warsaw',
    });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({
      workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled',
    });
    today = (await trx.raw(`SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw', 'YYYY-MM-DD') AS today`))
      .rows[0].today;
  });
  const seed = async (name: string) => db('leads').insert({
    id: randomUUID(), workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'source-fixture',
    name, email: 'PRIVATE_EMAIL', phone: 'PRIVATE_PHONE', service: '', address: '',
    details: 'PRIVATE_DETAILS', notes: 'PRIVATE_NOTES', source: 'website', stage: 'new',
    ownerId: owner, createdAt: new Date(), lastActivityAt: new Date(),
  });
  const input = (dataset: string, selected: string) => leadSourceExportInputSchema.parse({
    dataset,
    query: { workspaceId, view: 'lead-source', period: { from: today, to: today }, selected },
  });
  const audit = (id: string) => db('reportExportAudit').where({ id }).first();

  await check('Sources preview and successful streaming create immutable content-free audits', async () => {
    await seed('=SUM(1,2)');
    const selection = input('cohort', 'cohort');
    const before = await previewLeadSourceExport(db, identity, enabled, selection);
    assert.equal(before.count, 1);
    await seed('Second CSV fixture');
    const result = await createLeadSourceCSVExport(db, identity, enabled, selection);
    const text = await drain(result.stream), completion = await result.completion;
    assert.equal(result.count, 2);
    assert.equal(result.generation.id, result.id);
    assert.equal(result.generation.count, result.count);
    assert.equal(completion.outcome, 'completed');
    assert.equal(completion.rowsSent, 2);
    assert.ok(text.startsWith('\uFEFF' + csvLine(result.columns)));
    assert.ok(text.includes(' / =SUM(1,2)'));
    assert.ok(!text.includes('PRIVATE_'));
    const saved = await audit(result.id);
    assert.equal(saved.report, 'sources');
    assert.equal(saved.dataset, 'cohort');
    assert.equal(saved.outcome, 'completed');
    assert.deepEqual(saved.outputScopes, {
      lead: 'workspace',
      leadArchiveVisibility: 'included',
      conversion: { kind: 'available', scope: 'workspace' },
      acceptedValue: { kind: 'available', scope: 'workspace' },
    });
    assert.equal(Number(saved.count), 2);
    assert.equal(Number(saved.rowsSent), 2);
    assert.equal(Number(saved.bytesSent), Buffer.byteLength(text));
    assert.ok(!JSON.stringify(saved.selection).includes('=SUM(1,2)'));
    assert.ok(!JSON.stringify(saved.selection).includes('PRIVATE_'));
  });

  await check('default-off Reports export authority is rechecked before preview and download', async () => {
    await assert.rejects(
      previewLeadSourceExport(db, identity, enabled.filter(id => id !== 'reports.export'), input('cohort', 'cohort')),
      AuthorizationAccessError,
    );
    await assert.rejects(
      createLeadSourceCSVExport(db, identity, enabled.filter(id => id !== 'reports.export'), input('cohort', 'cohort')),
      AuthorizationAccessError,
    );
  });

  await check('row limits produce a rejected durable audit without a success-shaped stream', async () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '1';
    await assert.rejects(
      createLeadSourceCSVExport(db, identity, enabled, input('cohort', 'cohort')),
      ReportExportLimitError,
    );
    const saved = await db('reportExportAudit').where({ report: 'sources', outcome: 'rejected' }).first();
    assert.ok(saved?.finishedAt);
    assert.equal(Number(saved.rowsSent), 0);
    delete process.env.REPORT_EXPORT_ROW_LIMIT;
  });

  await check('stream cancellation records failure and never claims complete delivery', async () => {
    const result = await createLeadSourceCSVExport(db, identity, enabled, input('cohort', 'cohort'));
    const reader = result.stream.getReader();
    assert.equal((await reader.read()).done, false);
    await reader.cancel();
    assert.equal((await result.completion).outcome, 'failed');
    assert.equal((await audit(result.id)).outcome, 'failed');
  });

  await check('50,000 accepted-family rows complete within default byte and duration limits', async () => {
    const leadId = randomUUID();
    await db('leads').insert({
      id: leadId, workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'measurement',
      name: 'Measured cohort Lead', email: '', phone: '', service: '', address: '', details: '', notes: '',
      source: 'website', stage: 'new', ownerId: owner, createdAt: new Date(),
    });
    for (let offset = 0; offset < 50000; offset += 500) {
      const records = Array.from({ length: 500 }, (_, index) => {
        const number = offset + index + 1, id = randomUUID(), snapshotId = randomUUID();
        const content: EstimateFrozenSnapshot = {
          formatVersion: 1,
          content: {
            number: `EST-${String(number).padStart(4, '0')}`, revision: 1, name: 'Measured frozen quote',
            business: { name: 'Fixture', address: '1 Fixture Street', phone: '2125550100',
              email: 'fixture@example.test', licenseLine: '', logoPath: null, requireServiceAddress: false },
            recipientName: 'Fixture', recipientEmail: '', serviceAddress: '', estimateDate: today,
            validUntil: today, preparedBy: '', relatedRecord: '', scope: '', message: '',
            paymentTerms: '', termsNote: '',
            items: [{ description: 'Repair', quantity: '1', unitPrice: '100.00',
              taxable: true, included: false, unit: '' }],
            discount: { type: 'percent', value: '10' }, taxRate: '8', deposit: { type: 'percent', value: '25' },
          },
          amounts: { lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 1000,
            taxCents: 720, totalCents: 9720, depositCents: 2430, balanceCents: 7290 },
        };
        return { number, id, snapshotId, content };
      });
      await db.transaction(async trx => {
        await trx('estimates').insert(records.map(record => ({
          id: record.id, workspaceId, estimateNumber: record.number, revision: 1, version: 3,
          name: record.content.content.name, parentType: 'lead', leadId, status: 'accepted',
          publishedAt: new Date(), createdBy: owner, acceptedTotalCents: 9720,
        })));
        await trx('estimate_snapshots').insert(records.map(record => ({
          id: record.snapshotId, workspaceId, estimateId: record.id, estimateVersion: 2,
          content: JSON.stringify(record.content), contentHash: estimateSnapshotHash(record.content),
          createdAt: new Date(),
        })));
        await trx('estimate_decisions').insert(records.map(record => ({
          id: randomUUID(), workspaceId, estimateId: record.id, snapshotId: record.snapshotId,
          estimateVersion: 3, outcome: 'accepted', decisionDate: today, channel: 'phone',
          note: '', snapshotTotalCents: 9720, actorId: owner,
        })));
      });
    }
    const started = performance.now();
    const result = await createLeadSourceCSVExport(db, identity, enabled, input('accepted-estimates', 'accepted-estimates'));
    const reader = result.stream.getReader();
    let bytes = 0, records = 0, previous = -1;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      for (const byte of next.value) { if (previous === 13 && byte === 10) records++; previous = byte; }
    }
    const completion = await result.completion, durationMs = Math.round(performance.now() - started);
    assert.equal(completion.outcome, 'completed');
    assert.equal(result.count, 50000);
    assert.equal(completion.rowsSent, 50000);
    assert.equal(records, 50001);
    assert.equal(completion.bytesSent, bytes);
    assert.ok(bytes <= result.limits.bytes);
    assert.ok(durationMs < result.limits.durationMs);
    console.log(`MEASURE acceptedRows=50000 bytes=${bytes} durationMs=${durationMs}`);
  });

  console.log(`${checks} Sources CSV streaming database journeys passed.`);
} finally {
  environment.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [databaseName]);
  await admin.destroy();
}
