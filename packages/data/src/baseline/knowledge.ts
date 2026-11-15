import type { Knex } from 'knex';

export async function createKnowledgeTables(db: Knex) {
  await db.raw('CREATE EXTENSION IF NOT EXISTS vector');
  await db.schema.createTable('helpArticles', table => {
    table.text('id').primary();
    table.text('slug').notNullable();
    table.text('version').notNullable();
    table.text('title').notNullable();
    table.text('sourcePath').notNullable();
    table.specificType('roles', 'text[]').notNullable();
    table.specificType('capabilities', 'text[]').notNullable();
    table.specificType('plans', 'text[]').notNullable();
    table.text('productStatus').notNullable();
    table.text('state').notNullable();
    table.text('model').notNullable();
    table.integer('dimensions').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('publishedAt', { useTz: true });
    table.check("state IN ('draft', 'published', 'retired')");
    table.check(`"productStatus" IN ('implemented', 'planned')`);
    table.check('dimensions BETWEEN 1 AND 2000');
    table.index(['slug', 'state']);
  });
  await db.raw(`CREATE UNIQUE INDEX help_one_published ON "helpArticles" (slug) WHERE state = 'published'`);
  await db.schema.createTable('helpHeads', table => {
    table.text('slug').primary();
    table.text('articleId').notNullable().references('id').inTable('helpArticles');
  });
  await db.schema.createTable('helpChunks', table => {
    table.text('id').primary();
    table.text('articleId').notNullable().references('id').inTable('helpArticles').onDelete('CASCADE');
    table.text('anchor').notNullable();
    table.text('heading').notNullable();
    table.text('text').notNullable();
    table.integer('position').notNullable();
    table.text('contentHash').notNullable();
    table.unique(['articleId', 'anchor']);
  });
  await db.schema.createTable('helpEmbeddings', table => {
    table.text('chunkId').primary().references('id').inTable('helpChunks').onDelete('CASCADE');
    table.specificType('embedding', 'vector').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('aiUsageCalls', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId');
    table.text('userId');
    table.uuid('turnId');
    table.text('provider').notNullable().defaultTo('openai');
    table.text('model').notNullable();
    table.text('phase').notNullable();
    table.text('outcome').notNullable().defaultTo('started');
    for (const field of ['inputTokens', 'outputTokens', 'totalTokens', 'cachedInputTokens', 'reasoningTokens']) table.bigInteger(field);
    table.timestamp('startedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.bigInteger('reservationTokens').notNullable().defaultTo(0);
    table.check("outcome IN ('started','completed','failed','cancelled')");
    table.check("phase IN ('planning','answer','query_embedding','corpus_embedding','evaluation_embedding')");
    table.check(`("inputTokens" IS NULL AND "outputTokens" IS NULL AND "totalTokens" IS NULL AND "cachedInputTokens" IS NULL AND "reasoningTokens" IS NULL) OR
      ("inputTokens" IS NOT NULL AND "outputTokens" IS NOT NULL AND "totalTokens" IS NOT NULL AND "cachedInputTokens" IS NOT NULL AND "reasoningTokens" IS NOT NULL AND
       "inputTokens" >= 0 AND "outputTokens" >= 0 AND "totalTokens" = "inputTokens" + "outputTokens" AND
       "cachedInputTokens" BETWEEN 0 AND "inputTokens" AND "reasoningTokens" BETWEEN 0 AND "outputTokens")`);
    table.check('"reservationTokens" >= 0', [], 'ai_usage_reservation_nonnegative');
    table.index(['workspaceId', 'startedAt']);
    table.index(['turnId']);
    table.index(['outcome', 'startedAt']);
  });
  await db.schema.createTable('workspaceAITokenBudgets', table => {
    table.uuid('workspaceId').primary();
    table.bigInteger('monthlyTokens').notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('"monthlyTokens" BETWEEN 0 AND 1000000000000');
  });
}
