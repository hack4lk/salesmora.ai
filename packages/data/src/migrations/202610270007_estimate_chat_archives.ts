import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("chatEstimateArchives", table => {
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
  await db.raw(`CREATE UNIQUE INDEX chat_estimate_archive_pending_thread ON "chatEstimateArchives"
    ("workspaceId", "userId", "threadId") WHERE state = 'pending'`);
  await db.schema.createTable("chatEstimateArchiveAudit", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    table.uuid("proposalId").notNullable();
    table.text("action").notNullable();
    table.string("inputHash", 64).notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
}
export async function down(db: Knex) {
  if (await db("chatEstimateArchives").first("id") || await db("chatEstimateArchiveAudit").first("id")) {
    throw new Error("Retained Estimate Archive/Restore proposals require this migration.");
  }
  await db.schema.dropTable("chatEstimateArchiveAudit");
  await db.schema.dropTable("chatEstimateArchives");
}
