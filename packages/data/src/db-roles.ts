import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createDatabase } from './database';
import {
  ADMIN_APP_ROLE,
  AUDIT_WORKER_ROLE,
  AUDIT_VERIFIER_ROLE,
  RUNTIME_GROUP,
  RUNTIME_LOGIN_ROLES,
  applyAdminAuditGrants,
  applyAdminIdentityGrants,
  applyAdminRuntimeFeatureFlagGrants,
  applyAdminRuntimeSettingsGrants,
  applyRuntimeGrants,
  applyAuditWorkerGrants,
} from './runtime-roles';

// Provisions the least-privilege database roles (admin console plan §5.2). Run as the
// schema owner: `pnpm db:roles` (development/deployment) or `pnpm db:roles --test`.
const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (process.env.NODE_ENV !== 'production' && existsSync(envFile)) process.loadEnvFile(envFile);
const isTest = process.argv.includes('--test');
const connection = isTest ? process.env.TEST_DATABASE_URL : process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connection) throw Error('Missing owner database URL. Set MIGRATION_DATABASE_URL or run pnpm db:setup.');
if (isTest && !new URL(connection).pathname.endsWith('_test')) throw Error('Test roles require a database ending in _test.');

const loginRoles = [
  { name: RUNTIME_LOGIN_ROLES.web, password: process.env.DB_WEB_PASSWORD, runtime: true },
  { name: RUNTIME_LOGIN_ROLES.worker, password: process.env.DB_WORKER_PASSWORD, runtime: true },
  { name: ADMIN_APP_ROLE, password: process.env.DB_ADMIN_APP_PASSWORD, runtime: false },
  { name: AUDIT_WORKER_ROLE, password: process.env.DB_AUDIT_WORKER_PASSWORD, runtime: false },
  { name: AUDIT_VERIFIER_ROLE, password: process.env.DB_AUDIT_VERIFIER_PASSWORD, runtime: false },
];
const quote = (identifier: string) => pg.escapeIdentifier(identifier);

// Role DDL goes through pg directly: Knex rewrites "?" in raw SQL, which could corrupt a password.
const client = new pg.Client({ connectionString: connection });
const db = createDatabase(connection);
await client.connect();
try {
  const { rows: [{ owner, database }] } = await client.query<{ owner: string; database: string }>('SELECT current_user AS owner, current_database() AS database');
  if (loginRoles.some(role => role.name === owner)) throw Error('Connect with the schema owner, not a runtime role.');
  const exists = async (name: string) => Boolean((await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [name])).rowCount);
  // Roles are cluster-wide, so the test database reuses the roles created for development.
  if (!await exists(RUNTIME_GROUP)) await client.query(`CREATE ROLE ${quote(RUNTIME_GROUP)} NOLOGIN`);
  for (const role of loginRoles) {
    if (!role.password) {
      console.warn(`Skipped ${role.name}: password variable is not set.`);
      continue;
    }
    if (role.password.length < 24) throw Error(`${role.name} password must be at least 24 characters.`);
    // Role DDL cannot use bind parameters; the password is escaped and never logged.
    const inherit = role.runtime ? 'INHERIT' : 'NOINHERIT';
    const options = `LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS ${inherit} PASSWORD ${pg.escapeLiteral(role.password)}`;
    await client.query(`${await exists(role.name) ? 'ALTER' : 'CREATE'} ROLE ${quote(role.name)} ${options}`);
    if (role.runtime) await client.query(`GRANT ${quote(RUNTIME_GROUP)} TO ${quote(role.name)}`);
    await client.query(`GRANT CONNECT ON DATABASE ${quote(database)} TO ${quote(role.name)}`);
    console.log(`Provisioned ${role.name}.`);
  }
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
  await applyAdminRuntimeFeatureFlagGrants(db);
  await applyAdminRuntimeSettingsGrants(db);
  await applyAdminAuditGrants(db);
  await applyAuditWorkerGrants(db);
  console.log(`Database roles ready (${isTest ? 'test' : process.env.NODE_ENV === 'production' ? 'deployment' : 'development'}).`);
} finally {
  await client.end();
  await db.destroy();
}
