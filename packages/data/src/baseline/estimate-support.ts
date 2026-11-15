import type { Knex } from 'knex';

export async function createEstimateSupportTables(db: Knex) {
  await db.schema.createTable('estimate_items', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.integer('position').notNullable();
    table.uuid('catalogId');
    table.text('catalogName');
    table.text('unit');
    table.text('sku');
    table.text('description').notNullable();
    table.decimal('quantity', 12, 3).notNullable();
    table.integer('unitPriceCents');
    table.boolean('taxable').notNullable().defaultTo(true);
    table.boolean('included').notNullable().defaultTo(false);
    table.bigint('amountCents');
    table.unique(['workspaceId', 'estimateId', 'position']);
    table.foreign(['workspaceId', 'estimateId']).references(['workspaceId', 'id']).inTable('estimates').onDelete('CASCADE');
    table.check('position >= 0 AND quantity > 0 AND ("unitPriceCents" IS NULL OR "unitPriceCents" BETWEEN 0 AND 100000000)');
    table.check('("unitPriceCents" IS NULL AND "included" = false) OR ("unitPriceCents" > 0 AND "included" = false) OR ("unitPriceCents" = 0 AND "included" = true)');
    table.check('("amountCents" IS NULL OR "amountCents" BETWEEN 0 AND 1000000000) AND char_length(description) BETWEEN 1 AND 200');
  });
  await db.raw(`ALTER TABLE estimate_items ADD CONSTRAINT estimate_items_catalog_fk
    FOREIGN KEY ("workspaceId","catalogId") REFERENCES "materialCatalog" ("workspaceId","id")
    ON DELETE SET NULL ("catalogId")`);

  await db.schema.createTable('estimate_snapshots', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.jsonb('content').notNullable();
    table.string('contentHash', 64).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('estimateVersion').notNullable().defaultTo(1);
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'estimateId']);
    table.unique(['workspaceId', 'estimateId', 'id']);
    table.foreign(['workspaceId', 'estimateId']).references(['workspaceId', 'id']).inTable('estimates').onDelete('CASCADE');
    table.check(`"contentHash" ~ '^[0-9a-f]{64}$'`);
  });
  await db.schema.createTable('estimate_share_tokens', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.uuid('snapshotId').notNullable();
    table.string('tokenHash', 64).notNullable().unique();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('revokedAt', { useTz: true });
    table.integer('viewCount').notNullable().defaultTo(0);
    table.timestamp('firstViewedAt', { useTz: true });
    table.timestamp('lastViewedAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('encryptedToken');
    table.unique(['workspaceId', 'estimateId', 'snapshotId']);
    table.foreign(['workspaceId', 'estimateId', 'snapshotId']).references(['workspaceId', 'estimateId', 'id']).inTable('estimate_snapshots').onDelete('CASCADE');
    table.check(`"tokenHash" ~ '^[0-9a-f]{64}$' AND "viewCount" >= 0`);
  });
  await db.schema.createTable('estimate_deliveries', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.uuid('snapshotId').notNullable();
    table.text('recipient').notNullable();
    table.string('recipientHash', 64).notNullable();
    table.text('providerMessageId');
    table.text('status').notNullable().defaultTo('queued');
    table.text('idempotencyKey').notNullable();
    table.integer('attemptCount').notNullable().defaultTo(0);
    table.timestamp('queuedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.timestamp('bouncedAt', { useTz: true });
    table.timestamp('failedAt', { useTz: true });
    table.text('subject').notNullable().defaultTo('');
    table.text('requestedBy').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('failureCode');
    table.unique(['workspaceId', 'idempotencyKey']);
    table.foreign(['workspaceId', 'estimateId', 'snapshotId']).references(['workspaceId', 'estimateId', 'id']).inTable('estimate_snapshots').onDelete('CASCADE');
    table.index(['workspaceId', 'estimateId', 'queuedAt']);
    table.index(['status', 'nextAttemptAt']);
    table.check(`status IN ('queued','sent','bounced','failed') AND "attemptCount" >= 0 AND char_length(recipient) <= 254 AND "recipientHash" ~ '^[0-9a-f]{64}$'`);
    table.check(`"failureCode" IS NULL OR "failureCode" IN ('authorization','inactive','invalid','transport')`, [], 'estimate_delivery_failure_code_check');
  });
  await db.schema.createTable('estimate_activity', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('actorName').notNullable();
    table.text('source').notNullable();
    table.text('type').notNullable();
    table.jsonb('changes').notNullable().defaultTo('{}');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(['workspaceId', 'estimateId']).references(['workspaceId', 'id']).inTable('estimates').onDelete('CASCADE');
    table.index(['workspaceId', 'estimateId', 'createdAt', 'id']);
    table.check(`source IN ('ui','assistant-confirmed','worker','system')`);
  });
  await db.schema.createTable('estimate_operation_receipts', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.text('actorId').notNullable().references('id').inTable('users');
    table.text('operation').notNullable();
    table.string('inputHash', 64).notNullable();
    table.uuid('estimateId');
    table.integer('version').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'submissionId']);
    table.foreign(['workspaceId', 'estimateId']).references(['workspaceId', 'id']).inTable('estimates');
    table.check(`operation IN ('create','send','publish','resend','decision','convert','void','revise','archive','restore') AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0`);
  });
  await db.schema.createTable('estimate_decisions', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('estimateId').notNullable();
    table.uuid('snapshotId').notNullable();
    table.uuid('previousDecisionId');
    table.integer('estimateVersion').notNullable();
    table.text('outcome').notNullable();
    table.date('decisionDate').notNullable();
    table.text('channel').notNullable();
    table.text('note').notNullable();
    table.text('reason');
    table.bigint('snapshotTotalCents').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'estimateId', 'id']);
    table.unique(['workspaceId', 'estimateId', 'estimateVersion']);
    table.foreign(['workspaceId', 'estimateId', 'snapshotId']).references(['workspaceId', 'estimateId', 'id']).inTable('estimate_snapshots').onDelete('CASCADE');
    table.foreign(['workspaceId', 'estimateId', 'previousDecisionId']).references(['workspaceId', 'estimateId', 'id']).inTable('estimate_decisions');
    table.check(`outcome IN ('accepted','declined') AND channel IN ('email','phone','in-person','other')
      AND "estimateVersion" > 0 AND "snapshotTotalCents" >= 0 AND char_length(note) <= 500
      AND (("previousDecisionId" IS NULL AND reason IS NULL)
        OR ("previousDecisionId" IS NOT NULL AND reason IS NOT NULL AND char_length(trim(reason)) BETWEEN 1 AND 500))`);
  });
  await db.schema.createTable('estimateNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('estimateId').notNullable();
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('event').notNullable();
    table.text('dedupeKey').notNullable();
    table.timestamp('readAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text('emailStatus').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.unique(['workspaceId', 'id']);
    table.unique(['workspaceId', 'dedupeKey', 'userId']);
    table.foreign(['workspaceId', 'estimateId']).references(['workspaceId', 'id']).inTable('estimates').onDelete('CASCADE');
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['emailStatus', 'nextAttemptAt']);
  });
  await db.raw(`ALTER TABLE "estimateNotifications"
    ADD CHECK (event IN ('sent','delivery_failed','viewed','decision_recorded','expiring_soon','expired')),
    ADD CHECK ("emailStatus" IN ('queued','sent','skipped','failed')),
    ADD CHECK (attempts BETWEEN 0 AND 5),
    ADD CHECK (char_length("dedupeKey") BETWEEN 1 AND 200)`);
  await db.schema.createTable('estimateExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.text('scope').notNullable();
    table.jsonb('filters').notNullable();
    table.integer('count').notNullable();
    table.integer('rowsSent').notNullable().defaultTo(0);
    table.text('outcome').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.index(['workspaceId', 'createdAt']);
    table.check(`scope IN ('workspace','assigned_job') AND outcome IN ('started','completed','failed','rejected') AND count >= 0 AND "rowsSent" >= 0`);
  });
  await db.raw(`CREATE FUNCTION protect_estimate_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Estimate snapshots are immutable'; END
  $$`);
  await db.raw(`CREATE TRIGGER protect_estimate_snapshot BEFORE UPDATE ON estimate_snapshots
    FOR EACH ROW EXECUTE FUNCTION protect_estimate_snapshot()`);
  await db.raw(`CREATE FUNCTION protect_estimate_decision() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."actorId" IS NULL AND (to_jsonb(NEW) - 'actorId') = (to_jsonb(OLD) - 'actorId') THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'Estimate decisions are immutable';
    END
  $$`);
  await db.raw(`CREATE TRIGGER protect_estimate_decision BEFORE UPDATE ON estimate_decisions
    FOR EACH ROW EXECUTE FUNCTION protect_estimate_decision()`);
  await db.raw(`CREATE FUNCTION estimate_export_audit_final() RETURNS trigger
    LANGUAGE plpgsql AS $$ BEGIN
      IF TG_OP = 'DELETE' OR OLD.outcome <> 'started' THEN
        RAISE EXCEPTION 'Final estimate export audit records are immutable';
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw('CREATE TRIGGER estimate_export_audit_final BEFORE UPDATE OR DELETE ON "estimateExportAudit" FOR EACH ROW EXECUTE FUNCTION estimate_export_audit_final()');
}
