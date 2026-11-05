import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.alterTable('billingWebhookEvents', table => {
    table.uuid('workspaceId').references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.index(['workspaceId', 'receivedAt']);
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable('billingWebhookEvents', table => {
    table.dropIndex(['workspaceId', 'receivedAt']);
    table.dropColumn('workspaceId');
  });
}
