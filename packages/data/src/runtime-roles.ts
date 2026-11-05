import type { Knex } from 'knex';

/** Group role that web and worker log-in roles inherit their tenant-data privileges from. */
export const RUNTIME_GROUP = 'salesmora_runtime';
export const RUNTIME_LOGIN_ROLES = { web: 'salesmora_web', worker: 'salesmora_worker' } as const;
export const ADMIN_APP_ROLE = 'salesmora_admin_app';
export const AUDIT_WORKER_ROLE = 'salesmora_audit_worker';
export const AUDIT_VERIFIER_ROLE = 'salesmora_audit_verifier';
export const ADMIN_IDENTITY_TABLES = [
  'staffUsers',
  'staffSessions',
  'staffAccounts',
  'staffVerifications',
  'staffPasskeys',
  'staffTwoFactors',
  'staffRateLimits',
  'staffRoleAssignments',
  'staffInvitations',
  'staffEnrollments',
  'approvalRequests',
  'staffActionChallenges',
  'staffFactorUses',
  'staffInvitationDeliveries',
  'workspaceInvitationDeliveries',
  'userEmailChanges',
  'aiModelPricing',
  'systemSettingVersions',
] as const;

const MIGRATION_TABLES = ['knex_migrations', 'knex_migrations_lock'];
// Tables holding credentials or tokens that the admin app must never read (§5.2).
const GMAIL_RUNTIME_GRANTS: Record<string, { web: string; worker: string | null }> = {
  captureGmailWorkerReadiness: { web: 'SELECT', worker: 'SELECT, INSERT, UPDATE' },
  captureGmailSamplePreviews: { web: 'SELECT, INSERT, DELETE', worker: null },
  captureGmailSampleBindings: { web: 'SELECT, INSERT', worker: 'SELECT' },
  captureGmailAccounts: { web: 'SELECT, INSERT, UPDATE', worker: 'SELECT, UPDATE' },
  captureGmailCredentials: { web: 'SELECT, INSERT, UPDATE, DELETE', worker: 'SELECT, UPDATE' },
  captureGmailOAuthAttempts: { web: 'SELECT, INSERT, UPDATE, DELETE', worker: null },
  captureGmailMailboxState: { web: 'SELECT, INSERT, UPDATE, DELETE', worker: 'SELECT, INSERT, UPDATE, DELETE' },
  captureGmailEligibilityWindows: { web: 'SELECT, INSERT, UPDATE', worker: 'SELECT, INSERT, UPDATE' },
  captureGmailMessageJobs: { web: 'SELECT, UPDATE', worker: 'SELECT, INSERT, UPDATE' },
  captureGmailDisconnectReviews: { web: 'SELECT, INSERT, UPDATE', worker: null },
  captureGmailConnectionEvents: { web: 'SELECT, INSERT', worker: 'SELECT, INSERT' },
};
const ADMIN_HIDDEN_TABLES = ['verifications', 'rateLimits', ...Object.keys(GMAIL_RUNTIME_GRANTS)];
const ADMIN_COLUMN_ALLOWLISTS: Record<string, string[]> = {
  accounts: ['userId', 'providerId'],
};
const ADMIN_HIDDEN_COLUMNS: Record<string, string[]> = { sessions: ['token'], estimate_share_tokens: ['encryptedToken'] };
// Staff-controlled state the customer app must not be able to forge or undo.
export const STAFF_ONLY_TABLES = ['suspensionAudit', 'workspaceSuspensionNotices', 'accountAudit', 'workspaceOwnershipNotices'];
// The worker delivers the staff notices, so it may read and update the outboxes but never create notices.
const WORKER_TABLE_GRANTS: Record<string, string> = { workspaceSuspensionNotices: 'SELECT, UPDATE', workspaceOwnershipNotices: 'SELECT, UPDATE' };

interface AdminWrite { table: string; privilege: 'INSERT' | 'UPDATE' | 'DELETE'; columns?: string[]; sequence?: string }
// The only tenant writes the admin app needs (§5.2). Each new admin use case adds its rows here.
const ADMIN_WRITES: AdminWrite[] = [
  { table: 'captureAccessChecks', privilege: 'INSERT', columns: ['id','workspaceId','targetPlan','sources','effectiveAt'] },
  { table: 'users', privilege: 'UPDATE', columns: ['suspendedAt', 'suspendedReason'] },
  { table: 'workspaces', privilege: 'UPDATE', columns: ['suspendedAt', 'suspendedReason'] },
  { table: 'sessions', privilege: 'DELETE' },
  { table: 'chatTurns', privilege: 'UPDATE', columns: ['state', 'finishedAt'] },
  { table: 'suspensionAudit', privilege: 'INSERT', sequence: 'suspensionAudit_id_seq' },
  { table: 'workspaceSuspensionNotices', privilege: 'INSERT' },
  { table: 'workspaceSuspensionNotices', privilege: 'UPDATE', columns: ['status'] },
  { table: 'workspaces', privilege: 'UPDATE', columns: ['planOverride', 'planOverrideEndsAt', 'planOverrideReason', 'planOverrideId'] },
  { table: 'billingAudit', privilege: 'INSERT', sequence: 'billingAudit_id_seq' },
  { table: 'billingPlanChanges', privilege: 'INSERT', columns: ['id', 'workspaceId', 'actorId', 'targetPlan', 'kind', 'basis', 'amountDue', 'prorationAt'] },
  { table: 'billingPlanChanges', privilege: 'UPDATE', columns: ['state', 'scheduleId'] },
  { table: 'workspaceSubscriptions', privilege: 'UPDATE', columns: ['subscriptionId', 'plan', 'status', 'priceId', 'cancelAtPeriodEnd', 'paidThrough', 'recoveryUntil', 'updatedAt'] },
  { table: 'users', privilege: 'UPDATE', columns: ['emailVerified', 'updatedAt'] },
  { table: 'accountAudit', privilege: 'INSERT', sequence: 'accountAudit_id_seq' },
  { table: 'workspaceMemberships', privilege: 'DELETE' },
  { table: 'leads', privilege: 'UPDATE', columns: ['ownerId', 'ownerName', 'version', 'updatedAt', 'lastActivityAt'] },
  { table: 'leadActivity', privilege: 'INSERT' },
  { table: 'workspaceInvitations', privilege: 'UPDATE', columns: ['status', 'tokenHash', 'expiresAt', 'sentAt', 'lastAttemptAt', 'deliveryAttempts'] },
  { table: 'authorizationAudit', privilege: 'INSERT', sequence: 'authorizationAudit_id_seq' },
  { table: 'workspaces', privilege: 'UPDATE', columns: ['ownerId'] },
  { table: 'workspaceMemberships', privilege: 'UPDATE', columns: ['role'] },
  { table: 'workspaceOwnershipNotices', privilege: 'INSERT' },
  { table: 'workspaceAITokenBudgets', privilege: 'INSERT', columns: ['workspaceId', 'monthlyTokens'] },
  { table: 'workspaceAITokenBudgets', privilege: 'UPDATE', columns: ['monthlyTokens', 'updatedAt'] },
  { table: 'billingRenewalRecoveries', privilege: 'UPDATE', columns: ['state', 'reconciledAt', 'retryCancelledAt'] },
  { table: 'billingRecoveryGraceExtensions', privilege: 'INSERT', columns: ['id', 'workspaceId', 'invoiceId', 'invoiceCreatedAt', 'extendedUntil'] },
  { table: 'billingWebhookEvents', privilege: 'UPDATE', columns: ['retryAt'] },
];

async function existingRoles(db: Knex) {
  const rows = await db('pg_roles').whereIn('rolname', [
    RUNTIME_GROUP,
    ADMIN_APP_ROLE,
    AUDIT_WORKER_ROLE,
    AUDIT_VERIFIER_ROLE,
    ...Object.values(RUNTIME_LOGIN_ROLES),
  ])
    .select<{ rolname: string }[]>('rolname');
  return new Set(rows.map(row => row.rolname));
}

// The schema the migrations write to: public in every deployment, a scratch schema in replay rehearsals.
async function targetSchema(db: Knex) {
  const { rows } = await db.raw<{ rows: { schema: string }[] }>('SELECT current_schema() AS schema');
  return rows[0].schema;
}

async function existingColumns(db: Knex, schema: string, table: string, names: string[]) {
  const rows = await db('information_schema.columns').where({ table_schema: schema, table_name: table }).whereIn('column_name', names)
    .select<{ column_name: string }[]>('column_name');
  return rows.length === names.length;
}

async function existingTables(db: Knex, schema: string, names: string[]) {
  const rows = await db('pg_tables').where({ schemaname: schema }).whereIn('tablename', names).select<{ tablename: string }[]>('tablename');
  return rows.map(row => row.tablename);
}

/**
 * Grants least-privilege access to the application schema (public). Idempotent, and it skips roles
 * that have not been provisioned yet (`pnpm db:roles`), so deployments without the
 * roles keep working. Must run as the schema owner so default privileges cover the
 * tables that later migrations create.
 */
export async function applyRuntimeGrants(db: Knex) {
  const roles = await existingRoles(db);
  const schema = await targetSchema(db);
  const migrationTables = await existingTables(db, schema, MIGRATION_TABLES);
  // PostgreSQL 15+ already defaults to this; older clusters let every role create objects.
  await db.raw('REVOKE CREATE ON SCHEMA ?? FROM PUBLIC', [schema]);
  if (roles.has(RUNTIME_GROUP)) {
    await db.raw('GRANT USAGE ON SCHEMA ?? TO ??', [schema, RUNTIME_GROUP]);
    await db.raw('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ?? TO ??', [schema, RUNTIME_GROUP]);
    await db.raw('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA ?? TO ??', [schema, RUNTIME_GROUP]);
    await db.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA ?? GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ??', [schema, RUNTIME_GROUP]);
    await db.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA ?? GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ??', [schema, RUNTIME_GROUP]);
    for (const table of migrationTables) await db.raw('REVOKE ALL ON ?? FROM ??', [table, RUNTIME_GROUP]);
    for (const table of await existingTables(db, schema, STAFF_ONLY_TABLES)) await db.raw('REVOKE ALL ON ?? FROM ??', [table, RUNTIME_GROUP]);
    if ((await existingTables(db, schema, ['users'])).length) {
      for (const role of [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)].filter(name => roles.has(name))) {
        await db.raw('REVOKE UPDATE ON ?? FROM ??', ['users', role]);
        await db.raw('REVOKE UPDATE (??) ON ?? FROM ??', ['email', 'users', role]);
      }
      const mutableUserColumns = ['name', 'image', 'emailVerified', 'onboardingStatus', 'deletionRequestedAt', 'updatedAt'];
      if (await existingColumns(db, schema, 'users', mutableUserColumns)) {
        await db.raw(`GRANT UPDATE (${mutableUserColumns.map(() => '??').join(', ')}) ON ?? TO ??`,
          [...mutableUserColumns, 'users', RUNTIME_GROUP]);
      }
    }
    if ((await existingTables(db, schema, ['workspaceAITokenBudgets'])).length) {
      for (const role of [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)].filter(name => roles.has(name))) {
        await db.raw('REVOKE ALL ON ?? FROM ??', ['workspaceAITokenBudgets', role]);
      }
      for (const role of Object.values(RUNTIME_LOGIN_ROLES).filter(name => roles.has(name))) {
        await db.raw('GRANT SELECT ON ?? TO ??', ['workspaceAITokenBudgets', role]);
      }
    }
  }
  // Remove inherited broad grants before assigning each Gmail runtime its explicit privileges.
  // Stable account identities and eligibility/message dedupe records are retained until workspace purge.
  for (const table of await existingTables(db, schema, Object.keys(GMAIL_RUNTIME_GRANTS))) {
    await db.raw('REVOKE ALL ON ?? FROM PUBLIC', [table]);
    for (const role of [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)].filter(name => roles.has(name))) {
      await db.raw('REVOKE ALL ON ?? FROM ??', [table, role]);
    }
    for (const runtime of ['web', 'worker'] as const) {
      const privileges = GMAIL_RUNTIME_GRANTS[table][runtime], role = RUNTIME_LOGIN_ROLES[runtime];
      if (privileges && roles.has(role)) await db.raw(`GRANT ${privileges} ON ?? TO ??`, [table, role]);
    }
  }
  if (roles.has(RUNTIME_LOGIN_ROLES.worker)) {
    for (const table of await existingTables(db, schema, Object.keys(WORKER_TABLE_GRANTS))) {
      await db.raw(`GRANT ${WORKER_TABLE_GRANTS[table]} ON ?? TO ??`, [table, RUNTIME_LOGIN_ROLES.worker]);
    }
  }
  if (roles.has(ADMIN_APP_ROLE)) {
    // Read-only, except for the narrow writes in ADMIN_WRITES.
    await db.raw('GRANT USAGE ON SCHEMA ?? TO ??', [schema, ADMIN_APP_ROLE]);
    await db.raw('GRANT SELECT ON ALL TABLES IN SCHEMA ?? TO ??', [schema, ADMIN_APP_ROLE]);
    await db.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA ?? GRANT SELECT ON TABLES TO ??', [schema, ADMIN_APP_ROLE]);
    for (const table of [...migrationTables, ...await existingTables(db, schema, ADMIN_HIDDEN_TABLES)]) {
      await db.raw('REVOKE ALL ON ?? FROM ??', [table, ADMIN_APP_ROLE]);
    }
    for (const [table, hidden] of Object.entries(ADMIN_HIDDEN_COLUMNS)) {
      if (!(await existingTables(db, schema, [table])).length) continue;
      const columns = (await db('information_schema.columns').where({ table_schema: schema, table_name: table })
        .whereNotIn('column_name', hidden).orderBy('ordinal_position').select<{ column_name: string }[]>('column_name'))
        .map(row => row.column_name);
      await db.raw('REVOKE ALL ON ?? FROM ??', [table, ADMIN_APP_ROLE]);
      await db.raw(`GRANT SELECT (${columns.map(() => '??').join(', ')}) ON ?? TO ??`, [...columns, table, ADMIN_APP_ROLE]);
    }
    for (const [table, allowed] of Object.entries(ADMIN_COLUMN_ALLOWLISTS)) {
      if (!(await existingTables(db, schema, [table])).length) continue;
      await db.raw('REVOKE ALL ON ?? FROM ??', [table, ADMIN_APP_ROLE]);
      if (await existingColumns(db, schema, table, allowed)) {
        await db.raw(`GRANT SELECT (${allowed.map(() => '??').join(', ')}) ON ?? TO ??`, [...allowed, table, ADMIN_APP_ROLE]);
      }
    }
    // After the hidden-column revokes above, which would otherwise remove these grants.
    for (const write of ADMIN_WRITES) {
      if (!(await existingTables(db, schema, [write.table])).length) continue;
      if (write.columns && !await existingColumns(db, schema, write.table, write.columns)) continue;
      const columns = write.columns ? ` (${write.columns.map(() => '??').join(', ')})` : '';
      await db.raw(`GRANT ${write.privilege}${columns} ON ?? TO ??`, [...write.columns ?? [], write.table, ADMIN_APP_ROLE]);
      if (write.sequence) await db.raw('GRANT USAGE ON SEQUENCE ?? TO ??', [write.sequence, ADMIN_APP_ROLE]);
    }
  }
}

/**
 * Keeps staff identity tables isolated from customer runtimes. Only the admin app
 * receives DML, and only for the explicit identity-table allow-list.
 */
export async function applyAdminIdentityGrants(db: Knex) {
  const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
    "SELECT to_regnamespace('admin') IS NOT NULL AS exists",
  );
  if (!exists) return;

  const roles = await existingRoles(db);
  const runtimeRoles = [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)]
    .filter(role => roles.has(role));

  await db.raw('REVOKE ALL ON SCHEMA ?? FROM PUBLIC', ['admin']);
  await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA ?? FROM PUBLIC', ['admin']);
  await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA ?? FROM PUBLIC', ['admin']);
  for (const role of runtimeRoles) {
    await db.raw('REVOKE ALL ON SCHEMA ?? FROM ??', ['admin', role]);
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA ?? FROM ??', ['admin', role]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA ?? FROM ??', ['admin', role]);
  }

  if (!roles.has(ADMIN_APP_ROLE)) return;
  await db.raw('GRANT USAGE ON SCHEMA ?? TO ??', ['admin', ADMIN_APP_ROLE]);
  const tables = await existingTables(db, 'admin', [...ADMIN_IDENTITY_TABLES, 'workspaceExportRequests', 'featureFlags', 'featureFlagOverrides', 'rolloutFlags']);
  for (const table of tables) {
    if (table === 'workspaceExportRequests') {
      await db.raw('GRANT SELECT, INSERT ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    } else if (table === 'systemSettingVersions') {
      await db.raw('GRANT SELECT, INSERT ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    } else if (table === 'featureFlags') {
      await db.raw('GRANT SELECT, UPDATE ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    } else if (table === 'featureFlagOverrides') {
      await db.raw('GRANT SELECT, INSERT, UPDATE, DELETE ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    } else if (table === 'workspaceInvitationDeliveries') {
      await db.raw('GRANT SELECT, INSERT, UPDATE ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    } else {
      await db.raw('GRANT SELECT, INSERT, UPDATE, DELETE ON ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    }
  }
  if (
    await existingColumns(db, 'admin', 'workspaceExportRequests', ['nextAttemptAt']) &&
    (await existingTables(db, 'admin', ['workspaceExportArtifacts'])).length
  ) {
    await applyAdminExportWorkerGrants(db);
  }
}

export async function applyAdminRuntimeSettingsGrants(db: Knex) {
  const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
    "SELECT to_regprocedure('public.get_default_monthly_ai_tokens()') IS NOT NULL AS exists",
  );
  if (!exists) return;
  const roles = await existingRoles(db);
  for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
    if (roles.has(role)) {
      await db.raw('GRANT EXECUTE ON FUNCTION public.get_default_monthly_ai_tokens() TO ??', [role]);
    }
  }
}

export async function applyAdminRuntimeFeatureFlagGrants(db: Knex) {
  const roles = await existingRoles(db);
  for (const signature of [
    'public.is_salesmora_feature_enabled(text,text,text)',
    'public.is_salesmora_rollout_enabled(text)',
  ]) {
    const { rows: [{ exists }] } = await db.raw<{ rows: { exists: boolean }[] }>(
      'SELECT to_regprocedure(?) IS NOT NULL AS exists', [signature],
    );
    if (!exists) continue;
    for (const role of Object.values(RUNTIME_LOGIN_ROLES)) {
      if (roles.has(role)) {
        await db.raw(`GRANT EXECUTE ON FUNCTION ${signature} TO ??`, [role]);
      }
    }
  }
}

export async function applyAdminExportWorkerGrants(db: Knex) {
  const roles = await existingRoles(db);
  const worker = RUNTIME_LOGIN_ROLES.worker;
  if (!roles.has(worker)) return;

  await db.raw('REVOKE ALL ON SCHEMA ?? FROM ??', ['admin', worker]);
  await db.raw('GRANT USAGE ON SCHEMA ?? TO ??', ['admin', worker]);
  for (const table of ['workspaceExportRequests', 'workspaceExportArtifacts']) {
    if (!(await existingTables(db, 'admin', [table])).length) continue;
    await db.raw('REVOKE ALL ON TABLE ?? FROM PUBLIC', [`admin.${table}`]);
    await db.raw('REVOKE ALL ON TABLE ?? FROM ??', [`admin.${table}`, worker]);
  }
  if ((await existingTables(db, 'admin', ['workspaceExportRequests'])).length) {
    await db.raw(
      'GRANT SELECT ("id", "workspaceId", "ownerUserId", "requestedBy", "requestedByRole", "reason", "state", "requestedAt", "updatedAt", "attempts", "nextAttemptAt", "expiresAt", "workspaceName") ON TABLE ?? TO ??',
      ['admin.workspaceExportRequests', worker],
    );
    if (await existingColumns(db, 'admin', 'workspaceExportRequests', [
      'notificationStatus', 'notificationAttempts', 'nextNotificationAt',
    ])) {
      await db.raw(
        'GRANT SELECT ("notificationStatus", "notificationAttempts", "nextNotificationAt") ON TABLE ?? TO ??',
        ['admin.workspaceExportRequests', worker],
      );
    }
    await db.raw(
      'GRANT UPDATE ("state", "updatedAt", "attempts", "nextAttemptAt", "expiresAt", "csvCount", "fileMetadataCount", "failureCode") ON TABLE ?? TO ??',
      ['admin.workspaceExportRequests', worker],
    );
    if (await existingColumns(db, 'admin', 'workspaceExportRequests', [
      'notificationStatus', 'notificationAttempts', 'nextNotificationAt', 'notificationSentAt',
    ])) {
      await db.raw(
        'GRANT UPDATE ("notificationStatus", "notificationAttempts", "nextNotificationAt", "notificationSentAt") ON TABLE ?? TO ??',
        ['admin.workspaceExportRequests', worker],
      );
    }
  }
  if ((await existingTables(db, 'admin', ['workspaceExportArtifacts'])).length) {
    await db.raw(
      'GRANT SELECT ("requestId") ON TABLE ?? TO ??',
      ['admin.workspaceExportArtifacts', worker],
    );
    await db.raw(
      'GRANT INSERT ("requestId", "objectKey", "encryptedDek", "fileIv", "fileAuthTag", "archiveSizeBytes", "artifactSizeBytes", "createdAt") ON TABLE ?? TO ??',
      ['admin.workspaceExportArtifacts', worker],
    );
    await db.raw('GRANT DELETE ON TABLE ?? TO ??', ['admin.workspaceExportArtifacts', worker]);
  }
  if ((await existingTables(db, 'admin', ['auditEvents'])).length) {
    await db.raw('REVOKE ALL ON TABLE ?? FROM ??', ['admin.auditEvents', worker]);
    await db.raw(
      'GRANT SELECT ("sequence", "hash") ON TABLE ?? TO ??',
      ['admin.auditEvents', worker],
    );
    await db.raw(
      'GRANT INSERT ("sequence", "id", "occurredAt", "staffUserId", "staffRole", "action", "targetType", "targetId", "workspaceId", "reason", "before", "after", "requestId", "ipAddress", "userAgent", "prevHash", "hash") ON TABLE ?? TO ??',
      ['admin.auditEvents', worker],
    );
    await db.raw('REVOKE ALL ON SEQUENCE ?? FROM ??', ['admin.auditEvents_sequence_seq', worker]);
    await db.raw('GRANT USAGE ON SEQUENCE ?? TO ??', ['admin.auditEvents_sequence_seq', worker]);
  }
}

export async function applyAdminAuditGrants(db: Knex) {
  if (!(await existingTables(db, 'admin', ['auditEvents'])).length) return;
  const roles = await existingRoles(db);
  const runtimeRoles = [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)]
    .filter(role => roles.has(role));

  await db.raw('REVOKE ALL ON TABLE ?? FROM PUBLIC', ['admin.auditEvents']);
  for (const role of runtimeRoles) {
    await db.raw('REVOKE ALL ON TABLE ?? FROM ??', ['admin.auditEvents', role]);
  }
  if (roles.has(ADMIN_APP_ROLE)) {
    await db.raw('REVOKE ALL ON TABLE ?? FROM ??', ['admin.auditEvents', ADMIN_APP_ROLE]);
    await db.raw('GRANT SELECT, INSERT ON TABLE ?? TO ??', ['admin.auditEvents', ADMIN_APP_ROLE]);
    await db.raw('REVOKE ALL ON SEQUENCE ?? FROM ??', ['admin.auditEvents_sequence_seq', ADMIN_APP_ROLE]);
    await db.raw('GRANT USAGE ON SEQUENCE ?? TO ??', ['admin.auditEvents_sequence_seq', ADMIN_APP_ROLE]);
  }
  if (
    await existingColumns(db, 'admin', 'workspaceExportRequests', ['nextAttemptAt']) &&
    (await existingTables(db, 'admin', ['workspaceExportArtifacts'])).length
  ) {
    await applyAdminExportWorkerGrants(db);
  }
}

export async function applyAuditWorkerGrants(db: Knex) {
  const tables = await existingTables(db, 'admin', [
    'auditArchiveJobs', 'auditArchiveAttempts', 'auditArchiveCopies', 'auditArchiveCopyAttempts', 'auditArchiveChecks',
  ]);
  if (!tables.length) return;
  const roles = await existingRoles(db);
  for (const table of tables) {
    await db.raw('REVOKE ALL ON TABLE ?? FROM PUBLIC', [`admin.${table}`]);
    for (const role of [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES), ADMIN_APP_ROLE]
      .filter(name => roles.has(name))) {
      await db.raw('REVOKE ALL ON TABLE ?? FROM ??', [`admin.${table}`, role]);
    }
    if (roles.has(ADMIN_APP_ROLE)) {
      await db.raw('GRANT SELECT ON TABLE ?? TO ??', [`admin.${table}`, ADMIN_APP_ROLE]);
    }
  }
  if (roles.has(AUDIT_WORKER_ROLE)) {
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA admin FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA admin FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('REVOKE CREATE ON SCHEMA public FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('REVOKE ALL ON SCHEMA admin FROM ??', [AUDIT_WORKER_ROLE]);
    await db.raw('GRANT USAGE ON SCHEMA admin TO ??', [AUDIT_WORKER_ROLE]);
    await db.raw('GRANT SELECT ON TABLE admin."auditEvents" TO ??', [AUDIT_WORKER_ROLE]);
    for (const table of tables) {
      if (table === 'auditArchiveCopies') {
        await db.raw('GRANT SELECT, INSERT ON TABLE ?? TO ??', [`admin.${table}`, AUDIT_WORKER_ROLE]);
        await db.raw(`GRANT UPDATE ("state", "attempts", "checkpoint", "checkpointSHA256", "copyEvidence", "failureCode", "updatedAt")
          ON TABLE ?? TO ??`, [`admin.${table}`, AUDIT_WORKER_ROLE]);
        continue;
      }
      if (table === 'auditArchiveCopyAttempts') {
        await db.raw('GRANT SELECT, INSERT ON TABLE ?? TO ??', [`admin.${table}`, AUDIT_WORKER_ROLE]);
        await db.raw('GRANT UPDATE ("state", "failureCode", "finishedAt") ON TABLE ?? TO ??',
          [`admin.${table}`, AUDIT_WORKER_ROLE]);
        continue;
      }
      await db.raw(`GRANT ${table === 'auditArchiveChecks' ? 'SELECT' : 'SELECT, INSERT, UPDATE'} ON TABLE ?? TO ??`,
        [`admin.${table}`, AUDIT_WORKER_ROLE]);
    }
  }
  if (roles.has(AUDIT_VERIFIER_ROLE)) {
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA admin FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA admin FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('REVOKE CREATE ON SCHEMA public FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('REVOKE ALL ON SCHEMA admin FROM ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('GRANT USAGE ON SCHEMA admin TO ??', [AUDIT_VERIFIER_ROLE]);
    await db.raw('GRANT SELECT ON TABLE admin."auditEvents" TO ??', [AUDIT_VERIFIER_ROLE]);
    for (const table of tables.filter(name => ['auditArchiveCopies', 'auditArchiveChecks'].includes(name))) {
      await db.raw(`GRANT ${table === 'auditArchiveChecks' ? 'SELECT, INSERT' : 'SELECT'} ON TABLE ?? TO ??`,
        [`admin.${table}`, AUDIT_VERIFIER_ROLE]);
    }
  }
}

export async function revokeRuntimeGrants(db: Knex) {
  const roles = await existingRoles(db);
  const schema = await targetSchema(db);
  if (roles.has(RUNTIME_LOGIN_ROLES.worker)) await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA ?? FROM ??', [schema, RUNTIME_LOGIN_ROLES.worker]);
  for (const role of [RUNTIME_GROUP, ADMIN_APP_ROLE].filter(name => roles.has(name))) {
    await db.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA ?? REVOKE ALL ON TABLES FROM ??', [schema, role]);
    await db.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA ?? REVOKE ALL ON SEQUENCES FROM ??', [schema, role]);
    await db.raw('REVOKE ALL ON ALL TABLES IN SCHEMA ?? FROM ??', [schema, role]);
    await db.raw('REVOKE ALL ON ALL SEQUENCES IN SCHEMA ?? FROM ??', [schema, role]);
    await db.raw('REVOKE USAGE ON SCHEMA ?? FROM ??', [schema, role]);
  }
}

export interface DatabaseRoleFacts {
  user: string;
  superuser: boolean;
  databaseOwner: boolean;
  canCreateInPublic: boolean;
}

/** Reasons the connected role is more privileged than a runtime service should be. */
export function databaseRoleProblems(facts: DatabaseRoleFacts) {
  const problems: string[] = [];
  if (facts.superuser) problems.push('is a superuser');
  if (facts.databaseOwner) problems.push('owns the database');
  if (facts.canCreateInPublic) problems.push('can create objects in the public schema');
  return problems;
}

export async function readDatabaseRoleFacts(db: Knex): Promise<DatabaseRoleFacts> {
  const { rows } = await db.raw<{ rows: DatabaseRoleFacts[] }>(`
    SELECT current_user AS "user",
      (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS superuser,
      pg_has_role(current_user, (SELECT datdba FROM pg_database WHERE datname = current_database()), 'MEMBER') AS "databaseOwner",
      has_schema_privilege(current_user, 'public', 'CREATE') AS "canCreateInPublic"`);
  return rows[0];
}

/**
 * Startup check for web and worker. Warns when the service connects with owner-level
 * credentials; throws instead when DATABASE_ROLE_ENFORCED=true (set once an
 * environment has run `pnpm db:roles` and switched DATABASE_URL to its runtime role).
 */
export async function assertRuntimeDatabaseRole(db: Knex, service: string, env: NodeJS.ProcessEnv = process.env) {
  const facts = await readDatabaseRoleFacts(db);
  const problems = databaseRoleProblems(facts);
  if (!problems.length) return facts;
  const message = `${service} database role "${facts.user}" ${problems.join(', ')}. Use a least-privilege runtime role (see docs/database-roles.md).`;
  if (env.DATABASE_ROLE_ENFORCED === 'true') throw Error(message);
  console.warn(message);
  return facts;
}
