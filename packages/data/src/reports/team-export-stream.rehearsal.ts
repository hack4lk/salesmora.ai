import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { permissionIds, teamReportExportInputSchema } from '@salesmora/contracts';
import { migrateFreshBaseline } from '../baseline-runner';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { createJob } from '../jobs/store';
import { csvLine } from '../leads/csv';
import { down as rollbackBaseline } from '../baseline-migrations/202611150001_fresh_baseline';
import { createTeamReportCSVExport, previewTeamReportExport, ReportExportLimitError } from './team-export';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const databaseName = `team_csv_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${databaseName}`;
const db = knex({ client: 'pg', connection: url.toString(), pool: { min: 0, max: 8 } });
const workspaceId = randomUUID(), owner = randomUUID(), other = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
const environment = ['REPORT_EXPORT_ROW_LIMIT', 'REPORT_EXPORT_BYTE_LIMIT', 'REPORT_EXPORT_DURATION_MS'] as const;
const previous = environment.map(key => process.env[key]);
let created = false, checks = 0;
async function check(name: string, run: () => Promise<void>) {
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
    await trx('users').insert([owner, other].map(id => ({
      id, name: `Member ${id}`, email: `${id}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Team CSV fixture',
      businessType: 'test', postalCode: '', serviceRange: '', timezone: 'Europe/Warsaw' });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: other, role: 'office' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'PRIVATE_CUSTOMER', type: 'person',
      companyName: '', email: 'private@example.test', phone: '', location: '', internalNotes: 'PRIVATE_NOTES' });
  });
  const seedLead = () => db('leads').insert({
    id: randomUUID(), workspaceId, submissionId: randomUUID(), submissionHash: 'test', createdBy: owner,
    ownerId: owner, name: 'Private lead label', email: 'private@example.test', phone: '', service: 'Repair',
    address: '', details: 'PRIVATE_NOTES', notes: 'PRIVATE_NOTES', source: 'website', stage: 'new',
  });
  await seedLead();
  await db.transaction(trx => createJob(trx, identity, enabled, {
    workspaceId, submissionId: randomUUID(), customerId, title: 'Private job label', primaryOwnerId: owner, service: 'Repair',
  }));
  const leads = teamReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'team-leads', filters: { members: [owner] },
    selected: { kind: 'owner', id: `member:${owner}` },
  } });
  const jobs = teamReportExportInputSchema.parse({ dataset: 'evidence', query: {
    workspaceId, view: 'team-jobs', filters: { members: [owner] },
    selected: { kind: 'member', id: owner, responsibility: 'primary', filter: 'all' },
  } });
  const audit = (id: string) => db('reportExportAudit').where({ id }).first();
  const hash = (value: string) => createHash('sha256').update(value).digest('hex');
  await check('Team source previews recount, stream and hash member selectors in immutable audit', async () => {
    assert.equal((await previewTeamReportExport(db, identity, enabled, leads)).count, 1);
    await seedLead();
    for (const [input, count, selectionHash] of [[leads, 2, hash(`member:${owner}`)], [jobs, 1, hash(owner)]] as const) {
      const result = await createTeamReportCSVExport(db, identity, enabled, input);
      const text = await drain(result.stream), completion = await result.completion;
      assert.equal(result.count, count);
      assert.equal(result.generation.count, count);
      assert.deepEqual(completion, { outcome: 'completed', rowsSent: count, bytesSent: Buffer.byteLength(text) });
      assert(text.startsWith('\uFEFF' + csvLine(result.columns)));
      assert.equal(text.split('\r\n').length, count + 2);
      assert(!text.includes('PRIVATE_NOTES'));
      assert(!text.includes('private@example.test'));
      const saved = await audit(result.id);
      assert.equal(saved.report, 'team');
      assert.equal(saved.outcome, 'completed');
      assert.equal(saved.scope, 'workspace');
      assert.deepEqual(saved.outputScopes, { view: input.query.view, scope: 'workspace',
        archiveVisibility: input.query.view === 'team-leads' ? 'excluded' : 'included' });
      assert.deepEqual(saved.selection.query.filters.members, [hash(owner)]);
      assert.equal(saved.selection.query.selected.id, selectionHash);
      assert(!JSON.stringify(saved.selection).includes(owner));
      assert(!JSON.stringify(saved.selection).includes('Private'));
      await assert.rejects(db('reportExportAudit').where({ id: result.id }).update({ outcome: 'failed' }), /immutable/);
    }
  });
  await check('Team domains independently reauthorize and enforce narrowed assigned selections', async () => {
    for (const [input, permission, readPermission] of [
      [leads, 'leads.export', 'leads.read'], [jobs, 'jobs.export', 'jobs.read'],
    ] as const) {
      await previewTeamReportExport(db, identity, enabled, input);
      for (const denied of ['reports.export', 'reports.read', permission, readPermission] as const) {
        await assert.rejects(createTeamReportCSVExport(db, identity, enabled.filter(id => id !== denied), input), AuthorizationAccessError);
      }
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission }).update({ scope: 'assigned' });
      try {
        const result = await createTeamReportCSVExport(db, identity, enabled, input);
        await drain(result.stream);
        assert.equal((await result.completion).outcome, 'completed');
        assert.deepEqual(result.generation.scope, { kind: 'assigned', currentMemberId: owner });
        assert.equal((await audit(result.id)).scope, 'assigned');
        const unauthorized = teamReportExportInputSchema.parse({ ...input,
          query: { ...input.query, filters: { members: [other] } } });
        await assert.rejects(createTeamReportCSVExport(db, identity, enabled, unauthorized), AuthorizationAccessError);
      } finally {
        await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission }).update({ scope: 'workspace' });
      }
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission }).delete();
      try { await assert.rejects(createTeamReportCSVExport(db, identity, enabled, input), AuthorizationAccessError); }
      finally { await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission, scope: 'workspace' }); }
    }
    await assert.rejects(previewTeamReportExport(db, { ...identity, workspaceId: randomUUID() }, enabled, leads), AuthorizationAccessError);
  });
  await check('Team row and byte limits persist rejected outcomes', async () => {
    process.env.REPORT_EXPORT_ROW_LIMIT = '1';
    try {
      await assert.rejects(createTeamReportCSVExport(db, identity, enabled, leads), ReportExportLimitError);
      const saved = await db('reportExportAudit').where({ report: 'team', outcome: 'rejected' }).first();
      assert.equal(Number(saved.rowsSent), 0);
      assert(saved.finishedAt);
    } finally { delete process.env.REPORT_EXPORT_ROW_LIMIT; }
    process.env.REPORT_EXPORT_BYTE_LIMIT = '1';
    try {
      const result = await createTeamReportCSVExport(db, identity, enabled, jobs);
      await assert.rejects(drain(result.stream), /could not be completed/);
      assert.equal((await result.completion).outcome, 'rejected');
      assert.equal((await audit(result.id)).outcome, 'rejected');
    } finally { delete process.env.REPORT_EXPORT_BYTE_LIMIT; }
  });
  await check('Team cancellation and request abort persist failed outcomes', async () => {
    const result = await createTeamReportCSVExport(db, identity, enabled, leads);
    const reader = result.stream.getReader();
    assert.equal((await reader.read()).done, false);
    await reader.cancel(); reader.releaseLock();
    assert.equal((await result.completion).outcome, 'failed');
    assert.equal((await audit(result.id)).outcome, 'failed');
    const request = new AbortController();
    const aborted = await createTeamReportCSVExport(db, identity, enabled, jobs, request.signal);
    request.abort();
    await assert.rejects(drain(aborted.stream), /could not be completed/);
    assert.equal((await aborted.completion).outcome, 'failed');
    assert.equal((await audit(aborted.id)).outcome, 'failed');
    process.env.REPORT_EXPORT_DURATION_MS = '2000';
    try {
      const timeout = await createTeamReportCSVExport(db, identity, enabled, leads);
      assert.equal((await timeout.completion).outcome, 'failed');
      assert.equal((await audit(timeout.id)).outcome, 'failed');
      await assert.rejects(drain(timeout.stream), /could not be completed/);
    } finally { delete process.env.REPORT_EXPORT_DURATION_MS; }
  });
  await check('Team empty evidence completes with a header and durable audit', async () => {
    const empty = teamReportExportInputSchema.parse({ dataset: 'evidence', query: {
      workspaceId, view: 'team-jobs', filters: { members: [] }, selected: { kind: 'queue', queue: 'overdue' },
    } });
    const result = await createTeamReportCSVExport(db, identity, enabled, empty);
    assert.equal(result.count, 0);
    assert.equal(await drain(result.stream), '\uFEFF' + csvLine(result.columns));
    assert.equal((await result.completion).outcome, 'completed');
    assert.equal((await audit(result.id)).outcome, 'completed');
  });
  await check('Forward-only baseline preserves Team audit evidence', async () => {
    await assert.rejects(rollbackBaseline(), /forward-only/);
    const result = await createTeamReportCSVExport(db, identity, enabled, jobs);
    await drain(result.stream);
    assert.equal((await audit(result.id)).outcome, 'completed');
  });
  console.log(`${checks} Team CSV streaming database journeys passed.`);
} finally {
  environment.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [databaseName]);
  await admin.destroy();
}
