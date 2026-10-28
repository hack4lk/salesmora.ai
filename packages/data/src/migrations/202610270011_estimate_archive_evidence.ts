import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("chatTurns", table => {
    table.jsonb("estimateArchiveEvidence").notNullable().defaultTo("[]");
  });
}
export async function down(db: Knex) {
  const retained = await db("chatTurns")
    .whereRaw(`jsonb_array_length("estimateArchiveEvidence") > 0`)
    .first("id");
  if (retained) throw new Error("Retained Archive/Restore evidence requires this migration.");
  await db.schema.alterTable("chatTurns", table => table.dropColumn("estimateArchiveEvidence"));
}
