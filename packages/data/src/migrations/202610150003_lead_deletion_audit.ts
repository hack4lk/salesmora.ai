import type { Knex } from 'knex';

export async function up(db: Knex) {
  // Deliberately independent of lead/account FKs: non-content evidence survives deletion.
  await db.schema.createTable('leadDeletionAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('leadId').notNullable();
    table.integer('leadNumber').notNullable();
    table.text('actorId').notNullable();
    table.text('requestHash').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'leadId']);
  });
  await db.raw(`CREATE FUNCTION lead_deletion_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Lead deletion audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER lead_deletion_audit_immutable BEFORE UPDATE OR DELETE ON "leadDeletionAudit" FOR EACH ROW EXECUTE FUNCTION lead_deletion_audit_immutable()');
}

export async function down(db: Knex) {
  await db.schema.dropTable('leadDeletionAudit');
  await db.raw('DROP FUNCTION lead_deletion_audit_immutable()');
}
