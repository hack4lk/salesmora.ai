import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('approvalRequests', table => {
    table.uuid('id').primary();
    table.text('email').notNullable();
    table.text('requestedBy').notNullable().references('id').inTable('admin.staffUsers');
    table.text('reason').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.text('decidedBy').references('id').inTable('admin.staffUsers');
    table.timestamp('decidedAt', { useTz: true });
    table.check(`"status" IN ('pending', 'approved', 'rejected')`);
    table.check('"decidedBy" IS NULL OR "decidedBy" <> "requestedBy"');
    table.check('"expiresAt" > "createdAt"');
    table.index(['email', 'status']);
  });
  await db.schema.withSchema('admin').createTable('staffActionChallenges', table => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE');
    table.text('sessionId').notNullable().references('id').inTable('admin.staffSessions').onDelete('CASCADE');
    table.jsonb('input').notNullable();
    table.text('challenge').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('verifiedAt', { useTz: true });
    table.timestamp('consumedAt', { useTz: true });
    table.integer('attempts').notNullable().defaultTo(0);
    table.index(['userId', 'createdAt']);
  });
  await db.schema.withSchema('admin').createTable('staffFactorUses', table => {
    table.text('userId').notNullable().references('id').inTable('admin.staffUsers').onDelete('CASCADE');
    table.bigInteger('step').notNullable();
    table.primary(['userId', 'step']);
  });
  await db.schema.withSchema('admin').createTable('staffInvitationDeliveries', table => {
    table.uuid('id').primary();
    table.text('invitationId').notNullable().unique().references('id').inTable('admin.staffInvitations').onDelete('CASCADE');
    table.text('encryptedToken');
    table.text('status').notNullable().defaultTo('pending');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('sentAt', { useTz: true });
    table.check(`"status" IN ('pending', 'sent', 'failed')`);
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  for (const table of ['staffInvitationDeliveries', 'staffFactorUses', 'staffActionChallenges', 'approvalRequests']) {
    await db.schema.withSchema('admin').dropTable(table);
  }
}
