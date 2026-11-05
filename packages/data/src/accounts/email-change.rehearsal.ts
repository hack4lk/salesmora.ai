import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { adminEmailChangeTokenHash } from '../admin-email-change-signature';
import { RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { completeAdminEmailChange, EmailChangeCompletionError } from './email-change';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const webURL = new URL(ownerURL);
webURL.username = RUNTIME_LOGIN_ROLES.web;
webURL.password = process.env.DB_WEB_PASSWORD ?? '';
if (!webURL.password) throw Error(`Set the ${RUNTIME_LOGIN_ROLES.web} password and run pnpm db:roles:test.`);
const owner = createDatabase(ownerURL);
const web = createDatabase(webURL.href);
const suffix = randomUUID();
const now = new Date();
const userId = `email-change-${suffix}`;
const otherUserId = `email-change-other-${suffix}`;
const deletingUserId = `email-change-deleting-${suffix}`;
const staleUserId = `email-change-stale-${suffix}`;
const collisionUserId = `email-change-collision-${suffix}`;
const expiredUserId = `email-change-expired-${suffix}`;
const requestedBy = `staff-${suffix}`;
const token = () => randomBytes(32).toString('base64url');
const tokens = {
  normal: token(),
  expired: token(),
  deleting: token(),
  stale: token(),
  collision: token(),
};
const emails = {
  current: `${suffix}@old.example.test`,
  new: `${suffix}@new.example.test`,
  other: `other-${suffix}@example.test`,
  deleting: `deleting-${suffix}@example.test`,
  stale: `stale-${suffix}@old.example.test`,
  collision: `collision-${suffix}@old.example.test`,
};
const denied = (error: { code?: string }) => error.code === '42501';

async function seed() {
  await owner('users').insert([
    { id: userId, email: emails.current, emailVerified: false, deletionRequestedAt: null },
    { id: otherUserId, email: emails.other, emailVerified: true, deletionRequestedAt: null },
    { id: deletingUserId, email: emails.deleting, emailVerified: true, deletionRequestedAt: now },
    { id: staleUserId, email: emails.stale, emailVerified: true, deletionRequestedAt: null },
    { id: collisionUserId, email: emails.collision, emailVerified: true, deletionRequestedAt: null },
    { id: expiredUserId, email: `expired-${suffix}@old.example.test`, emailVerified: true, deletionRequestedAt: null },
  ].map(user => ({
    ...user, name: user.id, createdAt: now, updatedAt: now, termsVersion: 'rehearsal', termsAcceptedAt: now,
  })));
  await owner('sessions').insert([
    userId, userId,
  ].map(id => ({
    id: `${id}-session-${randomUUID()}`, userId: id, token: randomUUID(),
    expiresAt: new Date(Date.now() + 3_600_000), createdAt: now, updatedAt: now,
  })));
}

async function addRequest(input: {
  token: string;
  targetUserId: string;
  oldEmail: string;
  newEmail: string;
  expiresAt?: Date;
}) {
  const id = randomUUID();
  await owner.withSchema('admin').table('userEmailChanges').insert({
    id,
    tokenHash: adminEmailChangeTokenHash(input.token),
    userId: input.targetUserId,
    oldEmail: input.oldEmail,
    newEmail: input.newEmail,
    reason: 'Customer requested an email change',
    requestedBy,
    staffRole: 'super_admin',
    requestId: id,
    createdAt: now,
    expiresAt: input.expiresAt ?? new Date(Date.now() + 3_600_000),
  });
  return id;
}

async function cleanup() {
  await owner.withSchema('admin').table('userEmailChanges')
    .whereIn('userId', [userId, deletingUserId, staleUserId, collisionUserId, expiredUserId]).delete();
  await owner('users').whereIn('id', [userId, otherUserId, deletingUserId, staleUserId, collisionUserId, expiredUserId]).delete();
}

try {
  await seed();
  const normalRequestId = await addRequest({
    token: tokens.normal, targetUserId: userId, oldEmail: emails.current, newEmail: emails.new,
  });
  await addRequest({
    token: tokens.expired, targetUserId: expiredUserId,
    oldEmail: `expired-${suffix}@old.example.test`, newEmail: `expired-${suffix}@new.example.test`,
    expiresAt: new Date(Date.now() - 1),
  });
  await addRequest({
    token: tokens.deleting, targetUserId: deletingUserId, oldEmail: emails.deleting, newEmail: `new-${emails.deleting}`,
  });
  await addRequest({
    token: tokens.stale, targetUserId: staleUserId, oldEmail: `before-${emails.stale}`, newEmail: `new-${emails.stale}`,
  });
  await addRequest({
    token: tokens.collision, targetUserId: collisionUserId, oldEmail: emails.collision, newEmail: emails.other,
  });

  await assert.rejects(web.withSchema('admin').table('userEmailChanges').select('id').limit(1), denied);
  await assert.rejects(web('accountAudit').select('id').limit(1), denied);
  await assert.rejects(web('users').where({ id: userId }).update({ email: `direct-${emails.new}` }), denied);
  await assert.rejects(completeAdminEmailChange(web, 'x'), (error: unknown) =>
    error instanceof EmailChangeCompletionError && error.status === 400);

  const expiredBeforeAccountMutation = await completeAdminEmailChange(web, tokens.expired).then(
    () => false,
    (error: unknown) => error instanceof EmailChangeCompletionError && error.status === 410,
  );
  assert.equal(expiredBeforeAccountMutation, true);
  await assert.rejects(completeAdminEmailChange(web, tokens.deleting), (error: unknown) =>
    error instanceof EmailChangeCompletionError && error.status === 409);
  await owner('users').where({ id: staleUserId }).update({ email: `changed-${emails.stale}` });
  await assert.rejects(completeAdminEmailChange(web, tokens.stale), (error: unknown) =>
    error instanceof EmailChangeCompletionError && error.status === 409);
  await assert.rejects(completeAdminEmailChange(web, tokens.collision), (error: unknown) =>
    error instanceof EmailChangeCompletionError && error.status === 409);
  assert.equal((await owner('users').where({ id: userId }).first('email')).email, emails.current);

  await owner.raw(`CREATE FUNCTION public.email_change_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."userId" = '${userId}' AND NEW.action = 'email.changed' THEN
        RAISE EXCEPTION 'Rehearsal email-change account-audit failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw('CREATE TRIGGER email_change_rehearsal_failure BEFORE INSERT ON public."accountAudit" FOR EACH ROW EXECUTE FUNCTION public.email_change_rehearsal_failure()');
  try {
    await assert.rejects(completeAdminEmailChange(web, tokens.normal), /Rehearsal email-change account-audit failure/);
  } finally {
    await owner.raw('DROP TRIGGER email_change_rehearsal_failure ON public."accountAudit"');
    await owner.raw('DROP FUNCTION public.email_change_rehearsal_failure()');
  }
  assert.equal((await owner('users').where({ id: userId }).first('email')).email, emails.current);
  assert.equal(Number((await owner('sessions').where({ userId }).count<{ count: string }[]>('* as count'))[0].count), 2);
  assert.equal((await owner.withSchema('admin').table('userEmailChanges').where({ id: normalRequestId }).first('consumedAt')).consumedAt, null);
  assert.equal(Number((await owner('accountAudit').where({ userId, action: 'email.changed' }).count<{ count: string }[]>('* as count'))[0].count), 0);

  const results = await Promise.allSettled([
    completeAdminEmailChange(web, tokens.normal),
    completeAdminEmailChange(web, tokens.normal),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1, 'a one-use email token can complete only once');
  const failure = results.find(result => result.status === 'rejected');
  assert.ok(failure?.status === 'rejected' && failure.reason instanceof EmailChangeCompletionError);
  const updated = await owner('users').where({ id: userId }).first<{ email: string; emailVerified: boolean }>('email', 'emailVerified');
  assert.equal(updated?.email, emails.new);
  assert.equal(updated?.emailVerified, true);
  assert.equal(Number((await owner('sessions').where({ userId }).count<{ count: string }[]>('* as count'))[0].count), 0);
  const audit = await owner('accountAudit').where({ userId, action: 'email.changed' })
    .first<{ actorType: string; actorId: string; reason: string; details: Record<string, unknown> }>(
      'actorType', 'actorId', 'reason', 'details',
    );
  assert.deepEqual(audit, {
    actorType: 'staff',
    actorId: requestedBy,
    reason: 'Customer requested an email change',
    details: { sessionsRevoked: 2 },
  });
  assert.equal((await owner.withSchema('admin').table('userEmailChanges').where({ id: normalRequestId }).first('completedAt')).completedAt instanceof Date, true);
  await assert.rejects(completeAdminEmailChange(web, tokens.normal), (error: unknown) =>
    error instanceof EmailChangeCompletionError && error.status === 409);
  console.log('PASS isolated email-change completion, token expiry/replay, eligibility, unique email, role boundary, and atomic account/session/audit updates');
} finally {
  await cleanup();
  await Promise.all([owner.destroy(), web.destroy()]);
}
