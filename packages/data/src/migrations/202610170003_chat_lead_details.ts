import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => { table.jsonb('leadDetailsResult').nullable(); });
}
export async function down(db: Knex) {
  if (await db('chatTurns').whereNotNull('leadDetailsResult').orWhereRaw(`jsonb_path_exists("leadEvidence", '$[*].ownerStamp')`).first('id')) throw Error('Retained lead details/provenance requires this migration.');
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('leadDetailsResult'); });
}
