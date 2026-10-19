import type { Knex } from 'knex';
export async function up(db: Knex) {
  // Knex-generated check names vary; select only the existing capability constraint.
  const checks = await db.raw(`SELECT conname FROM pg_constraint WHERE conrelid = '"chatActionDrafts"'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%capability%'`);
  if (checks.rows.length !== 1) throw Error('Expected the create-only chat capability constraint');
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT ??', [checks.rows[0].conname]);
  await db.schema.alterTable('chatActionDrafts', t => {
    t.text('actionType').notNullable().defaultTo('lead.create'); t.jsonb('stagePayload');
  });
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_type_payload CHECK (
    ("actionType" = 'lead.create' AND capability = 'leads.create' AND "stagePayload" IS NULL) OR
    ("actionType" = 'lead.stage' AND capability = 'leads.stage.update' AND "stagePayload" IS NOT NULL))`);
  await db.schema.alterTable('chatActionAudit', t => { t.text('actionType').notNullable().defaultTo('lead.create'); });
}
export async function down(db: Knex) {
  if (await db('chatActionDrafts').whereNot('actionType', 'lead.create').first() || await db('chatActionAudit').whereNot('actionType', 'lead.create').first()) throw Error('Cannot discard stage proposals during rollback');
  await db.raw('ALTER TABLE "chatActionDrafts" DROP CONSTRAINT chat_action_type_payload');
  await db.schema.alterTable('chatActionDrafts', t => { t.dropColumn('actionType'); t.dropColumn('stagePayload'); });
  await db.raw(`ALTER TABLE "chatActionDrafts" ADD CONSTRAINT chat_action_create_capability CHECK (capability = 'leads.create')`);
  await db.schema.alterTable('chatActionAudit', t => { t.dropColumn('actionType'); });
}
