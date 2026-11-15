import type { Knex } from 'knex';

export async function createAdminAuditTables(db: Knex) {
  await db.schema.withSchema('admin').createTable('auditEvents', table => {
    table.bigIncrements('sequence').primary();
    table.text('id').notNullable().unique();
    table.timestamp('occurredAt', { useTz: true }).notNullable();
    table.text('staffUserId');
    table.text('staffRole').notNullable();
    table.text('action').notNullable();
    table.text('targetType').notNullable();
    table.text('targetId').notNullable();
    table.text('workspaceId');
    table.text('reason');
    table.jsonb('before');
    table.jsonb('after');
    table.text('requestId').notNullable();
    table.text('ipAddress');
    table.text('userAgent');
    table.text('prevHash');
    table.text('hash').notNullable().unique();
    table.check(`"staffRole" IN ('super_admin', 'support', 'billing', 'bootstrap')`);
    table.index(['occurredAt']);
    table.index(['staffUserId', 'occurredAt']);
    table.index(['action', 'occurredAt']);
    table.index(['targetType', 'targetId']);
  });
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
  await db.schema.withSchema('admin').createTable('auditArchiveCopies', table => {
    table.uuid('id').primary();
    table.uuid('ledgerId').notNullable();
    table.bigInteger('throughSequence').notNullable();
    table.jsonb('scope').notNullable();
    table.jsonb('target').notNullable();
    table.text('state').notNullable();
    table.integer('attempts').notNullable().defaultTo(0);
    table.jsonb('checkpoint');
    table.text('checkpointSHA256');
    table.jsonb('copyEvidence');
    table.text('failureCode');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['ledgerId', 'throughSequence']);
    table.check(`"state" IN ('pending', 'copying', 'copied', 'failed')`);
    table.check('"throughSequence" > 0 AND "attempts" >= 0');
    table.check(`"scope"->>'throughSequence' = "throughSequence"::text AND "scope"->>'ledgerId' = "ledgerId"::text`);
    table.check(`("checkpoint" IS NULL) = ("checkpointSHA256" IS NULL)`);
    table.check(`"state" <> 'copied' OR ("checkpoint" IS NOT NULL AND "copyEvidence" IS NOT NULL AND "failureCode" IS NULL)`);
  });
  await db.schema.withSchema('admin').createTable('auditArchiveCopyAttempts', table => {
    table.uuid('id').primary();
    table.uuid('copyId').notNullable().references('id').inTable('admin.auditArchiveCopies');
    table.integer('attempt').notNullable();
    table.text('state').notNullable();
    table.text('failureCode');
    table.timestamp('startedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.unique(['copyId', 'attempt']);
    table.check(`"state" IN ('copying', 'copied', 'failed', 'interrupted')`);
    table.check('"attempt" > 0');
    table.check(`("state" = 'copying' AND "finishedAt" IS NULL AND "failureCode" IS NULL)
      OR ("state" = 'copied' AND "finishedAt" IS NOT NULL AND "failureCode" IS NULL)
      OR ("state" IN ('failed', 'interrupted') AND "finishedAt" IS NOT NULL AND "failureCode" IS NOT NULL)`);
  });
  await db.schema.withSchema('admin').createTable('auditArchiveChecks', table => {
    table.uuid('id').primary();
    table.uuid('copyId').notNullable().references('id').inTable('admin.auditArchiveCopies');
    table.text('state').notNullable();
    table.jsonb('retained');
    table.jsonb('evidence');
    table.text('failureCode');
    table.timestamp('checkedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['copyId', 'checkedAt']);
    table.check(`"state" IN ('accepted', 'failed')`);
    table.check(`("state" = 'accepted' AND "retained" IS NOT NULL AND "evidence" IS NOT NULL AND "failureCode" IS NULL)
      OR ("state" = 'failed' AND "retained" IS NULL AND "evidence" IS NULL AND "failureCode" IS NOT NULL)`);
  });
}
