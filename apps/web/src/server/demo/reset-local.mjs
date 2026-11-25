import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { verifyPassword } from 'better-auth/crypto';
import { createDatabase } from '@salesmora/data';
import { migrateFreshBaseline } from '@salesmora/data/baseline-runner';
import { seedDemoCrm } from '@salesmora/data/demo/seed-crm';
import { runDemoReset } from '../../../../../scripts/demo-reset-orchestration.mjs';
import { dropVerifiedDatabase } from '../../../../../scripts/demo-reset-drop.mjs';
import { prepareDemoCredentials } from '../../../../../scripts/demo-reset-credentials.mjs';
import { assertCompleteMigrationLedger, validateDemoResetTarget } from '../../../../../scripts/demo-reset-safety.mjs';
import { readWorkflowSnapshot, writeWorkflowSnapshot } from '../../../../../scripts/demo-reset-workflow-snapshot.mjs';
import { demoAccounts, seedDemoAccounts } from './seed-accounts.ts';
import { collectDemoWorkflows, emptyDemoWorkflows, restoreDemoWorkflows, sameDemoWorkflowSnapshot, verifyDemoWorkflows } from './workflow-preservation.mjs';

const envPath = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
const migrationDirectory = fileURLToPath(new URL('../../../../../packages/data/src/baseline-migrations', import.meta.url));
const args = process.argv.slice(2);
const recoveryArgs = args.filter(arg => arg.startsWith('--workflow-snapshot='));
if (args.some(arg => arg !== '--yes' && !arg.startsWith('--workflow-snapshot=')) ||
    args.filter(arg => arg === '--yes').length > 1 || recoveryArgs.length > 1 ||
    (recoveryArgs.length && !recoveryArgs[0].slice('--workflow-snapshot='.length))) {
  throw new Error('Usage: pnpm db:reset:demo [--yes] [--workflow-snapshot=/absolute/path]');
}
const recoveryPath = recoveryArgs[0]?.slice('--workflow-snapshot='.length);
const env = parseEnv(await readFile(envPath, 'utf8'));
if (process.env.NODE_ENV === 'production') env.NODE_ENV = 'production';
validateDemoResetTarget(env);
const migrationURL = new URL(env.MIGRATION_DATABASE_URL);
const maintenanceURL = new URL(migrationURL);
maintenanceURL.pathname = '/postgres';
const maintenance = createDatabase(maintenanceURL.toString());
let seedTime;
let seeded;
let databaseExists = false;

async function collectCurrentWorkflows() {
  const owner = createDatabase(env.MIGRATION_DATABASE_URL);
  try {
    return await owner.transaction(async trx => {
      await trx.raw('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      return collectDemoWorkflows(trx, demoAccounts);
    });
  } finally {
    await owner.destroy();
  }
}

async function seedTarget(db, credentials, now, snapshot) {
  const context = await seedDemoAccounts(db, credentials, now, undefined, snapshot);
  await seedDemoCrm(db, context, now);
  await restoreDemoWorkflows(db, snapshot);
  return context;
}

async function verifyTarget(db, credentials, now, context, snapshot) {
  const ledger = await db('knex_migrations').select('name');
  assertCompleteMigrationLedger(ledger, await readdir(migrationDirectory));
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
    timeZone: context.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  const visit = await db('calendarVisits').where({ workspaceId: context.workspaces.main, scheduledDate: today }).first('id');
  if (!visit) throw new Error('The shared workspace has no visit on the seed date.');
  for (const [table, minimum] of [['customers', 16], ['leads', 25], ['jobs', 16], ['workOrders', 16],
    ['materialCatalog', 9], ['estimates', 16], ['estimate_decisions', 6]]) {
    const [{ count }] = await db(table).count('* as count');
    if (Number(count) < minimum) throw new Error(`Demo ${table} verification failed.`);
  }
  await verifyDemoWorkflows(db, snapshot);
}
const actions = {
  async preflight(target) {
    await access(migrationDirectory);
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
    databaseExists = info.database_owner !== null;
    if (databaseExists) {
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
  async captureWorkflows() {
    const current = databaseExists ? await collectCurrentWorkflows() : emptyDemoWorkflows();
    if (recoveryPath && current.workflows.length) {
      throw new Error('A recovery snapshot cannot replace workflows in the current database; inspect them first.');
    }
    const path = recoveryPath ?? writeWorkflowSnapshot(current);
    const snapshot = readWorkflowSnapshot(path);
    console.log(`Private workflow recovery snapshot: ${path}`);
    return snapshot;
  },
  async rehearseWorkflows(_target, credentials, snapshot) {
    const name = `demo_workflow_rehearsal_${randomUUID().replaceAll('-', '')}_test`;
    const url = new URL(env.MIGRATION_DATABASE_URL);
    url.pathname = `/${name}`;
    const db = createDatabase(url.toString());
    let created = false;
    try {
      await maintenance.raw('CREATE DATABASE ?? OWNER ?? TEMPLATE template0', [name, 'salesmora']);
      created = true;
      await migrateFreshBaseline(db);
      const now = new Date();
      const context = await seedTarget(db, credentials, now, snapshot);
      await verifyTarget(db, credentials, now, context, snapshot);
    } finally {
      await db.destroy();
      if (created) await maintenance.raw('DROP DATABASE ??', [name]);
    }
  },
  async dropDatabase(target, snapshot) {
    if (!databaseExists) return;
    const owner = createDatabase(env.MIGRATION_DATABASE_URL);
    await dropVerifiedDatabase(maintenance, owner, target.database, async trx => {
      const current = await collectDemoWorkflows(trx, demoAccounts);
      if (recoveryPath ? current.workflows.length > 0 : !sameDemoWorkflowSnapshot(current, snapshot)) {
        throw new Error('Workflow data changed after the recovery snapshot; reset stopped.');
      }
    });
    databaseExists = false;
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
  async seed(_target, credentials, snapshot) {
    seedTime = new Date();
    const db = createDatabase(env.MIGRATION_DATABASE_URL);
    try {
      seeded = await seedTarget(db, credentials, seedTime, snapshot);
    } finally {
      await db.destroy();
    }
  },
  async verify(_target, credentials, snapshot) {
    const db = createDatabase(env.MIGRATION_DATABASE_URL);
    try {
      await verifyTarget(db, credentials, seedTime, seeded, snapshot);
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
