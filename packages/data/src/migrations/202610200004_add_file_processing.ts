import type { Knex } from 'knex';

export async function up(db: Knex) {
  // Add thumbnail and processing columns to files table
  await db.schema.alterTable('files', (table) => {
    table.string('thumbnailStorageKey').nullable(); // S3 key for generated thumbnail
    table.string('thumbnailEncryptedDekB64').nullable(); // Base64-encoded encrypted DEK for thumbnail
    table.bigint('thumbnailSizeBytes').nullable(); // Size of thumbnail in bytes
    table.string('heicOriginalStorageKey').nullable(); // S3 key for HEIC original (if converted to JPEG)
    table.string('heicOriginalEncryptedDekB64').nullable(); // Base64-encoded encrypted DEK for HEIC original
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable('files', (table) => {
    table.dropColumn('thumbnailStorageKey');
    table.dropColumn('thumbnailEncryptedDekB64');
    table.dropColumn('thumbnailSizeBytes');
    table.dropColumn('heicOriginalStorageKey');
    table.dropColumn('heicOriginalEncryptedDekB64');
  });
}
