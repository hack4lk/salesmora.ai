import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert','void')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
}

export async function down(db: Knex) {
  await db("estimate_operation_receipts").where({ operation: "void" }).delete();
  await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT estimate_operation_receipts_check");
  await db.raw(`ALTER TABLE estimate_operation_receipts ADD CONSTRAINT estimate_operation_receipts_check
    CHECK (operation IN ('create','send','publish','resend','decision','convert')
      AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0)`);
}
