import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => {
    table.jsonb('reportSnapshot');
    table.jsonb('reportEvidence').notNullable().defaultTo('[]');
  });
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_report_evidence_array
    CHECK (jsonb_typeof("reportEvidence") = 'array' AND jsonb_array_length("reportEvidence") <= 7)`);
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('reportSnapshot')
    .orWhereRaw(`"reportEvidence" <> '[]'::jsonb`).first('id')) {
    throw new Error('Retained report evidence requires this migration.');
  }
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_report_evidence_array');
  await db.schema.alterTable('chatTurns', table => {
    table.dropColumn('reportSnapshot'); table.dropColumn('reportEvidence');
  });
}
