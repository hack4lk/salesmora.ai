import type { Knex } from 'knex';

export async function createCaptureGmailSupportTables(db: Knex) {
  await db.schema.createTable('captureGmailDisconnectReviews', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('accountId').notNullable(); table.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    table.text('actorId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('payload').notNullable(); table.text('state').notNullable().defaultTo('pending'); table.uuid('requestId'); table.text('inputHash'); table.jsonb('receipt');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.check("state IN ('pending','confirmed')"); table.check('jsonb_typeof(payload) = \'object\'');
    table.check('(state = \'confirmed\') = ("receipt" IS NOT NULL AND "requestId" IS NOT NULL AND "inputHash" IS NOT NULL)');
    table.check('"expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + interval \'10 minutes\'');
    table.unique(['workspaceId', 'requestId']);
  });
  await db.schema.createTable('captureGmailConnectionEvents', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('accountId').notNullable(); table.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL'); table.uuid('sourceId');
    table.foreign(['workspaceId', 'sourceId']).references(['workspaceId', 'id']).inTable('captureSources').deferrable('deferred');
    table.text('kind').notNullable(); table.integer('accountVersion').notNullable(); table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check("kind IN ('connected','reconnected','selected','disconnected','authorization-lost')"); table.check('"accountVersion" > 0');
  });
  await db.schema.createTable('captureGmailSamplePreviews', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('sourceId').notNullable(); t.uuid('draftId').notNullable(); t.integer('draftVersion').notNullable(); t.integer('sourceVersion').notNullable();
    t.uuid('accountId').notNullable(); t.integer('credentialGeneration').notNullable(); t.text('actorId').notNullable();
    t.string('configurationHash', 64).notNullable(); t.string('contentHash', 64).notNullable();
    t.text('messageId').notNullable(); t.text('sender').notNullable(); t.timestamp('receivedAt', { useTz: true }).notNullable();
    t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.foreign(['workspaceId', 'sourceId', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').onDelete('CASCADE');
    t.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    t.check('"draftVersion" > 0 AND "sourceVersion" > 0 AND "credentialGeneration" > 0 AND "configurationHash" ~ \'^[a-f0-9]{64}$\' AND "contentHash" ~ \'^[a-f0-9]{64}$\'');
    t.index(['workspaceId', 'expiresAt']);
  });
  await db.schema.createTable('captureGmailSampleBindings', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('sourceId').notNullable(); t.uuid('draftId').notNullable(); t.uuid('sampleId').notNullable();
    t.integer('draftVersion').notNullable(); t.string('bindingHash', 64).notNullable(); t.jsonb('provenance').notNullable();
    t.foreign(['workspaceId', 'sourceId', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').onDelete('CASCADE');
    t.foreign(['workspaceId', 'sourceId', 'sampleId', 'draftId']).references(['workspaceId', 'sourceId', 'id', 'draftId']).inTable('captureSourceSamples').deferrable('deferred');
    t.unique(['workspaceId', 'sourceId', 'sampleId', 'draftVersion']);
    t.check('"draftVersion" > 0 AND jsonb_typeof(provenance)=\'object\'');
  });
  await db.raw('CREATE TRIGGER capture_gmail_sample_binding_immutable BEFORE UPDATE OR DELETE ON "captureGmailSampleBindings" FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()');
  const { rows: [{ schema }] } = await db.raw<{ rows: { schema: string }[] }>('SELECT current_schema() AS schema');
  await db.raw(`CREATE FUNCTION capture_gmail_preview_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP='DELETE' AND (OLD."expiresAt" <= clock_timestamp() OR NOT EXISTS (SELECT 1 FROM workspaces WHERE id=OLD."workspaceId")) THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Gmail preview proof is immutable' USING ERRCODE='23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER capture_gmail_preview_immutable BEFORE UPDATE OR DELETE ON "captureGmailSamplePreviews" FOR EACH ROW EXECUTE FUNCTION capture_gmail_preview_immutable()');
  await db.schema.createTable('captureGmailWorkerReadiness', table => {
    table.uuid('workspaceId').notNullable();
    table.uuid('sourceId').notNullable();
    table.timestamp('checkedAt', { useTz: true }).notNullable();
    table.primary(['workspaceId', 'sourceId']);
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('CASCADE');
  });
  await db.schema.createTable('captureSetupSamples', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('sourceId').notNullable(); table.uuid('draftId').notNullable(); table.text('actorId').notNullable();
    table.string('configurationHash', 64).notNullable(); table.jsonb('sample').notNullable(); table.jsonb('findings').notNullable();
    table.timestamp('reviewedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(['workspaceId', 'sourceId', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').onDelete('CASCADE');
  });
  await db.raw('CREATE TRIGGER capture_setup_sample_immutable BEFORE UPDATE OR DELETE ON "captureSetupSamples" FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()');
}
