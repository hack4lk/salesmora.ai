import type { Knex } from 'knex';
import { applyAuditWorkerGrants } from '../runtime-roles';

export async function up(db: Knex) {
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
  await applyAuditWorkerGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('auditArchiveChecks');
  await db.schema.withSchema('admin').dropTable('auditArchiveCopyAttempts');
  await db.schema.withSchema('admin').dropTable('auditArchiveCopies');
  await applyAuditWorkerGrants(db);
}
