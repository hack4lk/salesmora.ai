import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw Error('Admin billing recovery migration requires a transaction.');
  await db.schema.alterTable('billingRenewalRecoveries', table => {
    table.timestamp('retryCancelledAt', { useTz: true });
  });
  await db.schema.createTable('billingRecoveryGraceExtensions', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable()
      .references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
    table.text('invoiceId').notNullable();
    table.timestamp('invoiceCreatedAt', { useTz: true }).notNullable();
    table.timestamp('extendedUntil', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('EXTRACT(EPOCH FROM ("extendedUntil" - "invoiceCreatedAt")) > 604800');
    table.check('EXTRACT(EPOCH FROM ("extendedUntil" - "invoiceCreatedAt")) <= 1209600');
    table.index(['workspaceId', 'invoiceId']);
  });
  await applyRuntimeGrants(db);
}

export async function down() {
  throw Error('Admin billing recovery evidence is forward-only.');
}
