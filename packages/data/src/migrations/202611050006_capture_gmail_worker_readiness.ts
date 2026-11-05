import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.createTable('captureGmailWorkerReadiness', table => {
    table.uuid('workspaceId').notNullable();
    table.uuid('sourceId').notNullable();
    table.timestamp('checkedAt', { useTz: true }).notNullable();
    table.primary(['workspaceId', 'sourceId']);
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('CASCADE');
  });
  await applyRuntimeGrants(db);
}

export async function down(db: Knex) {
  await db.schema.dropTable('captureGmailWorkerReadiness');
}
