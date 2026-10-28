import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("estimate_snapshots", table => {
    table.integer("estimateVersion").notNullable().defaultTo(1);
  });
  await db.schema.alterTable("estimate_share_tokens", table => {
    // Recovery for authorized copy/resend uses the existing envelope encryption, never plaintext.
    table.text("encryptedToken").nullable();
  });
  await db.schema.alterTable("estimate_deliveries", table => {
    table.text("subject").notNullable().defaultTo("");
    table.text("requestedBy").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("nextAttemptAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(["status", "nextAttemptAt"]);
  });
  await db.raw('ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check');
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
  await db.raw(`CREATE FUNCTION protect_estimate_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Estimate snapshots are immutable'; END
  $$`);
  await db.raw(`CREATE TRIGGER protect_estimate_snapshot BEFORE UPDATE ON estimate_snapshots
    FOR EACH ROW EXECUTE FUNCTION protect_estimate_snapshot()`);
}

export async function down(db: Knex) {
  await db.raw("DROP TRIGGER protect_estimate_snapshot ON estimate_snapshots");
  await db.raw("DROP FUNCTION protect_estimate_snapshot()");
  await db("estimate_operation_receipts").whereIn("operation", ["publish", "resend"]).delete();
  await db.raw('ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check');
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','decision','convert')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
  await db.schema.alterTable("estimate_deliveries", table => {
    table.dropIndex(["status", "nextAttemptAt"]);
    table.dropColumns("subject", "requestedBy", "nextAttemptAt");
  });
  await db.schema.alterTable("estimate_share_tokens", table => table.dropColumn("encryptedToken"));
  await db.schema.alterTable("estimate_snapshots", table => table.dropColumn("estimateVersion"));
}
