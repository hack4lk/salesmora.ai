import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.raw('CREATE EXTENSION IF NOT EXISTS vector');
  await db.schema.createTable('helpArticles', table => {
    table.text('id').primary(); table.text('slug').notNullable(); table.text('version').notNullable();
    table.text('title').notNullable(); table.text('sourcePath').notNullable();
    table.specificType('roles', 'text[]').notNullable(); table.specificType('capabilities', 'text[]').notNullable();
    table.specificType('plans', 'text[]').notNullable(); table.text('productStatus').notNullable();
    table.text('state').notNullable(); table.text('model').notNullable(); table.integer('dimensions').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('publishedAt', { useTz: true });
    table.check("state IN ('draft', 'published', 'retired')");
    table.check("\"productStatus\" IN ('implemented', 'planned')"); table.check('dimensions BETWEEN 1 AND 2000');
    table.index(['slug', 'state']);
  });
  await db.raw(`CREATE UNIQUE INDEX help_one_published ON "helpArticles" (slug) WHERE state = 'published'`);
  await db.schema.createTable('helpHeads', table => {
    table.text('slug').primary(); table.text('articleId').notNullable().references('id').inTable('helpArticles');
  });
  await db.schema.createTable('helpChunks', table => {
    table.text('id').primary(); table.text('articleId').notNullable().references('id').inTable('helpArticles').onDelete('CASCADE');
    table.text('anchor').notNullable(); table.text('heading').notNullable(); table.text('text').notNullable();
    table.integer('position').notNullable(); table.text('contentHash').notNullable(); table.unique(['articleId', 'anchor']);
  });
  await db.schema.createTable('helpEmbeddings', table => {
    table.text('chunkId').primary().references('id').inTable('helpChunks').onDelete('CASCADE');
    table.specificType('embedding', 'vector').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
}
export async function down(db: Knex) {
  for (const table of ['helpEmbeddings', 'helpChunks', 'helpHeads', 'helpArticles']) await db.schema.dropTable(table);
  // Other applications may share the extension; leave it installed.
}
