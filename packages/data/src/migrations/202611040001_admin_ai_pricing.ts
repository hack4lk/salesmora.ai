import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('aiModelPricing', table => {
    table.uuid('id').primary();
    table.text('model').notNullable();
    table.decimal('inputUsdPerMillion', 14, 6).notNullable();
    table.decimal('cachedInputUsdPerMillion', 14, 6).notNullable();
    table.decimal('outputUsdPerMillion', 14, 6).notNullable();
    table.text('source').notNullable();
    table.timestamp('effectiveFrom', { useTz: true }).notNullable();
    table.text('createdBy').notNullable().references('id').inTable('admin.staffUsers');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['model', 'effectiveFrom']);
    table.check('char_length("model") BETWEEN 1 AND 128');
    table.check('char_length("source") BETWEEN 1 AND 500');
    table.check('"inputUsdPerMillion" >= 0 AND "cachedInputUsdPerMillion" >= 0 AND "outputUsdPerMillion" >= 0');
    table.index(['model', 'effectiveFrom']);
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('aiModelPricing');
  await applyAdminIdentityGrants(db);
}
