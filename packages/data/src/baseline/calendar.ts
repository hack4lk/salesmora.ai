import type { Knex } from 'knex';

export async function createCalendarTables(db: Knex) {
  await db.schema.createTable('calendarVisits', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.date('scheduledDate');
    table.text('arrivalWindow');
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'id']);
    table.index(['workspaceId', 'scheduledDate', 'id']);
    table.check(`version > 0 AND ("arrivalWindow" IS NULL OR ("scheduledDate" IS NOT NULL AND "arrivalWindow" IN ('08:00-10:00','09:00-11:00','10:00-12:00','12:00-14:00','13:00-15:00','14:00-16:00')))`);
  });
  await db.schema.createTable('calendarVisitRecords', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('visitId').notNullable();
    table.uuid('jobId');
    table.uuid('workOrderId');
    table.timestamp('linkedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('endedAt', { useTz: true });
    table.foreign(['workspaceId', 'visitId']).references(['workspaceId', 'id']).inTable('calendarVisits').onDelete('CASCADE');
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.foreign(['workspaceId', 'workOrderId']).references(['workspaceId', 'id']).inTable('workOrders').onDelete('CASCADE');
    table.check(`("jobId" IS NULL) <> ("workOrderId" IS NULL)`);
    table.check(`"endedAt" IS NULL OR "endedAt" >= "linkedAt"`);
    table.index(['workspaceId', 'visitId', 'endedAt']);
  });
  for (const column of ['jobId', 'workOrderId']) {
    await db.raw(`CREATE UNIQUE INDEX "calendar_active_${column}" ON "calendarVisitRecords" ("workspaceId", "${column}") WHERE "endedAt" IS NULL AND "${column}" IS NOT NULL`);
  }
  await db.schema.createTable('calendarScheduleSnapshots', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('visitId').notNullable();
    table.uuid('jobId');
    table.uuid('workOrderId');
    table.integer('recordVersion').notNullable();
    table.text('recordStatus').notNullable();
    table.date('scheduledDate');
    table.text('arrivalWindow');
    table.text('reason').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(['workspaceId', 'visitId']).references(['workspaceId', 'id']).inTable('calendarVisits').onDelete('CASCADE');
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.foreign(['workspaceId', 'workOrderId']).references(['workspaceId', 'id']).inTable('workOrders').onDelete('CASCADE');
    table.check(`("jobId" IS NULL) <> ("workOrderId" IS NULL)`);
    table.check(`"recordVersion" > 0 AND reason IN ('backfill','closed','separated','rescheduled','cleared')`);
    table.check(`"arrivalWindow" IS NULL OR "scheduledDate" IS NOT NULL`);
    table.index(['workspaceId', 'visitId', 'createdAt', 'id']);
  });
  await db.raw(`CREATE FUNCTION protect_calendar_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Calendar schedule snapshots cannot be updated'; END $$`);
  await db.raw('CREATE TRIGGER protect_calendar_snapshot BEFORE UPDATE ON "calendarScheduleSnapshots" FOR EACH ROW EXECUTE FUNCTION protect_calendar_snapshot()');
  await db.schema.createTable('calendarOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('inputHash').notNullable();
    table.jsonb('result').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']);
  });
  await db.schema.createTable('visitNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('operationId').notNullable();
    table.text('event').notNullable();
    table.text('actorName').notNullable();
    table.jsonb('before').notNullable();
    table.jsonb('after').notNullable();
    table.text('timezone').notNullable();
    table.timestamp('readAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('emailStatus').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.unique(['workspaceId', 'operationId', 'userId']);
    table.unique(['workspaceId', 'id']);
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['emailStatus', 'nextAttemptAt']);
  });
  await db.raw(`ALTER TABLE "visitNotifications" ADD CHECK (event IN ('scheduled','rescheduled','cleared','joined','separated')), ADD CHECK ("emailStatus" IN ('queued','sent','skipped','failed')), ADD CHECK (attempts >= 0)`);
  await db.schema.createTable('visitNotificationRecords', table => {
    table.uuid('workspaceId').notNullable();
    table.uuid('notificationId').notNullable();
    table.uuid('jobId').references('id').inTable('jobs').onDelete('CASCADE');
    table.uuid('workOrderId').references('id').inTable('workOrders').onDelete('CASCADE');
    table.foreign(['workspaceId', 'notificationId']).references(['workspaceId', 'id']).inTable('visitNotifications').onDelete('CASCADE');
    table.index(['notificationId']);
    table.unique(['notificationId', 'jobId']);
    table.unique(['notificationId', 'workOrderId']);
  });
  await db.raw(`ALTER TABLE "visitNotificationRecords" ADD CHECK (("jobId" IS NOT NULL)::int + ("workOrderId" IS NOT NULL)::int = 1)`);
  await db.schema.createTable('jobNotificationSettings', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('section').notNullable();
    table.jsonb('values').notNullable();
    table.integer('version').notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'section']);
    table.check(`"section" in ('deadline', 'reminders', 'events')`);
    table.check('"version" >= 1');
  });
  await db.schema.createTable('jobNotificationSettingsAudit', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('section').notNullable();
    table.text('requestHash').notNullable();
    table.integer('beforeVersion').notNullable();
    table.integer('afterVersion').notNullable();
    table.jsonb('beforeValues').notNullable();
    table.jsonb('afterValues').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']);
    table.index(['workspaceId', 'createdAt']);
  });
}
