import type { Knex } from 'knex';

export async function up(db: Knex) {
  for (const table of ['users', 'workspaces']) await db.schema.alterTable(table, t => t.timestamp('deletionRequestedAt', { useTz: true }));
  // Preserve immutable security evidence under its opaque workspace ID after the live workspace is purged.
  await db.schema.alterTable('authorizationAudit', t => t.dropForeign('workspaceId'));
  await db.schema.createTable('accountDeletionRequests', t => {
    t.uuid('id').primary(); t.text('userId').notNullable().unique(); t.uuid('workspaceId').unique();
    t.text('state').notNullable().defaultTo('pending');
    t.timestamp('requestedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('completedAt', { useTz: true }); t.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.integer('attempts').notNullable().defaultTo(0); t.text('lastError');
    t.check("state IN ('pending', 'completed')"); t.index(['state', 'retryAt']);
  });
}
export async function down() { throw Error('Account deletion migration is forward-only.'); }
