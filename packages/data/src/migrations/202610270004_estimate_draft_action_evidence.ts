import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", table => {
    table.jsonb("estimateDraftActionEvidence").notNullable().defaultTo("[]");
  });
}
export async function down(db: Knex) {
  const retained = await db("chatTurns").whereRaw(`jsonb_array_length("estimateDraftActionEvidence") > 0`).first("id");
  if (retained) throw new Error("Retained Draft-action evidence requires this migration.");
  await db.schema.alterTable("chatTurns", table => table.dropColumn("estimateDraftActionEvidence"));
}
