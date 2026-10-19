import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('workspaces', table => {
    table.uuid('id').primary();
    // One initial workspace per account also makes onboarding creation retry-safe.
    table.text('ownerId').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.text('businessName').notNullable(); table.text('businessType').notNullable();
    table.text('postalCode').notNullable(); table.text('serviceRange').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('workspaceMemberships', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('role').notNullable(); table.text('profile').notNullable();
    table.primary(['workspaceId', 'userId']); table.index('userId');
    table.check("role IN ('owner', 'admin', 'member')"); table.check("profile IN ('office', 'field')");
  });
  await db.schema.createTable('workspaceServices', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('service').notNullable(); table.primary(['workspaceId', 'service']);
  });
  await db.schema.createTable('workspaceInvitations', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('email').notNullable(); table.text('role').notNullable(); table.text('profile').notNullable();
    table.text('status').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'email']);
    table.check("role IN ('admin', 'member')"); table.check("profile IN ('office', 'field')");
    table.check("status IN ('pending_verification', 'queued')");
  });
}
export async function down(db: Knex) {
  for (const table of ['workspaceInvitations', 'workspaceServices', 'workspaceMemberships', 'workspaces']) await db.schema.dropTable(table);
}
