import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('notificationPreferences', t => { t.boolean('visitChangedEmail').notNullable().defaultTo(true); });
  await db.schema.createTable('visitNotifications', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE'); t.uuid('operationId').notNullable();
    t.text('event').notNullable(); t.text('actorName').notNullable(); t.jsonb('before').notNullable(); t.jsonb('after').notNullable(); t.text('timezone').notNullable();
    t.timestamp('readAt', { useTz: true }); t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.text('emailStatus').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('sentAt', { useTz: true });
    t.unique(['workspaceId', 'operationId', 'userId']); t.unique(['workspaceId', 'id']); t.index(['workspaceId', 'userId', 'createdAt', 'id']); t.index(['emailStatus', 'nextAttemptAt']);
  });
  await db.raw(`ALTER TABLE "visitNotifications" ADD CHECK (event IN ('scheduled','rescheduled','cleared','joined','separated')), ADD CHECK ("emailStatus" IN ('queued','sent','skipped','failed')), ADD CHECK (attempts >= 0)`);
  await db.schema.createTable('visitNotificationRecords', t => {
    t.uuid('workspaceId').notNullable(); t.uuid('notificationId').notNullable();
    t.uuid('jobId').references('id').inTable('jobs').onDelete('CASCADE'); t.uuid('workOrderId').references('id').inTable('workOrders').onDelete('CASCADE');
    t.foreign(['workspaceId', 'notificationId']).references(['workspaceId', 'id']).inTable('visitNotifications').onDelete('CASCADE');
    t.index(['notificationId']); t.unique(['notificationId', 'jobId']); t.unique(['notificationId', 'workOrderId']);
  });
  await db.raw(`ALTER TABLE "visitNotificationRecords" ADD CHECK (("jobId" IS NOT NULL)::int + ("workOrderId" IS NOT NULL)::int = 1)`);
}
export async function down(db: Knex) {
  await db.schema.dropTable('visitNotificationRecords'); await db.schema.dropTable('visitNotifications');
  await db.schema.alterTable('notificationPreferences', t => { t.dropColumn('visitChangedEmail'); });
}
