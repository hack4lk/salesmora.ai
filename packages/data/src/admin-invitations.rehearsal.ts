import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { verifyAdminAuditChain } from './admin-audit';
import { ADMIN_APP_ROLE } from './runtime-roles';
import {
  ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT,
  ADMIN_INVITATION_LIFETIME_MS,
  AdminInvitationError,
  createBootstrapSuperAdminInvitation,
} from './admin-invitations';
import { invitationTokenHash } from './workspaces/invitation-tokens';

const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) {
  throw Error('Use the isolated local test database.');
}
if (!process.env.DB_ADMIN_APP_PASSWORD) throw Error('Set DB_ADMIN_APP_PASSWORD and run pnpm db:roles:test.');
const adminURL = new URL(ownerURL);
adminURL.username = ADMIN_APP_ROLE;
adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;

const owner = createDatabase(ownerURL);
const admin = createDatabase(adminURL.toString());
const prefix = `admin-bootstrap-${randomUUID()}`;
const testEmails = [
  `${prefix}-one@karpukcreative.com`,
  `${prefix}-two@karpukcreative.com`,
  `${prefix}-three@karpukcreative.com`,
];

try {
  for (const email of ['admin@salesmora.ai', 'admin@karpukcreative.com.example.com', 'admin@@karpukcreative.com']) {
    await assert.rejects(createBootstrapSuperAdminInvitation(admin, { email }), AdminInvitationError);
  }
  await owner.withSchema('admin').table('staffInvitations').whereIn('email', testEmails).delete();
  const issuedAt = new Date();
  const first = await createBootstrapSuperAdminInvitation(admin, { email: testEmails[0], now: issuedAt });
  const stored = await owner.withSchema('admin').table('staffInvitations')
    .where({ email: testEmails[0] }).first('tokenHash', 'expiresAt', 'role', 'invitedBy');
  assert.ok(stored);
  assert.equal(stored.tokenHash, invitationTokenHash(first.token));
  assert.notEqual(stored.tokenHash, first.token);
  assert.equal(stored.role, 'super_admin');
  assert.equal(stored.invitedBy, null);
  assert.equal(new Date(stored.expiresAt).getTime() - issuedAt.getTime(), ADMIN_INVITATION_LIFETIME_MS);
  assert.equal(await owner.withSchema('admin').table('staffUsers').where({ email: testEmails[0] }).first('id'), undefined);
  const bootstrapEvent = await owner.withSchema('admin').table('auditEvents')
    .where({ targetType: 'staff_invitation', targetId: first.id })
    .first('staffUserId', 'staffRole', 'action', 'after');
  assert.equal(bootstrapEvent.staffUserId, null);
  assert.equal(bootstrapEvent.staffRole, 'bootstrap');
  assert.equal(bootstrapEvent.action, 'staff.bootstrap_invitation.created');
  assert.deepEqual(bootstrapEvent.after, {
    role: 'super_admin',
    expiresAt: first.expiresAt.toISOString(),
  });
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);

  await assert.rejects(
    createBootstrapSuperAdminInvitation(admin, { email: testEmails[0], now: issuedAt }),
    AdminInvitationError,
    'an unexpired invitation cannot be duplicated',
  );

  const reissued = await createBootstrapSuperAdminInvitation(admin, {
    email: testEmails[0],
    now: new Date(issuedAt.getTime() + ADMIN_INVITATION_LIFETIME_MS + 1),
  });
  assert.notEqual(reissued.token, first.token, 'an expired link receives a new token');
  assert.equal(reissued.expiresAt.getTime(), issuedAt.getTime() + ADMIN_INVITATION_LIFETIME_MS * 2 + 1);

  await assert.rejects(
    createBootstrapSuperAdminInvitation(admin, { email: 'person@example.com' }),
    AdminInvitationError,
    'non-company emails are rejected',
  );

  const concurrent = await Promise.allSettled([
    createBootstrapSuperAdminInvitation(admin, { email: testEmails[1] }),
    createBootstrapSuperAdminInvitation(admin, { email: testEmails[2] }),
  ]);
  assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(concurrent.filter(result => result.status === 'rejected' &&
    result.reason instanceof AdminInvitationError).length, 1);
  assert.equal(ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT, 2);

  const issuedEmailRows = await owner.withSchema('admin').table('staffInvitations')
    .whereIn('email', testEmails).select('email');
  assert.equal(issuedEmailRows.length, 3);
  await owner.withSchema('admin').table('staffInvitations').whereIn('email', testEmails).delete();

  const inviterId = randomUUID();
  await owner.withSchema('admin').table('staffUsers').insert({
    id: inviterId,
    name: 'Bootstrap rehearsal inviter',
    email: `${prefix}-inviter@karpukcreative.com`,
    emailVerified: true,
    createdAt: issuedAt,
    updatedAt: issuedAt,
  });
  await owner.withSchema('admin').table('staffInvitations').insert({
    id: randomUUID(),
    email: testEmails[0],
    role: 'super_admin',
    tokenHash: randomUUID(),
    invitedBy: inviterId,
    createdAt: issuedAt,
    expiresAt: new Date(issuedAt.getTime() + ADMIN_INVITATION_LIFETIME_MS),
  });
  await createBootstrapSuperAdminInvitation(admin, { email: testEmails[1], now: issuedAt });
  await assert.rejects(
    createBootstrapSuperAdminInvitation(admin, { email: testEmails[2], now: issuedAt }),
    AdminInvitationError,
    'pending Super Admin invitations count toward the bootstrap limit',
  );
  console.log('Admin bootstrap invitation rehearsal passed (6 checks).');
} finally {
  await owner.withSchema('admin').table('staffInvitations').whereIn('email', testEmails).delete();
  await owner.withSchema('admin').table('staffUsers').where({ email: `${prefix}-inviter@karpukcreative.com` }).delete();
  await Promise.all([owner.destroy(), admin.destroy()]);
}
