import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("estimate_decisions", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.uuid("snapshotId").notNullable();
    t.uuid("previousDecisionId").nullable();
    t.integer("estimateVersion").notNullable();
    t.text("outcome").notNullable();
    t.date("decisionDate").notNullable();
    t.text("channel").notNullable();
    t.text("note").notNullable();
    t.text("reason").nullable();
    t.bigint("snapshotTotalCents").notNullable();
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.unique(["workspaceId", "estimateId", "id"]);
    t.unique(["workspaceId", "estimateId", "estimateVersion"]);
    t.foreign(["workspaceId", "estimateId", "snapshotId"])
      .references(["workspaceId", "estimateId", "id"]).inTable("estimate_snapshots").onDelete("CASCADE");
    t.foreign(["workspaceId", "estimateId", "previousDecisionId"])
      .references(["workspaceId", "estimateId", "id"]).inTable("estimate_decisions");
    t.check(`outcome IN ('accepted','declined') AND channel IN ('email','phone','in-person','other')
      AND "estimateVersion" > 0 AND "snapshotTotalCents" >= 0 AND char_length(note) <= 500
      AND (("previousDecisionId" IS NULL AND reason IS NULL)
        OR ("previousDecisionId" IS NOT NULL AND reason IS NOT NULL AND char_length(trim(reason)) BETWEEN 1 AND 500))`);
  });
  await db.schema.alterTable("estimates", t => {
    t.bigint("acceptedTotalCents").nullable();
    t.check('"acceptedTotalCents" IS NULL OR "acceptedTotalCents" >= 0', [], "estimates_accepted_total_check");
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("estimates", t => {
    t.dropChecks("estimates_accepted_total_check");
    t.dropColumn("acceptedTotalCents");
  });
  await db.schema.dropTable("estimate_decisions");
}
