import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { createDatabase } from './database';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES, STAFF_ONLY_TABLES, databaseRoleProblems, readDatabaseRoleFacts } from './runtime-roles';

// Proves the least-privilege roles from `pnpm db:roles:test` against the isolated test database.
const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  return Object.assign(new URL(ownerURL), { username, password }).toString();
};
const owner = createDatabase(ownerURL);
const web = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.web, process.env.DB_WEB_PASSWORD));
const worker = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.worker, process.env.DB_WORKER_PASSWORD));
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
let passed = 0;
let fixtureWorkspace: { id: string; ownerId: string } | null = null;

async function denied(db: Knex, statement: (trx: Knex.Transaction) => Promise<unknown>, label: string) {
  const trx = await db.transaction();
  try {
    await assert.rejects(statement(trx), (error: { code?: string }) => error.code === '42501', `${label} must be denied`);
  } finally {
    await trx.rollback();
  }
  passed++;
}

async function tables() {
  return (await owner('pg_tables').where({ schemaname: 'public' }).whereNotIn('tablename', ['knex_migrations', 'knex_migrations_lock', ...STAFF_ONLY_TABLES])
    .select<{ tablename: string }[]>('tablename')).map(row => row.tablename);
}

try {
  if (!await owner('workspaces').first('id')) {
    const now = new Date();
    const fixture = { id: randomUUID(), ownerId: randomUUID() };
    fixtureWorkspace = fixture;
    await owner('users').insert({
      id: fixture.ownerId,
      name: 'Runtime grants rehearsal',
      email: `runtime-grants-${fixture.ownerId}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      termsVersion: 'runtime-grants-rehearsal',
      termsAcceptedAt: now,
    });
    await owner.transaction(async trx => {
      await trx('workspaces').insert({
        id: fixture.id,
        ownerId: fixture.ownerId,
        businessName: 'Runtime grants rehearsal',
        businessType: 'test',
        postalCode: '',
        serviceRange: '',
        createdAt: now,
      });
      await trx('workspaceMemberships').insert({
        workspaceId: fixture.id,
        userId: fixture.ownerId,
        role: 'owner',
      });
      await trx('workspacePolicies').insert({ workspaceId: fixture.id });
    });
    await owner('workspaceSubscriptions').insert({
      workspaceId: fixture.id,
      plan: 'free',
      intendedPlan: 'free',
      catalogVersion: 'runtime-grants-rehearsal',
      status: 'free',
    });
  }

  for (const [name, db] of [['web', web], ['worker', worker], ['admin', admin]] as const) {
    assert.deepEqual(databaseRoleProblems(await readDatabaseRoleFacts(db)), [], `${name} role passes the startup self-check`);
    passed++;
  }
  {
    const defaults = await Promise.all([web, worker].map(async runtime => {
      const { rows } = await runtime.raw<{ rows: { monthlyTokens: string | null }[] }>(
        'SELECT public.get_default_monthly_ai_tokens()::text AS "monthlyTokens"',
      );
      return rows[0]?.monthlyTokens ?? null;
    }));
    assert.equal(defaults[0], defaults[1], 'web and worker receive the same narrow default-budget value');
    const privileges = await owner.raw<{ rows: {
      adminSelect: boolean; adminInsert: boolean; adminUpdate: boolean; adminDelete: boolean;
      runtimeExecute: boolean;
    }[] }>(`
      SELECT has_table_privilege(?, 'admin."systemSettingVersions"', 'SELECT') AS "adminSelect",
        has_table_privilege(?, 'admin."systemSettingVersions"', 'INSERT') AS "adminInsert",
        has_table_privilege(?, 'admin."systemSettingVersions"', 'UPDATE') AS "adminUpdate",
        has_table_privilege(?, 'admin."systemSettingVersions"', 'DELETE') AS "adminDelete",
        has_function_privilege(?, 'public.get_default_monthly_ai_tokens()', 'EXECUTE') AS "runtimeExecute"`,
    [ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES.web]);
    assert.deepEqual(privileges.rows[0], {
      adminSelect: true, adminInsert: true, adminUpdate: false, adminDelete: false, runtimeExecute: true,
    }, 'setting history is append-only to Admin and runtime can only call its narrow reader');
    passed += 2;
  }
  {
    const results = await Promise.all([web, worker].map(runtime =>
      runtime.raw<{ rows: { chat: boolean }[] }>(
        "SELECT public.is_salesmora_feature_enabled('chat.enabled', NULL, NULL) AS chat",
      )));
    assert.deepEqual(results.map(result => result.rows[0].chat), [true, true],
      'web and worker can evaluate flags through the narrow runtime function');
    const { rows: [privileges] } = await owner.raw<{ rows: {
      adminFlagRead: boolean; adminFlagUpdate: boolean; runtimeTableRead: boolean; runtimeExecute: boolean;
    }[] }>(`
      SELECT has_table_privilege(?, 'admin."featureFlags"', 'SELECT') AS "adminFlagRead",
        has_table_privilege(?, 'admin."featureFlags"', 'UPDATE') AS "adminFlagUpdate",
        has_table_privilege(?, 'admin."featureFlags"', 'SELECT') AS "runtimeTableRead",
        has_function_privilege(?, 'public.is_salesmora_feature_enabled(text,text,text)', 'EXECUTE') AS "runtimeExecute"`,
    [ADMIN_APP_ROLE, ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.worker]);
    assert.deepEqual(privileges, {
      adminFlagRead: true, adminFlagUpdate: true, runtimeTableRead: false, runtimeExecute: true,
    }, 'Admin may manage flags while runtime roles call only the function and cannot read flag tables');
    passed += 2;
  }
  assert.ok(databaseRoleProblems(await readDatabaseRoleFacts(owner)).length > 0, 'owner role fails the self-check');
  passed++;

  // Runtime roles: DML on every application table except staff-only ones (covered by the suspension rehearsal), nothing else.
  const all = await tables();
  const runtimeTables = all.filter(table => table !== 'workspaceAITokenBudgets');
  for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
    const { rows } = await owner.raw<{ rows: { table: string; dml: boolean; extra: boolean }[] }>(`
      SELECT t AS table,
        has_table_privilege(?, quote_ident(t), 'SELECT') AND has_table_privilege(?, quote_ident(t), 'INSERT') AND
          has_table_privilege(?, quote_ident(t), 'DELETE') AND (t = 'users' OR has_table_privilege(?, quote_ident(t), 'UPDATE')) AS dml,
        has_table_privilege(?, quote_ident(t), 'TRUNCATE, REFERENCES, TRIGGER') AS extra
      FROM unnest(string_to_array(?, ',')) AS t`, [role, role, role, role, role, runtimeTables.join(',')]);
    assert.deepEqual(rows.filter(row => !row.dml).map(row => row.table), [], `${role} has DML on every table`);
    assert.deepEqual(rows.filter(row => row.extra).map(row => row.table), [], `${role} has no TRUNCATE/REFERENCES/TRIGGER`);
    const userColumns = await owner.raw<{ rows: { email: boolean; emailVerified: boolean; onboardingStatus: boolean; deletionRequestedAt: boolean }[] }>(`
      SELECT has_column_privilege(?, 'public.users', 'email', 'UPDATE') AS email,
        has_column_privilege(?, 'public.users', 'emailVerified', 'UPDATE') AS "emailVerified",
        has_column_privilege(?, 'public.users', 'onboardingStatus', 'UPDATE') AS "onboardingStatus",
        has_column_privilege(?, 'public.users', 'deletionRequestedAt', 'UPDATE') AS "deletionRequestedAt"`,
    [role, role, role, role]);
    assert.deepEqual(userColumns.rows[0], {
      email: false, emailVerified: true, onboardingStatus: true, deletionRequestedAt: true,
    }, `${role} may update only approved user-account fields, never the email address`);
    passed += 3;
  }
  {
    const workspace = await owner('workspaces').first<{ id: string }>('id');
    assert.ok(workspace, 'isolated grants rehearsal has a workspace for the budget foreign key');
    const { rows: [webPrivileges] } = await owner.raw<{ rows: {
      select: boolean; insert: boolean; update: boolean; delete: boolean; extra: boolean;
    }[] }>(`
      SELECT has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'SELECT') AS "select",
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'INSERT') AS insert,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'UPDATE') AS update,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'DELETE') AS delete,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'TRUNCATE, REFERENCES, TRIGGER') AS extra`,
    [RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.web, RUNTIME_LOGIN_ROLES.web]);
    assert.deepEqual(webPrivileges, { select: true, insert: false, update: false, delete: false, extra: false },
      'web reads AI budgets but cannot change them');
    const { rows: [workerPrivileges] } = await owner.raw<{ rows: {
      select: boolean; insert: boolean; update: boolean; delete: boolean; extra: boolean;
    }[] }>(`
      SELECT has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'SELECT') AS "select",
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'INSERT') AS insert,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'UPDATE') AS update,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'DELETE') AS delete,
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'TRUNCATE, REFERENCES, TRIGGER') AS extra`,
    [RUNTIME_LOGIN_ROLES.worker, RUNTIME_LOGIN_ROLES.worker, RUNTIME_LOGIN_ROLES.worker, RUNTIME_LOGIN_ROLES.worker, RUNTIME_LOGIN_ROLES.worker]);
    assert.deepEqual(workerPrivileges, { select: true, insert: false, update: false, delete: false, extra: false },
      'worker reads AI budgets for Gmail extraction but cannot change them');
    const { rows: [adminPrivileges] } = await owner.raw<{ rows: {
      select: boolean; insert: boolean; update: boolean; delete: boolean; extra: boolean;
      insertWorkspace: boolean; insertTokens: boolean; updateTokens: boolean; updateDate: boolean; updateWorkspace: boolean;
    }[] }>(`
      SELECT has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'SELECT') AS "select",
        has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'INSERT') AS insert,
      has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'UPDATE') AS update,
      has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'DELETE') AS delete,
      has_table_privilege(?, 'public."workspaceAITokenBudgets"', 'TRUNCATE, REFERENCES, TRIGGER') AS extra,
        has_column_privilege(?, 'public."workspaceAITokenBudgets"', 'workspaceId', 'INSERT') AS "insertWorkspace",
        has_column_privilege(?, 'public."workspaceAITokenBudgets"', 'monthlyTokens', 'INSERT') AS "insertTokens",
        has_column_privilege(?, 'public."workspaceAITokenBudgets"', 'monthlyTokens', 'UPDATE') AS "updateTokens",
        has_column_privilege(?, 'public."workspaceAITokenBudgets"', 'updatedAt', 'UPDATE') AS "updateDate",
        has_column_privilege(?, 'public."workspaceAITokenBudgets"', 'workspaceId', 'UPDATE') AS "updateWorkspace"`,
    [ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE,
      ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE]);
    assert.deepEqual(adminPrivileges, {
      select: true, insert: false, update: false, delete: false, extra: false, insertWorkspace: true, insertTokens: true,
      updateTokens: true, updateDate: true, updateWorkspace: false,
    }, 'admin has only the required budget insert/update column grants');

    const adminTrx = await admin.transaction();
    try {
      await adminTrx('workspaceAITokenBudgets').insert({ workspaceId: workspace.id, monthlyTokens: 321 });
      assert.equal(await adminTrx('workspaceAITokenBudgets').where({ workspaceId: workspace.id })
        .update({ monthlyTokens: 654, updatedAt: adminTrx.fn.now() }), 1);
      passed++;
    } finally {
      await adminTrx.rollback();
    }
    await denied(admin, trx => trx('workspaceAITokenBudgets').where({ workspaceId: workspace.id }).delete(),
      'admin AI-budget DELETE');
    await denied(admin, trx => trx('workspaceAITokenBudgets').where({ workspaceId: workspace.id })
      .update({ workspaceId: randomUUID() }), 'admin AI-budget workspaceId update');
    await denied(web, trx => trx('workspaceAITokenBudgets').insert({ workspaceId: workspace.id, monthlyTokens: 1 }),
      'web AI-budget INSERT');
    await denied(worker, trx => trx('workspaceAITokenBudgets').insert({ workspaceId: workspace.id, monthlyTokens: 1 }),
      'worker AI-budget INSERT');
    const webTrx = await web.transaction();
    try {
      await webTrx('workspaceAITokenBudgets').where({ workspaceId: workspace.id }).select('monthlyTokens');
      passed++;
    } finally {
      await webTrx.rollback();
    }
  }
  {
    const trx = await web.transaction();
    try {
      const id = randomUUID();
      await trx('rateLimits').insert({ id, key: `grants-rehearsal-${id}`, count: 1, lastRequest: Date.now() });
      assert.equal((await trx('rateLimits').where({ id }).update({ count: 2 })), 1);
      assert.equal((await trx('rateLimits').where({ id }).delete()), 1);
      passed++;
    } finally {
      await trx.rollback();
    }
  }
  await denied(web, trx => trx.raw('TRUNCATE "rateLimits"'), 'TRUNCATE');
  await denied(web, trx => trx('users').where({ id: 'missing' }).update({ email: 'forged@example.test' }), 'direct customer email changes');
  await denied(web, trx => trx.raw('DROP TABLE "rateLimits"'), 'DROP TABLE');
  await denied(web, trx => trx.raw('ALTER TABLE "rateLimits" ADD COLUMN grants_rehearsal text'), 'ALTER TABLE');
  await denied(web, trx => trx.raw('CREATE TABLE grants_rehearsal (id int)'), 'CREATE TABLE');
  await denied(web, trx => trx.raw('CREATE SCHEMA grants_rehearsal'), 'CREATE SCHEMA');
  await denied(web, trx => trx('knex_migrations').select('name'), 'reading migration history');
  await denied(worker, trx => trx('knex_migrations').insert({ name: 'forged.ts', batch: 999, migration_time: new Date() }), 'forging migrations');

  // Admin app: read-only, with secrets hidden and account-provider access explicitly column-scoped.
  await admin('users').count();
  await admin('sessions').select('id', 'userId', 'expiresAt').limit(1);
  await admin('accounts').select('userId', 'providerId').limit(1);
  passed++;
  await denied(admin, trx => trx('users').where({ id: 'none' }).update({ name: 'x' }), 'admin UPDATE');
  await denied(admin, trx => trx('rateLimits').insert({ id: randomUUID(), key: 'x', count: 1, lastRequest: 1 }), 'admin INSERT');
  await denied(admin, trx => trx.withSchema('admin').table('systemSettingVersions').update({ reason: 'forged update' }), 'admin rewriting setting history');
  await denied(web, trx => trx.withSchema('admin').table('systemSettingVersions').select('value'), 'runtime reading setting history directly');
  await denied(admin, trx => trx('accounts').select('id'), 'admin reading account IDs');
  await denied(admin, trx => trx('accounts').select('accountId'), 'admin reading provider account identifiers');
  await denied(admin, trx => trx('accounts').select('password'), 'admin reading customer password hashes');
  await denied(admin, trx => trx('accounts').select('accessToken'), 'admin reading provider access tokens');
  await denied(admin, trx => trx('verifications').select('id'), 'admin reading verifications');
  await denied(admin, trx => trx('sessions').select('token'), 'admin reading session tokens');
  await denied(admin, trx => trx('estimate_share_tokens').select('encryptedToken'), 'admin reading share tokens');
  {
    const workspace = await owner('workspaces').first<{ id: string }>('id');
    assert.ok(workspace, 'isolated grants rehearsal has a workspace for the billing foreign key');
    let createdSubscription = false;
    if (!await owner('workspaceSubscriptions').where({ workspaceId: workspace.id }).first('workspaceId')) {
      await owner('workspaceSubscriptions').insert({ workspaceId: workspace.id, catalogVersion: 'grants-rehearsal' });
      createdSubscription = true;
    }
    try {
      const trx = await admin.transaction();
      try {
        const id = randomUUID();
        await trx('billingPlanChanges').insert({
          id,
          workspaceId: workspace.id,
          actorId: 'grants-rehearsal-owner',
          targetPlan: 'standard',
          kind: 'upgrade',
          basis: JSON.stringify({ id: 'sub_rehearsal', price: 'price_rehearsal', start: 1, end: 2 }),
          amountDue: 0,
          prorationAt: 1,
        });
        assert.equal(await trx('billingPlanChanges').where({ id }).update({ state: 'applying', scheduleId: 'sub_sched_rehearsal' }), 1);
        assert.equal(await trx('workspaceSubscriptions').where({ workspaceId: workspace.id })
          .update({ updatedAt: trx.fn.now() }), 1);
        assert.equal(await trx('billingRenewalRecoveries').where({ id: randomUUID() })
          .update({ retryCancelledAt: trx.fn.now() }), 0);
        assert.equal(await trx('billingRenewalRecoveries').where({ id: randomUUID() })
          .update({ state: 'paid', reconciledAt: trx.fn.now() }), 0);
        await trx('billingRecoveryGraceExtensions').insert({
          id: randomUUID(),
          workspaceId: workspace.id,
          invoiceId: 'in_rehearsal',
          invoiceCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
          extendedUntil: new Date('2026-01-09T00:00:00.000Z'),
        });
        passed++;
      } finally {
        await trx.rollback();
      }
      await denied(admin, trx => trx('billingPlanChanges').where({ id: '00000000-0000-4000-8000-000000000001' }).delete(),
        'admin plan-change DELETE');
      await denied(admin, trx => trx('billingPlanChanges').where({ id: '00000000-0000-4000-8000-000000000001' })
        .update({ targetPlan: 'free' }), 'admin plan-change target mutation');
      await denied(admin, trx => trx('workspaceSubscriptions').where({ workspaceId: workspace.id })
        .update({ workspaceId: randomUUID() }), 'admin subscription workspace mutation');
      await denied(admin, trx => trx('billingRenewalRecoveries').where({ id: randomUUID() })
        .update({ amountDue: 0 }), 'admin recovery amount mutation');
      await denied(admin, trx => trx('billingRecoveryGraceExtensions').where({ id: randomUUID() })
        .update({ extendedUntil: new Date() }), 'admin grace-extension mutation');
      await denied(admin, trx => trx('billingRecoveryGraceExtensions').where({ id: randomUUID() }).delete(),
        'admin grace-extension DELETE');

      const webhookEventId = `evt_${randomUUID()}`;
      await owner('billingWebhookEvents').insert({
        id: webhookEventId,
        type: 'invoice.payment_failed',
        objectId: 'in_grants_rehearsal',
        workspaceId: workspace.id,
        attempts: 1,
      });
      try {
        const { rows: [webhookPrivileges] } = await owner.raw<{ rows: {
          updateRetryAt: boolean;
          updateAttempts: boolean;
          updateProcessedAt: boolean;
          updateWorkspace: boolean;
        }[] }>(`
          SELECT has_column_privilege(?, 'public."billingWebhookEvents"', 'retryAt', 'UPDATE') AS "updateRetryAt",
            has_column_privilege(?, 'public."billingWebhookEvents"', 'attempts', 'UPDATE') AS "updateAttempts",
            has_column_privilege(?, 'public."billingWebhookEvents"', 'processedAt', 'UPDATE') AS "updateProcessedAt",
            has_column_privilege(?, 'public."billingWebhookEvents"', 'workspaceId', 'UPDATE') AS "updateWorkspace"`,
        [ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE, ADMIN_APP_ROLE]);
        assert.deepEqual(webhookPrivileges, {
          updateRetryAt: true,
          updateAttempts: false,
          updateProcessedAt: false,
          updateWorkspace: false,
        }, 'admin can schedule webhook retries without changing event identity or history');

        const trx = await admin.transaction();
        try {
          assert.equal(await trx('billingWebhookEvents').where({ id: webhookEventId })
            .update({ retryAt: trx.fn.now() }), 1);
          passed++;
        } finally {
          await trx.rollback();
        }
        await denied(admin, trx => trx('billingWebhookEvents').where({ id: webhookEventId })
          .update({ attempts: 2 }), 'admin webhook attempt mutation');
        await denied(admin, trx => trx('billingWebhookEvents').where({ id: webhookEventId })
          .update({ processedAt: trx.fn.now() }), 'admin webhook processed-state mutation');
        await denied(admin, trx => trx('billingWebhookEvents').where({ id: webhookEventId })
          .update({ workspaceId: randomUUID() }), 'admin webhook workspace mutation');
        passed++;
      } finally {
        await owner('billingWebhookEvents').where({ id: webhookEventId }).delete();
      }
    } finally {
      if (createdSubscription) {
        await owner('workspaceSubscriptions').where({ workspaceId: workspace.id }).delete();
      }
    }
  }

  // Default privileges cover tables created by later migrations.
  {
    const trx = await owner.transaction();
    try {
      await trx.raw('CREATE TABLE grants_rehearsal_future (id int)');
      const { rows: [row] } = await trx.raw<{ rows: { web: boolean; admin: boolean; adminWrite: boolean }[] }>(`SELECT
        has_table_privilege(?, 'grants_rehearsal_future', 'INSERT') AS web,
        has_table_privilege(?, 'grants_rehearsal_future', 'SELECT') AS admin,
        has_table_privilege(?, 'grants_rehearsal_future', 'INSERT') AS "adminWrite"`, [RUNTIME_LOGIN_ROLES.web, ADMIN_APP_ROLE, ADMIN_APP_ROLE]);
      assert.deepEqual(row, { web: true, admin: true, adminWrite: false }, 'future tables inherit runtime and admin grants');
      passed++;
    } finally {
      await trx.rollback();
    }
  }
  console.log(`Runtime grants rehearsal passed (${passed} checks).`);
} finally {
  const fixture = fixtureWorkspace;
  if (fixture) {
    await owner.transaction(async trx => {
      await trx('billingWebhookEvents').where({ workspaceId: fixture.id }).delete();
      await trx('workspaceSubscriptions').where({ workspaceId: fixture.id }).delete();
      await trx('workspaceMemberships').where({ workspaceId: fixture.id }).delete();
      await trx('workspacePolicies').where({ workspaceId: fixture.id }).delete();
      await trx('workspaces').where({ id: fixture.id }).delete();
    });
    await owner('users').where({ id: fixture.ownerId }).delete();
  }
  await Promise.all([owner.destroy(), web.destroy(), worker.destroy(), admin.destroy()]);
}
