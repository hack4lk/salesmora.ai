import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('staffEnrollments', table => {
    table.text('id').primary();
    table.text('invitationId').notNullable().unique()
      .references('id').inTable('admin.staffInvitations').onDelete('CASCADE');
    table.text('tokenHash').notNullable().unique();
    table.text('factor').notNullable();
    table.text('state').notNullable();
    table.integer('failedAttempts').notNullable().defaultTo(0);
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.check(`"factor" IN ('passkey', 'totp')`);
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('staffEnrollments');
  await applyAdminIdentityGrants(db);
}
