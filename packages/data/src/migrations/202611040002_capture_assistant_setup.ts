import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.schema.createTable('chatCaptureSetupProposals', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('threadId').notNullable().references('id').inTable('chatThreads').onDelete('CASCADE');
    table.uuid('turnId').notNullable().references('id').inTable('chatTurns').onDelete('CASCADE');
    table.uuid('requestId').notNullable(); table.text('state').notNullable().defaultTo('pending'); table.jsonb('payload').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); table.timestamp('resolvedAt', { useTz: true });
    table.unique(['workspaceId', 'userId', 'requestId']); table.index(['workspaceId', 'userId', 'turnId']);
    table.check("state IN ('pending','confirmed','cancelled','superseded')");
  });
  await db.raw(`CREATE UNIQUE INDEX chat_capture_setup_pending ON "chatCaptureSetupProposals" ("workspaceId","userId","threadId") WHERE state='pending'`);
  await db.schema.createTable('chatCaptureSetupAudit', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL'); table.uuid('proposalId').notNullable();
    table.text('operation').notNullable(); table.text('action').notNullable(); table.string('inputHash', 64).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.createTable('captureSetupSamples', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('sourceId').notNullable(); table.uuid('draftId').notNullable(); table.text('actorId').notNullable();
    table.string('configurationHash', 64).notNullable(); table.jsonb('sample').notNullable(); table.jsonb('findings').notNullable();
    table.timestamp('reviewedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(['workspaceId', 'sourceId', 'draftId']).references(['workspaceId', 'sourceId', 'id']).inTable('captureSourceDrafts').onDelete('CASCADE');
  });
  await db.schema.alterTable('chatTurns', table => { table.jsonb('captureSetupEvidence').notNullable().defaultTo('[]'); });
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_capture_setup_evidence CHECK (jsonb_typeof("captureSetupEvidence")='array' AND jsonb_array_length("captureSetupEvidence")<=7)`);
  const { rows: [{ schema }] } = await db.raw('SELECT current_schema() AS schema');
  await db.raw(`CREATE FUNCTION capture_setup_audit_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM workspaces WHERE id=OLD."workspaceId") THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' AND OLD."actorId" IS NOT NULL AND NEW."actorId" IS NULL AND to_jsonb(OLD)-'actorId'=to_jsonb(NEW)-'actorId' AND NOT EXISTS (SELECT 1 FROM users WHERE id=OLD."actorId") THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Setup audit is immutable' USING ERRCODE='23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER capture_setup_audit_immutable BEFORE UPDATE OR DELETE ON "chatCaptureSetupAudit" FOR EACH ROW EXECUTE FUNCTION capture_setup_audit_immutable()');
  await db.raw('CREATE TRIGGER capture_setup_sample_immutable BEFORE UPDATE OR DELETE ON "captureSetupSamples" FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()');
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  if (await db('chatCaptureSetupProposals').first('id') || await db('chatCaptureSetupAudit').first('id') || await db('captureSetupSamples').first('id')) throw Error('Retained setup proposals and sample approvals require this migration.');
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_capture_setup_evidence');
  await db.schema.alterTable('chatTurns', table => { table.dropColumn('captureSetupEvidence'); });
  await db.schema.dropTable('captureSetupSamples'); await db.schema.dropTable('chatCaptureSetupAudit'); await db.schema.dropTable('chatCaptureSetupProposals');
  await db.raw('DROP FUNCTION capture_setup_audit_immutable()');
}
