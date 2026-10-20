import type { Knex } from "knex";

/** The signature image lives privately on the completion row (no storage service yet); it is only ever read through the authorized detail read. */
export async function up(db: Knex) {
  await db.schema.alterTable("workOrderCompletions", t => { t.dropColumn("signatureRef"); t.text("signatureImage").nullable(); });
  await db.raw(`ALTER TABLE "workOrderCompletions" ADD CONSTRAINT "workOrderCompletionsSignatureImageCheck" CHECK ("signatureImage" IS NULL OR ("signerName" IS NOT NULL AND "signatureImage" LIKE 'data:image/png;base64,%' AND length("signatureImage") <= 60000))`);
}
export async function down(db: Knex) {
  await db.raw(`ALTER TABLE "workOrderCompletions" DROP CONSTRAINT "workOrderCompletionsSignatureImageCheck"`);
  await db.schema.alterTable("workOrderCompletions", t => { t.dropColumn("signatureImage"); t.text("signatureRef").nullable(); });
}
