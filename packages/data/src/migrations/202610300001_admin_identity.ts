import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

const adminSchema = 'admin';

export async function up(db: Knex) {
  await db.raw('CREATE SCHEMA ??', [adminSchema]);
  await db.raw('REVOKE ALL ON SCHEMA ?? FROM PUBLIC', [adminSchema]);

  await db.schema.withSchema(adminSchema).createTable('staffUsers', table => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.boolean('emailVerified').notNullable().defaultTo(false);
    table.text('image');
    table.boolean('twoFactorEnabled').notNullable().defaultTo(false);
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });
  await db.raw('CREATE UNIQUE INDEX ?? ON admin."staffUsers" (lower("email"))', ['staffUsers_email_case_insensitive']);

  await db.schema.withSchema(adminSchema).createTable('staffSessions', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.text('token').notNullable().unique();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
    table.text('ipAddress');
    table.text('userAgent');
  });

  await db.schema.withSchema(adminSchema).createTable('staffAccounts', table => {
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

  await db.schema.withSchema(adminSchema).createTable('staffVerifications', table => {
    table.text('id').primary();
    table.text('identifier').notNullable().index();
    table.text('value').notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });

  await db.schema.withSchema(adminSchema).createTable('staffPasskeys', table => {
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

  await db.schema.withSchema(adminSchema).createTable('staffTwoFactors', table => {
    table.text('id').primary();
    table.text('secret').notNullable();
    table.text('backupCodes').notNullable();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE').index();
    table.boolean('verified').notNullable().defaultTo(true);
    table.integer('failedVerificationCount').notNullable().defaultTo(0);
    table.timestamp('lockedUntil', { useTz: true });
  });

  await db.schema.withSchema(adminSchema).createTable('staffRateLimits', table => {
    table.text('id').primary();
    table.text('key').notNullable().unique();
    table.integer('count').notNullable();
    table.bigInteger('lastRequest').notNullable();
  });

  await db.schema.withSchema(adminSchema).createTable('staffRoleAssignments', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE');
    table.text('role').notNullable();
    table.text('grantedBy').references('id').inTable('admin.staffUsers').onDelete('SET NULL');
    table.timestamp('grantedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('revokedAt', { useTz: true });
    table.check(`"role" IN ('super_admin', 'support', 'billing')`);
    table.index(['userId', 'revokedAt']);
  });
  await db.raw(
    'CREATE UNIQUE INDEX ?? ON admin."staffRoleAssignments" ("userId") WHERE "revokedAt" IS NULL',
    ['staffRoleAssignments_one_active_role_per_user'],
  );

  await db.schema.withSchema(adminSchema).createTable('staffInvitations', table => {
    table.text('id').primary();
    table.text('email').notNullable();
    table.text('role').notNullable();
    table.text('tokenHash').notNullable().unique();
    table.text('invitedBy').notNullable().references('id').inTable('admin.staffUsers').onDelete('RESTRICT');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('acceptedAt', { useTz: true });
    table.timestamp('revokedAt', { useTz: true });
    table.check(`"role" IN ('super_admin', 'support', 'billing')`);
    table.check('"expiresAt" > "createdAt"');
  });

  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  for (const table of [
    'staffInvitations',
    'staffRoleAssignments',
    'staffRateLimits',
    'staffTwoFactors',
    'staffPasskeys',
    'staffVerifications',
    'staffAccounts',
    'staffSessions',
    'staffUsers',
  ]) {
    await db.schema.withSchema(adminSchema).dropTable(table);
  }
  await db.raw('DROP SCHEMA ??', [adminSchema]);
}
