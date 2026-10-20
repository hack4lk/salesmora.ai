import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('aiUsageCalls', t => {
    t.uuid('id').primary();
    // No transcript FK: deleting a conversation must not erase usage accounting.
    t.uuid('workspaceId'); t.text('userId'); t.uuid('turnId');
    t.text('provider').notNullable().defaultTo('openai'); t.text('model').notNullable(); t.text('phase').notNullable();
    t.text('outcome').notNullable().defaultTo('started');
    for (const name of ['inputTokens', 'outputTokens', 'totalTokens', 'cachedInputTokens', 'reasoningTokens']) t.bigInteger(name);
    t.timestamp('startedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('finishedAt', { useTz: true });
    t.check("outcome IN ('started','completed','failed','cancelled')");
    t.check("phase IN ('planning','answer','query_embedding','corpus_embedding','evaluation_embedding')");
    t.check(`("inputTokens" IS NULL AND "outputTokens" IS NULL AND "totalTokens" IS NULL AND "cachedInputTokens" IS NULL AND "reasoningTokens" IS NULL) OR
      ("inputTokens" IS NOT NULL AND "outputTokens" IS NOT NULL AND "totalTokens" IS NOT NULL AND "cachedInputTokens" IS NOT NULL AND "reasoningTokens" IS NOT NULL AND
       "inputTokens" >= 0 AND "outputTokens" >= 0 AND "totalTokens" = "inputTokens" + "outputTokens" AND
       "cachedInputTokens" BETWEEN 0 AND "inputTokens" AND "reasoningTokens" BETWEEN 0 AND "outputTokens")`);
    t.index(['workspaceId', 'startedAt']); t.index(['turnId']); t.index(['outcome', 'startedAt']);
  });
}
export async function down(db: Knex) { await db.schema.dropTable('aiUsageCalls'); }
