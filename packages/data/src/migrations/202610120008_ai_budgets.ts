import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('aiUsageCalls', t => { t.bigInteger('reservationTokens').notNullable().defaultTo(0); t.check('"reservationTokens" >= 0', [], 'ai_usage_reservation_nonnegative'); });
  // Existing unknown workspace usage cannot be assumed free when budgets are enabled.
  await db('aiUsageCalls').whereNotNull('workspaceId').update({ reservationTokens: db.raw('coalesce("totalTokens", 5000000)') });
  await db.schema.createTable('workspaceAITokenBudgets', t => {
    t.uuid('workspaceId').primary(); t.bigInteger('monthlyTokens').notNullable();
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check('"monthlyTokens" BETWEEN 0 AND 1000000000000');
  });
}
export async function down(db: Knex) {
  await db.schema.dropTable('workspaceAITokenBudgets');
  await db.schema.alterTable('aiUsageCalls', t => t.dropColumn('reservationTokens'));
}
