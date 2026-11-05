import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  const { rows: [{ schema }] } = await db.raw('SELECT current_schema() AS schema');
  const { rows: checks } = await db.raw(`SELECT c.conname FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = ? AND t.relname = 'captureSourceEvents' AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%kind%'`, [schema]);
  for (const check of checks) await db.raw('ALTER TABLE "captureSourceEvents" DROP CONSTRAINT ??', [check.conname]);
  await db.raw(`ALTER TABLE "captureSourceEvents" ADD CONSTRAINT capture_source_event_kind CHECK (kind IN ('draft.saved','source.launched','source.scheduled','source.schedule_cancelled','source.schedule_blocked','source.paused','source.archived','source.restored','source.duplicated','source.blocked','receipt.accepted','intake.decided'))`);
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
  // Narrow staff enqueue permission: admin roles retain read-only capture source access.
  await db.schema.createTable('captureAccessChecks', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.text('targetPlan').notNullable(); t.jsonb('sources').notNullable(); t.check("jsonb_typeof(sources) = 'array'"); t.timestamp('effectiveAt', { useTz: true }).notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('processedAt', { useTz: true }); t.check(`"targetPlan" IN ('free','standard','premium')`); t.index(['processedAt','effectiveAt']);
  });
  await applyRuntimeGrants(db);
}
export async function down() { throw Error('Capture publication history is forward-only.'); }
