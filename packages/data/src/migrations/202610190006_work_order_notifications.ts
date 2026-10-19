import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('workOrderNotifications', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('workOrderId').notNullable().references('id').inTable('workOrders').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('event').notNullable();
    t.text('actorName').notNullable().defaultTo('');
    t.timestamp('readAt', { useTz: true });
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(['workspaceId', 'userId', 'createdAt', 'id']);
    t.index(['workOrderId']);
  });
  await db.raw(`ALTER TABLE "workOrderNotifications" ADD CHECK (event IN ('issued','assigned','rescheduled','changed','completed','canceled'))`);
}
export async function down(db: Knex) {
  await db.schema.dropTable('workOrderNotifications');
}
