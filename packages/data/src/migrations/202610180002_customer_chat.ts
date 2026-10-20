import type { Knex } from "knex";
export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", (t) => {
    t.string("customerStamp", 64).nullable();
    t.jsonb("customerResult").nullable();
  });
  await db.schema.createTable("chatCustomerDrafts", (t) => {
    t.uuid("id").primary();
    t.uuid("turnId")
      .notNullable()
      .unique()
      .references("id")
      .inTable("chatTurns")
      .onDelete("CASCADE");
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.text("userId")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    t.uuid("threadId")
      .notNullable()
      .references("id")
      .inTable("chatThreads")
      .onDelete("CASCADE");
    t.string("inputHash", 64).notNullable();
    t.string("accessHash", 64).notNullable();
    t.string("customerStamp", 64).notNullable();
    t.text("state").notNullable().defaultTo("pending");
    t.jsonb("payload").notNullable();
    t.jsonb("review").notNullable();
    t.timestamp("expiresAt", { useTz: true }).notNullable();
    t.timestamp("resolvedAt", { useTz: true }).nullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.index(["workspaceId", "userId", "threadId", "state"]);
  });
  await db.raw(
    `ALTER TABLE "chatCustomerDrafts" ADD CONSTRAINT customer_draft_state CHECK (state IN ('pending','confirmed','canceled','superseded'))`,
  );
}
export async function down(db: Knex) {
  if (
    (await db("chatCustomerDrafts").first("id")) ||
    (await db("chatTurns").whereNotNull("customerStamp").first("id"))
  )
    throw Error("Retained customer drafts require this migration.");
  await db.schema.dropTable("chatCustomerDrafts");
  await db.schema.alterTable("chatTurns", (t) => {
    t.dropColumn("customerStamp");
    t.dropColumn("customerResult");
  });
}
