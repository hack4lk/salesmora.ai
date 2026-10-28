import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", table => {
    table.jsonb("estimateResult").nullable();
    table.string("estimateStamp", 32).nullable();
  });
}

export async function down(db: Knex) {
  if (await db("chatTurns").whereNotNull("estimateResult").orWhereNotNull("estimateStamp").first("id")) {
    throw new Error("Retained Estimate results require this migration.");
  }
  await db.schema.alterTable("chatTurns", table => {
    table.dropColumn("estimateResult");
    table.dropColumn("estimateStamp");
  });
}
