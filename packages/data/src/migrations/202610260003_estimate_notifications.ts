import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("notificationPreferences", table => {
    table.boolean("estimateEmail").notNullable().defaultTo(true);
  });
  await db.schema.createTable("estimateNotifications", table => {
    table.uuid("id").primary();
    table.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    table.uuid("estimateId").notNullable();
    table.text("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.text("event").notNullable();
    table.text("dedupeKey").notNullable();
    table.timestamp("readAt", { useTz: true });
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.text("emailStatus").notNullable().defaultTo("queued");
    table.integer("attempts").notNullable().defaultTo(0);
    table.timestamp("nextAttemptAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp("sentAt", { useTz: true });
    table.unique(["workspaceId", "id"]);
    table.unique(["workspaceId", "dedupeKey", "userId"]);
    table.foreign(["workspaceId", "estimateId"])
      .references(["workspaceId", "id"]).inTable("estimates").onDelete("CASCADE");
    table.index(["workspaceId", "userId", "createdAt", "id"]);
    table.index(["emailStatus", "nextAttemptAt"]);
  });
  await db.raw(`ALTER TABLE "estimateNotifications"
    ADD CHECK (event IN ('sent','delivery_failed','viewed','decision_recorded','expiring_soon','expired')),
    ADD CHECK ("emailStatus" IN ('queued','sent','skipped','failed')),
    ADD CHECK (attempts BETWEEN 0 AND 5),
    ADD CHECK (char_length("dedupeKey") BETWEEN 1 AND 200)`);
}

export async function down(db: Knex) {
  await db.schema.dropTable("estimateNotifications");
  await db.schema.alterTable("notificationPreferences", table => {
    table.dropColumn("estimateEmail");
  });
}
