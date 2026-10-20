import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('leads', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('submissionId').notNullable();
    table.text('submissionHash').notNullable();
    table.text('name').notNullable(); table.text('email').notNullable(); table.text('phone').notNullable();
    table.text('service').notNullable(); table.text('address').notNullable(); table.text('details').notNullable(); table.text('notes').notNullable();
    table.text('source').notNullable(); table.text('stage').notNullable(); table.text('ownerId');
    table.foreign(['workspaceId', 'ownerId']).references(['workspaceId', 'userId']).inTable('workspaceMemberships');
    table.unique(['workspaceId', 'createdBy', 'submissionId']);
    table.index(['workspaceId', 'createdAt']);
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check("source IN ('website', 'referral', 'phone', 'gmail', 'other')");
    table.check("stage IN ('new', 'contacted', 'estimate-sent', 'in-progress')");
  });
}
export async function down(db: Knex) { await db.schema.dropTable('leads'); }
