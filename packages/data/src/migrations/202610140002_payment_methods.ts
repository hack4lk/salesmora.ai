import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('billingPaymentMethods', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    t.text('actorId').notNullable(); t.text('customerId').notNullable(); t.text('subscriptionId').notNullable();
    t.text('customerDefault'); t.text('subscriptionDefault'); t.text('setupIntentId').unique(); t.text('paymentMethodId');
    t.text('state').notNullable().defaultTo('creating');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('consentedAt', { useTz: true }); t.timestamp('completedAt', { useTz: true });
    t.check("state IN ('creating','ready','applying','complete','cancelled')"); t.index(['workspaceId','state']);
  });
}
export async function down() { throw Error('Payment method records are forward-only.'); }
