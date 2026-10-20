import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('materialNotifications', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('materialId').notNullable().references('id').inTable('materialCatalog').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('event').notNullable();
    t.text('materialName').notNullable();
    t.text('reason').notNullable().defaultTo('');
    t.text('actorName').notNullable().defaultTo('');
    t.timestamp('readAt', { useTz: true });
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(['workspaceId', 'userId', 'createdAt', 'id']);
    t.index(['materialId']);
  });
  await db.raw(`ALTER TABLE "materialNotifications" ADD CHECK (event IN ('approved','rejected'))`);
}
export async function down(db: Knex) {
  await db.schema.dropTable('materialNotifications');
}
