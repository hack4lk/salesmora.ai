import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { createDatabase } from './database';
import {
  ADMIN_APP_ROLE,
  ADMIN_IDENTITY_TABLES,
  RUNTIME_LOGIN_ROLES,
  applyAdminIdentityGrants,
} from './runtime-roles';

const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) {
  throw Error('Use the isolated local test database.');
}
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  const url = new URL(ownerURL);
  url.username = username;
  url.password = password;
  return url.toString();
};

const owner = createDatabase(ownerURL);
const web = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.web, process.env.DB_WEB_PASSWORD));
const worker = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.worker, process.env.DB_WORKER_PASSWORD));
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
let passed = 0;

async function denied(db: Knex, statement: (trx: Knex.Transaction) => Promise<unknown>, label: string) {
  const trx = await db.transaction();
  try {
    await assert.rejects(statement(trx), (error: { code?: string }) => error.code === '42501', `${label} must be denied`);
  } finally {
    await trx.rollback();
  }
  passed++;
}

try {
  const tables = await owner('pg_tables').where({ schemaname: 'admin' })
    .whereIn('tablename', [...ADMIN_IDENTITY_TABLES]).select<{ tablename: string }[]>('tablename');
  assert.deepEqual(tables.map(row => row.tablename).sort(), [...ADMIN_IDENTITY_TABLES].sort(), 'identity schema has all expected tables');
  passed++;

  {
    const { rows } = await owner.raw<{ rows: { tableName: string; adminDml: boolean; webRead: boolean; workerRead: boolean }[] }>(`
      SELECT name AS "tableName",
        has_table_privilege(?, format('%I.%I', 'admin', name), 'SELECT, INSERT, UPDATE, DELETE') AS "adminDml",
        has_table_privilege(?, format('%I.%I', 'admin', name), 'SELECT') AS "webRead",
        has_table_privilege(?, format('%I.%I', 'admin', name), 'SELECT') AS "workerRead"
      FROM unnest(string_to_array(?, ',')) AS t(name)`,
    [ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.worker, [...ADMIN_IDENTITY_TABLES].join(',')]);
    assert.deepEqual(rows.filter(row => !row.adminDml).map(row => row.tableName), [], 'admin has DML on every identity table');
    assert.deepEqual(rows.filter(row => row.webRead || row.workerRead).map(row => row.tableName), [], 'web and worker cannot read identity tables');
    passed += 2;
  }

  for (const [name, db] of [['web', web], ['worker', worker]] as const) {
    const { rows: [{ canUseSchema }] } = await db.raw<{ rows: { canUseSchema: boolean }[] }>(
      "SELECT has_schema_privilege(current_user, 'admin', 'USAGE') AS \"canUseSchema\"",
    );
    assert.equal(canUseSchema, false, `${name} cannot use the admin schema`);
    passed++;
    await denied(db, trx => trx.withSchema('admin').table('staffUsers').select('id'), `${name} reading staff identities`);
    await denied(db, trx => trx.withSchema('admin').table('auditEvents').select('id'), `${name} reading staff audit events`);
  }

  {
    const trx = await admin.transaction();
    try {
      const id = randomUUID();
      const now = new Date();
      await trx.withSchema('admin').table('staffUsers').insert({
        id,
        name: 'Grant rehearsal',
        email: `grant-rehearsal-${id}@example.test`,
        createdAt: now,
        updatedAt: now,
      });
      await trx.withSchema('admin').table('staffRoleAssignments').insert({
        id: randomUUID(),
        userId: id,
        role: 'support',
        grantedBy: id,
      });
      await trx.withSchema('admin').table('staffInvitations').insert({
        id: randomUUID(),
        email: `invite-${id}@example.test`,
        role: 'support',
        tokenHash: randomUUID(),
        invitedBy: id,
        expiresAt: new Date(now.getTime() + 60_000),
      });
      assert.equal(await trx.withSchema('admin').table('staffUsers').where({ id }).update({ name: 'Grant rehearsal updated' }), 1);
      const user = await trx.withSchema('admin').table('staffUsers').where({ id }).first('id');
      assert.equal(user?.id, id);
      passed++;
    } finally {
      await trx.rollback();
    }
  }

  await denied(admin, trx => trx.raw('CREATE TABLE admin.grants_rehearsal_denied (id int)'), 'admin creating schema objects');
  await denied(admin, trx => trx.raw('ALTER TABLE admin."staffUsers" ADD COLUMN grants_rehearsal text'), 'admin altering identity tables');
  await denied(admin, trx => trx.raw('DROP TABLE admin."staffUsers"'), 'admin dropping identity tables');

  {
    const trx = await owner.transaction();
    try {
      await trx.schema.withSchema('admin').createTable('grants_rehearsal_future', table => table.integer('id'));
      await applyAdminIdentityGrants(trx);
      const { rows: [row] } = await trx.raw<{ rows: { adminRead: boolean; webRead: boolean; workerRead: boolean }[] }>(`
        SELECT
          has_table_privilege(?, 'admin.grants_rehearsal_future', 'SELECT') AS "adminRead",
          has_table_privilege(?, 'admin.grants_rehearsal_future', 'SELECT') AS "webRead",
          has_table_privilege(?, 'admin.grants_rehearsal_future', 'SELECT') AS "workerRead"`,
      [ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.worker]);
      assert.deepEqual(row, { adminRead: false, webRead: false, workerRead: false }, 'unlisted future tables stay denied');
      passed++;
    } finally {
      await trx.rollback();
    }
  }

  console.log(`Admin identity isolation rehearsal passed (${passed} checks).`);
} finally {
  await Promise.all([owner.destroy(), web.destroy(), worker.destroy(), admin.destroy()]);
}
