import type { Knex } from "knex";

export async function up(db: Knex.Transaction) {
  await db.schema.alterTable("workOrderMaterials", t => { t.text("imageUrl").notNullable().defaultTo(""); });
}

export async function down(db: Knex.Transaction) {
  await db.schema.alterTable("workOrderMaterials", t => { t.dropColumn("imageUrl"); });
}
