import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('notificationPreferences', t => {
    t.text('userId').primary().references('id').inTable('users').onDelete('CASCADE');
    t.boolean('leadAssignedEmail').notNullable().defaultTo(true);
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('assignmentNotifications', t => {
    t.uuid('id').primary().references('id').inTable('leadActivity').onDelete('CASCADE');
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('leadId').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('readAt', { useTz: true });
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(['workspaceId', 'userId', 'createdAt', 'id']);
  });
  await db.schema.createTable('assignmentEmailOutbox', t => {
    t.uuid('id').primary().references('id').inTable('assignmentNotifications').onDelete('CASCADE');
    t.text('status').notNullable().defaultTo('queued');
    t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('sentAt', { useTz: true });
    t.index(['status', 'nextAttemptAt']);
  });
  await db.raw(`ALTER TABLE "assignmentEmailOutbox" ADD CHECK (status IN ('queued','sent','skipped','failed')), ADD CHECK (attempts >= 0 AND attempts <= 5)`);
}
export async function down(db: Knex) {
  await db.schema.dropTable('assignmentEmailOutbox');
  await db.schema.dropTable('assignmentNotifications');
  await db.schema.dropTable('notificationPreferences');
}
