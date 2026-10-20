import type { Knex } from 'knex';
const original = `("actionType" = 'lead.create' AND capability = 'leads.create' AND "stagePayload" IS NULL) OR ("actionType" = 'lead.stage' AND capability = 'leads.stage.update' AND "stagePayload" IS NOT NULL)`;
export async function up(db: Knex) {
  await db.schema.alterTable('chatActionDrafts', t => { t.jsonb('updatePayload'); });
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (((${original}) AND "updatePayload" IS NULL) OR ("actionType" = 'lead.update' AND capability = 'leads.update' AND "stagePayload" IS NULL AND "updatePayload" IS NOT NULL))`);
}
export async function down(db: Knex) {
  if (await db('chatActionDrafts').where({ actionType: 'lead.update' }).first() || await db('chatActionAudit').where({ actionType: 'lead.update' }).first()) throw Error('Cannot discard retained update proposals or audit meaning');
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.schema.alterTable('chatActionDrafts', t => { t.dropColumn('updatePayload'); });
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (${original})`);
}
