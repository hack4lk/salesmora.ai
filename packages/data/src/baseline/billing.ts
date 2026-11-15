import type { Knex } from 'knex';

export async function createBillingTables(db: Knex) {
  await db.schema.createTable('workspaceSubscriptions', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('RESTRICT');
    table.text('plan').notNullable().defaultTo('free');
    table.text('intendedPlan').notNullable().defaultTo('free');
    table.text('catalogVersion').notNullable();
    table.text('status').notNullable().defaultTo('free');
    table.jsonb('pendingInvitations').notNullable().defaultTo('[]');
    table.timestamp('customerCreationStartedAt', { useTz: true });
    table.text('customerId').unique();
    table.text('subscriptionId').unique();
    table.text('priceId');
    table.boolean('cancelAtPeriodEnd').notNullable().defaultTo(false);
    for (const field of ['paidThrough', 'recoveryUntil', 'transitionUntil']) table.timestamp(field, { useTz: true });
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`plan IN ('free','standard','premium') AND "intendedPlan" IN ('free','standard','premium')`);
  });
  await db.schema.createTable('billingCheckoutAttempts', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.text('plan').notNullable();
    table.text('priceId').notNullable();
    table.text('sessionId').unique();
    table.text('status').notNullable().defaultTo('creating');
    table.timestamp('expiresAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
    table.check("plan IN ('standard','premium')");
  });
  await db.schema.createTable('billingWebhookEvents', table => {
    table.text('id').primary();
    table.text('type').notNullable();
    table.text('objectId').notNullable();
    table.timestamp('receivedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('processedAt', { useTz: true });
    table.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('attempts').notNullable().defaultTo(0);
    table.uuid('workspaceId').references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.index(['processedAt', 'retryAt']);
    table.index(['workspaceId', 'receivedAt']);
  });
  await db.schema.createTable('billingAudit', table => {
    table.bigIncrements('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('action').notNullable();
    table.text('actorId');
    table.text('eventId');
    table.jsonb('details').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.raw(`CREATE UNIQUE INDEX "billingAudit_override_expired_unique" ON "billingAudit" ((details->>'overrideId')) WHERE action = 'plan.override_expired'`);
  await db.schema.createTable('billingPlanChanges', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.text('actorId').notNullable();
    table.text('targetPlan').notNullable();
    table.text('kind').notNullable();
    table.text('state').notNullable().defaultTo('quoted');
    table.jsonb('basis').notNullable();
    table.integer('amountDue').notNullable();
    table.integer('prorationAt').notNullable();
    table.text('scheduleId');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
    table.check(`"targetPlan" IN ('free','standard','premium')`);
  });
  await db.schema.createTable('billingPaymentMethods', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    for (const field of ['actorId', 'customerId', 'subscriptionId']) table.text(field).notNullable();
    table.text('customerDefault');
    table.text('subscriptionDefault');
    table.text('setupIntentId').unique();
    table.text('paymentMethodId');
    table.text('state').notNullable().defaultTo('creating');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('consentedAt', { useTz: true });
    table.timestamp('completedAt', { useTz: true });
    table.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('attempts').notNullable().defaultTo(0);
    table.check("state IN ('creating','ready','applying','complete','cancelled')");
    table.index(['workspaceId', 'state']);
    table.index(['state', 'retryAt']);
  });
  await db.schema.createTable('billingRenewalRecoveries', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    for (const field of ['actorId', 'customerId', 'subscriptionId', 'invoiceId']) table.text(field).notNullable();
    table.text('paymentMethodId');
    table.integer('amountDue').notNullable();
    table.jsonb('invoice').notNullable();
    table.text('state').notNullable().defaultTo('quoted');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('attemptedAt', { useTz: true });
    table.timestamp('reconciledAt', { useTz: true });
    table.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('retryCancelledAt', { useTz: true });
    table.check("state IN ('quoted','applying','action','pending','paid','declined','changed','expired')");
    table.index(['state', 'retryAt']);
    table.index(['workspaceId', 'invoiceId']);
  });
  await db.schema.createTable('billingRecoveryGraceExtensions', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.text('invoiceId').notNullable();
    table.timestamp('invoiceCreatedAt', { useTz: true }).notNullable();
    table.timestamp('extendedUntil', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('EXTRACT(EPOCH FROM ("extendedUntil" - "invoiceCreatedAt")) > 604800');
    table.check('EXTRACT(EPOCH FROM ("extendedUntil" - "invoiceCreatedAt")) <= 1209600');
    table.index(['workspaceId', 'invoiceId']);
  });
}
