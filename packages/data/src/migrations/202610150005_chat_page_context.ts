import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns', table => {
    // Intent and non-content provenance share the existing private transcript lifecycle.
    table.jsonb('pageContext').notNullable().defaultTo('{}');
    table.jsonb('leadEvidence').notNullable().defaultTo('[]');
  });
}
export async function down(db: Knex) {
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('pageContext'); table.dropColumn('leadEvidence'); });
}
