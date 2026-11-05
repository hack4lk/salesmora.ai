import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.schema.alterTable('captureSourceSamples', t => { t.unique(['workspaceId', 'sourceId', 'id', 'draftId'], { indexName: 'capture_gmail_sample_owner' }); });
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
  const { rows: [{ schema }] } = await db.raw('SELECT current_schema() AS schema');
  await db.raw(`CREATE FUNCTION capture_gmail_preview_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP='DELETE' AND (OLD."expiresAt" <= clock_timestamp() OR NOT EXISTS (SELECT 1 FROM workspaces WHERE id=OLD."workspaceId")) THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Gmail preview proof is immutable' USING ERRCODE='23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER capture_gmail_preview_immutable BEFORE UPDATE OR DELETE ON "captureGmailSamplePreviews" FOR EACH ROW EXECUTE FUNCTION capture_gmail_preview_immutable()');
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  if (await db('captureGmailSamplePreviews').first('id') || await db('captureGmailSampleBindings').first('id')) throw Error('Retained Gmail sample proof requires this migration.');
  await db.schema.dropTable('captureGmailSampleBindings'); await db.schema.dropTable('captureGmailSamplePreviews'); await db.raw('DROP FUNCTION capture_gmail_preview_immutable()');
  await db.schema.alterTable('captureSourceSamples', t => { t.dropUnique(['workspaceId', 'sourceId', 'id', 'draftId'], 'capture_gmail_sample_owner'); });
}
