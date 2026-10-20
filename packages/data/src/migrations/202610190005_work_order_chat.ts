import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", t => { t.jsonb("workOrderResult").nullable(); });
  await db.schema.createTable("chatWorkOrderDrafts", t => {
    t.uuid("id").primary();
    t.uuid("turnId").notNullable().unique().references("id").inTable("chatTurns").onDelete("CASCADE");
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("threadId").notNullable().references("id").inTable("chatThreads").onDelete("CASCADE");
    t.string("inputHash", 64).notNullable();
    t.string("accessHash", 64).notNullable();
    t.text("state").notNullable().defaultTo("pending");
    t.jsonb("payload").notNullable();
    t.jsonb("review").notNullable();
    t.timestamp("expiresAt", { useTz: true }).notNullable();
    t.timestamp("resolvedAt", { useTz: true }).nullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(["workspaceId", "userId", "threadId", "state"]);
  });
  await db.schema.createTable("workOrderExportAudit", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.integer("rowCount").notNullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
  });
  await db.raw(`ALTER TABLE "chatWorkOrderDrafts" ADD CONSTRAINT work_order_draft_state CHECK (state IN ('pending','confirmed','canceled','superseded'))`);
}

export async function down(db: Knex) {
  if (await db("chatWorkOrderDrafts").first("id")) throw Error("Retained work order drafts require this migration.");
  await db.schema.dropTable("chatWorkOrderDrafts");
  await db.schema.dropTable("workOrderExportAudit");
  await db.schema.alterTable("chatTurns", t => { t.dropColumn("workOrderResult"); });
}
