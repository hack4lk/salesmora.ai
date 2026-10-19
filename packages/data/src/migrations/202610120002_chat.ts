import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('chatThreads', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['id', 'workspaceId', 'userId']);
    table.index(['workspaceId', 'userId', 'updatedAt']);
  });
  await db.schema.createTable('chatTurns', table => {
    table.uuid('id').primary();
    table.uuid('threadId').notNullable();
    table.uuid('workspaceId').notNullable();
    table.text('userId').notNullable();
    table.foreign(['threadId', 'workspaceId', 'userId']).references(['id', 'workspaceId', 'userId']).inTable('chatThreads').onDelete('CASCADE');
    table.uuid('clientTurnId').notNullable();
    table.text('requestHash').notNullable();
    table.text('surfaceKey').notNullable();
    table.text('state').notNullable();
    table.timestamp('leaseUntil', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.unique(['workspaceId', 'userId', 'clientTurnId']);
    table.index(['workspaceId', 'userId', 'createdAt']);
    table.check("state IN ('accepted', 'running', 'completed', 'failed', 'cancelled', 'interrupted')");
  });
  await db.raw(`CREATE UNIQUE INDEX chat_one_active_thread ON "chatTurns" ("threadId") WHERE state IN ('accepted', 'running')`);
  await db.schema.createTable('chatMessages', table => {
    table.uuid('id').primary();
    table.uuid('turnId').notNullable().references('id').inTable('chatTurns').onDelete('CASCADE');
    table.text('role').notNullable();
    table.text('text').notNullable();
    table.unique(['turnId', 'role']);
    table.check("role IN ('user', 'assistant')");
    table.check('length(text) <= 32000');
  });
}
export async function down(db: Knex) {
  await db.schema.dropTable('chatMessages');
  await db.schema.dropTable('chatTurns');
  await db.schema.dropTable('chatThreads');
}
