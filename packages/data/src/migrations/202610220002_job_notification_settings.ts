import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.createTable('jobNotificationSettings', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('section').notNullable(); t.jsonb('values').notNullable(); t.integer('version').notNullable();
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.primary(['workspaceId', 'section']);
    t.check(`"section" in ('deadline', 'reminders', 'events')`); t.check('"version" >= 1');
  });
  await db.schema.createTable('jobNotificationSettingsAudit', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.uuid('submissionId').notNullable(); t.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    t.text('section').notNullable(); t.text('requestHash').notNullable();
    t.integer('beforeVersion').notNullable(); t.integer('afterVersion').notNullable();
    t.jsonb('beforeValues').notNullable(); t.jsonb('afterValues').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.primary(['workspaceId', 'submissionId']); t.index(['workspaceId', 'createdAt']);
  });
}
export async function down(db: Knex) { await db.schema.dropTable('jobNotificationSettingsAudit'); await db.schema.dropTable('jobNotificationSettings'); }
