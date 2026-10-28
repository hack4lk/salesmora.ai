import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('notificationPreferences', t => t.boolean('jobActivityEmail').notNullable().defaultTo(true));
  await db.schema.createTable('jobNotifications', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('jobId').notNullable();
    t.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    t.text('actorName').notNullable();
    t.uuid('operationId').notNullable(); t.text('event').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('readAt', { useTz: true });
    t.text('emailStatus').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('sentAt', { useTz: true });
    t.unique(['workspaceId', 'operationId', 'event', 'userId']);
    t.index(['workspaceId', 'userId', 'createdAt', 'id']); t.index(['emailStatus', 'nextAttemptAt']);
    t.check("event IN ('created')");
    t.check('"emailStatus" IN (\'queued\',\'sent\',\'skipped\',\'failed\')');
    t.check('attempts BETWEEN 0 AND 5');
  });
}
export async function down(db: Knex) {
  await db.schema.dropTable('jobNotifications');
  await db.schema.alterTable('notificationPreferences', t => t.dropColumn('jobActivityEmail'));
}
