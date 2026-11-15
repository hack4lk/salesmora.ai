import type { Knex } from 'knex';

export async function createFileTables(db: Knex) {
  await db.schema.createTable('files', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.string('entityType').notNullable();
    table.uuid('entityId').notNullable();
    table.text('uploadedByUserId').notNullable();
    table.string('name').notNullable();
    table.string('mimeType').notNullable();
    table.bigint('sizeBytes').notNullable();
    table.enum('status', ['uploading', 'ready', 'failed']).notNullable().defaultTo('uploading');
    table.text('failureReason');
    table.string('storageKey').notNullable();
    table.string('encryptedDekB64').notNullable();
    table.string('categoryTag');
    table.text('caption');
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    table.timestamp('deletedAt');
    table.string('thumbnailStorageKey');
    table.string('thumbnailEncryptedDekB64');
    table.bigint('thumbnailSizeBytes');
    table.string('heicOriginalStorageKey');
    table.string('heicOriginalEncryptedDekB64');
    table.index(['workspaceId']);
    table.index(['entityType', 'entityId']);
    table.index(['status']);
    table.index(['uploadedByUserId']);
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
    table.foreign('uploadedByUserId').references('id').inTable('users').onDelete('set null');
  });
  await db.schema.createTable('fileEvents', table => {
    table.uuid('id').primary();
    table.uuid('fileId').notNullable();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.enum('eventType', ['created', 'ready', 'failed', 'downloaded', 'removed']).notNullable();
    table.jsonb('metadata');
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
    table.index(['fileId']);
    table.index(['workspaceId']);
    table.index(['actorId']);
    table.index(['eventType']);
    table.foreign('fileId').references('id').inTable('files').onDelete('cascade');
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
    table.foreign('actorId').references('id').inTable('users').onDelete('set null');
  });
  await db.schema.createTable('workspaceStorageUsage', table => {
    table.uuid('workspaceId').primary();
    table.bigint('usedBytes').notNullable().defaultTo(0);
    table.bigint('quotaBytes').notNullable();
    for (const field of ['lastReconciled', 'createdAt', 'updatedAt']) table.timestamp(field).notNullable().defaultTo(db.fn.now());
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
  });
  await db.schema.createTable('jobMessages', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('jobId').notNullable();
    table.text('authorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('authorName').notNullable();
    table.text('text').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.foreign(['workspaceId', 'jobId']).references(['workspaceId', 'id']).inTable('jobs').onDelete('CASCADE');
    table.index(['workspaceId', 'jobId', 'createdAt', 'id']);
    table.check('length(text) <= 4000 AND length(text) > 0');
  });
}
