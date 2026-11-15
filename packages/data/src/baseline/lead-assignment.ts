import type { Knex } from 'knex';

export async function createLeadAssignmentTables(db: Knex) {
  const { rows: [{ schema }] } = await db.raw<{ rows: { schema: string }[] }>('SELECT current_schema() AS schema');
  await db.schema.createTable('leadAssignmentSettings', table => {
    table.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE');
    table.integer('version').notNullable().defaultTo(1);
    table.jsonb('value').notNullable().defaultTo('{"kind":"unassigned"}');
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('version > 0');
    table.check(`value = '{"kind":"unassigned"}'::jsonb OR (value->>'kind' = 'teammate' AND jsonb_typeof(value->'teammateId') = 'string' AND length(value->>'teammateId') BETWEEN 1 AND 200 AND value = jsonb_build_object('kind','teammate','teammateId',value->>'teammateId')) IS TRUE`);
  });
  await db.schema.createTable('leadAssignmentSettingsAudit', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('requestId').notNullable();
    table.text('actorId').notNullable();
    table.text('inputHash').notNullable();
    table.integer('beforeVersion').notNullable();
    table.integer('afterVersion').notNullable();
    table.jsonb('beforeValue').notNullable();
    table.jsonb('afterValue').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.primary(['workspaceId', 'requestId']);
    table.unique(['workspaceId', 'afterVersion']);
    table.check('"beforeVersion" > 0 AND "afterVersion" = "beforeVersion" + 1');
  });
  await db.raw(`CREATE FUNCTION initialize_lead_assignment() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    INSERT INTO "leadAssignmentSettings" ("workspaceId") VALUES (NEW.id) ON CONFLICT ("workspaceId") DO NOTHING; RETURN NEW; END $$`, [schema]);
  await db.raw('CREATE TRIGGER workspace_lead_assignment AFTER INSERT ON workspaces FOR EACH ROW EXECUTE FUNCTION initialize_lead_assignment()');
  await db.raw(`CREATE FUNCTION preserve_lead_assignment_audit() RETURNS trigger LANGUAGE plpgsql SET search_path = ??, pg_temp AS $$ BEGIN
    IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM workspaces WHERE id = OLD."workspaceId") THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'Lead assignment history is immutable' USING ERRCODE = '23514'; END $$`, [schema]);
  await db.raw('CREATE TRIGGER lead_assignment_audit_immutable BEFORE UPDATE OR DELETE ON "leadAssignmentSettingsAudit" FOR EACH ROW EXECUTE FUNCTION preserve_lead_assignment_audit()');
}
