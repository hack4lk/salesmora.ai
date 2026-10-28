import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_event');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_status_snapshot');
  await db.schema.alterTable('jobNotifications', t => {
    t.text('assignmentChange'); t.text('beforeAssignment'); t.text('afterAssignment'); t.text('jobNumberSnapshot');
  });
  await db.raw(`ALTER TABLE "jobNotifications"
    ADD CONSTRAINT job_notifications_event CHECK (event IN ('created','status','assignment')),
    ADD CONSTRAINT job_notifications_status_snapshot CHECK (
      (event IN ('created','assignment') AND "beforeStatus" IS NULL AND "afterStatus" IS NULL) OR
      (event='status' AND "beforeStatus" IS NOT NULL AND "afterStatus" IS NOT NULL
        AND "beforeStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "afterStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "beforeStatus"<>"afterStatus"
        AND NOT ("beforeStatus" IN ('completed','canceled') AND "afterStatus" IN ('completed','canceled')))),
    ADD CONSTRAINT job_notifications_assignment_snapshot CHECK (
      (event<>'assignment' AND "assignmentChange" IS NULL AND "beforeAssignment" IS NULL AND "afterAssignment" IS NULL AND "jobNumberSnapshot" IS NULL) OR
      (event='assignment' AND "assignmentChange" IS NOT NULL AND "beforeAssignment" IS NOT NULL AND "afterAssignment" IS NOT NULL
        AND "jobNumberSnapshot" IS NOT NULL AND "jobNumberSnapshot" ~ '^J-[0-9]+$'
        AND "beforeAssignment" IN ('none','primary','team') AND "afterAssignment" IN ('none','primary','team')
        AND (("assignmentChange"='removed' AND "beforeAssignment"<>'none' AND "afterAssignment"='none')
          OR ("assignmentChange"='primary' AND "afterAssignment"='primary' AND "beforeAssignment"<>'primary')
          OR ("assignmentChange"='team' AND "afterAssignment"='team' AND "beforeAssignment"<>'team')
          OR ("assignmentChange"='updated' AND "beforeAssignment"="afterAssignment" AND "afterAssignment"<>'none'))))`);
}
export async function down(db: Knex) {
  if (await db('jobNotifications').where({ event: 'assignment' }).first('id')) throw new Error('Retained Job assignment history requires this migration.');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_assignment_snapshot');
  await db.schema.alterTable('jobNotifications', t => {
    t.dropColumn('assignmentChange'); t.dropColumn('beforeAssignment'); t.dropColumn('afterAssignment'); t.dropColumn('jobNumberSnapshot');
  });
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_event');
  await db.raw("ALTER TABLE \"jobNotifications\" ADD CONSTRAINT job_notifications_event CHECK (event IN ('created','status'))");
}
