import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { appendAdminAuditEvent, verifyAdminAuditChain } from './admin-audit';
import { ADMIN_APP_ROLE } from './runtime-roles';

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

try {
  const initialChain = await verifyAdminAuditChain(owner);
  assert.equal(initialChain.valid, true);
  if (!initialChain.valid) throw Error('Cannot append to a broken audit chain.');

  const firstEvent = await admin.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: randomUUID(),
    staffRole: 'super_admin',
    action: 'audit.rehearsal.created',
    targetType: 'audit_rehearsal',
    targetId: randomUUID(),
    after: { nested: { z: 1, a: true }, outcome: 'created' },
  }));
  const concurrentEvents = await Promise.all(Array.from({ length: 2 }, (_, index) =>
    admin.transaction(trx => appendAdminAuditEvent(trx, {
      staffUserId: randomUUID(),
      staffRole: 'support',
      action: 'audit.rehearsal.concurrent',
      targetType: 'audit_rehearsal',
      targetId: `${firstEvent.id}-${index}`,
    }))));
  assert.equal(concurrentEvents.length, 2);
  const validChain = await verifyAdminAuditChain(owner);
  assert.equal(validChain.valid, true, 'concurrent writers preserve a single ordered chain');
  if (!validChain.valid) throw Error('Audit hash chain verification failed.');
  assert.equal(validChain.checked, initialChain.checked + 3);

  const privileges = await owner.raw<{
    rows: { canSelectInsert: boolean; canUpdate: boolean; canDelete: boolean }[];
  }>(`
    SELECT
      has_table_privilege(?, 'admin."auditEvents"', 'SELECT, INSERT') AS "canSelectInsert",
      has_table_privilege(?, 'admin."auditEvents"', 'UPDATE') AS "canUpdate",
      has_table_privilege(?, 'admin."auditEvents"', 'DELETE') AS "canDelete"`,
  [ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE]);
  assert.deepEqual(privileges.rows[0], {
    canSelectInsert: true,
    canUpdate: false,
    canDelete: false,
  });

  await assert.rejects(
    admin.withSchema('admin').table('auditEvents').where({ id: firstEvent.id }).update({ action: 'audit.rehearsal.tampered' }),
    (error: { code?: string }) => error.code === '42501',
  );
  await assert.rejects(
    admin.withSchema('admin').table('auditEvents').where({ id: firstEvent.id }).delete(),
    (error: { code?: string }) => error.code === '42501',
  );

  const firstStored = await owner.withSchema('admin').table('auditEvents')
    .where({ id: firstEvent.id }).first('sequence', 'action');
  await owner.withSchema('admin').table('auditEvents')
    .where({ id: firstEvent.id }).update({ action: 'audit.rehearsal.tampered' });
  const tamperedChain = await verifyAdminAuditChain(owner);
  assert.equal(tamperedChain.valid, false);
  if (tamperedChain.valid) throw Error('A modified audit event was not detected.');
  assert.equal(tamperedChain.brokenSequence, String(firstStored.sequence));
  await owner.withSchema('admin').table('auditEvents')
    .where({ id: firstEvent.id }).update({ action: firstStored.action });
  assert.equal((await verifyAdminAuditChain(owner)).valid, true, 'restoring the event restores the verified chain');

  console.log('Admin audit rehearsal passed (6 checks).');
} finally {
  await Promise.all([owner.destroy(), admin.destroy()]);
}
