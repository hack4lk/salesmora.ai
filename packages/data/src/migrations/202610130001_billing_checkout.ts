import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('users', t => { t.text('registrationPlan').notNullable().defaultTo('free'); t.check("\"registrationPlan\" IN ('free','standard','premium')", [], 'users_registration_plan_check'); });
  await db.schema.createTable('workspaceSubscriptions', t => {
    t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('RESTRICT');
    t.text('plan').notNullable().defaultTo('free'); t.text('intendedPlan').notNullable().defaultTo('free');
    t.text('catalogVersion').notNullable(); t.text('status').notNullable().defaultTo('free');
    t.jsonb('pendingInvitations').notNullable().defaultTo('[]');
    t.timestamp('customerCreationStartedAt',{useTz:true}); t.text('customerId').unique(); t.text('subscriptionId').unique(); t.text('priceId');
    t.boolean('cancelAtPeriodEnd').notNullable().defaultTo(false);
    t.timestamp('paidThrough', {useTz:true}); t.timestamp('recoveryUntil', {useTz:true}); t.timestamp('transitionUntil', {useTz:true});
    t.timestamp('updatedAt', {useTz:true}).notNullable().defaultTo(db.fn.now());
    t.check("plan IN ('free','standard','premium') AND \"intendedPlan\" IN ('free','standard','premium')");
  });
  await db.raw(`INSERT INTO "workspaceSubscriptions" ("workspaceId", "catalogVersion", "transitionUntil") SELECT id, '2026-10-13-v1', now() + interval '30 days' FROM workspaces`);
  await db.schema.createTable('billingCheckoutAttempts', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    t.text('plan').notNullable(); t.text('priceId').notNullable(); t.text('sessionId').unique();
    t.text('status').notNullable().defaultTo('creating'); t.timestamp('expiresAt',{useTz:true});
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now()); t.index(['workspaceId','createdAt']);
    t.check("plan IN ('standard','premium')");
  });
  await db.schema.createTable('billingWebhookEvents', t => {
    t.text('id').primary(); t.text('type').notNullable(); t.text('objectId').notNullable();
    t.timestamp('receivedAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.timestamp('processedAt',{useTz:true}); t.timestamp('retryAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
    t.integer('attempts').notNullable().defaultTo(0); t.index(['processedAt','retryAt']);
  });
  await db.schema.createTable('billingAudit', t => {
    t.bigIncrements('id').primary(); t.uuid('workspaceId').notNullable(); t.text('action').notNullable();
    t.text('actorId'); t.text('eventId'); t.jsonb('details').notNullable(); t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
  });
}
export async function down(db: Knex) {
  for (const table of ['billingAudit','billingWebhookEvents','billingCheckoutAttempts','workspaceSubscriptions']) await db.schema.dropTable(table);
  await db.schema.alterTable('users', t => t.dropColumn('registrationPlan'));
}
