import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.raw('ALTER TABLE "workspaceInvitations" DROP CONSTRAINT "workspaceInvitations_status_check"');
  await db.schema.alterTable('workspaceInvitations', table => {
    table.text('tokenHash').unique();
    table.timestamp('expiresAt', { useTz: true });
    table.timestamp('sentAt', { useTz: true });
    table.timestamp('acceptedAt', { useTz: true });
    table.text('acceptedBy').references('id').inTable('users').onDelete('SET NULL');
    table.integer('deliveryAttempts').notNullable().defaultTo(0);
    table.timestamp('lastAttemptAt', { useTz: true });
    table.index(['status', 'workspaceId']);
  });
  await db.raw(`ALTER TABLE "workspaceInvitations" ADD CONSTRAINT "workspaceInvitations_status_check" CHECK (status IN ('pending_verification','queued','sent','accepted','revoked'))`);
}
export async function down(db: Knex) {
  await db.raw('ALTER TABLE "workspaceInvitations" DROP CONSTRAINT "workspaceInvitations_status_check"');
  await db('workspaceInvitations').whereIn('status', ['sent', 'accepted', 'revoked']).update({ status: 'queued' });
  await db.schema.alterTable('workspaceInvitations', table => {
    table.dropIndex(['status', 'workspaceId']);
    table.dropColumns('tokenHash','expiresAt','sentAt','acceptedAt','acceptedBy','deliveryAttempts','lastAttemptAt');
  });
  await db.raw(`ALTER TABLE "workspaceInvitations" ADD CONSTRAINT "workspaceInvitations_status_check" CHECK (status IN ('pending_verification','queued'))`);
}
