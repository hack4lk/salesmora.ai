import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', t => { t.jsonb('calendarResult'); t.text('calendarStamp'); });
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_calendar_stamp CHECK ("calendarStamp" IS NULL OR "calendarStamp" ~ '^[a-f0-9]{64}$')`);
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('calendarStamp').first('id')) throw Error('Retained Calendar evidence requires this migration.');
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_calendar_stamp');
  await db.schema.alterTable('chatTurns', t => { t.dropColumn('calendarResult'); t.dropColumn('calendarStamp'); });
}
