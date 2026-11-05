import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => { table.text('captureStamp'); table.jsonb('captureResult'); });
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_capture_stamp CHECK ("captureStamp" IS NULL OR "captureStamp" ~ '^[a-f0-9]{64}$')`);
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('captureStamp').first('id')) throw Error('Retained capture assistant evidence requires this migration.');
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_capture_stamp');
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('captureStamp'); table.dropColumn('captureResult'); });
}
