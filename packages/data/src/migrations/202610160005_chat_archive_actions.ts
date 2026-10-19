import type { Knex } from 'knex';
const previous = `((((((("actionType" = 'lead.create' AND capability = 'leads.create' AND "stagePayload" IS NULL) OR ("actionType" = 'lead.stage' AND capability = 'leads.stage.update' AND "stagePayload" IS NOT NULL)) AND "updatePayload" IS NULL) OR ("actionType" = 'lead.update' AND capability = 'leads.update' AND "stagePayload" IS NULL AND "updatePayload" IS NOT NULL)) AND "assignmentPayload" IS NULL) OR ("actionType" = 'lead.assign' AND capability = 'leads.assign' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NOT NULL)) AND "notePayload" IS NULL) OR ("actionType" = 'lead.note' AND capability = 'leads.read' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NOT NULL)`;
export async function up(db: Knex) {
  await db.schema.alterTable('chatActionDrafts', t => { t.jsonb('archivePayload'); });
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (((${previous}) AND "archivePayload" IS NULL) OR ("actionType" = 'lead.archive' AND capability = 'leads.archive' AND "stagePayload" IS NULL AND "updatePayload" IS NULL AND "assignmentPayload" IS NULL AND "notePayload" IS NULL AND "archivePayload" IS NOT NULL))`);
}
export async function down(db: Knex) {
  if (await db('chatActionDrafts').where({ actionType: 'lead.archive' }).first() || await db('chatActionAudit').where({ actionType: 'lead.archive' }).first()) throw Error('Cannot discard retained archive proposals or audit meaning');
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.schema.alterTable('chatActionDrafts', t => { t.dropColumn('archivePayload'); });
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (${previous})`);
}
