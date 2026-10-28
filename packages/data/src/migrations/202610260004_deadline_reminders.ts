import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('notificationPreferences', t => t.boolean('deadlineReminderEmail').notNullable().defaultTo(true));
  await db.schema.alterTable('jobs', t => t.integer('reminderRevision').notNullable().defaultTo(0));
  await db.schema.createTable('deadlineNotifications', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('jobId').notNullable();
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    t.integer('reminderRevision').notNullable();
    t.text('offsetKey').notNullable();
    t.date('completionDeadline').notNullable(); t.date('reminderDate').notNullable(); t.text('timezone').notNullable();
    t.text('event').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('readAt', { useTz: true });
    t.text('emailStatus').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('sentAt', { useTz: true });
    t.unique(['workspaceId', 'jobId', 'reminderRevision', 'offsetKey', 'userId']);
    t.index(['workspaceId', 'userId', 'createdAt', 'id']); t.index(['emailStatus', 'nextAttemptAt']);
    t.check("event IN ('approaching','due','overdue')");
    t.check('"emailStatus" IN (\'queued\',\'sent\',\'skipped\',\'failed\')');
    t.check('attempts BETWEEN 0 AND 5'); t.check('"reminderRevision" >= 0');
  });
  // One generation per deadline/lifecycle, regardless of which trusted mutation path updates the Job.
  await db.raw(`CREATE FUNCTION advance_job_reminder_revision() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF OLD."completionDeadline" IS DISTINCT FROM NEW."completionDeadline"
        OR ((OLD.status IN ('completed','canceled')) IS DISTINCT FROM (NEW.status IN ('completed','canceled'))) THEN
        NEW."reminderRevision" := OLD."reminderRevision" + 1;
        UPDATE "deadlineNotifications" SET "emailStatus" = 'skipped'
          WHERE "workspaceId" = OLD."workspaceId" AND "jobId" = OLD.id AND "emailStatus" = 'queued';
      ELSE NEW."reminderRevision" := OLD."reminderRevision"; END IF;
      RETURN NEW;
    END $$`);
  await db.raw('CREATE TRIGGER jobs_reminder_revision BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION advance_job_reminder_revision()');
  await db.raw(`CREATE INDEX jobs_deadline_reminders ON jobs ("workspaceId","completionDeadline",id) WHERE "completionDeadline" IS NOT NULL AND status NOT IN ('completed','canceled')`);
}
export async function down(db: Knex) {
  await db.raw('DROP TRIGGER jobs_reminder_revision ON jobs');
  await db.raw('DROP FUNCTION advance_job_reminder_revision()');
  await db.raw('DROP INDEX jobs_deadline_reminders');
  await db.schema.dropTable('deadlineNotifications');
  await db.schema.alterTable('jobs', t => t.dropColumn('reminderRevision'));
  await db.schema.alterTable('notificationPreferences', t => t.dropColumn('deadlineReminderEmail'));
}
