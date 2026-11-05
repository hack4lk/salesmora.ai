import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

/** Staff ownership transfer (0d part c): the notice outbox and the admin grants to swap the Owner. */
export async function up(db: Knex) {
  // One row per recipient. The worker delivers them; a later transfer makes earlier notices stale.
  await db.schema.createTable('workspaceOwnershipNotices', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('recipient').notNullable();
    t.text('fromUserId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('toUserId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('status').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('sentAt', { useTz: true });
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check(`"recipient" IN ('new_owner', 'previous_owner')`);
    t.check(`"status" IN ('queued', 'sent', 'failed', 'skipped')`);
    t.index(['status', 'nextAttemptAt']);
  });
  await applyRuntimeGrants(db);
}

// Re-applying the earlier grant set would need the previous ADMIN_WRITES list; the extra grants are harmless to keep.
export async function down(db: Knex) {
  await db.schema.dropTable('workspaceOwnershipNotices');
}
