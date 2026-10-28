import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert','void','revise','archive','restore')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
}

export async function down(db: Knex) {
  await db("estimate_operation_receipts").whereIn("operation", ["archive", "restore"]).delete();
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert','void','revise')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
}
