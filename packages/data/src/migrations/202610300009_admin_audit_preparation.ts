import type { Knex } from 'knex';
import { applyAuditWorkerGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('auditArchiveJobs', table => {
    table.uuid('id').primary();
    table.uuid('ledgerId').notNullable().unique();
    table.text('state').notNullable();
    table.jsonb('scope');
    table.integer('attempts').notNullable().defaultTo(0);
    table.jsonb('checkpoint');
    table.text('checkpointSHA256');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"state" IN ('pending', 'preparing', 'prepared', 'failed', 'no_events')`);
    table.check('"attempts" >= 0');
    table.check(`("state" = 'no_events' AND "scope" IS NULL) OR ("state" <> 'no_events' AND "scope" IS NOT NULL)`);
    table.check(`("state" = 'prepared' AND "checkpoint" IS NOT NULL AND "checkpointSHA256" IS NOT NULL)
      OR ("state" <> 'prepared' AND "checkpoint" IS NULL AND "checkpointSHA256" IS NULL)`);
  });
  await db.schema.withSchema('admin').createTable('auditArchiveAttempts', table => {
    table.uuid('id').primary();
    table.uuid('jobId').notNullable().references('id').inTable('admin.auditArchiveJobs');
    table.integer('attempt').notNullable();
    table.text('state').notNullable();
    table.text('failureCode');
    table.jsonb('checkpoint');
    table.text('checkpointSHA256');
    table.timestamp('startedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.unique(['jobId', 'attempt']);
    table.check('"attempt" > 0');
    table.check(`("state" = 'prepared' AND "checkpoint" IS NOT NULL AND "checkpointSHA256" IS NOT NULL)
      OR ("state" <> 'prepared' AND "checkpoint" IS NULL AND "checkpointSHA256" IS NULL)`);
    table.check(`"state" IN ('preparing', 'prepared', 'failed', 'interrupted')`);
    table.check(`("state" = 'preparing' AND "finishedAt" IS NULL AND "failureCode" IS NULL)
      OR ("state" = 'prepared' AND "finishedAt" IS NOT NULL AND "failureCode" IS NULL)
      OR ("state" IN ('failed', 'interrupted') AND "finishedAt" IS NOT NULL AND "failureCode" IS NOT NULL)`);
  });
  await applyAuditWorkerGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('auditArchiveAttempts');
  await db.schema.withSchema('admin').dropTable('auditArchiveJobs');
}
