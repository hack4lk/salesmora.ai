import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('billingPaymentMethods', t => {
    t.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.integer('attempts').notNullable().defaultTo(0);
    t.index(['state','retryAt']);
  });
}
export async function down() { throw Error('Card retry migration is forward-only.'); }
