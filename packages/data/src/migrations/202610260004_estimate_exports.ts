import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("estimateExportAudit", (table) => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable();
    table.text("actorId").notNullable();
    table.text("scope").notNullable();
    table.jsonb("filters").notNullable();
    table.integer("count").notNullable();
    table.integer("rowsSent").notNullable().defaultTo(0);
    table.text("outcome").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("finishedAt", { useTz: true });
    table.index(["workspaceId", "createdAt"]);
    table.check(
      "scope IN ('workspace','assigned_job') AND outcome IN ('started','completed','failed','rejected') AND count >= 0 AND \"rowsSent\" >= 0",
    );
  });
  await db.raw(`CREATE FUNCTION estimate_export_audit_final() RETURNS trigger
    LANGUAGE plpgsql AS $$ BEGIN
      IF TG_OP = 'DELETE' OR OLD.outcome <> 'started' THEN
        RAISE EXCEPTION 'Final estimate export audit records are immutable';
      END IF;
      RETURN NEW;
    END $$`);
  await db.raw(
    'CREATE TRIGGER estimate_export_audit_final BEFORE UPDATE OR DELETE ON "estimateExportAudit" FOR EACH ROW EXECUTE FUNCTION estimate_export_audit_final()',
  );
}

export async function down(db: Knex) {
  await db.schema.dropTable("estimateExportAudit");
  await db.raw("DROP FUNCTION estimate_export_audit_final()");
}
