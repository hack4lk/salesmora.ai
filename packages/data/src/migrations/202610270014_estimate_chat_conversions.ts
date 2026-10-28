import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("chatEstimateConversions", table => {
    table.uuid("id").primary();
    table.uuid("turnId").notNullable().references("id").inTable("chatTurns").onDelete("CASCADE");
    table.uuid("threadId").notNullable().references("id").inTable("chatThreads").onDelete("CASCADE");
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.text("state").notNullable().defaultTo("pending");
    table.jsonb("payload").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("resolvedAt", { useTz: true });
    table.index(["workspaceId", "userId", "turnId"]);
    table.check("state IN ('pending','confirmed','cancelled','superseded')");
  });
  await db.raw(`CREATE UNIQUE INDEX chat_estimate_conversion_pending_thread ON "chatEstimateConversions"
    ("workspaceId", "userId", "threadId") WHERE state = 'pending'`);
  await db.schema.createTable("chatEstimateConversionAudit", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    table.uuid("proposalId").notNullable();
    table.text("action").notNullable();
    table.string("inputHash", 64).notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.schema.alterTable("chatTurns", table => {
    table.jsonb("estimateConversionEvidence").notNullable().defaultTo("[]");
  });
}

export async function down(db: Knex) {
  const retained = await db("chatEstimateConversions").first("id") ||
    await db("chatEstimateConversionAudit").first("id") ||
    await db("chatTurns").whereRaw(`jsonb_array_length("estimateConversionEvidence") > 0`).first("id");
  if (retained) throw new Error("Retained Estimate conversion proposals require this migration.");
  await db.schema.alterTable("chatTurns", table => table.dropColumn("estimateConversionEvidence"));
  await db.schema.dropTable("chatEstimateConversionAudit");
  await db.schema.dropTable("chatEstimateConversions");
}
