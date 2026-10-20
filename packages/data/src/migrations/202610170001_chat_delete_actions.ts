import type { Knex } from 'knex';
const beforeArchive = `((((((("actionType" = 'lead.create' AND capability = 'leads.create' AND "stagePayload" IS NULL) OR ("actionType" = 'lead.stage' AND capability = 'leads.stage.update' AND "stagePayload" IS NOT NULL)) AND "updatePayload" IS NULL) OR ("actionType" = 'lead.update' AND capability = 'leads.update' AND "stagePayload" IS NULL AND "updatePayload" IS NOT NULL)) AND "assignmentPayload" IS NULL) OR ("actionType" = 'lead.assign' AND capability = 'leads.assign' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NOT NULL)) AND "notePayload" IS NULL) OR ("actionType" = 'lead.note' AND capability = 'leads.read' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NOT NULL)`;
const beforeExport = `(((${beforeArchive}) AND "archivePayload" IS NULL) OR ("actionType" = 'lead.archive' AND capability = 'leads.archive' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NULL AND "archivePayload" IS NOT NULL))`;
const previous = `(((${beforeExport}) AND "exportPayload" IS NULL) OR ("actionType" = 'lead.export' AND capability = 'leads.export' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NULL AND "archivePayload" IS NULL AND "exportPayload" IS NOT NULL))`;
export async function up(db: Knex) {
  await db.schema.alterTable('chatActionDrafts', t => { t.jsonb('deletePayload'); });
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (((${previous}) AND "deletePayload" IS NULL) OR ("actionType" = 'lead.delete' AND capability = 'leads.delete' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NULL AND "archivePayload" IS NULL AND "exportPayload" IS NULL AND "deletePayload" IS NOT NULL))`);
}
export async function down(db: Knex) {
  if (await db('chatActionDrafts').where({ actionType: 'lead.delete' }).first() || await db('chatActionAudit').where({ actionType: 'lead.delete' }).first()) throw Error('Cannot discard retained deletion proposals or audit meaning');
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.schema.alterTable('chatActionDrafts', t => { t.dropColumn('deletePayload'); });
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (${previous})`);
}
