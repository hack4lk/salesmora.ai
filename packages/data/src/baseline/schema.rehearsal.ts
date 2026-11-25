import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL ||
  !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) {
  throw new Error('A separate local TEST_DATABASE_URL ending in _test is required.');
}

const suffix = randomUUID().replaceAll('-', '');
const names = [`baseline_reference_${suffix}_test`, `baseline_candidate_${suffix}_test`,
  `baseline_occupied_${suffix}_test`, `baseline_concurrent_${suffix}_test`];
const owner = createDatabase(connection);
const execute = promisify(execFile);
const migrationCLI = fileURLToPath(new URL('../migrate.ts', import.meta.url));
const migrationDirectory = fileURLToPath(new URL('../baseline-migrations', import.meta.url));
const migrationNames = readdirSync(migrationDirectory).filter(name => name.endsWith('.ts')).sort();
const runCLI = (name: string, ...args: string[]) => {
  const url = new URL(connection);
  url.pathname = `/${name}`;
  return execute(process.execPath, ['--import', 'tsx', migrationCLI, ...args], {
    env: { ...process.env, MIGRATION_DATABASE_URL: url.toString(), TEST_DATABASE_URL: url.toString(), NODE_ENV: 'development' },
  });
};
const databases = names.map(name => {
  const url = new URL(connection);
  url.pathname = `/${name}`;
  return createDatabase(url.toString());
});
const tables = [
  'users', 'sessions', 'accounts', 'verifications', 'rateLimits',
  'workspaces', 'workspaceMemberships', 'workspaceServices', 'workspaceInvitations',
  'workspacePolicies', 'workspaceRolePolicies', 'authorizationAudit',
  'customers', 'workspaceCustomerCounters', 'leads', 'workspaceLeadCounters', 'workspaceLeadAdmissions', 'leadActivity',
  'leadAssignmentSettings', 'leadAssignmentSettingsAudit',
  'leadTags', 'notificationPreferences', 'assignmentNotifications', 'assignmentEmailOutbox', 'leadDeletionAudit', 'leadExportAudit',
  'customerActivity', 'customerOperations', 'customerExportAudit',
  'jobs', 'workspaceJobCounters', 'jobTeamMembers', 'jobActivity', 'jobOperations', 'deadlineNotifications',
  'workOrders', 'workspaceWorkOrderCounters', 'workOrderTasks', 'workOrderMaterials', 'workOrderCrew',
  'workOrderCompletions', 'workOrderActivity', 'workOrderOperations', 'workOrderDeleteAudit', 'workOrderExportAudit',
  'materialCatalog', 'materialAudit', 'materialOperations', 'materialExportAudit', 'materialNotifications', 'workOrderNotifications',
  'files', 'fileEvents', 'workspaceStorageUsage', 'jobMessages',
  'accountDeletionRequests', 'accountAudit', 'suspensionAudit', 'workspaceSuspensionNotices', 'workspaceOwnershipNotices',
  'helpArticles', 'helpHeads', 'helpChunks', 'helpEmbeddings', 'aiUsageCalls', 'workspaceAITokenBudgets',
  'workspaceSubscriptions', 'billingCheckoutAttempts', 'billingWebhookEvents', 'billingAudit',
  'billingPlanChanges', 'billingPaymentMethods', 'billingRenewalRecoveries', 'billingRecoveryGraceExtensions',
  'calendarVisits', 'calendarVisitRecords', 'calendarScheduleSnapshots', 'calendarOperations',
  'visitNotifications', 'visitNotificationRecords', 'jobNotificationSettings', 'jobNotificationSettingsAudit',
  'jobNotifications',
  'workspaceEstimateCounters', 'workspaceEstimateSettings', 'workspaceEstimateRevisionCounters', 'estimates',
  'estimate_items', 'estimate_snapshots', 'estimate_share_tokens', 'estimate_deliveries',
  'estimate_activity', 'estimate_operation_receipts', 'estimate_decisions', 'estimateNotifications', 'estimateExportAudit',
  'reportExportAudit', 'reportTemplates',
  'chatThreads', 'chatTurns', 'chatMessages',
  'chatProposals', 'chatProposalAudit', 'chatProposalStorage',
  'captureSources', 'captureSourceVersions', 'captureSourceDrafts', 'captureSourceSamples', 'capturePublications',
  'captureReceipts', 'intakeItems', 'intakeReviewSnapshots', 'intakeDecisions', 'captureOperations',
  'captureSourceEvents', 'leadCaptureData',
  'capturePublicationTransitions', 'captureAdminNotices', 'captureAccessChecks', 'captureRequestBuckets',
  'captureSubmissionAttempts', 'captureChallengeChecks', 'captureReceiptProcessing', 'captureInputUsage',
  'captureGmailAccounts', 'captureGmailCredentials', 'captureGmailOAuthAttempts', 'captureGmailMailboxState',
  'captureGmailEligibilityWindows', 'captureGmailMessageJobs',
  'captureGmailDisconnectReviews', 'captureGmailConnectionEvents', 'captureGmailSamplePreviews',
  'captureGmailSampleBindings', 'captureGmailWorkerReadiness', 'captureSetupSamples',
];
const created: string[] = [];
const reference = JSON.parse(readFileSync(fileURLToPath(new URL('./schema-reference.json', import.meta.url)), 'utf8')) as {
  version: number; checks: (string | Record<string, string>)[];
};
assert.equal(reference.version, 1);
let referenceIndex = 0;
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
let databaseOwner = '';
let availableRoles = new Set<string>();
function compareReference(actual: unknown) {
  const index = referenceIndex++;
  const expected = reference.checks[index];
  assert.ok(expected, `Missing historical reference check ${index}`);
  if (typeof expected === 'string') {
    assert.equal(digest(actual), expected, `Historical schema reference check ${index} differs`);
    return;
  }
  assert.ok(Array.isArray(actual));
  const groups: Record<string, string[]> = {};
  for (const row of actual as { grantee: string }[]) {
    const grantee = row.grantee === databaseOwner ? '$database_owner' : row.grantee;
    (groups[grantee] ??= []).push(JSON.stringify({ ...row, grantee }));
  }
  const actualHashes = Object.fromEntries(Object.entries(groups).map(([role, rows]) => [role, digest(rows.sort())]));
  const expectedHashes = Object.fromEntries(Object.entries(expected).filter(([role]) =>
    role === '-' || role === '$database_owner' || availableRoles.has(role)));
  assert.deepEqual(actualHashes, expectedHashes, `Historical privilege reference check ${index} differs`);
}
const adminTables = ['staffUsers', 'staffSessions', 'staffAccounts', 'staffVerifications', 'staffPasskeys',
  'staffTwoFactors', 'staffRateLimits', 'staffRoleAssignments', 'staffInvitations', 'aiModelPricing',
  'systemSettingVersions', 'featureFlags', 'featureFlagOverrides', 'rolloutFlags', 'staffEnrollments',
  'approvalRequests', 'staffActionChallenges', 'staffFactorUses', 'staffInvitationDeliveries',
  'auditEvents', 'auditArchiveJobs', 'auditArchiveAttempts', 'auditArchiveCopies', 'auditArchiveCopyAttempts', 'auditArchiveChecks',
  'userEmailChanges', 'workspaceInvitationDeliveries', 'workspaceExportRequests', 'workspaceExportArtifacts'];

try {
  for (const name of names) {
    await owner.raw('CREATE DATABASE ??', [name]);
    created.push(name);
  }
  await databases[0].schema.createTable('knex_migrations', table => {
    table.increments('id'); table.string('name'); table.integer('batch'); table.timestamp('migration_time');
  });
  await databases[0]('knex_migrations').insert({ name: '202610110001_historical.ts', batch: 1 });
  await databases[1].transaction(async trx => {
    await trx.raw('SET LOCAL search_path TO public, pg_catalog');
    await trx.migrate.up({ directory: migrationDirectory, name: '202611150001_fresh_baseline.ts', loadExtensions: ['.ts'], schemaName: 'public' });
  });
  await assert.rejects(migrateFreshBaseline(databases[0]), /legacy or unknown migration ledger/);
  await databases[2].schema.createTable('existing_data', table => table.integer('id'));
  await assert.rejects(migrateFreshBaseline(databases[2]), /requires an empty database/);
  assert.equal(await databases[2].schema.hasTable('existing_data'), true);
  assert.equal(await databases[2].schema.hasTable('knex_migrations'), false);
  await databases[2].schema.dropTable('existing_data');
  await databases[2].raw("CREATE TYPE existing_type AS ENUM ('fixture')");
  await assert.rejects(migrateFreshBaseline(databases[2]), /requires an empty database/);
  assert.equal((await databases[2].raw("SELECT to_regtype('public.existing_type') AS type")).rows[0].type, 'existing_type');
  assert.equal(await databases[2].schema.hasTable('knex_migrations'), false);
  await databases[2].raw('DROP TYPE existing_type');
  await databases[2].raw('CREATE TYPE existing_composite AS (value integer)');
  await assert.rejects(migrateFreshBaseline(databases[2]), /requires an empty database/);
  assert.equal((await databases[2].raw("SELECT to_regtype('public.existing_composite') AS type")).rows[0].type, 'existing_composite');
  await databases[2].raw('DROP TYPE existing_composite');
  await databases[2].raw('CREATE SCHEMA existing_schema');
  await assert.rejects(migrateFreshBaseline(databases[2]), /requires an empty database/);
  assert.equal((await databases[2].raw("SELECT to_regnamespace('existing_schema') AS schema")).rows[0].schema, 'existing_schema');
  await assert.rejects(runCLI(names[2]), /requires an empty database/);
  await databases[2].raw('DROP SCHEMA existing_schema');
  assert.match((await runCLI(names[2])).stdout, /Migrations complete/);
  assert.match((await runCLI(names[2], '--test')).stdout, /Migrations complete \(test\)/);
  await assert.rejects(runCLI(names[2], '--test', '--rollback'), /forward-only/);
  assert.deepEqual((await databases[2]('knex_migrations').orderBy('name').pluck('name')), migrationNames);
  const simultaneous = await Promise.all([migrateFreshBaseline(databases[3]), migrateFreshBaseline(databases[3])]);
  assert.deepEqual(simultaneous.map(result => result[1].length).sort((a, b) => a - b), [0, migrationNames.length]);
  assert.deepEqual((await databases[3]('knex_migrations').orderBy('name').pluck('name')), migrationNames);
  const roles = await databases[1].raw<{ rows: { rolname: string; current_user: string }[] }>(
    'SELECT rolname, current_user FROM pg_roles',
  );
  databaseOwner = roles.rows[0].current_user;
  availableRoles = new Set(roles.rows.map(row => row.rolname));
  assert.match((await runCLI(names[3])).stdout, /Migrations complete/);
  await assert.rejects(runCLI(names[0]), /legacy or unknown migration ledger/);
  await assert.rejects(runCLI(names[3], '--rollback'), /forward-only/);
  assert.deepEqual((await databases[3]('knex_migrations').orderBy('name').pluck('name')), migrationNames);
  const queries = [
    `SELECT table_name, column_name, data_type, udt_schema, udt_name, is_nullable, column_default,
      character_maximum_length, numeric_precision, numeric_precision_radix, numeric_scale, datetime_precision,
      interval_type, is_identity, identity_generation, is_generated, generation_expression, collation_schema, collation_name
      FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ANY(?)
      ORDER BY table_name, ordinal_position`,
    `SELECT c.relname AS table_name, con.conname, pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = ANY(?) AND con.contype <> 't' ORDER BY c.relname, con.conname`,
    `SELECT tablename, indexname, indexdef FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = ANY(?) ORDER BY tablename, indexname`,
  ];
  for (const query of queries) {
    const candidate = await databases[1].raw(query, [tables]);
    compareReference(candidate.rows);
  }
  for (const [schema, expected] of [['public', tables], ['admin', adminTables]] as const) {
    const candidate = await databases[1].raw<{ rows: { table_name: string }[] }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = ? AND table_type = 'BASE TABLE'
         AND table_name NOT IN ('knex_migrations', 'knex_migrations_lock') ORDER BY table_name`,
      [schema],
    );
    assert.deepEqual(candidate.rows.map(row => row.table_name), [...expected].sort());
    compareReference(candidate.rows);
  }
  assert.equal(tables.length + adminTables.length, 165);
  const orphanedTriggerFunctions = await databases[1].raw<{ rows: { name: string }[] }>(`
    SELECT p.proname AS name FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'admin') AND p.prorettype = 'pg_catalog.trigger'::regtype
      AND NOT EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgfoid = p.oid AND NOT t.tgisinternal)
    ORDER BY p.proname`);
  assert.deepEqual(orphanedTriggerFunctions.rows.map(row => row.name), []);
  for (const query of [
    `SELECT e.extname, e.extversion, n.nspname AS schema
     FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace ORDER BY e.extname`,
    `SELECT n.nspname AS schema, c.relname AS relation, t.tgname, pg_get_triggerdef(t.oid) AS definition
     FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname IN ('public', 'admin') AND NOT t.tgisinternal
     ORDER BY n.nspname, c.relname, t.tgname`,
    `SELECT n.nspname AS schema, p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_functiondef(p.oid) AS definition
     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname IN ('public', 'admin') AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_proc'::regclass
         AND d.objid = p.oid AND d.deptype = 'e')
       AND (p.prorettype <> 'pg_catalog.trigger'::regtype
         OR EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgfoid = p.oid AND NOT t.tgisinternal))
     ORDER BY n.nspname, p.proname, arguments`,
    `SELECT n.nspname AS schema, c.relname, s.seqstart, s.seqincrement, s.seqmax, s.seqmin, s.seqcache, s.seqcycle,
       pg_get_serial_sequence(format('%I.%I', tn.nspname, t.relname), col.attname) AS owned_sequence,
       tn.nspname AS owner_schema, t.relname AS owner_table, col.attname AS owner_column
     FROM pg_sequence s JOIN pg_class c ON c.oid = s.seqrelid JOIN pg_namespace n ON n.oid = c.relnamespace
     LEFT JOIN pg_depend d ON d.classid = 'pg_class'::regclass AND d.objid = c.oid
       AND d.refclassid = 'pg_class'::regclass AND d.deptype IN ('a', 'i')
     LEFT JOIN pg_class t ON t.oid = d.refobjid
     LEFT JOIN pg_namespace tn ON tn.oid = t.relnamespace
     LEFT JOIN pg_attribute col ON col.attrelid = t.oid AND col.attnum = d.refobjsubid
     WHERE n.nspname IN ('public', 'admin') AND c.relname NOT LIKE 'knex_migrations%'
     ORDER BY n.nspname, c.relname`,
    `SELECT n.nspname AS schema, a.grantee::regrole::text AS grantee, a.privilege_type, a.is_grantable
     FROM pg_namespace n CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
     WHERE n.nspname IN ('public', 'admin') ORDER BY 1, 2, 3`,
    `SELECT n.nspname AS schema, c.relname, c.relkind, a.grantee::regrole::text AS grantee, a.privilege_type, a.is_grantable
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault(CASE WHEN c.relkind = 'S' THEN 'S'::"char" ELSE 'r'::"char" END, c.relowner))) a
     WHERE n.nspname IN ('public', 'admin') AND c.relkind IN ('r', 'S', 'v', 'm', 'p')
       AND c.relname NOT LIKE 'knex_migrations%'
     ORDER BY 1, 2, 3, 4, 5`,
    `SELECT n.nspname AS schema, c.relname, col.attname, a.grantee::regrole::text AS grantee, a.privilege_type, a.is_grantable
     FROM pg_attribute col JOIN pg_class c ON c.oid = col.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
     CROSS JOIN LATERAL aclexplode(col.attacl) a
     WHERE n.nspname IN ('public', 'admin') AND col.attnum > 0 AND NOT col.attisdropped
       AND c.relname NOT LIKE 'knex_migrations%'
     ORDER BY 1, 2, 3, 4, 5`,
    `SELECT n.nspname AS schema, p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
       a.grantee::regrole::text AS grantee, a.privilege_type, a.is_grantable
     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
     WHERE n.nspname IN ('public', 'admin') AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_proc'::regclass
         AND d.objid = p.oid AND d.deptype = 'e')
       AND (p.prorettype <> 'pg_catalog.trigger'::regtype
         OR EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgfoid = p.oid AND NOT t.tgisinternal))
     ORDER BY 1, 2, 3, 4, 5`,
    `SELECT COALESCE(n.nspname, '') AS schema, d.defaclobjtype, a.grantee::regrole::text AS grantee,
       a.privilege_type, a.is_grantable
     FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
     CROSS JOIN LATERAL aclexplode(d.defaclacl) a
     WHERE n.nspname IN ('public', 'admin') OR d.defaclnamespace = 0
     ORDER BY 1, 2, 3, 4`,
  ]) {
    const candidate = await databases[1].raw(query);
    compareReference(candidate.rows);
  }
  for (const query of queries) {
    const adminQuery = query.replace("= 'public'", "= 'admin'");
    const candidate = await databases[1].raw(adminQuery, [adminTables]);
    compareReference(candidate.rows);
  }
  for (const query of [
    `SELECT pg_get_functiondef('admin.check_staff_session_access()'::regprocedure) AS definition`,
    `SELECT pg_get_triggerdef(oid) AS definition FROM pg_trigger
      WHERE tgrelid = 'admin."staffSessions"'::regclass AND tgname = 'staff_session_access'`,
  ]) {
    const candidate = await databases[1].raw(query);
    assert.equal(candidate.rows.length, 1);
    compareReference(candidate.rows);
  }
  const triggerQuery = `SELECT c.relname, t.tgname, pg_get_triggerdef(t.oid) AS definition
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND t.tgname IN ('authorization_lock', 'authorization_owner_invariant',
      'authorization_audit_immutable', 'suspension_columns_guard', 'plan_override_columns_guard',
      'assign_customer_number', 'assign_lead_number', 'record_lead_creation', 'record_lead_admission',
      'workspace_lead_assignment', 'lead_assignment_audit_immutable', 'lead_deletion_audit_immutable', 'lead_export_audit_final',
      'assign_job_number', 'jobs_reminder_revision', 'assign_work_order_number', 'account_audit_immutable',
      'suspension_audit_immutable', 'protect_calendar_snapshot', 'assign_estimate_number', 'assign_estimate_revision',
      'protect_estimate_snapshot', 'protect_estimate_decision', 'estimate_export_audit_final', 'report_export_audit_final',
      'chat_proposal_audit_immutable', 'chat_proposal_audit_no_truncate', 'chat_historical_audit_actor_erasure',
      'chat_historical_audit_workspace_erasure', 'chat_historical_audit_import_owner',
      'chat_proposal_storage_monotonic', 'chat_proposal_storage_no_truncate',
      'capture_decision_current', 'capture_snapshot_immutable', 'capture_transition_immutable', 'capture_processing_immutable',
      'capture_gmail_identity_immutable', 'capture_gmail_close_source_window', 'capture_gmail_sample_binding_immutable',
      'capture_gmail_preview_immutable', 'capture_setup_sample_immutable')
    ORDER BY c.relname, t.tgname`;
  const functionQuery = `SELECT p.proname, pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('authorization_lock_workspace', 'authorization_check_owner',
      'authorization_audit_immutable', 'suspension_columns_guard', 'plan_override_columns_guard',
      'assign_customer_number', 'assign_lead_number', 'record_lead_creation', 'record_lead_admission',
      'initialize_lead_assignment', 'preserve_lead_assignment_audit', 'lead_deletion_audit_immutable', 'lead_export_audit_final',
      'assign_job_number', 'advance_job_reminder_revision', 'assign_work_order_number', 'account_audit_immutable',
      'suspension_audit_immutable', 'protect_calendar_snapshot', 'assign_estimate_number', 'assign_estimate_revision',
      'protect_estimate_snapshot', 'protect_estimate_decision', 'estimate_export_audit_final', 'report_export_audit_final',
      'chat_proposal_audit_immutable', 'chat_historical_audit_parent_erasure', 'chat_historical_audit_import_owner',
      'chat_proposal_storage_monotonic', 'get_default_monthly_ai_tokens',
      'is_salesmora_feature_enabled', 'is_salesmora_rollout_enabled',
      'complete_admin_user_email_change', 'read_owner_workspace_export', 'record_owner_workspace_export_download',
      'capture_check_decision', 'capture_preserve_snapshot', 'capture_preserve_transition', 'capture_gmail_envelope_valid',
      'capture_gmail_identity_immutable', 'capture_gmail_close_source_window', 'capture_gmail_preview_immutable')
    ORDER BY p.proname`;
  for (const [query, expectedCount] of [[triggerQuery, 53], [functionQuery, 42]] as const) {
    const candidate = await databases[1].raw(query);
    assert.equal(candidate.rows.length, expectedCount);
    compareReference(candidate.rows);
  }
  const candidate = databases[1];
  for (const [schema, names] of [['public', tables], ['admin', adminTables]] as const) {
    for (const name of names) {
      const actual = await candidate(name).withSchema(schema).count<{ count: string }[]>('* as count');
      compareReference(actual[0].count);
    }
  }
  const flagQuery = `SELECT id, "defaultEnabled", enabled, owner, description, "expiresAt", "updatedBy"
    FROM admin."featureFlags" ORDER BY id`;
  const candidateFlags = await candidate.raw(flagQuery);
  assert.equal(candidateFlags.rows.length, 2);
  compareReference(candidateFlags.rows);
  assert.equal(referenceIndex, reference.checks.length);
  for (const db of [candidate]) {
    const authority = await db('chatProposalStorage').where({ id: 1 }).first('store', 'contractVersion', 'activatedAt');
    assert.equal(authority.store, 'canonical');
    assert.equal(authority.contractVersion, 1);
    assert.ok(authority.activatedAt instanceof Date);
    const { rows: [privileges] } = await db.raw<{ rows: { public_execute: boolean }[] }>(
      `SELECT EXISTS (SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
        WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE') AS public_execute
       FROM pg_proc p WHERE p.oid = 'public.chat_historical_audit_parent_erasure()'::regprocedure`,
    );
    assert.equal(privileges.public_execute, false);
  }
  assert.ok(await candidate('pg_constraint').where({ conname: 'jobs_accepted_estimate_fk' }).first('oid'));
  assert.ok(await candidate('pg_constraint').where({ conname: 'workOrderMaterialsCatalogFk' }).first('oid'));
  const role = 'salesmora_web';
  const { rows: [{ available }] } = await candidate.raw<{ rows: { available: boolean }[] }>(
    'SELECT to_regrole(?) IS NOT NULL AND to_regrole(?) IS NOT NULL AS available', [role, 'salesmora_runtime'],
  );
  if (!available) throw new Error('Baseline guard testing requires the local runtime database roles.');
  const userId = randomUUID(), workspaceId = randomUUID();
  const staffId = randomUUID(), staffSessionId = randomUUID(), staffNow = new Date();
  await candidate('staffUsers').withSchema('admin').insert({ id: staffId, name: 'Staff fixture',
    email: `${staffId}@example.test`, createdAt: staffNow, updatedAt: staffNow, disabledAt: staffNow });
  await assert.rejects(candidate('staffSessions').withSchema('admin').insert({ id: staffSessionId,
    userId: staffId, token: randomUUID(), expiresAt: new Date(staffNow.getTime() + 60_000),
    createdAt: staffNow, updatedAt: staffNow }), (error: { code?: string }) => error.code === '42501');
  await candidate('staffUsers').withSchema('admin').where({ id: staffId }).update({
    disabledAt: null, accessChangedAt: new Date(staffNow.getTime() + 1_000),
  });
  await assert.rejects(candidate('staffSessions').withSchema('admin').insert({ id: staffSessionId,
    userId: staffId, token: randomUUID(), expiresAt: new Date(staffNow.getTime() + 60_000),
    createdAt: staffNow, updatedAt: staffNow }), (error: { code?: string }) => error.code === '42501');
  await candidate('staffSessions').withSchema('admin').insert({ id: staffSessionId,
    userId: staffId, token: randomUUID(), expiresAt: new Date(staffNow.getTime() + 60_000),
    createdAt: new Date(staffNow.getTime() + 2_000), updatedAt: staffNow });
  const flagEnabled = async (flag: string, plan: string, workspace: string) => {
    const { rows: [{ enabled }] } = await candidate.raw<{ rows: { enabled: boolean }[] }>(
      'SELECT public.is_salesmora_feature_enabled(?, ?, ?) AS enabled', [flag, plan, workspace],
    );
    return enabled;
  };
  assert.equal(await flagEnabled('chat.enabled', 'free', workspaceId), true);
  assert.equal(await flagEnabled('unknown', 'free', workspaceId), false);
  await candidate('featureFlagOverrides').withSchema('admin').insert([
    { flagId: 'chat.enabled', targetType: 'plan', targetId: 'free', enabled: false,
      reason: 'Baseline test override', updatedBy: staffId },
    { flagId: 'chat.enabled', targetType: 'workspace', targetId: workspaceId, enabled: true,
      reason: 'Baseline test override', updatedBy: staffId },
  ]);
  assert.equal(await flagEnabled('chat.enabled', 'free', workspaceId), true);
  assert.equal(await flagEnabled('chat.enabled', 'free', randomUUID()), false);
  await candidate('users').insert({
    id: userId, name: 'Baseline fixture', email: `${userId}@example.test`,
    createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date(),
  });
  await candidate.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: userId, businessName: 'Fixture',
      businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
    await trx('workspacePolicies').insert({ workspaceId });
  });
  const settings = await candidate('leadAssignmentSettings').where({ workspaceId }).first('version', 'value');
  assert.equal(settings.version, 1);
  assert.deepEqual(settings.value, { kind: 'unassigned' });
  await assert.rejects(candidate('leadAssignmentSettings').where({ workspaceId }).update({ value: JSON.stringify({ kind: 'teammate' }) }),
    (error: { code?: string }) => error.code === '23514');
  const requestId = randomUUID();
  await candidate('leadAssignmentSettingsAudit').insert({ workspaceId, requestId, actorId: userId, inputHash: 'fixture',
    beforeVersion: 1, afterVersion: 2, beforeValue: JSON.stringify({ kind: 'unassigned' }),
    afterValue: JSON.stringify({ kind: 'teammate', teammateId: userId }) });
  await assert.rejects(candidate('leadAssignmentSettingsAudit').where({ workspaceId, requestId }).delete(),
    (error: { code?: string; message?: string }) => error.code === '23514' && error.message?.includes('Lead assignment history is immutable') === true);
  await candidate.raw('GRANT USAGE ON SCHEMA public TO ??', [role]);
  await candidate.raw('GRANT SELECT, INSERT, UPDATE ON users, workspaces TO ??', [role]);
  await candidate.raw('GRANT SELECT ON "workspaceMemberships", "workspacePolicies" TO ??', [role]);
  await candidate.transaction(async trx => {
    await trx.raw('SET LOCAL ROLE ??', [role]);
    assert.equal(await trx('users').where({ id: userId }).update({ name: 'Updated fixture' }), 1);
    assert.equal(await trx('workspaces').where({ id: workspaceId }).update({ businessName: 'Updated fixture' }), 1);
  });
  const protectedWrites = [
    { query: () => candidate('users').where({ id: userId }).update({ suspendedAt: new Date(), suspendedReason: 'fixture' }),
      message: 'Suspension state can only be changed by the admin console' },
    { query: () => candidate('workspaces').where({ id: workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'fixture' }),
      message: 'Suspension state can only be changed by the admin console' },
    { query: () => candidate('workspaces').where({ id: workspaceId }).update({
      planOverride: 'premium', planOverrideEndsAt: new Date(), planOverrideReason: 'fixture', planOverrideId: randomUUID(),
    }), message: 'Plan overrides can only be changed by the admin console' },
    { query: () => candidate('users').insert({ id: randomUUID(), name: 'Fixture', email: 'blocked@example.test',
      createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date(),
      suspendedAt: new Date(), suspendedReason: 'fixture' }),
    message: 'Suspension state can only be changed by the admin console' },
    { query: () => candidate('workspaces').insert({ id: randomUUID(), ownerId: userId, businessName: 'Fixture',
      businessType: 'test', postalCode: '', serviceRange: '', suspendedAt: new Date(), suspendedReason: 'fixture' }),
    message: 'Suspension state can only be changed by the admin console' },
    { query: () => candidate('workspaces').insert({ id: randomUUID(), ownerId: userId, businessName: 'Fixture',
      businessType: 'test', postalCode: '', serviceRange: '', planOverride: 'premium', planOverrideEndsAt: new Date(),
      planOverrideReason: 'fixture', planOverrideId: randomUUID() }),
    message: 'Plan overrides can only be changed by the admin console' },
  ];
  for (const { query, message } of protectedWrites) {
    await assert.rejects(candidate.transaction(async trx => {
      await trx.raw('SET LOCAL ROLE ??', [role]);
      await query().transacting(trx);
    }), (error: { code?: string; message?: string }) => error.code === '42501' && error.message?.includes(message) === true);
  }
  const customerId = randomUUID();
  await candidate('customers').insert({ id: customerId, workspaceId, name: 'Customer fixture', type: 'person',
    companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  assert.equal((await candidate('customers').where({ id: customerId }).first('customerNumber')).customerNumber, 1);
  const leadId = randomUUID();
  await candidate('leads').insert({ id: leadId, workspaceId, createdBy: userId, submissionId: randomUUID(),
    submissionHash: 'fixture', name: 'Lead fixture', email: '', phone: '', service: '', address: '',
    details: '', notes: '', source: 'other', stage: 'in-progress', customerId });
  const lead = await candidate('leads').where({ id: leadId }).first('leadNumber', 'stage');
  assert.equal(lead.leadNumber, 1);
  assert.equal(lead.stage, 'estimate-sent');
  assert.equal((await candidate('leadActivity').where({ leadId }).first('type')).type, 'created');
  assert.ok(await candidate('workspaceLeadAdmissions').where({ leadId }).first('leadId'));
  const jobId = randomUUID(), notificationId = randomUUID();
  await candidate('jobs').insert({ id: jobId, workspaceId, customerId, customerName: 'Customer fixture',
    sourceLeadId: leadId, title: 'Job fixture', service: '', location: '', description: '' });
  assert.equal((await candidate('jobs').where({ id: jobId }).first('jobNumber')).jobNumber, 1);
  const estimateId = randomUUID(), snapshotId = randomUUID(), decisionId = randomUUID();
  await candidate('estimates').insert({ id: estimateId, workspaceId, name: 'Estimate fixture',
    parentType: 'job', jobId });
  assert.equal((await candidate('estimates').where({ id: estimateId }).first('estimateNumber')).estimateNumber, 1);
  await candidate('estimate_snapshots').insert({ id: snapshotId, workspaceId, estimateId,
    content: JSON.stringify({ total: 100 }), contentHash: 'a'.repeat(64) });
  await assert.rejects(candidate('estimate_snapshots').where({ id: snapshotId }).update({ content: '{}' }),
    (error: { message?: string }) => error.message?.includes('Estimate snapshots are immutable') === true);
  await candidate('estimate_decisions').insert({ id: decisionId, workspaceId, estimateId, snapshotId,
    estimateVersion: 1, outcome: 'accepted', decisionDate: '2026-12-01', channel: 'email',
    note: '', snapshotTotalCents: 100, actorId: userId });
  await assert.rejects(candidate('estimate_decisions').where({ id: decisionId }).update({ outcome: 'declined' }),
    (error: { message?: string }) => error.message?.includes('Estimate decisions are immutable') === true);
  assert.equal(await candidate('estimate_decisions').where({ id: decisionId }).update({ actorId: null }), 1);
  const reportAuditId = randomUUID();
  await candidate('reportExportAudit').insert({ id: reportAuditId, workspaceId, actorId: userId,
    report: 'overview', dataset: 'fixture', scope: 'workspace', selection: '{}', policyRevision: 1,
    count: 0, limits: '{}', snapshotAt: new Date(), outcome: 'started' });
  await assert.rejects(candidate('reportExportAudit').where({ id: reportAuditId }).update({ dataset: 'changed' }),
    (error: { message?: string }) => error.message?.includes('Report export audit identity is immutable') === true);
  await candidate('reportExportAudit').where({ id: reportAuditId }).update({ outcome: 'completed', finishedAt: new Date() });
  await assert.rejects(candidate('reportExportAudit').where({ id: reportAuditId }).delete(),
    (error: { message?: string }) => error.message?.includes('Final report export audits are immutable') === true);
  const threadId = randomUUID(), turnId = randomUUID(), proposalId = randomUUID(), proposalAuditId = randomUUID();
  await candidate('chatThreads').insert({ id: threadId, workspaceId, userId });
  await candidate('chatTurns').insert({ id: turnId, threadId, workspaceId, userId, clientTurnId: randomUUID(),
    requestHash: 'fixture', surfaceKey: 'fixture', state: 'completed', leaseUntil: new Date() });
  const proposal = { family: 'estimateDraft', id: proposalId, workspaceId, userId, threadId, turnId,
    payloadVersion: 1, state: 'pending', inputHash: 'a'.repeat(64), payload: '{}',
    expiresAt: new Date(), createdAt: new Date() };
  await candidate('chatProposals').insert(proposal);
  await assert.rejects(candidate('chatProposals').insert({ ...proposal, id: randomUUID() }),
    (error: { code?: string }) => error.code === '23505');
  await candidate('chatProposalAudit').insert({ id: proposalAuditId, family: proposal.family, proposalId,
    workspaceId, actorId: userId, action: 'created', inputHash: 'a'.repeat(64), details: '{}', createdAt: new Date() });
  await assert.rejects(candidate('chatProposalAudit').where({ id: proposalAuditId }).delete(),
    (error: { code?: string }) => error.code === '23514');
  await assert.rejects(candidate('chatProposalStorage').where({ id: 1 }).update({ store: 'legacy', activatedAt: null }),
    (error: { code?: string }) => error.code === '23514');
  await candidate('deadlineNotifications').insert({ id: notificationId, workspaceId, jobId, userId,
    reminderRevision: 0, offsetKey: 'fixture', completionDeadline: '2026-12-01',
    reminderDate: '2026-11-30', timezone: 'UTC', event: 'approaching' });
  await candidate('jobs').where({ id: jobId }).update({ completionDeadline: '2026-12-02' });
  assert.equal((await candidate('jobs').where({ id: jobId }).first('reminderRevision')).reminderRevision, 1);
  assert.equal((await candidate('deadlineNotifications').where({ id: notificationId }).first('emailStatus')).emailStatus, 'skipped');
  await candidate('leads').where({ id: leadId }).delete();
  assert.ok(await candidate('workspaceLeadAdmissions').where({ leadId }).first('leadId'));
  assert.equal(await candidate('leadActivity').where({ leadId }).first('id'), undefined);
  assert.equal((await candidate('jobs').where({ id: jobId }).first('sourceLeadId')).sourceLeadId, null);
  console.log('Fresh baseline schema, seed, privileges, and runner comparison passed.');
} finally {
  await Promise.all(databases.map(db => db.destroy()));
  try {
    for (const name of created) await owner.raw('DROP DATABASE ??', [name]);
  } finally {
    await owner.destroy();
  }
}
