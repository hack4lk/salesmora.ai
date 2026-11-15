import type { Knex } from 'knex';

export async function createJobTables(db: Knex) {
  await db.schema.createTable('jobs', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('jobNumber').notNullable();
    table.uuid('customerId');
    table.text('customerName').notNullable();
    table.uuid('sourceLeadId');
    table.text('sourceLeadNumber');
    for (const field of ['title', 'service', 'location', 'description']) table.text(field).notNullable();
    table.text('status').notNullable().defaultTo('needs-scheduling');
    table.text('primaryOwnerId');
    table.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    table.date('scheduledDate');
    table.text('arrivalWindow');
    table.date('completionDeadline');
    table.text('waitingReason');
    table.integer('version').notNullable().defaultTo(1);
    for (const name of ['createdAt', 'updatedAt', 'lastActivityAt']) table.timestamp(name, { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.uuid('acceptedEstimateId');
    table.integer('reminderRevision').notNullable().defaultTo(0);
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'jobNumber']);
    table.index(['workspaceId', 'status', 'createdAt', 'id']);
    table.index(['workspaceId', 'scheduledDate', 'id']);
    table.index(['workspaceId', 'primaryOwnerId', 'scheduledDate']);
    table.index(['workspaceId', 'customerId']);
    table.check(`status IN ('needs-scheduling','scheduled','in-progress','waiting','completed','canceled') AND version > 0 AND "jobNumber" > 0`);
    table.check(`("arrivalWindow" IS NULL OR ("scheduledDate" IS NOT NULL AND "arrivalWindow" IN ('08:00-10:00','09:00-11:00','10:00-12:00','12:00-14:00','13:00-15:00','14:00-16:00')))`);
    table.check(`status <> 'scheduled' OR "scheduledDate" IS NOT NULL`);
    table.check(`status <> 'needs-scheduling' OR "scheduledDate" IS NULL`);
    table.check(`(status = 'waiting' AND "waitingReason" IS NOT NULL AND "waitingReason" IN ('customer','materials','approval','other')) OR (status <> 'waiting' AND "waitingReason" IS NULL)`);
  });
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_customer_workspace_fk FOREIGN KEY ("workspaceId","customerId") REFERENCES customers("workspaceId",id) ON DELETE SET NULL ("customerId")`);
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_lead_workspace_fk FOREIGN KEY ("workspaceId","sourceLeadId") REFERENCES leads("workspaceId",id) ON DELETE SET NULL ("sourceLeadId")`);
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_owner_workspace_fk FOREIGN KEY ("workspaceId","primaryOwnerId") REFERENCES "workspaceMemberships"("workspaceId","userId") ON DELETE SET NULL ("primaryOwnerId")`);
  await db.raw(`CREATE UNIQUE INDEX jobs_source_lead_once ON jobs("workspaceId","sourceLeadId") WHERE "sourceLeadId" IS NOT NULL`);
  await db.raw(`CREATE UNIQUE INDEX jobs_accepted_estimate_once ON jobs("workspaceId","acceptedEstimateId") WHERE "acceptedEstimateId" IS NOT NULL`);
  await db.raw(`CREATE INDEX jobs_needs_schedule ON jobs("workspaceId","completionDeadline",id) WHERE "scheduledDate" IS NULL AND status NOT IN ('completed','canceled')`);
  await db.raw(`CREATE INDEX jobs_deadline_reminders ON jobs ("workspaceId","completionDeadline",id) WHERE "completionDeadline" IS NOT NULL AND status NOT IN ('completed','canceled')`);
  await db.schema.createTable('workspaceJobCounters', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('lastNumber').notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_job_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO "workspaceJobCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1)
    ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceJobCounters"."lastNumber"+1
    RETURNING "lastNumber" INTO NEW."jobNumber"; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER assign_job_number BEFORE INSERT ON jobs FOR EACH ROW EXECUTE FUNCTION assign_job_number()');
  await db.schema.createTable('jobTeamMembers', table => {
    table.uuid('workspaceId').notNullable();
    table.uuid('jobId').notNullable();
    table.text('userId').notNullable();
    table.primary(['workspaceId', 'jobId', 'userId']);
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.foreign(['workspaceId', 'userId']).references(['workspaceId', 'userId']).inTable('workspaceMemberships').onDelete('CASCADE');
    table.index(['workspaceId', 'userId', 'jobId']);
  });
  await db.schema.createTable('jobActivity', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('jobId').notNullable();
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName').notNullable();
    table.text('source').notNullable();
    table.text('type').notNullable();
    table.jsonb('changes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'jobId', 'createdAt', 'id']);
    table.check(`source IN ('ui','assistant-confirmed','system')`);
  });
  await db.schema.createTable('jobOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.uuid('jobId').notNullable();
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.string('inputHash', 64).notNullable();
    table.integer('version').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']);
  });
  await db.schema.createTable('deadlineNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('jobId').notNullable();
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.integer('reminderRevision').notNullable();
    table.text('offsetKey').notNullable();
    table.date('completionDeadline').notNullable();
    table.date('reminderDate').notNullable();
    table.text('timezone').notNullable();
    table.text('event').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('readAt', { useTz: true });
    table.text('emailStatus').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.unique(['workspaceId', 'jobId', 'reminderRevision', 'offsetKey', 'userId']);
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['emailStatus', 'nextAttemptAt']);
    table.check("event IN ('approaching','due','overdue')");
    table.check('"emailStatus" IN (\'queued\',\'sent\',\'skipped\',\'failed\')');
    table.check('attempts BETWEEN 0 AND 5');
    table.check('"reminderRevision" >= 0');
  });
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
}
