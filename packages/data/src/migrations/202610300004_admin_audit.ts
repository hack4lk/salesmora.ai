import type { Knex } from 'knex';
import { applyAdminAuditGrants, applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('auditEvents', table => {
    table.bigIncrements('sequence').primary();
    table.text('id').notNullable().unique();
    table.timestamp('occurredAt', { useTz: true }).notNullable();
    table.text('staffUserId');
    table.text('staffRole').notNullable();
    table.text('action').notNullable();
    table.text('targetType').notNullable();
    table.text('targetId').notNullable();
    table.text('workspaceId');
    table.text('reason');
    table.jsonb('before');
    table.jsonb('after');
    table.text('requestId').notNullable();
    table.text('ipAddress');
    table.text('userAgent');
    table.text('prevHash');
    table.text('hash').notNullable().unique();
    table.check(`"staffRole" IN ('super_admin', 'support', 'billing', 'bootstrap')`);
    table.index(['occurredAt']);
    table.index(['staffUserId', 'occurredAt']);
    table.index(['action', 'occurredAt']);
    table.index(['targetType', 'targetId']);
  });
  await applyAdminIdentityGrants(db);
  await applyAdminAuditGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('auditEvents');
  await applyAdminIdentityGrants(db);
}
