import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("estimate_deliveries", table => {
    table.text("failureCode").nullable();
    table.check(`"failureCode" IS NULL OR "failureCode" IN ('authorization','inactive','invalid','transport')`, [], "estimate_delivery_failure_code_check");
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("estimate_deliveries", table => table.dropColumn("failureCode"));
}
