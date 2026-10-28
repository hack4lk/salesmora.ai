import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("workspaceEstimateSettings", (table) => {
    table.integer("version").notNullable().defaultTo(1);
    table.boolean("requireServiceAddress").notNullable().defaultTo(true);
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("workspaceEstimateSettings", (table) => {
    table.dropColumns("requireServiceAddress", "version");
  });
}
