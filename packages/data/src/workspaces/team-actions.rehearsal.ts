import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeWorkspacePolicy } from '../authorization/store';
import { createDatabase } from '../database';
import type { TeamInvitationEmailInput } from '../email/team-invitation';
import { ADMIN_APP_ROLE } from '../runtime-roles';
import { invitationTokenHash } from './invitation-tokens';
import { removeWorkspaceMember, resendWorkspaceInvitation, revokeWorkspaceInvitation, TeamActionError, type TeamActor } from './team-actions';

// Runs the team use cases as the admin app role and proves its new grants stay narrow.
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
process.env.BILLING_SANDBOX_ENABLED = 'true';
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  return Object.assign(new URL(ownerURL), { username, password }).toString();
};
const owner = createDatabase(ownerURL);
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
const denied = (error: { code?: string }) => error.code === '42501';

const suffix = randomUUID().slice(0, 8);
const users = { owner: `team-owner-${suffix}`, admin: `team-admin-${suffix}`, office: `team-office-${suffix}`, field: `team-field-${suffix}`, unverified: `team-unverified-${suffix}` };
const workspaceId = randomUUID(), unverifiedWorkspaceId = randomUUID(), customerId = randomUUID(), jobId = randomUUID(), workOrderId = randomUUID();
const leadIds = [randomUUID(), randomUUID(), randomUUID()];
const invites = { expired: randomUUID(), queued: randomUUID(), accepted: randomUUID(), adminInvitedByAdmin: randomUUID(), unverifiedOwner: randomUUID() };
const staff: TeamActor = { type: 'staff', id: `staff-${suffix}` };
const appURL = 'https://app.example.test';
const sent: { to: string; input: TeamInvitationEmailInput }[] = [];
const sendEmail = async (to: string, input: TeamInvitationEmailInput) => { sent.push({ to, input }); };
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const staffAudit = (id: string) => owner('authorizationAudit').where({ workspaceId: id, actorId: staff.id }).orderBy('id').select('action', 'beforeRevision', 'afterRevision', 'beforePolicy', 'afterPolicy');
const invitation = (id: string) => owner('workspaceInvitations').where({ id }).first('status', 'tokenHash', 'expiresAt', 'deliveryAttempts', 'lastAttemptAt');
const longAgo = new Date(Date.now() - 3_600_000);

async function seed() {
  const now = new Date();
  await owner('users').insert(Object.values(users).map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now,
    emailVerified: id !== users.unverified })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Fictional team workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert([{ workspaceId, userId: users.owner, role: 'owner' }, { workspaceId, userId: users.admin, role: 'admin' },
      { workspaceId, userId: users.office, role: 'office' }, { workspaceId, userId: users.field, role: 'field' }]);
    await initializeWorkspacePolicy(trx, { userId: users.owner, workspaceId });
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'standard', status: 'active', paidThrough: new Date(Date.now() + 30 * 86_400_000), catalogVersion: 'fixture' });
    await trx('workspaces').insert({ id: unverifiedWorkspaceId, ownerId: users.unverified, businessName: 'Fictional unverified workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId: unverifiedWorkspaceId, userId: users.unverified, role: 'owner' });
    await initializeWorkspacePolicy(trx, { userId: users.unverified, workspaceId: unverifiedWorkspaceId });
  });
  await owner('customers').insert({ id: customerId, workspaceId, name: 'Fictional customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  await owner('leads').insert(leadIds.map((id, index) => ({ id, workspaceId, customerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'fixture', name: `Lead ${index}`,
    service: 'Repair', email: '', phone: '', address: '', details: '', notes: '', source: 'other', stage: 'new',
    ownerId: index < 2 ? users.office : users.field, archivedAt: index === 1 ? now : null })));
  await owner('jobs').insert({ id: jobId, workspaceId, customerName: 'Fictional customer', title: 'Fixture job', service: 'Repair', location: '', description: '', primaryOwnerId: users.office });
  await owner('jobTeamMembers').insert({ workspaceId, jobId, userId: users.office });
  await owner('workOrders').insert({ id: workOrderId, workspaceId, jobId, title: 'Fixture work order', primaryAssigneeId: users.office });
  await owner('workOrderCrew').insert({ workspaceId, workOrderId, userId: users.office });
  const invite = (id: string, ws: string, inviterId: string, role: string, status: string, extra: Record<string, unknown> = {}) =>
    ({ id, workspaceId: ws, email: `${id}@example.test`, role, inviterId, status, tokenHash: invitationTokenHash(`old-${id}`), ...extra });
  await owner('workspaceInvitations').insert([
    invite(invites.expired, workspaceId, users.owner, 'field', 'sent', { expiresAt: longAgo, sentAt: longAgo, lastAttemptAt: longAgo, deliveryAttempts: 1 }),
    invite(invites.queued, workspaceId, users.owner, 'office', 'queued', { lastAttemptAt: longAgo, deliveryAttempts: 1 }),
    invite(invites.accepted, workspaceId, users.owner, 'field', 'accepted', { acceptedAt: now, acceptedBy: users.field }),
    invite(invites.adminInvitedByAdmin, workspaceId, users.admin, 'admin', 'pending_verification'),
    invite(invites.unverifiedOwner, unverifiedWorkspaceId, users.unverified, 'field', 'pending_verification'),
  ]);
}

async function cleanup() {
  // Audit rows are immutable evidence and stay behind, like the other rehearsals.
  await owner.transaction(async trx => {
    for (const id of [workspaceId, unverifiedWorkspaceId]) {
      await trx('leadActivity').where({ workspaceId: id }).delete();
      await trx('leads').where({ workspaceId: id }).delete();
      await trx('workOrderCrew').where({ workspaceId: id }).delete();
      await trx('workOrders').where({ workspaceId: id }).delete();
      await trx('jobTeamMembers').where({ workspaceId: id }).delete();
      await trx('jobs').where({ workspaceId: id }).delete();
      await trx('customers').where({ workspaceId: id }).delete();
      await trx('workspaceInvitations').where({ workspaceId: id }).delete();
      await trx('workspaceSubscriptions').where({ workspaceId: id }).delete();
      await trx('workspaceRolePolicies').where({ workspaceId: id }).delete();
      await trx('workspacePolicies').where({ workspaceId: id }).delete();
      await trx('workspaceMemberships').where({ workspaceId: id }).delete();
      await trx('workspaces').where({ id }).delete();
    }
    await trx('users').whereIn('id', Object.values(users)).delete();
  });
}

try {
  await seed();

  await check('invalid input is refused before any change', async () => {
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId, userId: users.office, reason: '   ', actor: staff }), RangeError);
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId, userId: users.office, reason: 'x', actor: { type: 'staff', id: ' ' } }), TeamActionError);
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId: randomUUID(), userId: users.office, reason: 'x', actor: staff }), /Workspace not found/);
    await assert.rejects(revokeWorkspaceInvitation(admin, { invitationId: randomUUID(), reason: 'x', actor: staff }), /Invitation not found/);
    assert.deepEqual(await staffAudit(workspaceId), []);
  });

  await check('the Owner and non-members cannot be removed', async () => {
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId, userId: users.owner, reason: 'x', actor: staff }), /Transfer ownership first/);
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId, userId: users.unverified, reason: 'x', actor: staff }), /not a member/);
  });

  await check('removing a member unassigns their leads, including archived ones, and clears jobs and work orders', async () => {
    const policy = await owner('workspacePolicies').where({ workspaceId }).first('revision');
    assert.deepEqual(await removeWorkspaceMember(admin, { workspaceId, userId: users.office, reason: '  Left the company  ', actor: staff }), { unassignedLeads: 2 });
    assert.equal(await owner('workspaceMemberships').where({ workspaceId, userId: users.office }).first(), undefined);
    const leads = await owner('leads').whereIn('id', leadIds).orderBy('name').select('ownerId', 'ownerName', 'version');
    assert.deepEqual(leads.map(lead => [lead.ownerId, lead.ownerName]), [[null, null], [null, null], [users.field, users.field]]);
    const activity = await owner('leadActivity').where({ workspaceId, type: 'assigned' }).select('leadId', 'actorId', 'actorName', 'actorType', 'type', 'changes');
    assert.equal(activity.length, 2);
    for (const row of activity) {
      assert.deepEqual([row.actorId, row.actorName, row.actorType, row.type, row.changes.from, row.changes.to], [null, 'SalesMora support', 'system', 'assigned', users.office, null]);
    }
    assert.equal((await owner('jobs').where({ id: jobId }).first('primaryOwnerId')).primaryOwnerId, null);
    assert.equal((await owner('workOrders').where({ id: workOrderId }).first('primaryAssigneeId')).primaryAssigneeId, null);
    assert.equal(await owner('jobTeamMembers').where({ jobId }).first(), undefined);
    assert.equal(await owner('workOrderCrew').where({ workOrderId }).first(), undefined);
    assert.deepEqual(await staffAudit(workspaceId), [{ action: 'member.removed', beforeRevision: policy.revision, afterRevision: policy.revision, beforePolicy: null,
      afterPolicy: { actorType: 'staff', reason: 'Left the company', member: { userId: users.office, role: 'office' }, unassignedLeads: 2 } }]);
  });

  await check('resending needs a free seat and leaves the invitation untouched when refused', async () => {
    // Owner, Admin and Field (3) plus the queued and the waiting Admin invitations (2) fill the Standard plan's 5 seats.
    const before = await invitation(invites.expired);
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'x', actor: staff, appURL, sendEmail }), /no free seat/);
    assert.deepEqual(await invitation(invites.expired), before);
    assert.equal(sent.length, 0);
  });

  await check('revoking an open invitation keeps its link reporting "revoked" and repeating is a no-op', async () => {
    const { tokenHash } = await invitation(invites.queued);
    assert.deepEqual(await revokeWorkspaceInvitation(admin, { invitationId: invites.queued, reason: 'Sent to the wrong person', actor: staff }), { changed: true });
    assert.deepEqual(await invitation(invites.queued).then(row => [row.status, row.tokenHash]), ['revoked', tokenHash]);
    assert.deepEqual(await revokeWorkspaceInvitation(admin, { invitationId: invites.queued, reason: 'Again', actor: staff }), { changed: false });
    assert.deepEqual((await staffAudit(workspaceId)).at(-1)?.afterPolicy, { actorType: 'staff', reason: 'Sent to the wrong person', invitation: { id: invites.queued, role: 'office', previousStatus: 'queued' } });
    assert.equal((await staffAudit(workspaceId)).length, 2);
  });

  await check('accepted invitations cannot be revoked or resent, and revoked ones cannot be resent', async () => {
    await assert.rejects(revokeWorkspaceInvitation(admin, { invitationId: invites.accepted, reason: 'x', actor: staff }), /Remove the member instead/);
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.accepted, reason: 'x', actor: staff, appURL, sendEmail }), /already accepted/);
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.queued, reason: 'x', actor: staff, appURL, sendEmail }), /already revoked/);
  });

  await check('a failed send changes nothing, so the previous link keeps working', async () => {
    const before = await invitation(invites.expired);
    const failing = async () => { throw new Error('SMTP down'); };
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'x', actor: staff, appURL, sendEmail: failing }), /SMTP down/);
    assert.deepEqual(await invitation(invites.expired), before);
    assert.equal((await staffAudit(workspaceId)).length, 2);
  });

  await check('an expired invitation is resent with a new seven-day link and the old link stops working', async () => {
    const before = await invitation(invites.expired);
    const { expiresAt } = await resendWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'Customer asked again', actor: staff, appURL, sendEmail });
    assert.equal(sent.length, 1);
    const [{ to, input }] = sent;
    assert.equal(to, `${invites.expired}@example.test`);
    assert.deepEqual({ ...input, url: undefined }, { url: undefined, inviterName: users.owner, workspaceName: 'Fictional team workspace', role: 'field' });
    const url = new URL(input.url);
    assert.equal(url.origin + url.pathname, `${appURL}/accept-invitation`);
    const after = await invitation(invites.expired);
    assert.equal(after.status, 'sent');
    assert.equal(after.tokenHash, invitationTokenHash(url.searchParams.get('token')!));
    assert.notEqual(after.tokenHash, before.tokenHash);
    assert.equal(after.deliveryAttempts, before.deliveryAttempts + 1);
    assert.ok(Math.abs(new Date(after.expiresAt).getTime() - (Date.now() + 7 * 86_400_000)) < 60_000);
    assert.equal(new Date(after.expiresAt).getTime(), expiresAt.getTime());
    assert.deepEqual((await staffAudit(workspaceId)).at(-1)?.afterPolicy, { actorType: 'staff', reason: 'Customer asked again', invitation: { id: invites.expired, role: 'field', previousStatus: 'sent' } });
  });

  await check('a queued delivery write rolls back with a failed invitation transaction', async () => {
    await owner('workspaceInvitations').where({ id: invites.expired }).update({ lastAttemptAt: longAgo });
    const before = await invitation(invites.expired);
    const auditBefore = await staffAudit(workspaceId);
    const outboxBefore = await admin.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ invitationId: invites.expired }).count<{ count: string }[]>('* as count');
    await assert.rejects(resendWorkspaceInvitation(admin, {
      invitationId: invites.expired,
      reason: 'Queue rollback rehearsal',
      actor: staff,
      appURL,
      queueEmail: async (trx, delivery) => {
        await trx.withSchema('admin').table('workspaceInvitationDeliveries').insert({
          id: randomUUID(),
          invitationId: delivery.invitationId,
          tokenHash: delivery.tokenHash,
          encryptedPayload: 'encrypted-rehearsal-payload',
          status: 'pending',
          attempts: 0,
          createdAt: new Date(),
        });
        throw new Error('Queue transaction must roll back.');
      },
    }), /Queue transaction must roll back/);
    assert.deepEqual(await invitation(invites.expired), before);
    assert.deepEqual(await staffAudit(workspaceId), auditBefore);
    assert.deepEqual(
      await admin.withSchema('admin').table('workspaceInvitationDeliveries')
        .where({ invitationId: invites.expired }).count<{ count: string }[]>('* as count'),
      outboxBefore,
    );
  });

  await check('queued invitation delivery uses the transaction and returns its outbox ID', async () => {
    await owner('workspaceInvitations').where({ id: invites.expired }).update({ lastAttemptAt: longAgo });
    let deliveryId: string | undefined;
    const before = await invitation(invites.expired);
    const result = await resendWorkspaceInvitation(admin, {
      invitationId: invites.expired,
      reason: 'Queue delivery rehearsal',
      actor: staff,
      appURL,
      queueEmail: async (trx, delivery) => {
        const id = randomUUID();
        deliveryId = id;
        await trx.withSchema('admin').table('workspaceInvitationDeliveries').insert({
          id,
          invitationId: delivery.invitationId,
          tokenHash: delivery.tokenHash,
          encryptedPayload: 'encrypted-rehearsal-payload',
          status: 'pending',
          attempts: 0,
          createdAt: new Date(),
        });
        return id;
      },
    });
    assert.equal(result.deliveryId, deliveryId);
    assert.equal(sent.length, 1);
    const after = await invitation(invites.expired);
    assert.notEqual(after.tokenHash, before.tokenHash);
    assert.equal(after.status, 'sent');
    const delivery = await admin.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ id: deliveryId }).first<{ invitationId: string; tokenHash: string; status: string; attempts: number }>(
        'invitationId', 'tokenHash', 'status', 'attempts',
      );
    assert.deepEqual(delivery, {
      invitationId: invites.expired,
      tokenHash: after.tokenHash,
      status: 'pending',
      attempts: 0,
    });
  });

  await check('resending again within a minute is refused', async () => {
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'x', actor: staff, appURL, sendEmail }), /less than a minute ago/);
  });

  await check('the inviter must still be allowed to invite the role, and the Owner must be verified', async () => {
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.adminInvitedByAdmin, reason: 'x', actor: staff, appURL, sendEmail }), /can no longer invite this role/);
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.unverifiedOwner, reason: 'x', actor: staff, appURL, sendEmail }), /verify their email/);
    assert.equal(sent.length, 1);
  });

  await check('suspended workspaces can lose members and invitations but not resend; deleting workspaces refuse all', async () => {
    await owner('workspaceInvitations').where({ id: invites.expired }).update({ lastAttemptAt: longAgo });
    await owner('workspaces').where({ id: workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'Rehearsal' });
    await assert.rejects(resendWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'x', actor: staff, appURL, sendEmail }), /suspended/);
    assert.deepEqual(await revokeWorkspaceInvitation(admin, { invitationId: invites.adminInvitedByAdmin, reason: 'Suspended account clean-up', actor: staff }), { changed: true });
    await owner('workspaces').where({ id: workspaceId }).update({ suspendedAt: null, suspendedReason: null, deletionRequestedAt: new Date() });
    await assert.rejects(removeWorkspaceMember(admin, { workspaceId, userId: users.field, reason: 'x', actor: staff }), /being deleted/);
    await assert.rejects(revokeWorkspaceInvitation(admin, { invitationId: invites.expired, reason: 'x', actor: staff }), /being deleted/);
    await owner('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });

  await check('the admin app can change only the granted columns', async () => {
    await assert.rejects(admin('workspaceInvitations').where({ id: invites.expired }).update({ email: 'forged@example.test' }), denied);
    await assert.rejects(admin('workspaceInvitations').insert({ id: randomUUID(), workspaceId, email: 'forged@example.test', role: 'field', status: 'queued' }), denied);
    await assert.rejects(admin('workspaceMemberships').insert({ workspaceId, userId: users.unverified, role: 'field' }), denied);
    await assert.rejects(admin('leads').where({ id: leadIds[2] }).update({ name: 'Forged' }), denied);
    await assert.rejects(admin.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ invitationId: invites.expired }).delete(), denied);
    await assert.rejects(admin('authorizationAudit').where({ workspaceId }).delete(), denied);
  });

  await check('audit rows cannot be changed or deleted', async () => {
    await assert.rejects(owner('authorizationAudit').where({ workspaceId, actorId: staff.id }).delete(), /immutable/);
    await assert.rejects(owner('authorizationAudit').where({ workspaceId, actorId: staff.id }).update({ action: 'edited' }), /immutable/);
  });

  console.log(`Team actions rehearsal passed: ${passed} checks.`);
} finally {
  await cleanup().catch(error => console.error('Cleanup failed:', error.message));
  await Promise.all([owner, admin].map(db => db.destroy()));
}
