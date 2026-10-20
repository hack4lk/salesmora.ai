import type { Knex } from 'knex';

export async function up(db: Knex) {
  // Main files table
  await db.schema.createTable('files', (table) => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.string('entityType').notNullable(); // 'work-order', 'job', 'progress-note', etc.
    table.uuid('entityId').notNullable();
    table.text('uploadedByUserId').notNullable();
    table.string('name').notNullable();
    table.string('mimeType').notNullable();
    table.bigint('sizeBytes').notNullable();
    table.enum('status', ['uploading', 'ready', 'failed']).notNullable().defaultTo('uploading');
    table.text('failureReason').nullable();
    table.string('storageKey').notNullable(); // S3 object key
    table.string('encryptedDekB64').notNullable(); // Base64-encoded encrypted DEK
    table.string('categoryTag').nullable(); // 'before', 'after', 'other', etc.
    table.text('caption').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    table.timestamp('deletedAt').nullable();

    table.index(['workspaceId']);
    table.index(['entityType', 'entityId']);
    table.index(['status']);
    table.index(['uploadedByUserId']);
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
    table.foreign('uploadedByUserId').references('id').inTable('users').onDelete('set null');
  });

  // File links for files attached to notes/comments
  await db.schema.createTable('fileLinks', (table) => {
    table.uuid('id').primary();
    table.uuid('fileId').notNullable();
    table.uuid('workspaceId').notNullable();
    table.string('linkedEntityType').notNullable(); // 'progress-note', 'note', etc.
    table.uuid('linkedEntityId').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());

    table.index(['fileId']);
    table.index(['workspaceId']);
    table.index(['linkedEntityType', 'linkedEntityId']);
    table.foreign('fileId').references('id').inTable('files').onDelete('cascade');
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
  });

  // Audit trail for file operations
  await db.schema.createTable('fileEvents', (table) => {
    table.uuid('id').primary();
    table.uuid('fileId').notNullable();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.enum('eventType', ['created', 'ready', 'failed', 'downloaded', 'removed']).notNullable();
    table.jsonb('metadata').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());

    table.index(['fileId']);
    table.index(['workspaceId']);
    table.index(['actorId']);
    table.index(['eventType']);
    table.foreign('fileId').references('id').inTable('files').onDelete('cascade');
    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
    table.foreign('actorId').references('id').inTable('users').onDelete('set null');
  });

  // Workspace storage usage tracking
  await db.schema.createTable('workspaceStorageUsage', (table) => {
    table.uuid('workspaceId').primary();
    table.bigint('usedBytes').notNullable().defaultTo(0);
    table.bigint('quotaBytes').notNullable();
    table.timestamp('lastReconciled').notNullable().defaultTo(db.fn.now());
    table.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());

    table.foreign('workspaceId').references('id').inTable('workspaces').onDelete('cascade');
  });
}

export async function down(db: Knex) {
  await db.schema.dropTableIfExists('workspaceStorageUsage');
  await db.schema.dropTableIfExists('fileEvents');
  await db.schema.dropTableIfExists('fileLinks');
  await db.schema.dropTableIfExists('files');
}
