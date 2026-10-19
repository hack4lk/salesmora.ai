import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('chatActionDrafts', t => {
    t.uuid('id').primary(); t.uuid('turnId').notNullable().unique().references('id').inTable('chatTurns').onDelete('CASCADE');
    t.uuid('threadId').notNullable(); t.uuid('workspaceId').notNullable(); t.text('userId').notNullable();
    t.foreign(['threadId', 'workspaceId', 'userId']).references(['id', 'workspaceId', 'userId']).inTable('chatThreads').onDelete('CASCADE');
    t.text('capability').notNullable().defaultTo('leads.create');
    t.jsonb('lead').notNullable(); t.text('inputHash').notNullable(); t.text('accessHash').notNullable();
    t.jsonb('ownerSnapshot'); t.text('state').notNullable().defaultTo('pending');
    t.uuid('leadId'); t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('resolvedAt', { useTz: true });
    t.check("state IN ('pending','confirmed','cancelled','superseded')");
    t.check("capability = 'leads.create'"); t.index(['threadId', 'state']);
  });
  await db.schema.createTable('chatActionAudit', t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable(); t.text('actorId').notNullable();
    t.uuid('draftId').notNullable(); t.text('action').notNullable(); t.text('inputHash').notNullable(); t.uuid('leadId');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check("action IN ('draft.proposed','draft.confirmed','draft.cancelled','draft.superseded')");
    t.index(['workspaceId', 'draftId']);
  });
  await db.raw(`CREATE FUNCTION chat_action_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Chat action audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER chat_action_audit_immutable BEFORE UPDATE OR DELETE ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION chat_action_audit_immutable()');
}
export async function down(db: Knex) {
  await db.schema.dropTable('chatActionDrafts'); await db.schema.dropTable('chatActionAudit');
  await db.raw('DROP FUNCTION chat_action_audit_immutable()');
}
