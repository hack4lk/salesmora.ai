import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CreateJobInput } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { saveJobNotificationSettings } from '../job-notification-settings/store';
import { createJob, readJob } from './store';
import { readJobCreationDeadline, JobDeadlineReviewConflict } from './deadline';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use the isolated local test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), customerId = randomUUID(), users = { owner: randomUUID(), office: randomUUID(), field: randomUUID() }, enabled = [...permissionIds];
const identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
let revision = '0', passed = 0;
const check = async (label: string, run: () => Promise<void>) => { await run(); console.log('PASS ' + label); passed++; };
async function setting(values: { mode: 'unset' } | { mode: 'relative'; days: number; count: 'business' | 'calendar' }) {
  revision = (await saveJobNotificationSettings(db, identity(), enabled, { workspaceId, section: 'deadline', submissionId: randomUUID(), revision, values })).deadline.revision;
}
async function reviewed(mode: 'workspace' | 'date' | 'unset' = 'workspace'): Promise<CreateJobInput> {
  const { context } = await readJobCreationDeadline(db, identity(), enabled);
  const date = mode === 'workspace' ? context.projectedDate : mode === 'date' ? '2027-05-01' : null;
  return { workspaceId, submissionId: randomUUID(), customerId, title: 'Deadline fixture', primaryOwnerId: users.owner, completionDeadline: date,
    deadlineIntent: mode === 'workspace' ? { mode, revision: context.revision } : mode === 'date' ? { mode, date: date! } : { mode },
    deadlinePreview: { revision: context.revision, createdDate: context.createdDate, resolvedDate: date, timezone: context.timezone } };
}
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Deadline ${role}`, email: `${id}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Deadline fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert(Object.entries(users).map(([role, userId]) => ({ workspaceId, userId, role }))); await initializeWorkspacePolicy(trx, identity());
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Deadline customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('creation preview is scoped to current creators and excludes administrative policy', async () => {
    const preview = await readJobCreationDeadline(db, identity('office'), enabled);
    assert.deepEqual(Object.keys(preview).sort(), ['canOverride', 'context']); assert.equal(preview.context.projectedDate, null);
    await assert.rejects(readJobCreationDeadline(db, identity('field'), enabled), AuthorizationAccessError);
    await assert.rejects(readJobCreationDeadline(db, { ...identity(), workspaceId: randomUUID() }, enabled), AuthorizationAccessError);
  });
  let original: CreateJobInput, jobId: string;
  await check('reviewed defaults persist with matching local creation date and immutable activity evidence', async () => {
    await setting({ mode: 'relative', days: 14, count: 'business' }); original = await reviewed();
    const result = await createJob(db, identity(), enabled, original); jobId = result.jobId;
    assert.equal((await readJob(db, identity(), enabled, jobId)).job.completionDeadline, original.completionDeadline);
    const activity = await db('jobActivity').where({ workspaceId, jobId, type: 'created' }).first(); assert.equal(activity.changes.deadlinePreview.resolvedDate, original.completionDeadline);
    assert.equal(new Date(activity.createdAt).toISOString(), (await readJob(db, identity(), enabled, jobId)).job.createdAt);
    const date = (await db.raw(`SELECT to_char("createdAt" AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS day FROM jobs WHERE id=?`, [jobId])).rows[0].day;
    assert.equal(date, original.deadlinePreview!.createdDate);
  });
  await check('rule changes preserve existing Jobs and exact retries return the original Job', async () => {
    await setting({ mode: 'relative', days: 1, count: 'calendar' });
    assert.equal((await createJob(db, identity(), enabled, original!)).jobId, jobId!);
    assert.equal((await readJob(db, identity(), enabled, jobId!)).job.completionDeadline, original!.completionDeadline);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: jobId!, type: 'created' })).length, 1);
  });
  await check('stale rules, timezone, workspace-local day and forged projections reject without side effects', async () => {
    const valid = await reviewed(), count = (await db('jobs').where({ workspaceId })).length;
    for (const preview of [{ ...valid.deadlinePreview!, revision: '0' }, { ...valid.deadlinePreview!, timezone: 'Pacific/Auckland' }, { ...valid.deadlinePreview!, createdDate: '2026-01-01' }]) {
      await assert.rejects(createJob(db, identity(), enabled, { ...valid, submissionId: randomUUID(), deadlineIntent: { mode: 'workspace', revision: preview.revision }, deadlinePreview: preview }), JobDeadlineReviewConflict);
    }
    const forged = '2027-12-01'; await assert.rejects(createJob(db, identity(), enabled, { ...valid, submissionId: randomUUID(), completionDeadline: forged, deadlinePreview: { ...valid.deadlinePreview!, resolvedDate: forged } }), JobDeadlineReviewConflict);
    assert.equal((await db('jobs').where({ workspaceId })).length, count);
  });
  await check('custom and explicitly unset choices override the default only with scheduling permission', async () => {
    for (const mode of ['date', 'unset'] as const) {
      const input = await reviewed(mode), result = await createJob(db, identity(), enabled, input);
      assert.equal((await readJob(db, identity(), enabled, result.jobId)).job.completionDeadline, input.completionDeadline);
    }
    await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'jobs.schedule.update' }).delete();
    const context = await readJobCreationDeadline(db, identity('office'), enabled); assert.equal(context.canOverride, false);
    await assert.rejects(createJob(db, identity('office'), enabled, await reviewed('unset')), AuthorizationAccessError);
    await assert.rejects(createJob(db, identity('office'), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: 'Legacy bypass denied', primaryOwnerId: users.owner, completionDeadline: null }), AuthorizationAccessError);
    const result = await createJob(db, identity('office'), enabled, await reviewed()); assert.ok(result.jobId);
  });
  await check('unset defaults and legacy explicitly reviewed dates/null remain unchanged', async () => {
    await setting({ mode: 'unset' }); const input = await reviewed(), result = await createJob(db, identity(), enabled, input);
    assert.equal((await readJob(db, identity(), enabled, result.jobId)).job.completionDeadline, null);
    assert.ok((await createJob(db, identity('office'), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: 'Legacy unset default', primaryOwnerId: users.owner, completionDeadline: null })).jobId);
    await setting({ mode: 'relative', days: 20, count: 'calendar' });
    for (const completionDeadline of [null, '2027-01-01']) {
      const result = await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: 'Legacy reviewed deadline', primaryOwnerId: users.owner, completionDeadline });
      assert.equal((await readJob(db, identity(), enabled, result.jobId)).job.completionDeadline, completionDeadline);
    }
  });
  await check('creation and deadline evidence roll back atomically and no reminders are sent', async () => {
    const input = await reviewed(), before = (await db('jobs').where({ workspaceId })).length;
    await assert.rejects(db.transaction(async trx => { await createJob(trx, identity(), enabled, input); throw Error('induced rollback'); }));
    assert.equal((await db('jobs').where({ workspaceId })).length, before); assert.equal((await db('jobOperations').where({ workspaceId, submissionId: input.submissionId })).length, 0);
    assert.equal((await db('visitNotifications').where({ workspaceId })).length, 0);
  });
  console.log(`PASS ${passed} Job deadline activation database journeys`);
} finally { await db('jobs').where({ workspaceId }).delete(); await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy(); }
