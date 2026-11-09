import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.createTable('reportTemplates', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('ownerId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('area').notNullable();
    table.text('name').notNullable();
    table.jsonb('configuration').notNullable();
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`area IN ('overview','leads','sources','calendar','jobs','team','estimates','activity','financial')`);
    table.check(`length(btrim(name)) BETWEEN 1 AND 80 AND version > 0`);
    table.index(['workspaceId', 'ownerId', 'area']);
  });
  await db.raw('CREATE UNIQUE INDEX report_template_personal_name ON "reportTemplates" ("workspaceId", "ownerId", area, lower(btrim(name)))');
}
export async function down(db: Knex) {
  const saved = await db('reportTemplates').first('id');
  if (saved) throw new Error('Cannot remove report template storage while saved templates exist.');
  await db.schema.dropTable('reportTemplates');
}
