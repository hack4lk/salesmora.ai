import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { activityReportExportInputSchema, financialReportExportInputSchema, businessOverviewExportInputSchema,
  permissionIds } from '@salesmora/contracts';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { csvLine } from '../leads/csv';
import { replayMigrations } from '../migration-replay';
import { down as rollbackAudit } from '../migrations/202611120002_report_export_audit_activity';
import { down as rollbackFinancialAudit } from '../migrations/202611120003_report_export_audit_financial';
import { down as rollbackOverviewAudit } from '../migrations/202611120004_report_export_audit_overview';
import { createActivityReportCSVExport, previewActivityReportExport } from './activity-export';
import { createFinancialReportCSVExport, previewFinancialReportExport } from './financial-export';
import { createBusinessOverviewCSVExport, previewBusinessOverviewExport, prepareBusinessOverviewExportInTransaction } from './business-overview-export';
import { readBusinessOverviewInTransaction } from './business-overview';
import { withReportExportSnapshot } from './lead-export';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const name = `activity_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${name}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), leadId = randomUUID(), jobId = randomUUID(), orderId = randomUUID();
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
  await replayMigrations(db);
  const today = (await db.raw<{ rows: { today: string }[] }>(
    `SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS today`)).rows[0]!.today;
  await db.transaction(async trx => {
    await trx('users').insert({ id: owner, name: 'Fixture actor', email: `${owner}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: owner, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
    await trx('leads').insert({ id: leadId, workspaceId, ownerId: owner, createdBy: owner,
      submissionId: randomUUID(), submissionHash: 'fixture', name: 'Fixture Lead', email: '', phone: '', service: '',
      address: '', details: '', notes: 'PRIVATE_NOTES', source: 'website', stage: 'new' });
    await trx('leadActivity').insert({ id: randomUUID(), workspaceId, leadId, actorId: owner,
      actorName: 'PRIVATE_ACTOR', actorType: 'user', type: 'created', changes: JSON.stringify({ body: 'PRIVATE_EVENT' }),
      createdAt: new Date() });
    await trx('jobs').insert({ id: jobId, workspaceId, primaryOwnerId: owner, createdBy: owner,
      title: 'Fixture Job', customerName: 'PRIVATE_CUSTOMER', description: '', service: '', location: '' });
    await trx('jobs').insert({ id: randomUUID(), workspaceId, primaryOwnerId: null, createdBy: owner,
      title: 'Other Job', customerName: 'PRIVATE_CUSTOMER', description: '', service: '', location: '' });
    await trx('workOrders').insert({ id: orderId, workspaceId, jobId, title: 'Fixture Work Order', status: 'issued',
      instructions: 'PRIVATE_INSTRUCTIONS', accessNotes: '', safetyNotes: '', issuedAt: new Date() });
    await trx('workOrderMaterials').insert({ id: randomUUID(), workspaceId, workOrderId: orderId, position: 0,
      name: 'Recorded pipe', quantity: '2', costCents: null, customerPriceCents: 500, status: 'needed', unit: 'each',
      note: 'PRIVATE_MATERIAL_NOTE' });
  });
  const input = activityReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'activity', period: { from: today, to: today },
    filters: { domains: ['lead'], actions: [], actors: [`member:${owner}`] },
  } });
  assert.equal((await previewActivityReportExport(db, identity, enabled, input)).count, 2);
  const result = await createActivityReportCSVExport(db, identity, enabled, input);
  const text = await drain(result.stream);
  assert(text.startsWith('\uFEFF' + csvLine(result.columns)));
  assert(!text.includes('PRIVATE_EVENT') && !text.includes('PRIVATE_NOTES') && !text.includes('PRIVATE_ACTOR'));
  assert.deepEqual(await result.completion, { outcome: 'completed', rowsSent: 2, bytesSent: Buffer.byteLength(text) });
  const audit = await db('reportExportAudit').where({ id: result.id }).first();
  assert.equal(audit.report, 'activity');
  assert.equal(audit.outcome, 'completed');
  assert.deepEqual(audit.selection.query.filters.actors, [createHash('sha256').update(`member:${owner}`).digest('hex')]);
  assert(!JSON.stringify(audit.selection).includes(owner));
  assert(audit.outputScopes.includedDomains.some((item: { domain: string }) => item.domain === 'lead'));
  const reduced = enabled.filter(id => id !== 'leads.export');
  await assert.rejects(createActivityReportCSVExport(db, identity, reduced, input), AuthorizationAccessError);
  const allDomains = activityReportExportInputSchema.parse({ ...input,
    query: { ...input.query, filters: { domains: [], actions: [], actors: [] } } });
  const narrowed = await createActivityReportCSVExport(db, identity, reduced, allDomains);
  assert(narrowed.omittedDomains.some(item => item.domain === 'lead'));
  await drain(narrowed.stream);
  assert.equal((await narrowed.completion).outcome, 'completed');
  const cancelled = await createActivityReportCSVExport(db, identity, enabled, input);
  const reader = cancelled.stream.getReader();
  await reader.read(); await reader.cancel(); reader.releaseLock();
  assert.equal((await cancelled.completion).outcome, 'failed');
  assert.equal((await db('reportExportAudit').where({ id: cancelled.id }).first()).outcome, 'failed');
  const financial = financialReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'financial', period: { from: today, to: today }, selected: 'materials',
  } });
  assert.equal((await previewFinancialReportExport(db, identity, enabled, financial)).count, 1);
  const costs = await createFinancialReportCSVExport(db, identity, enabled, financial);
  const costsText = await drain(costs.stream);
  assert(costsText.startsWith('\uFEFF' + csvLine(costs.columns)));
  assert(!costsText.includes('PRIVATE_MATERIAL_NOTE') && !costsText.includes('PRIVATE_INSTRUCTIONS'));
  assert.equal((await costs.completion).outcome, 'completed');
  const costsAudit = await db('reportExportAudit').where({ id: costs.id }).first();
  assert.equal(costsAudit.report, 'financial');
  assert.equal(costsAudit.outputScopes.section, 'materials');
  await assert.rejects(db('reportExportAudit').where({ id: costs.id }).update({ outcome: 'failed' }), /immutable/i);
  await assert.rejects(createFinancialReportCSVExport(db, identity, enabled.filter(id => id !== 'workorders.view_costs'), financial),
    AuthorizationAccessError);
  const cancelledCosts = await createFinancialReportCSVExport(db, identity, enabled, financial);
  const costsReader = cancelledCosts.stream.getReader();
  await costsReader.read(); await costsReader.cancel(); costsReader.releaseLock();
  assert.equal((await cancelledCosts.completion).outcome, 'failed');
  const oldByteLimit = process.env.REPORT_EXPORT_BYTE_LIMIT;
  process.env.REPORT_EXPORT_BYTE_LIMIT = '16';
  try {
    const limitedCosts = await createFinancialReportCSVExport(db, identity, enabled, financial);
    await assert.rejects(drain(limitedCosts.stream), /could not be completed/i);
    assert.equal((await limitedCosts.completion).outcome, 'rejected');
  } finally {
    if (oldByteLimit === undefined) delete process.env.REPORT_EXPORT_BYTE_LIMIT;
    else process.env.REPORT_EXPORT_BYTE_LIMIT = oldByteLimit;
  }
  const overview = businessOverviewExportInputSchema.parse({ dataset: 'summary',
    query: { workspaceId, view: 'business-overview', period: { from: today, to: today } } });
  await db('leads').insert({ id: randomUUID(), workspaceId, ownerId: null, createdBy: owner,
    submissionId: randomUUID(), submissionHash: 'fixture-other', name: 'Other Lead', email: '', phone: '', service: '',
    address: '', details: '', notes: 'PRIVATE_NOTES', source: 'website', stage: 'new' });
  const project = () => withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(30000), async (trx, context) => {
    const native = await readBusinessOverviewInTransaction(trx, context, overview.query);
    const projection = await prepareBusinessOverviewExportInTransaction(trx, context, overview);
    const rows = [];
    for await (const row of projection.rows()) rows.push(row);
    return { native, projection, rows };
  });
  const full = await project();
  assert.equal(full.native.jobs.kind, 'available');
  if (full.native.jobs.kind !== 'available') throw new Error('Expected native Job access.');
  assert.equal(full.rows.find(row => row[0] === 'jobs' && row[1] === 'created')?.[2], full.native.jobs.created);
  for (const metric of ['completed', 'active', 'overdue', 'waiting'] as const) {
    assert.equal(full.rows.find(row => row[0] === 'jobs' && row[1] === metric)?.[2], full.native.jobs[metric]);
  }
  assert.equal(full.native.leads.kind, 'available');
  if (full.native.leads.kind !== 'available') throw new Error('Expected native Lead access.');
  assert.equal(full.rows.find(row => row[0] === 'leads' && row[1] === 'created')?.[2], full.native.leads.created);
  assert.equal(full.rows.find(row => row[0] === 'leads' && row[1] === 'inactive')?.[2], full.native.leads.inactive);
  for (const [stage, count] of Object.entries(full.native.leads.stages)) {
    assert.equal(full.rows.find(row => row[0] === 'leads' && row[1] === `open ${stage}`)?.[2], count);
  }
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'assigned' });
  const assignedLead = await project();
  assert.equal(assignedLead.projection.scopes.lead?.scope, 'assigned');
  assert.equal(assignedLead.rows.find(row => row[0] === 'leads' && row[1] === 'created')?.[2], 1);
  assert.equal(full.native.leads.created, 2);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'workspace' });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'assigned' });
  const assigned = await project();
  assert.equal(assigned.projection.scopes.job, 'assigned');
  assert.equal(assigned.rows.find(row => row[0] === 'jobs' && row[1] === 'created')?.[2], 1);
  assert.equal(full.native.jobs.created, 2);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'workspace' });
  const partialPermissions = enabled.filter(id => id !== 'leads.export' && id !== 'workorders.export');
  const overviewPreview = await previewBusinessOverviewExport(db, identity, partialPermissions, overview);
  assert.equal(overviewPreview.scopes.lead, null);
  assert.equal(overviewPreview.scopes.job, 'workspace');
  assert.equal(overviewPreview.scopes.calendar?.workOrders, null);
  const overviewResult = await createBusinessOverviewCSVExport(db, identity, partialPermissions, overview);
  const overviewText = await drain(overviewResult.stream);
  assert(overviewText.startsWith('\uFEFF' + csvLine(overviewResult.columns)));
  assert(overviewText.includes('"leads","section","","unavailable"'));
  assert(!overviewText.includes('PRIVATE_'));
  assert.equal((await overviewResult.completion).outcome, 'completed');
  const overviewAudit = await db('reportExportAudit').where({ id: overviewResult.id }).first();
  assert.equal(overviewAudit.report, 'overview');
  assert.equal(overviewAudit.outputScopes.lead, null);
  await assert.rejects(createBusinessOverviewCSVExport(db, identity, enabled.filter(id => id !== 'reports.export'), overview),
    AuthorizationAccessError);
  const stopped = await createBusinessOverviewCSVExport(db, identity, partialPermissions, overview);
  const stoppedReader = stopped.stream.getReader();
  await stoppedReader.read(); await stoppedReader.cancel(); stoppedReader.releaseLock();
  assert.equal((await stopped.completion).outcome, 'failed');
  await assert.rejects(db.transaction(rollbackOverviewAudit), /violated by some row/);
  await assert.rejects(db.transaction(rollbackFinancialAudit), /violated by some row/);
  await assert.rejects(db.transaction(rollbackAudit), /violated by some row/);
  console.log('Activity, Financial and Overview CSV streaming, authority, audit, cancellation and rollback rehearsal passed.');
} finally {
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [name]);
  await admin.destroy();
}
