import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", table => {
    table.jsonb("estimateDraftDeleteEvidence").notNullable().defaultTo("[]");
  });
}

export async function down(db: Knex) {
  const retained = await db("chatTurns")
    .whereRaw(`jsonb_array_length("estimateDraftDeleteEvidence") > 0`)
    .first("id");
  if (retained) throw new Error("Retained Draft-deletion evidence requires this migration.");
  await db.schema.alterTable("chatTurns", table => table.dropColumn("estimateDraftDeleteEvidence"));
}
