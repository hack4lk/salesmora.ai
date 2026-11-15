import type { Knex } from 'knex';

export async function createJobNotifications(db: Knex) {
  await db.schema.createTable('jobNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('jobId').notNullable();
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName').notNullable();
    table.uuid('operationId').notNullable();
    table.text('event').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('readAt', { useTz: true });
    table.text('emailStatus').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    for (const field of ['beforeStatus', 'afterStatus', 'assignmentChange', 'beforeAssignment', 'afterAssignment', 'jobNumberSnapshot']) table.text(field);
    table.date('beforeDeadline');
    table.date('afterDeadline');
    table.text('deadlineTimezone');
    table.unique(['workspaceId', 'operationId', 'event', 'userId']);
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['emailStatus', 'nextAttemptAt']);
    table.check(`"emailStatus" IN ('queued','sent','skipped','failed')`);
    table.check('attempts BETWEEN 0 AND 5');
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
        AND "deadlineTimezone" IS NOT NULL AND length(btrim("deadlineTimezone")) BETWEEN 1 AND 100)),
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
