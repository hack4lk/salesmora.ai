import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('workspaceInvitationDeliveries', table => {
    table.uuid('id').primary();
    table.uuid('invitationId').notNullable().references('id').inTable('public.workspaceInvitations').onDelete('CASCADE');
    table.text('tokenHash').notNullable();
    table.text('encryptedPayload');
    table.text('status').notNullable().defaultTo('pending');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('sentAt', { useTz: true });
    table.check(`"status" IN ('pending', 'sent', 'failed', 'superseded')`);
    table.check('"attempts" BETWEEN 0 AND 5');
    table.index(['invitationId', 'createdAt']);
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('workspaceInvitationDeliveries');
  await applyAdminIdentityGrants(db);
}
