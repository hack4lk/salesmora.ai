import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => {
    table.jsonb('leadSearchSnapshot').nullable();
    table.jsonb('leadSearchEvidence').notNullable().defaultTo('[]');
  });
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('leadSearchSnapshot').orWhereRaw(`jsonb_array_length("leadSearchEvidence") > 0`).first('id')) throw Error('Retained search provenance requires this migration.');
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('leadSearchSnapshot'); table.dropColumn('leadSearchEvidence'); });
}
