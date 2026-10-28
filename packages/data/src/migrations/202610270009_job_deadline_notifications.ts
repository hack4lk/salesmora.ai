import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_event');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_status_snapshot');
  await db.schema.alterTable('jobNotifications', t => {
    t.date('beforeDeadline'); t.date('afterDeadline'); t.text('deadlineTimezone');
  });
  await db.raw(`ALTER TABLE "jobNotifications"
    ADD CONSTRAINT job_notifications_event CHECK (event IN ('created','status','assignment','deadline')),
    ADD CONSTRAINT job_notifications_status_snapshot CHECK (
      (event IN ('created','assignment','deadline') AND "beforeStatus" IS NULL AND "afterStatus" IS NULL) OR
      (event='status' AND "beforeStatus" IS NOT NULL AND "afterStatus" IS NOT NULL
        AND "beforeStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "afterStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "beforeStatus"<>"afterStatus"
        AND NOT ("beforeStatus" IN ('completed','canceled') AND "afterStatus" IN ('completed','canceled')))),
    ADD CONSTRAINT job_notifications_deadline_snapshot CHECK (
      (event<>'deadline' AND "beforeDeadline" IS NULL AND "afterDeadline" IS NULL AND "deadlineTimezone" IS NULL) OR
      (event='deadline' AND "beforeDeadline" IS DISTINCT FROM "afterDeadline"
        AND "deadlineTimezone" IS NOT NULL AND length(btrim("deadlineTimezone")) BETWEEN 1 AND 100))
  `);
}
export async function down(db: Knex) {
  if (await db('jobNotifications').where({ event: 'deadline' }).first('id')) throw new Error('Retained Job deadline history requires this migration.');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_deadline_snapshot');
  await db.schema.alterTable('jobNotifications', t => {
    t.dropColumn('beforeDeadline'); t.dropColumn('afterDeadline'); t.dropColumn('deadlineTimezone');
  });
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_event');
  await db.raw("ALTER TABLE \"jobNotifications\" ADD CONSTRAINT job_notifications_event CHECK (event IN ('created','status','assignment'))");
}
