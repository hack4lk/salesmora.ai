import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("estimates", table => {
    table.text("paymentLink").notNullable().defaultTo("");
    table.check('length("paymentLink") <= 2048', [], "estimate_payment_link_length_check");
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("estimates", table => table.dropColumn("paymentLink"));
}
