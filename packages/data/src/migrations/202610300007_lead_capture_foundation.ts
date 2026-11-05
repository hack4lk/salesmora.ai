import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

const tables = ['captureSources', 'captureSourceVersions', 'captureSourceDrafts', 'captureSourceSamples', 'capturePublications', 'captureReceipts', 'intakeItems', 'intakeReviewSnapshots', 'intakeDecisions', 'captureOperations', 'captureSourceEvents', 'leadCaptureData'] as const;
function base(db: Knex, t: Knex.CreateTableBuilder) {
  t.uuid('id').primary();
  t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
  t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  t.unique(['workspaceId', 'id']);
}
function positive(t: Knex.CreateTableBuilder, column: string) { t.integer(column).notNullable(); t.check(`"${column}" > 0`); }
function source(t: Knex.CreateTableBuilder, typed = false) {
  t.uuid('sourceId').notNullable();
  if (typed) { t.text('sourceType').notNullable(); t.check(`"sourceType" IN ('website','gmail')`); }
  t.foreign(typed ? ['workspaceId', 'sourceId', 'sourceType'] : ['workspaceId', 'sourceId']).references(typed ? ['workspaceId', 'id', 'type'] : ['workspaceId', 'id']).inTable('captureSources').deferrable('deferred');
  t.unique(['workspaceId', 'sourceId', 'id']);
}
function configuration(t: Knex.CreateTableBuilder) {
  positive(t, 'configurationVersion');
  t.foreign(['workspaceId', 'sourceId', 'configurationVersion']).references(['workspaceId', 'sourceId', 'configurationVersion']).inTable('captureSourceVersions').deferrable('deferred');
}
function hash(t: Knex.CreateTableBuilder, name: string) { t.text(name).notNullable(); t.check(`"${name}" ~ '^[a-f0-9]{64}$'`); }
function jsonObject(t: Knex.CreateTableBuilder, name: string) { t.jsonb(name).notNullable(); t.check(`jsonb_typeof("${name}") = 'object'`); }

export async function up(db: Knex) {
  const { rows: [{ schema }] } = await db.raw<{ rows: { schema: string }[] }>('SELECT current_schema() AS schema');
  await db.schema.createTable('captureSources', t => {
    base(db, t); t.text('name').notNullable(); t.check('length(btrim(name)) BETWEEN 1 AND 200');
    t.text('type').notNullable(); t.check(`type IN ('website','gmail')`); t.unique(['workspaceId', 'id', 'type']);
    positive(t, 'version'); t.text('status').notNullable(); t.check(`status IN ('draft','active','paused','scheduled','archived')`);
    t.text('block').notNullable().defaultTo('none'); t.check(`block IN ('none','entitlement','source_capacity','connection','workspace')`);
    t.integer('approvedVersion'); t.check('"approvedVersion" IS NULL OR "approvedVersion" > 0'); t.uuid('draftId');
    t.timestamp('scheduledAt', { useTz: true }); t.text('timezone');
    t.check(`(status = 'scheduled') = ("scheduledAt" IS NOT NULL AND timezone IS NOT NULL)`);
    t.check(`status = 'scheduled' OR ("scheduledAt" IS NULL AND timezone IS NULL)`);
    t.check(`status NOT IN ('active','scheduled') OR "approvedVersion" IS NOT NULL`);
    t.check(`status <> 'draft' OR "approvedVersion" IS NULL`);
    t.text('createdBy').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('lastActivityAt', { useTz: true });
    t.index(['workspaceId', 'status', 'type', 'id']);
  });
  await db.schema.createTable('captureSourceVersions', t => {
    base(db, t); source(t, true); positive(t, 'configurationVersion'); positive(t, 'definitionVersion'); positive(t, 'workflowVersion');
    jsonObject(t, 'configuration'); t.check(`COALESCE(configuration->>'schemaVersion' = '1' AND configuration->>'type' = "sourceType", false)`);
    t.text('approvedBy').notNullable(); t.timestamp('approvedAt', { useTz: true }).notNullable();
    t.unique(['workspaceId', 'sourceId', 'configurationVersion']);
    t.unique(['workspaceId', 'sourceId', 'configurationVersion', 'definitionVersion', 'workflowVersion'], { indexName: 'captureVersion_definition_workflow' });
  });
  await db.schema.createTable('captureSourceDrafts', t => {
    base(db, t); source(t, true); positive(t, 'version'); t.integer('baseApprovedVersion'); t.check('"baseApprovedVersion" IS NULL OR "baseApprovedVersion" > 0');
    jsonObject(t, 'configuration'); t.check(`COALESCE(configuration->>'schemaVersion' = '1' AND configuration->>'type' = "sourceType", false)`);
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.unique(['workspaceId', 'sourceId']);
    t.foreign(['workspaceId', 'sourceId', 'baseApprovedVersion']).references(['workspaceId', 'sourceId', 'configurationVersion']).inTable('captureSourceVersions').deferrable('deferred');
  });
  await db.schema.alterTable('captureSources', t => {
    t.foreign(['workspaceId', 'id', 'approvedVersion']).references(['workspaceId', 'sourceId', 'configurationVersion']).inTable('captureSourceVersions').deferrable('deferred');
    t.foreign(['workspaceId', 'id', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').deferrable('deferred');
  });
  await db.schema.createTable('captureSourceSamples', t => {
    base(db, t); source(t); t.text('sourceType').notNullable(); t.check(`"sourceType" = 'gmail'`); t.uuid('draftId').notNullable(); positive(t, 'draftVersion');
    t.foreign(['workspaceId', 'sourceId', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').deferrable('deferred');
    t.uuid('connectionId').notNullable(); t.text('accountEmail').notNullable(); hash(t, 'bindingHash'); jsonObject(t, 'evidence'); jsonObject(t, 'answers');
    t.check(`COALESCE(evidence->>'schemaVersion' = '1' AND evidence->>'type' = 'gmail', false)`);
    t.text('reviewedBy'); t.timestamp('reviewedAt', { useTz: true }); t.check('("reviewedBy" IS NULL) = ("reviewedAt" IS NULL)');
  });
  await db.schema.createTable('capturePublications', t => {
    base(db, t); source(t, true); t.check(`"sourceType" = 'website'`); configuration(t); positive(t, 'version');
    t.text('publicKey').notNullable().unique(); t.check('length("publicKey") BETWEEN 32 AND 200');
    t.unique(['workspaceId', 'sourceId']);
  });
  await db.schema.createTable('captureReceipts', t => {
    base(db, t); source(t, true); configuration(t); positive(t, 'definitionVersion'); positive(t, 'workflowVersion');
    t.foreign(['workspaceId', 'sourceId', 'configurationVersion', 'definitionVersion', 'workflowVersion']).references(['workspaceId', 'sourceId', 'configurationVersion', 'definitionVersion', 'workflowVersion']).inTable('captureSourceVersions').deferrable('deferred');
    t.unique(['workspaceId', 'sourceId', 'id', 'configurationVersion', 'definitionVersion'], { indexName: 'captureReceipt_definition' });
    t.unique(['workspaceId', 'sourceId', 'id', 'definitionVersion', 'workflowVersion'], { indexName: 'captureReceipt_workflow' });
    t.text('dedupeKey').notNullable(); t.check('length("dedupeKey") BETWEEN 1 AND 500'); hash(t, 'inputHash');
    t.uuid('publicationId'); t.uuid('connectionId'); t.text('messageId');
    t.foreign(['workspaceId', 'sourceId', 'publicationId']).references(['workspaceId', 'sourceId', 'id']).inTable('capturePublications').deferrable('deferred');
    t.check(`("sourceType" = 'website' AND "publicationId" IS NOT NULL AND "connectionId" IS NULL AND "messageId" IS NULL) OR ("sourceType" = 'gmail' AND "publicationId" IS NULL AND "connectionId" IS NOT NULL AND "messageId" IS NOT NULL AND length("messageId") BETWEEN 1 AND 500)`);
    t.text('admission').notNullable(); t.check(`admission IN ('review','automatic') AND (admission <> 'automatic' OR "sourceType" = 'website')`);
    jsonObject(t, 'evidence'); jsonObject(t, 'originalAnswers'); t.check(`COALESCE(evidence->>'schemaVersion' = '1' AND evidence->>'type' = "sourceType", false)`);
    t.timestamp('receivedAt', { useTz: true }).notNullable();
    t.unique(['workspaceId', 'sourceId', 'dedupeKey']); t.unique(['workspaceId', 'sourceId', 'id', 'admission']);
    t.unique(['workspaceId', 'sourceId', 'connectionId', 'messageId']);
  });
  await db.schema.createTable('intakeItems', t => {
    base(db, t); source(t); t.uuid('receiptId').notNullable(); t.text('admission').notNullable().defaultTo('review'); t.check(`admission = 'review'`);
    t.foreign(['workspaceId', 'sourceId', 'receiptId', 'admission']).references(['workspaceId', 'sourceId', 'id', 'admission']).inTable('captureReceipts').deferrable('deferred');
    t.unique(['workspaceId', 'receiptId']); positive(t, 'version'); positive(t, 'definitionVersion'); positive(t, 'workflowVersion');
    t.foreign(['workspaceId', 'sourceId', 'receiptId', 'definitionVersion', 'workflowVersion']).references(['workspaceId', 'sourceId', 'id', 'definitionVersion', 'workflowVersion']).inTable('captureReceipts').deferrable('deferred');
    t.text('status').notNullable(); t.check(`status IN ('awaiting','approved','dismissed')`); jsonObject(t, 'answers');
    t.jsonb('flags').notNullable(); t.check(`jsonb_typeof(flags) = 'array' AND flags <@ '["duplicate","missing","uncertain","capacity"]'::jsonb`);
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.index(['workspaceId', 'status', 'createdAt', 'id']);
  });
  await db.schema.createTable('intakeReviewSnapshots', t => {
    base(db, t); t.uuid('intakeId').notNullable(); positive(t, 'intakeVersion'); positive(t, 'definitionVersion'); positive(t, 'workflowVersion');
    t.foreign(['workspaceId', 'intakeId']).references(['workspaceId', 'id']).inTable('intakeItems').deferrable('deferred');
    t.text('actorId').notNullable(); t.integer('policyRevision').notNullable(); t.check('"policyRevision" >= 0');
    hash(t, 'requestHash'); jsonObject(t, 'review'); t.timestamp('expiresAt', { useTz: true }).notNullable(); t.check('"expiresAt" > "createdAt"');
    t.unique(['workspaceId', 'intakeId', 'id', 'intakeVersion']);
  });
  await db.schema.createTable('intakeDecisions', t => {
    base(db, t); t.uuid('intakeId').notNullable(); positive(t, 'expectedVersion'); t.uuid('reviewId').notNullable();
    t.foreign(['workspaceId', 'intakeId', 'reviewId', 'expectedVersion']).references(['workspaceId', 'intakeId', 'id', 'intakeVersion']).inTable('intakeReviewSnapshots').deferrable('deferred');
    t.unique(['workspaceId', 'intakeId']); t.uuid('requestId').notNullable(); t.unique(['workspaceId', 'requestId']);
    t.text('kind').notNullable(); t.check(`kind IN ('create','separate','link','dismiss')`); jsonObject(t, 'actor'); jsonObject(t, 'decision');
    t.uuid('resultingLeadId'); t.check(`(kind = 'dismiss') = ("resultingLeadId" IS NULL)`);
  });
  await db.schema.createTable('captureOperations', t => {
    base(db, t); t.uuid('requestId').notNullable(); t.text('operation').notNullable();
    t.check(`operation IN ('draft.create','draft.save','source.launch','source.pause','source.resume','source.archive','source.restore','source.duplicate','source.reschedule','intake.decide')`);
    hash(t, 'inputHash'); jsonObject(t, 'actor'); jsonObject(t, 'target'); jsonObject(t, 'result'); t.unique(['workspaceId', 'operation', 'requestId']);
  });
  await db.schema.createTable('captureSourceEvents', t => {
    base(db, t); source(t); t.text('kind').notNullable();
    t.check(`kind IN ('draft.saved','source.launched','source.scheduled','source.paused','source.archived','source.restored','source.duplicated','source.blocked','receipt.accepted','intake.decided')`);
    jsonObject(t, 'actor'); jsonObject(t, 'data'); t.index(['workspaceId', 'sourceId', 'createdAt', 'id']);
  });
  await db.schema.alterTable('leads', t => t.unique(['workspaceId', 'id'], { indexName: 'leads_capture_tenant_identity' }));
  await db.schema.createTable('leadCaptureData', t => {
    base(db, t); source(t); configuration(t); t.uuid('receiptId').notNullable();
    t.foreign(['workspaceId', 'sourceId', 'receiptId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureReceipts').deferrable('deferred');
    t.unique(['workspaceId', 'receiptId']); t.uuid('leadId'); t.uuid('resultingLeadId').notNullable(); positive(t, 'definitionVersion'); jsonObject(t, 'answers');
    t.foreign(['workspaceId', 'sourceId', 'receiptId', 'configurationVersion', 'definitionVersion']).references(['workspaceId', 'sourceId', 'id', 'configurationVersion', 'definitionVersion']).inTable('captureReceipts').deferrable('deferred');
    t.check('"leadId" IS NULL OR "leadId" = "resultingLeadId"');
  });
  // PG15+ column-list SET NULL preserves the tenant key and receipt history when a CRM lead is deleted.
  await db.raw(`ALTER TABLE "leadCaptureData" ADD CONSTRAINT "leadCaptureData_lead_tenant_fk" FOREIGN KEY ("workspaceId","leadId") REFERENCES leads ("workspaceId",id) ON DELETE SET NULL ("leadId") DEFERRABLE INITIALLY DEFERRED`);
  await db.raw(`CREATE FUNCTION capture_check_decision() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM "intakeItems" WHERE id = NEW."intakeId" AND "workspaceId" = NEW."workspaceId" AND version = NEW."expectedVersion" AND status = 'awaiting' FOR UPDATE) THEN
      RAISE EXCEPTION 'Stale intake decision' USING ERRCODE = '23514'; END IF;
    IF NEW.kind <> 'dismiss' AND NOT EXISTS (SELECT 1 FROM leads WHERE id = NEW."resultingLeadId" AND "workspaceId" = NEW."workspaceId") THEN
      RAISE EXCEPTION 'Invalid tenant lead target' USING ERRCODE = '23503'; END IF;
    RETURN NEW;
  END $$`, [schema]);
  await db.raw('CREATE TRIGGER capture_decision_current BEFORE INSERT ON "intakeDecisions" FOR EACH ROW EXECUTE FUNCTION capture_check_decision()');
  await db.raw(`CREATE FUNCTION capture_preserve_snapshot() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'captureSourceSamples' THEN
      IF OLD."reviewedAt" IS NULL AND OLD."reviewedBy" IS NULL AND NEW."reviewedAt" IS NOT NULL AND NEW."reviewedBy" IS NOT NULL
        AND to_jsonb(OLD) - 'reviewedAt' - 'reviewedBy' = to_jsonb(NEW) - 'reviewedAt' - 'reviewedBy' THEN RETURN NEW; END IF;
    END IF;
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'leadCaptureData' THEN
      IF OLD."leadId" IS NOT NULL AND NEW."leadId" IS NULL
      AND to_jsonb(OLD) - 'leadId' = to_jsonb(NEW) - 'leadId'
      AND NOT EXISTS (SELECT 1 FROM leads WHERE id = OLD."leadId" AND "workspaceId" = OLD."workspaceId") THEN RETURN NEW; END IF;
    END IF;
    IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM workspaces WHERE id = OLD."workspaceId") THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Capture snapshots are immutable' USING ERRCODE = '23514';
  END $$`, [schema]);
  for (const table of ['captureSourceVersions', 'captureSourceSamples', 'captureReceipts', 'intakeReviewSnapshots', 'intakeDecisions', 'captureOperations', 'captureSourceEvents', 'leadCaptureData']) {
    await db.raw('CREATE TRIGGER capture_snapshot_immutable BEFORE UPDATE OR DELETE ON ?? FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()', [table]);
  }
  await applyRuntimeGrants(db);
}
export async function down() { throw new Error(`Lead Capture history is forward-only (${tables.length} tables).`); }
