import type { Knex } from 'knex';

export async function createCustomerSupportTables(db: Knex) {
  await db.schema.createTable('customerActivity', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('customerId').notNullable();
    table.foreign(['workspaceId', 'customerId']).references(['workspaceId', 'id']).inTable('customers').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName').notNullable();
    table.text('type').notNullable();
    table.text('body').notNullable().defaultTo('');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'customerId', 'createdAt', 'id']);
  });
  await db.schema.createTable('customerOperations', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('customerId');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('action').notNullable();
    table.text('requestHash').notNullable();
    table.integer('version').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('customerExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.integer('rowCount').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
}
