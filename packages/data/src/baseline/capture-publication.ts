import type { Knex } from 'knex';

export async function createCapturePublicationTables(db: Knex) {
  const { rows: [{ schema }] } = await db.raw<{ rows: { schema: string }[] }>('SELECT current_schema() AS schema');
  await db.schema.createTable('capturePublicationTransitions', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('sourceId').notNullable();
    t.integer('configurationVersion').notNullable(); t.integer('baseApprovedVersion'); t.integer('approvedSourceVersion').notNullable(); t.integer('approvedDraftVersion').notNullable(); t.text('actorId').notNullable();
    t.timestamp('scheduledAt', { useTz: true }).notNullable(); t.text('timezone').notNullable(); t.text('state').notNullable().defaultTo('pending'); t.jsonb('failures').notNullable().defaultTo('[]');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('completedAt', { useTz: true });
    t.check(`state IN ('pending','applied','blocked','cancelled') AND (state = 'pending') = ("completedAt" IS NULL)`);
    t.check(`"configurationVersion" > 0 AND "approvedSourceVersion" > 0 AND "approvedDraftVersion" > 0 AND ("baseApprovedVersion" IS NULL OR "baseApprovedVersion" > 0)`);
    t.check(`jsonb_typeof(failures) = 'array'`);
    t.foreign(['workspaceId','sourceId','configurationVersion']).references(['workspaceId','sourceId','configurationVersion']).inTable('captureSourceVersions');
    t.foreign(['workspaceId','sourceId','baseApprovedVersion']).references(['workspaceId','sourceId','configurationVersion']).inTable('captureSourceVersions');
    t.index(['state','scheduledAt']); t.unique(['workspaceId','id']);
  });
  await db.raw(`CREATE UNIQUE INDEX capture_publication_pending ON "capturePublicationTransitions" ("workspaceId","sourceId") WHERE state = 'pending'`);
  await db.raw(`CREATE FUNCTION capture_preserve_transition() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM workspaces WHERE id = OLD."workspaceId") THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' AND OLD.state = 'pending' AND NEW.state IN ('applied','blocked','cancelled') AND NEW."completedAt" IS NOT NULL
      AND to_jsonb(OLD) - 'state' - 'completedAt' - 'failures' = to_jsonb(NEW) - 'state' - 'completedAt' - 'failures' THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Publication transition history is immutable' USING ERRCODE = '23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER capture_transition_immutable BEFORE UPDATE OR DELETE ON "capturePublicationTransitions" FOR EACH ROW EXECUTE FUNCTION capture_preserve_transition()');
  await db.schema.createTable('captureAdminNotices', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('sourceId').notNullable(); t.integer('sourceVersion').notNullable();
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE'); t.text('reason').notNullable(); t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('readAt', { useTz: true });
    t.foreign(['workspaceId','sourceId']).references(['workspaceId','id']).inTable('captureSources').onDelete('CASCADE'); t.unique(['workspaceId','sourceId','sourceVersion','userId']);
    t.check(`reason IN ('entitlement','source_capacity','workspace','connection','publication')`); t.index(['workspaceId','userId','createdAt']);
  });
  await db.schema.createTable('captureAccessChecks', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.text('targetPlan').notNullable(); t.jsonb('sources').notNullable(); t.check("jsonb_typeof(sources) = 'array'"); t.timestamp('effectiveAt', { useTz: true }).notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('processedAt', { useTz: true }); t.check(`"targetPlan" IN ('free','standard','premium')`); t.index(['processedAt','effectiveAt']);
  });
  await db.schema.createTable('captureRequestBuckets', t => {
    t.text('key').primary(); t.integer('count').notNullable(); t.timestamp('expiresAt', { useTz: true }).notNullable(); t.index('expiresAt'); t.check('count > 0');
  });
  await db.schema.createTable('captureSubmissionAttempts', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('publicationId').notNullable(); t.uuid('requestId').notNullable();
    t.text('inputHash').notNullable(); t.uuid('contextId').notNullable(); t.text('clientHash').notNullable(); t.boolean('challengeRequired').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.primary(['publicationId', 'requestId']); t.foreign(['workspaceId', 'publicationId']).references(['workspaceId', 'id']).inTable('capturePublications').onDelete('CASCADE');
    t.index(['publicationId', 'clientHash', 'createdAt']); t.index('expiresAt');
  });
  await db.schema.createTable('captureChallengeChecks', t => {
    t.text('tokenHash').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('publicationId').notNullable(); t.uuid('requestId').notNullable(); t.uuid('contextId').notNullable();
    t.text('inputHash').notNullable(); t.uuid('verificationId').notNullable().unique(); t.timestamp('verifiedAt', { useTz: true }); t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.foreign(['workspaceId', 'publicationId']).references(['workspaceId', 'id']).inTable('capturePublications').onDelete('CASCADE'); t.index('expiresAt');
  });
  await db.schema.createTable('captureReceiptProcessing', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('receiptId').notNullable(); t.uuid('contextId').notNullable(); t.jsonb('assignment').notNullable(); t.jsonb('tags').notNullable();
    t.primary(['workspaceId', 'receiptId']); t.foreign(['workspaceId', 'receiptId']).references(['workspaceId', 'id']).inTable('captureReceipts').onDelete('CASCADE');
    t.check(`jsonb_typeof(assignment) = 'object' AND jsonb_typeof(tags) = 'array'`);
  });
  await db.raw('CREATE TRIGGER capture_processing_immutable BEFORE UPDATE OR DELETE ON "captureReceiptProcessing" FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()');
  await db.schema.createTable('captureInputUsage', t => {
    t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    t.bigInteger('retainedBytes').notNullable().defaultTo(0); t.check('"retainedBytes" >= 0');
  });
}
