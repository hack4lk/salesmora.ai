import type { Knex } from 'knex';
import { setupChatCheckpoints } from '../checkpoints';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => {
    table.text('accessHash');
    table.jsonb('sources').notNullable().defaultTo('[]');
  });
  // Dedicated migration step; never run library DDL on a chat request.
  await setupChatCheckpoints(db);
}
export async function down(db: Knex) {
  // Library tables are shared execution infrastructure. Do not destructively drop them on rollback.
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('accessHash'); table.dropColumn('sources'); });
}
