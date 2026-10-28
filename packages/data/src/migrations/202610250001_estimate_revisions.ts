import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("estimates", t => {
    t.uuid("sourceEstimateId").nullable();
    t.unique(["workspaceId", "estimateNumber", "id"], { indexName: "estimates_family_id_unique" });
    t.foreign(["workspaceId", "estimateNumber", "sourceEstimateId"], "estimates_revision_source_fk")
      .references(["workspaceId", "estimateNumber", "id"]).inTable("estimates");
    t.check('"sourceEstimateId" IS NULL OR ("sourceEstimateId" <> id AND revision > 1)', [], "estimates_revision_source_check");
  });
  await db.raw(`CREATE UNIQUE INDEX estimates_one_pending_revision ON estimates ("workspaceId", "estimateNumber")
    WHERE "sourceEstimateId" IS NOT NULL AND status = 'draft'`);
  await db.schema.createTable("workspaceEstimateRevisionCounters", t => {
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.integer("estimateNumber").notNullable();
    t.integer("lastRevision").notNullable();
    t.primary(["workspaceId", "estimateNumber"]);
    t.check('"estimateNumber" > 0 AND "lastRevision" > 0');
  });
  await db.raw(`INSERT INTO "workspaceEstimateRevisionCounters" ("workspaceId", "estimateNumber", "lastRevision")
    SELECT "workspaceId", "estimateNumber", max(revision) FROM estimates GROUP BY "workspaceId", "estimateNumber"`);
  await db.raw(`CREATE FUNCTION assign_estimate_revision() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."sourceEstimateId" IS NULL THEN
        INSERT INTO "workspaceEstimateRevisionCounters" ("workspaceId","estimateNumber","lastRevision")
        VALUES (NEW."workspaceId",NEW."estimateNumber",NEW.revision)
        ON CONFLICT ("workspaceId","estimateNumber") DO UPDATE
        SET "lastRevision" = greatest("workspaceEstimateRevisionCounters"."lastRevision", EXCLUDED."lastRevision");
      ELSE
        INSERT INTO "workspaceEstimateRevisionCounters" ("workspaceId","estimateNumber","lastRevision")
        VALUES (NEW."workspaceId",NEW."estimateNumber",1)
        ON CONFLICT ("workspaceId","estimateNumber") DO UPDATE
        SET "lastRevision" = "workspaceEstimateRevisionCounters"."lastRevision" + 1
        RETURNING "lastRevision" INTO NEW.revision;
      END IF;
      RETURN NEW;
    END
  $$`);
  await db.raw(`CREATE TRIGGER assign_estimate_revision BEFORE INSERT ON estimates
    FOR EACH ROW EXECUTE FUNCTION assign_estimate_revision()`);
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert','void','revise')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
}

export async function down(db: Knex) {
  await db("estimate_operation_receipts").where({ operation: "revise" }).delete();
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert','void')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
  await db.raw("DROP TRIGGER assign_estimate_revision ON estimates");
  await db.raw("DROP FUNCTION assign_estimate_revision()");
  await db.schema.dropTable("workspaceEstimateRevisionCounters");
  await db.raw("DROP INDEX estimates_one_pending_revision");
  await db.schema.alterTable("estimates", t => {
    t.dropForeign(["workspaceId", "estimateNumber", "sourceEstimateId"], "estimates_revision_source_fk");
    t.dropUnique(["workspaceId", "estimateNumber", "id"], "estimates_family_id_unique");
    t.dropChecks("estimates_revision_source_check");
    t.dropColumn("sourceEstimateId");
  });
}
