import type { Knex } from 'knex';

export async function createAdminIdentityTables(db: Knex) {
  await db.raw('CREATE SCHEMA admin');
  await db.raw('REVOKE ALL ON SCHEMA admin FROM PUBLIC');
  await db.schema.withSchema('admin').createTable('staffUsers', table => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.boolean('emailVerified').notNullable().defaultTo(false);
    table.text('image');
    table.boolean('twoFactorEnabled').notNullable().defaultTo(false);
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
    table.timestamp('disabledAt', { useTz: true });
    table.timestamp('accessChangedAt', { useTz: true });
    table.integer('accessVersion').notNullable().defaultTo(0);
    table.check('"accessVersion" >= 0', [], 'staffUsers_access_version_check');
  });
  await db.raw('CREATE UNIQUE INDEX "staffUsers_email_case_insensitive" ON admin."staffUsers" (lower("email"))');
  await db.schema.withSchema('admin').createTable('staffSessions', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.text('token').notNullable().unique();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
    table.text('ipAddress');
    table.text('userAgent');
  });
  await db.schema.withSchema('admin').createTable('staffAccounts', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.text('accountId').notNullable();
    table.text('providerId').notNullable();
    table.unique(['providerId', 'accountId']);
    for (const field of ['accessToken', 'refreshToken', 'idToken', 'scope', 'password']) table.text(field);
    table.timestamp('accessTokenExpiresAt', { useTz: true });
    table.timestamp('refreshTokenExpiresAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });
  await db.schema.withSchema('admin').createTable('staffVerifications', table => {
    table.text('id').primary();
    table.text('identifier').notNullable().index();
    table.text('value').notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });
  await db.schema.withSchema('admin').createTable('staffPasskeys', table => {
    table.text('id').primary();
    table.text('name');
    table.text('publicKey').notNullable();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.text('credentialID').notNullable().unique();
    table.integer('counter').notNullable();
    table.text('deviceType').notNullable();
    table.boolean('backedUp').notNullable();
    table.text('transports');
    table.timestamp('createdAt', { useTz: true });
    table.text('aaguid');
  });
  await db.schema.withSchema('admin').createTable('staffTwoFactors', table => {
    table.text('id').primary();
    table.text('secret').notNullable();
    table.text('backupCodes').notNullable();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.boolean('verified').notNullable().defaultTo(true);
    table.integer('failedVerificationCount').notNullable().defaultTo(0);
    table.timestamp('lockedUntil', { useTz: true });
  });
  await db.schema.withSchema('admin').createTable('staffRateLimits', table => {
    table.text('id').primary();
    table.text('key').notNullable().unique();
    table.integer('count').notNullable();
    table.bigInteger('lastRequest').notNullable();
  });
  await db.schema.withSchema('admin').createTable('staffRoleAssignments', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE');
    table.text('role').notNullable();
    table.text('grantedBy').references('id').inTable('admin.staffUsers').onDelete('SET NULL');
    table.timestamp('grantedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('revokedAt', { useTz: true });
    table.check(`"role" IN ('super_admin', 'support', 'billing')`);
    table.index(['userId', 'revokedAt']);
  });
  await db.raw('CREATE UNIQUE INDEX "staffRoleAssignments_one_active_role_per_user" ON admin."staffRoleAssignments" ("userId") WHERE "revokedAt" IS NULL');
  await db.schema.withSchema('admin').createTable('staffInvitations', table => {
    table.text('id').primary();
    table.text('email').notNullable();
    table.text('role').notNullable();
    table.text('tokenHash').notNullable().unique();
    table.text('invitedBy').references('id').inTable('admin.staffUsers').onDelete('RESTRICT');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('acceptedAt', { useTz: true });
    table.timestamp('revokedAt', { useTz: true });
    table.check(`"role" IN ('super_admin', 'support', 'billing')`);
    table.check('"expiresAt" > "createdAt"');
  });
  await db.raw(`CREATE FUNCTION admin.check_staff_session_access() RETURNS trigger
    LANGUAGE plpgsql SET search_path = pg_catalog, admin AS $$
    DECLARE staff admin."staffUsers"%ROWTYPE;
    BEGIN
      SELECT * INTO staff FROM admin."staffUsers" WHERE id = NEW."userId" FOR SHARE;
      IF NOT FOUND OR staff."disabledAt" IS NOT NULL OR
        (staff."accessChangedAt" IS NOT NULL AND NEW."createdAt" < staff."accessChangedAt") THEN
        RAISE EXCEPTION 'Staff access changed; sign in again' USING ERRCODE = '42501';
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(`CREATE TRIGGER staff_session_access BEFORE INSERT ON admin."staffSessions"
    FOR EACH ROW EXECUTE FUNCTION admin.check_staff_session_access()`);
  await db.raw('REVOKE ALL ON FUNCTION admin.check_staff_session_access() FROM PUBLIC');
}
