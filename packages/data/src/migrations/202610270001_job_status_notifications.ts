import type { Knex } from 'knex';
async function dropEventCheck(db: Knex) {
  const { rows } = await db.raw(`SELECT c.conname FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attname='event'
    WHERE c.conrelid='"jobNotifications"'::regclass AND c.contype='c' AND c.conkey=ARRAY[a.attnum]::smallint[]`);
  if (rows.length !== 1) throw new Error('Expected the existing Job notification event constraint.');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT ??', [rows[0].conname]);
}
export async function up(db: Knex) {
  await dropEventCheck(db);
  await db.schema.alterTable('jobNotifications', t => { t.text('beforeStatus'); t.text('afterStatus'); });
  await db.raw(`ALTER TABLE "jobNotifications"
    ADD CONSTRAINT job_notifications_event CHECK (event IN ('created','status')),
    ADD CONSTRAINT job_notifications_status_snapshot CHECK (
      (event='created' AND "beforeStatus" IS NULL AND "afterStatus" IS NULL) OR
      (event='status' AND "beforeStatus" IS NOT NULL AND "afterStatus" IS NOT NULL
        AND "beforeStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "afterStatus" IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled')
        AND "beforeStatus"<>"afterStatus"
        AND NOT ("beforeStatus" IN ('completed','canceled') AND "afterStatus" IN ('completed','canceled')))
    )`);
}
export async function down(db: Knex) {
  if (await db('jobNotifications').where({ event: 'status' }).first('id')) throw new Error('Retained Job status history requires this migration.');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_status_snapshot');
  await db.raw('ALTER TABLE "jobNotifications" DROP CONSTRAINT job_notifications_event');
  await db.schema.alterTable('jobNotifications', t => { t.dropColumn('beforeStatus'); t.dropColumn('afterStatus'); t.check("event IN ('created')"); });
}
