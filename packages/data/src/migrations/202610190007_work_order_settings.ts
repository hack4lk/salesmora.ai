import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('workspaces', t => {
    t.text('businessPhone').notNullable().defaultTo('');
    t.boolean('workOrderSignoffRequired').notNullable().defaultTo(false);
  });
  // Deleting a draft cascades its activity, so a minimal trail is kept here.
  await db.schema.createTable('workOrderDeleteAudit', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.integer('workOrderNumber').notNullable();
    t.text('title').notNullable();
    t.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    t.text('source').notNullable().defaultTo('ui');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(['workspaceId', 'createdAt']);
  });
}
export async function down(db: Knex) {
  await db.schema.dropTable('workOrderDeleteAudit');
  await db.schema.alterTable('workspaces', t => { t.dropColumn('workOrderSignoffRequired'); t.dropColumn('businessPhone'); });
}
