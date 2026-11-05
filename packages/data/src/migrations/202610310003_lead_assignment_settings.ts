import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  const { rows: [{ schema }] } = await db.raw('SELECT current_schema() AS schema');
  await db.schema.createTable('leadAssignmentSettings', t => {
    t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    t.integer('version').notNullable().defaultTo(1); t.jsonb('value').notNullable().defaultTo('{"kind":"unassigned"}');
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check('version > 0');
    t.check(`value = '{"kind":"unassigned"}'::jsonb OR (value->>'kind' = 'teammate' AND jsonb_typeof(value->'teammateId') = 'string' AND length(value->>'teammateId') BETWEEN 1 AND 200 AND value = jsonb_build_object('kind','teammate','teammateId',value->>'teammateId')) IS TRUE`);
  });
  await db.schema.createTable('leadAssignmentSettingsAudit', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('requestId').notNullable();
    t.text('actorId').notNullable(); t.text('inputHash').notNullable(); t.integer('beforeVersion').notNullable(); t.integer('afterVersion').notNullable();
    t.jsonb('beforeValue').notNullable(); t.jsonb('afterValue').notNullable(); t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.primary(['workspaceId', 'requestId']); t.unique(['workspaceId', 'afterVersion']); t.check('"beforeVersion" > 0 AND "afterVersion" = "beforeVersion" + 1');
  });
  await db.raw(`INSERT INTO "leadAssignmentSettings" ("workspaceId") SELECT id FROM workspaces ON CONFLICT ("workspaceId") DO NOTHING`);
  // The trigger initializes every creation path inside the workspace's transaction, including setup.
  await db.raw(`CREATE FUNCTION initialize_lead_assignment() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    INSERT INTO "leadAssignmentSettings" ("workspaceId") VALUES (NEW.id) ON CONFLICT ("workspaceId") DO NOTHING; RETURN NEW; END $$`, [schema]);
  await db.raw('CREATE TRIGGER workspace_lead_assignment AFTER INSERT ON workspaces FOR EACH ROW EXECUTE FUNCTION initialize_lead_assignment()');
  await db.raw(`CREATE FUNCTION preserve_lead_assignment_audit() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM workspaces WHERE id = OLD."workspaceId") THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Lead assignment history is immutable' USING ERRCODE = '23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER lead_assignment_audit_immutable BEFORE UPDATE OR DELETE ON "leadAssignmentSettingsAudit" FOR EACH ROW EXECUTE FUNCTION preserve_lead_assignment_audit()');
  await applyRuntimeGrants(db);
}
export async function down() { throw Error('Lead assignment settings retain audited business decisions; use a forward migration.'); }
