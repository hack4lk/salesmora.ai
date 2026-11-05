import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').alterTable('workspaceExportRequests', table => {
    table.timestamp('nextAttemptAt', { useTz: true }).nullable();
  });
  await db.schema.withSchema('admin').createTable('workspaceExportArtifacts', table => {
    table.uuid('requestId').primary()
      .references('id').inTable('admin.workspaceExportRequests').onDelete('CASCADE');
    table.text('objectKey').notNullable().unique();
    table.binary('encryptedDek').notNullable();
    table.binary('fileIv').notNullable();
    table.binary('fileAuthTag').notNullable();
    table.bigint('archiveSizeBytes').notNullable();
    table.bigint('artifactSizeBytes').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check('octet_length("encryptedDek") = 64');
    table.check('octet_length("fileIv") = 16');
    table.check('octet_length("fileAuthTag") = 16');
    table.check('"archiveSizeBytes" > 0 AND "artifactSizeBytes" > 0');
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('workspaceExportArtifacts');
  await db.schema.withSchema('admin').alterTable('workspaceExportRequests', table => {
    table.dropColumn('nextAttemptAt');
  });
  await applyAdminIdentityGrants(db);
}
