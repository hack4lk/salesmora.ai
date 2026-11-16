import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type PermissionId, type CaptureDraftConfiguration } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { homeClock, readHomeLeadsInTransaction, readHomeJobsInTransaction, readHomeWorkloadInTransaction, canReadHomeWorkload, readHomeActivityInTransaction } from './read';
import { readHomeScheduleInTransaction } from '../calendar/read';
import { synchronizeCalendarRecord } from '../calendar/sync';
import { listHomeIntakeInTransaction, listIntakeItems } from '../lead-capture/intake-store';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const name = `home_${randomUUID().replaceAll('-', '')}_test`, ownerDB = createDatabase(connection), url = new URL(connection);
url.pathname = `/${name}`;
const db = createDatabase(url.toString());
const roleURL = new URL(url); roleURL.searchParams.set('options', '-c role=salesmora_web');
const runtime = createDatabase(roleURL.toString());
const workspaceId = randomUUID(), foreignWorkspace = randomUUID(), owner = randomUUID(), field = randomUUID(), office = randomUUID(), outsider = randomUUID();
const enabled = permissionIds.filter(permission => !permission.startsWith('reports.'));
const identity = (userId = owner) => ({ userId, workspaceId });
let created = false, passed = 0;
async function check(label: string, run: () => Promise<void>) { await run(); passed++; console.log(`PASS ${label}`); }
try {
  await ownerDB.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db);
  await db.transaction(async trx => {
    const now = new Date();
    await trx('users').insert([owner, field, office, outsider].map(id => ({ id, name: id === owner ? 'Owner' : id === field ? 'Field' : 'Other', email: `${id}@example.test`, termsVersion: 'fixture', termsAcceptedAt: now, createdAt: now, updatedAt: now })));
    await trx('workspaces').insert([{ id: workspaceId, ownerId: owner }, { id: foreignWorkspace, ownerId: outsider }].map(row => ({ ...row, businessName: 'Home fixture', businessType: 'test', postalCode: '', serviceRange: '', timezone: 'America/New_York' })));
    await trx('workspaceMemberships').insert([{ workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' }, { workspaceId, userId: office, role: 'office' }, { workspaceId: foreignWorkspace, userId: outsider, role: 'owner' }]);
    await initializeWorkspacePolicy(trx, identity()); await initializeWorkspacePolicy(trx, { userId: outsider, workspaceId: foreignWorkspace });
  });
  const date = '2026-11-15', timezone = 'America/New_York';
  const leads = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  await db('leads').insert(leads.map((id, index) => ({
    id, workspaceId: index === 4 ? foreignWorkspace : workspaceId, createdBy: index === 4 ? outsider : owner,
    submissionId: randomUUID(), submissionHash: 'fixture', name: `Lead ${index}`, email: '', phone: '', service: 'Repair', address: '', details: 'PRIVATE', notes: 'PRIVATE_NOTE',
    stage: index === 3 ? 'won' : 'new', source: 'other', ownerId: index === 2 ? null : field,
    createdAt: ['2026-10-17T03:59:59Z', '2026-10-17T04:00:00Z', '2026-11-15T14:00:00Z', '2026-11-15T15:00:00Z', '2026-11-15T16:00:00Z'][index],
  })));
  await db('leadActivity').whereIn('leadId', leads).update({ createdAt: '2026-10-01T14:00:00Z' });
  const jobs = Array.from({ length: 8 }, () => randomUUID());
  await db('jobs').insert(jobs.map((id, index) => ({
    id, workspaceId, createdBy: owner, title: `Job ${index}`, customerName: 'Customer', service: '', location: '', description: '',
    primaryOwnerId: index === 0 ? field : office, status: index === 6 ? 'completed' : index === 5 ? 'needs-scheduling' : 'waiting',
    completionDeadline: index === 0 ? '2026-11-13' : index === 1 ? '2026-11-14' : null,
    scheduledDate: index === 5 ? null : date, arrivalWindow: index === 2 || index === 5 ? null : '09:00-11:00',
    waitingReason: index === 5 || index === 6 ? null : 'materials',
    updatedAt: new Date(`2026-11-${String(index + 1).padStart(2, '0')}T14:00:00Z`),
  })));
  await db('jobTeamMembers').insert([{ workspaceId, jobId: jobs[0], userId: field }, { workspaceId, jobId: jobs[1], userId: field }]);
  await db.transaction(async trx => { for (const id of jobs) await synchronizeCalendarRecord(trx, workspaceId, 'job', id); });
  await check('business clock and 30 local calendar dates, including DST boundary, exclude other workspaces', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const clock = await homeClock(trx, context); assert.equal(clock.timezone, timezone); assert.match(clock.today, /^\d{4}-\d{2}-\d{2}$/);
      const result = await readHomeLeadsInTransaction(trx, context, date, timezone);
      assert.equal(result.newLeads, 3); assert.deepEqual(result.pipeline, { new: 3, contacted: 0, 'estimate-sent': 0, won: 1, lost: 0 });
      assert.equal(result.unassignedTotal, 1); assert.equal(result.attention[0].id, leads[2]);
    });
  });
  await check('active and attention totals are distinct unions; closed/null deadline ordering stays correct', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const result = await readHomeJobsInTransaction(trx, context, date);
      assert.equal(result.active, 7); assert.equal(result.attention, 7);
      assert.equal(result.jobs.length, 5); assert.equal(result.jobs[0].id, jobs[0]); assert.equal(result.jobs[1].id, jobs[1]);
      assert.equal(result.attentionItems[0].overdue, true);
      assert.equal(result.attentionItems.filter(job => job.completionDeadline === null).every(job => !job.overdue), true);
    });
  });
  await check('Field includes primary and supporting jobs once and no unrelated lead or workload identities', async () => {
    await withWorkspaceAuthorization(runtime, identity(field), enabled, false, async (trx, context) => {
      const result = await readHomeJobsInTransaction(trx, context, date);
      assert.equal(result.active, 2); assert.equal(result.attention, 2);
      const leadResult = await readHomeLeadsInTransaction(trx, context, date, timezone);
      assert.equal(leadResult.unassignedTotal, 0); assert.equal(leadResult.newLeads, 2);
      assert.equal(canReadHomeWorkload(context), false);
      await assert.rejects(readHomeWorkloadInTransaction(trx, context), AuthorizationAccessError);
    });
  });
  await check('workload combines primary/support responsibility without double counting and requires roster authority', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const result = await readHomeWorkloadInTransaction(trx, context);
      assert.equal(result.total, 3); assert.equal(result.items.find(item => item.id === field)?.activeJobs, 2);
      assert.equal(result.items.find(item => item.id === field)?.openLeads, 2);
      assert.equal(result.items[0].id, office);
    });
    await withWorkspaceAuthorization(runtime, identity(), enabled.filter(permission => permission !== 'leads.assign'), false, async (trx, context) => {
      assert.equal(canReadHomeWorkload(context), false);
    });
  });
  await check('schedule counts all distinct visits but renders five, with null windows last and own scope', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const result = await readHomeScheduleInTransaction(trx, context, date);
      assert.equal(result.total, 6); assert.equal(result.visits.length, 5); assert.equal(result.visits.some(visit => visit.arrivalWindow === null), false);
    });
    await withWorkspaceAuthorization(runtime, identity(field), enabled, false, async (trx, context) => {
      const result = await readHomeScheduleInTransaction(trx, context, date);
      assert.equal(result.total, 2); assert.equal(result.visits.every(visit => visit.crew.every(person => person.id === field)), true);
    });
  });
  const sourceId = randomUUID();
  const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'gmail', contactRequired: true,
    fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }],
    workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false } };
  await db.transaction(async trx => {
    await trx('captureSources').insert({ id: sourceId, workspaceId, name: 'Home intake', type: 'gmail', status: 'archived', version: 1, approvedVersion: 1 });
    await trx('captureSourceVersions').insert({ id: randomUUID(), workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(configuration), approvedBy: owner, approvedAt: new Date() });
  });
  const intakeIds = Array.from({ length: 7 }, () => randomUUID());
  for (const [index, id] of intakeIds.entries()) {
    const receiptId = randomUUID(), answers = JSON.stringify({ name: `Incoming ${index}` });
    await db('captureReceipts').insert({ id: receiptId, workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1,
      dedupeKey: id, inputHash: 'a'.repeat(64), admission: 'review', connectionId: randomUUID(), messageId: id,
      evidence: JSON.stringify({ schemaVersion: 1, type: 'gmail', from: 'sender@example.test', subject: 'Fictional request', body: 'Incoming request', fields: [] }),
      originalAnswers: answers, receivedAt: new Date(`2026-11-${String(index + 1).padStart(2, '0')}T14:00:00Z`) });
    await db('intakeItems').insert({ id, workspaceId, sourceId, receiptId, version: 1, definitionVersion: 1, workflowVersion: 1,
      status: index === 6 ? 'approved' : 'awaiting', answers, flags: JSON.stringify(index === 1 || index === 2 ? ['missing'] : []) });
  }
  await check('intake is flagged first then oldest, excludes decisions, and preserves canonical list order', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const result = await listHomeIntakeInTransaction(trx, context);
      assert.equal(result.total, 6); assert.equal(result.flaggedTotal, 2); assert.equal(result.rows.length, 5);
      assert.deepEqual(result.rows.slice(0, 3).map(row => row.id), [intakeIds[1], intakeIds[2], intakeIds[0]]);
    });
    const original = await listIntakeItems(runtime, identity(), enabled, { workspaceId });
    assert.equal(original.rows[0].id, intakeIds[5]);
    await withWorkspaceAuthorization(runtime, identity(), ['intake.read', 'home.access'], false, async (trx, context) => {
      assert.equal((await listHomeIntakeInTransaction(trx, context)).rows.every(row => !row.canReview), true);
    });
  });
  for (let index = 0; index < 6; index++) await db('jobActivity').insert({ id: randomUUID(), workspaceId, jobId: jobs[index],
    actorId: owner, actorName: 'PRIVATE_HISTORICAL_ACTOR', source: 'ui', type: 'status', changes: JSON.stringify({ to: 'waiting', notes: 'PRIVATE_NOTE' }),
    createdAt: new Date(`2026-11-${String(index + 1).padStart(2, '0')}T14:00:00Z`) });
  await db('jobActivity').insert({ id: randomUUID(), workspaceId, jobId: jobs[0], source: 'ui', actorId: owner, actorName: 'Private', type: 'note', changes: JSON.stringify({ body: 'PRIVATE_NOTE' }), createdAt: new Date() });
  await check('native latest-five activity needs record grants, not Reports, omits notes and respects current assignments', async () => {
    await withWorkspaceAuthorization(runtime, identity(), enabled, false, async (trx, context) => {
      const result = await readHomeActivityInTransaction(trx, context);
      assert.equal(result.length, 5); assert.equal(result[0].recordId, jobs[5]);
      assert.equal(JSON.stringify(result).includes('PRIVATE'), false);
    });
    await withWorkspaceAuthorization(runtime, identity(field), enabled, false, async (trx, context) => {
      const result = await readHomeActivityInTransaction(trx, context);
      assert.equal(result.length, 5);
      assert.equal(result.filter(event => event.domain === 'job').length, 2);
      assert.equal(result.every(event => [jobs[0], jobs[1], leads[0], leads[1], leads[3]].some(id => id === event.recordId)), true);
    });
    await assert.rejects(withWorkspaceAuthorization(runtime, identity(outsider), enabled, false, (trx, context) => readHomeJobsInTransaction(trx, context, date)), AuthorizationAccessError);
  });
  await check('revoked collection access denies before data and current unsupported activity errors explicitly', async () => {
    await withWorkspaceAuthorization(runtime, identity(), ['home.access'] satisfies PermissionId[], false, async (trx, context) => {
      await assert.rejects(readHomeLeadsInTransaction(trx, context, date, timezone), AuthorizationAccessError);
      await assert.rejects(readHomeJobsInTransaction(trx, context, date), AuthorizationAccessError);
      await assert.rejects(readHomeActivityInTransaction(trx, context), AuthorizationAccessError);
    });
    await db('jobActivity').insert({ id: randomUUID(), workspaceId, jobId: jobs[0], source: 'ui', actorId: owner, actorName: 'Owner', type: 'unsupported', changes: '{}', createdAt: new Date() });
    await assert.rejects(withWorkspaceAuthorization(runtime, identity(), enabled, false, (trx, context) => readHomeActivityInTransaction(trx, context)));
  });
  console.log(`PASS ${passed} Home data rehearsals under ${process.version}`);
} finally {
  await runtime.destroy(); await db.destroy();
  if (created) await ownerDB.raw('DROP DATABASE ??', [name]);
  await ownerDB.destroy();
}
