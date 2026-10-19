import type { Knex } from 'knex';
export async function up(db:Knex) {
  await db.schema.createTable('billingRenewalRecoveries',t=>{
    t.uuid('id').primary();t.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    t.text('actorId').notNullable();t.text('customerId').notNullable();t.text('subscriptionId').notNullable();t.text('invoiceId').notNullable();t.text('paymentMethodId');
    t.integer('amountDue').notNullable();t.jsonb('invoice').notNullable();t.text('state').notNullable().defaultTo('quoted');
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('expiresAt',{useTz:true}).notNullable();
    t.timestamp('attemptedAt',{useTz:true});t.timestamp('reconciledAt',{useTz:true});t.timestamp('retryAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.integer('attempts').notNullable().defaultTo(0);
    t.check("state IN ('quoted','applying','action','pending','paid','declined','changed','expired')");t.index(['state','retryAt']);t.index(['workspaceId','invoiceId']);
  });
}
export async function down(){throw Error('Renewal recovery evidence is forward-only');}
