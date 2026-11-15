import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { verifyPassword } from 'better-auth/crypto';
import { createDatabase } from '@salesmora/data';
import { migrateFreshBaseline } from '@salesmora/data/baseline-runner';
import { seedDemoCrm } from '@salesmora/data/demo/seed-crm';
import { runDemoReset } from '../../../../../scripts/demo-reset-orchestration.mjs';
import { prepareDemoCredentials } from '../../../../../scripts/demo-reset-credentials.mjs';
import { validateDemoResetTarget } from '../../../../../scripts/demo-reset-safety.mjs';
import { demoAccounts, seedDemoAccounts } from './seed-accounts.ts';

const envPath = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--yes') || args.filter(arg => arg === '--yes').length > 1) {
  throw new Error('Usage: pnpm db:reset:demo [--yes]');
}
const env = parseEnv(await readFile(envPath, 'utf8'));
if (process.env.NODE_ENV === 'production') env.NODE_ENV = 'production';
validateDemoResetTarget(env);
const migrationURL = new URL(env.MIGRATION_DATABASE_URL);
const maintenanceURL = new URL(migrationURL);
maintenanceURL.pathname = '/postgres';
const maintenance = createDatabase(maintenanceURL.toString());
let seedTime;
let seeded;
const actions = {
  async preflight(target) {
    await access(fileURLToPath(new URL('../../../../../packages/data/src/baseline-migrations', import.meta.url)));
    if (new URL(env.DATABASE_URL).username !== 'salesmora_web') {
      throw new Error('DATABASE_URL must use the local salesmora_web role.');
    }
    const { rows } = await maintenance.raw(`
      SELECT current_user AS owner, r.rolcreatedb, r.rolsuper,
        (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = ?) AS database_owner,
        (SELECT count(*)::int FROM pg_roles WHERE rolname IN
          ('salesmora_runtime', 'salesmora_web', 'salesmora_worker', 'salesmora_admin_app')) AS roles
      FROM pg_roles r WHERE r.rolname = current_user`, [target.database]);
    const info = rows[0];
    if (!info || info.owner !== 'salesmora' ||
        (info.database_owner !== null && info.database_owner !== 'salesmora') ||
        (!info.rolcreatedb && !info.rolsuper) || info.roles !== 4) {
      throw new Error('The local database owner or required runtime roles are not ready. Run local setup first.');
    }
    if (info.database_owner !== null) {
      const runtime = createDatabase(env.DATABASE_URL);
      try {
        const { rows: identities } = await runtime.raw('SELECT current_user AS role, current_database() AS database');
        if (identities[0].role !== 'salesmora_web' || identities[0].database !== target.database) {
          throw new Error('The configured web role does not connect to the target database.');
        }
      } finally {
        await runtime.destroy();
      }
    }
  },
  async confirm(target) {
    console.log(`This permanently deletes the local ${target.database} database at ${target.host}:${target.port}.`);
    if (args.includes('--yes')) return true;
    if (!stdin.isTTY || !stdout.isTTY) throw new Error('Interactive confirmation is required; use --yes for unattended execution.');
    const prompt = createInterface({ input: stdin, output: stdout });
    try {
      return (await prompt.question('Type "reset salesmora" to continue: ')) === 'reset salesmora';
    } finally {
      prompt.close();
    }
  },
  async prepareCredentials() {
    return prepareDemoCredentials(envPath);
  },
  async assertNoConnections(target) {
    const { rows } = await maintenance.raw(
      'SELECT pid, usename, application_name, state FROM pg_stat_activity WHERE datname = ? ORDER BY pid',
      [target.database],
    );
    if (rows.length) {
      console.error('Stop these database clients before resetting:', rows);
      throw new Error('The development database has active connections.');
    }
  },
  async dropDatabase() {
    await maintenance.raw('DROP DATABASE IF EXISTS ??', ['salesmora']);
  },
  async createDatabase() {
    await maintenance.raw('CREATE DATABASE ?? OWNER ?? TEMPLATE template0', ['salesmora', 'salesmora']);
  },
  async migrate() {
    const db = createDatabase(env.MIGRATION_DATABASE_URL);
    try {
      await migrateFreshBaseline(db);
    } finally {
      await db.destroy();
    }
  },
  async provisionRoles() {
    const db = createDatabase(env.DATABASE_URL);
    try {
      const { rows: [role] } = await db.raw(`SELECT current_user AS name,
        has_table_privilege(current_user, 'public.users', 'SELECT') AS users_access,
        has_table_privilege(current_user, 'public.knex_migrations', 'SELECT') AS migration_access`);
      if (role.name !== 'salesmora_web' || !role.users_access || role.migration_access) {
        throw new Error('The migrated database does not have the expected web role permissions.');
      }
    } finally {
      await db.destroy();
    }
  },
  async seed(_target, credentials) {
    seedTime = new Date();
    const db = createDatabase(env.MIGRATION_DATABASE_URL);
    try {
      seeded = await seedDemoAccounts(db, credentials, seedTime);
      await seedDemoCrm(db, seeded, seedTime);
    } finally {
      await db.destroy();
    }
  },
  async verify(_target, credentials) {
    const db = createDatabase(env.MIGRATION_DATABASE_URL);
    try {
      const ledger = await db('knex_migrations').select('name');
      if (!ledger.some(row => row.name === '202611150001_fresh_baseline.ts')) {
        throw new Error('The baseline migration ledger entry is missing.');
      }
      const accounts = await db('users').join('accounts', 'users.id', 'accounts.userId')
        .whereIn('users.email', demoAccounts.map(account => account.email))
        .select('users.email', 'users.emailVerified', 'accounts.providerId', 'accounts.password');
      assert.equal(accounts.length, demoAccounts.length);
      for (const account of demoAccounts) {
        const row = accounts.find(candidate => candidate.email === account.email);
        if (!row || !row.emailVerified || row.providerId !== 'credential' ||
            !await verifyPassword({ hash: row.password, password: credentials[account.key] })) {
          throw new Error(`Demo account verification failed for ${account.email}.`);
        }
      }
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: seeded.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(seedTime);
      const visit = await db('calendarVisits').where({ workspaceId: seeded.workspaces.main, scheduledDate: today }).first('id');
      if (!visit) throw new Error('The shared workspace has no visit on the seed date.');
      for (const [table, minimum] of [['customers', 16], ['leads', 25], ['jobs', 16], ['workOrders', 16],
        ['materialCatalog', 9], ['estimates', 16], ['estimate_decisions', 6]]) {
        const [{ count }] = await db(table).count('* as count');
        if (Number(count) < minimum) throw new Error(`Demo ${table} verification failed.`);
      }
    } finally {
      await db.destroy();
    }
  },
};

try {
  const result = await runDemoReset(env, actions);
  if (result.status === 'cancelled') console.log('Demo reset cancelled; the database was not changed.');
  else {
    console.log(`Demo reset complete. Seed time: ${seedTime.toISOString()} (workspace timezone: ${seeded.timezone}).`);
    for (const account of demoAccounts) console.log(`${account.email} — ${account.key}`);
    console.log('Passwords are in .env.local. Restart the web app and worker before testing.');
  }
} finally {
  await maintenance.destroy();
}
