import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PermissionId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { AuthorizationAccessError, WorkspaceSuspendedError, initializeWorkspacePolicy, loadWorkspaceAuthorization } from '../authorization/store';
import { assignLead } from '../leads/assign';
import { processAssignmentEmails } from '../notifications/delivery';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { suspendUser, suspendWorkspace, unsuspendUser, unsuspendWorkspace, type SuspensionActor } from './suspension';
import { processWorkspaceSuspensionNotices, type WorkspaceSuspensionNoticeMail } from './suspension-notices';

// Proves a suspended workspace is locked for members, its background email is held (not dropped) and resumes after
// unsuspend, and the Owner notice is still delivered. Customer actions run as the web role, processors as the worker role.
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  return Object.assign(new URL(ownerURL), { username, password }).toString();
};
const owner = createDatabase(ownerURL);
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
const web = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.web, process.env.DB_WEB_PASSWORD));
const worker = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.worker, process.env.DB_WORKER_PASSWORD));

const suffix = randomUUID().slice(0, 8);
const ownerId = `hold-owner-${suffix}`, memberId = `hold-member-${suffix}`;
const workspaceId = randomUUID(), leadId = randomUUID(), submissionId = randomUUID();
const staff: SuspensionActor = { type: 'staff', id: `staff-${suffix}` };
const enabled: PermissionId[] = ['leads.read', 'leads.assign'];
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const outbox = () => owner('assignmentEmailOutbox').where({ id: submissionId }).first('status', 'attempts');
const rejectsWith = async (promise: Promise<unknown>, type: new () => Error) => {
  const error = await promise.then(() => undefined, (error: unknown) => error);
  assert.ok(error instanceof type, `expected ${type.name}, got ${String(error)}`);
  return error;
};

async function seed() {
  const now = new Date();
  await owner('users').insert([ownerId, memberId].map(id => ({ id, name: id, email: `${id}@example.test`, emailVerified: true, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId, businessName: 'Fictional hold workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert([{ workspaceId, userId: ownerId, role: 'owner' }, { workspaceId, userId: memberId, role: 'office' }]);
    await initializeWorkspacePolicy(trx, { userId: ownerId, workspaceId });
  });
  await owner('leads').insert({ id: leadId, workspaceId, submissionId: randomUUID(), submissionHash: 'test', createdBy: ownerId, name: 'Fictional customer', email: 'customer@example.test', phone: '(212) 555-0134', service: 'Repair', address: 'Willow Street', details: '', notes: '', source: 'website', stage: 'new', ownerId: null });
  const lead = await owner('leads').where({ id: leadId }).first('version');
  await assignLead(web, { userId: ownerId, workspaceId }, enabled, { workspaceId, leadId, ownerId: memberId, expectedVersion: lead.version, submissionId });
}

async function cleanup() {
  await owner.transaction(async trx => {
    await trx('workspaceSuspensionNotices').where({ workspaceId }).delete();
    await trx('leads').where({ workspaceId }).delete();
    await trx('workspaceRolePolicies').where({ workspaceId }).delete();
    await trx('workspacePolicies').where({ workspaceId }).delete();
    await trx('workspaceMemberships').where({ workspaceId }).delete();
    await trx('workspaces').where({ id: workspaceId }).delete();
    await trx('users').whereIn('id', [ownerId, memberId]).delete();
  });
}

try {
  await seed();
  await check('an assignment email is queued while the workspace is active', async () => {
    assert.deepEqual(await outbox(), { status: 'queued', attempts: 0 });
  });

  const suspensionReason = 'Fictional suspension review ticket 2481';
  await suspendWorkspace(admin, { workspaceId, reason: suspensionReason, actor: staff });
  await check('members of a suspended workspace get WorkspaceSuspendedError, which is still an access error', async () => {
    const error = await rejectsWith(loadWorkspaceAuthorization(web, { userId: memberId, workspaceId }, enabled), WorkspaceSuspendedError);
    assert.ok(error instanceof AuthorizationAccessError);
    assert.doesNotMatch((error as Error).message, new RegExp(suspensionReason));
  });
  await check('customer writes into a suspended workspace are refused', async () => {
    const lead = await owner('leads').where({ id: leadId }).first('version');
    await rejectsWith(assignLead(web, { userId: ownerId, workspaceId }, enabled, { workspaceId, leadId, ownerId: null, expectedVersion: lead.version, submissionId: randomUUID() }), WorkspaceSuspendedError);
  });
  await check('the worker holds the queued email: not sent, not skipped, no attempt used', async () => {
    let sent = 0;
    const summary = await processAssignmentEmails(worker, enabled, async () => { sent++; });
    assert.equal(sent, 0);
    assert.deepEqual(summary, { sent: 0, skipped: 0, retryPending: 0, failed: 0 });
    assert.deepEqual(await outbox(), { status: 'queued', attempts: 0 });
  });
  await check('the Owner notice is sent while suspended, without the reason, and only once', async () => {
    const mails: WorkspaceSuspensionNoticeMail[] = [];
    assert.equal((await processWorkspaceSuspensionNotices(worker, async mail => { mails.push(mail); })).sent, 1);
    assert.equal(mails.length, 1);
    assert.equal(mails[0]!.to, `${ownerId}@example.test`);
    assert.equal(mails[0]!.workspaceName, 'Fictional hold workspace');
    assert.doesNotMatch(JSON.stringify(mails[0]), new RegExp(suspensionReason));
    assert.equal((await processWorkspaceSuspensionNotices(worker, async mail => { mails.push(mail); })).sent, 0);
    assert.deepEqual(await owner('workspaceSuspensionNotices').where({ workspaceId }).pluck('status'), ['sent']);
  });
  await check('a failed Owner notice is retried with backoff', async () => {
    await unsuspendWorkspace(admin, { workspaceId, reason: 'Rehearsal retry follow-up', actor: staff });
    await suspendWorkspace(admin, { workspaceId, reason: 'Fictional follow-up ticket 2482', actor: staff });
    const summary = await processWorkspaceSuspensionNotices(worker, async () => { throw Error('provider down'); });
    assert.equal(summary.retryPending, 1);
    const notice = await owner('workspaceSuspensionNotices').where({ workspaceId, status: 'queued' }).first('attempts', 'nextAttemptAt');
    assert.equal(notice.attempts, 1);
    assert.ok(new Date(notice.nextAttemptAt).getTime() > Date.now());
  });

  await unsuspendWorkspace(admin, { workspaceId, reason: 'Owner confirmed service restoration', actor: staff });
  await check('after unsuspend the held email is delivered and access returns', async () => {
    await loadWorkspaceAuthorization(web, { userId: memberId, workspaceId }, enabled);
    const sent: string[] = [];
    assert.equal((await processAssignmentEmails(worker, enabled, async mail => { sent.push(mail.to); })).sent, 1);
    assert.deepEqual(sent, [`${memberId}@example.test`]);
    assert.equal((await outbox()).status, 'sent');
  });

  await check('a suspended user is refused in every workspace with a plain access error', async () => {
    await suspendUser(admin, { userId: memberId, reason: 'Fictional user suspension review', actor: staff });
    const error = await rejectsWith(loadWorkspaceAuthorization(web, { userId: memberId, workspaceId }, enabled), AuthorizationAccessError);
    assert.ok(!(error instanceof WorkspaceSuspendedError), 'user suspension must not look like workspace suspension');
    await loadWorkspaceAuthorization(web, { userId: ownerId, workspaceId }, enabled);
    await unsuspendUser(admin, { userId: memberId, reason: 'Resolved support issue', actor: staff });
    await loadWorkspaceAuthorization(web, { userId: memberId, workspaceId }, enabled);
  });
  console.log(`${passed} suspension hold checks passed.`);
} finally {
  await cleanup().catch(error => console.error('Cleanup failed:', error));
  await Promise.all([owner.destroy(), admin.destroy(), web.destroy(), worker.destroy()]);
}
