import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { estimateReportExportInputSchema, permissionIds, type EstimateFrozenSnapshot } from '@salesmora/contracts';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { estimateSnapshotHash } from '../estimates/sharing-paper';
import { csvLine } from '../leads/csv';
import { migrateFreshBaseline } from '../baseline-runner';
import { down as rollbackBaseline } from '../baseline-migrations/202611150001_fresh_baseline';
import { createEstimateReportCSVExport, previewEstimateReportExport } from './estimate-export';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const name = `estimate_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${name}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), jobId = randomUUID(), estimateId = randomUUID(), snapshotId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let created = false;
async function drain(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
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
  await admin.raw('CREATE DATABASE ??', [name]); created = true;
  await migrateFreshBaseline(db);
  const today = (await db.raw<{ rows: { today: string }[] }>(
    `SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS today`)).rows[0]!.today;
  const snapshot: EstimateFrozenSnapshot = {
    formatVersion: 1, content: {
      number: 'EST-0001', revision: 1, name: 'Report quote',
      business: { name: 'Fixture', address: '1 Fixture Street', phone: '2125550100',
        email: 'fixture@example.test', licenseLine: '', logoPath: null, requireServiceAddress: false },
      recipientName: 'Fixture customer', recipientEmail: '', serviceAddress: '', estimateDate: today,
      validUntil: today, preparedBy: '', relatedRecord: '', scope: '', message: '', paymentTerms: '', termsNote: '',
      items: [{ description: 'Repair', quantity: '1', unitPrice: '100.00', taxable: true, included: false, unit: '' }],
      discount: { type: 'percent', value: '10' }, taxRate: '8', deposit: { type: 'percent', value: '25' },
    },
    amounts: { lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 1000, taxCents: 720,
      totalCents: 9720, depositCents: 2430, balanceCents: 7290 },
  };
  await db.transaction(async trx => {
    await trx('users').insert({ id: owner, name: 'Fixture', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('jobs').insert({ id: jobId, workspaceId, customerName: 'Fixture', title: 'Fixture', service: '',
      location: '', description: '', primaryOwnerId: owner, createdBy: owner });
    await trx('estimates').insert({ id: estimateId, workspaceId, estimateNumber: 1, revision: 1, name: 'Report quote',
      version: 3, parentType: 'job', jobId, ownerId: owner, status: 'accepted', publishedAt: new Date(), createdBy: owner,
      acceptedTotalCents: 9720 });
    await trx('estimate_snapshots').insert({ id: snapshotId, workspaceId, estimateId, estimateVersion: 2,
      content: JSON.stringify(snapshot), contentHash: estimateSnapshotHash(snapshot), createdAt: new Date() });
    await trx('estimate_decisions').insert({ id: randomUUID(), workspaceId, estimateId, snapshotId, estimateVersion: 3,
      outcome: 'accepted', decisionDate: today, channel: 'phone', note: 'PRIVATE_NOT_FOR_REPORT', snapshotTotalCents: 9720,
      actorId: owner, createdAt: new Date() });
  });
  const input = estimateReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'estimate-decisions', period: { from: today, to: today }, selected: 'decided',
    filters: { owners: [`member:${owner}`], parents: [] },
  } });
  assert.equal((await previewEstimateReportExport(db, identity, enabled, input)).count, 1);
  const result = await createEstimateReportCSVExport(db, identity, enabled, input);
  const text = await drain(result.stream);
  assert(text.startsWith('\uFEFF' + csvLine(result.columns)));
  assert(!text.includes('PRIVATE_NOT_FOR_REPORT'));
  assert.deepEqual(await result.completion, { outcome: 'completed', rowsSent: 1, bytesSent: Buffer.byteLength(text) });
  const audit = await db('reportExportAudit').where({ id: result.id }).first();
  assert.equal(audit.report, 'estimates');
  assert.equal(audit.outcome, 'completed');
  assert.deepEqual(audit.selection.query.filters.owners, [createHash('sha256').update(`member:${owner}`).digest('hex')]);
  assert(!JSON.stringify(audit.selection).includes(owner));
  assert.deepEqual(audit.outputScopes, { view: 'estimate-decisions', scope: 'workspace',
    handoff: true, archiveVisibility: 'included' });
  await assert.rejects(createEstimateReportCSVExport(db, identity, enabled.filter(id => id !== 'estimates.export'), input),
    AuthorizationAccessError);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
  const narrowed = await createEstimateReportCSVExport(db, identity, enabled, input);
  await drain(narrowed.stream);
  assert.equal((await narrowed.completion).outcome, 'completed');
  assert.equal(narrowed.scope, 'assigned_job');
  assert.equal((await db('reportExportAudit').where({ id: narrowed.id }).first()).scope, 'assigned');
  const cancelled = await createEstimateReportCSVExport(db, identity, enabled, input);
  const reader = cancelled.stream.getReader();
  await reader.read(); await reader.cancel(); reader.releaseLock();
  assert.equal((await cancelled.completion).outcome, 'failed');
  assert.equal((await db('reportExportAudit').where({ id: cancelled.id }).first()).outcome, 'failed');
  const previousBytes = process.env.REPORT_EXPORT_BYTE_LIMIT;
  process.env.REPORT_EXPORT_BYTE_LIMIT = '1';
  try {
    const limited = await createEstimateReportCSVExport(db, identity, enabled, input);
    await assert.rejects(drain(limited.stream), /could not be completed/);
    assert.equal((await limited.completion).outcome, 'rejected');
    assert.equal((await db('reportExportAudit').where({ id: limited.id }).first()).outcome, 'rejected');
  } finally {
    if (previousBytes === undefined) delete process.env.REPORT_EXPORT_BYTE_LIMIT;
    else process.env.REPORT_EXPORT_BYTE_LIMIT = previousBytes;
  }
  await assert.rejects(rollbackBaseline(), /forward-only/);
  console.log('Estimate CSV stream, authorization, audit, limits, cancellation and rollback rehearsal passed.');
} finally {
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [name]);
  await admin.destroy();
}
