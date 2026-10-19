import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => { table.jsonb('leadHistoryResult').nullable(); });
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('leadHistoryResult').first('id')) throw Error('Retained lead history requires this migration.');
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('leadHistoryResult'); });
}
