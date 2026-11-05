import type { Knex } from 'knex';
import { applyAdminIdentityGrants } from '../runtime-roles';

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('workspaceExportRequests', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('workspaceName').notNullable();
    table.text('ownerUserId').notNullable();
    table.text('ownerName').notNullable();
    table.text('maskedOwnerEmail').notNullable();
    table.text('requestedBy').notNullable();
    table.text('requestedByName').notNullable();
    table.text('requestedByRole').notNullable();
    table.text('reason').notNullable();
    table.text('state').notNullable().defaultTo('queued');
    table.timestamp('requestedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('expiresAt', { useTz: true });
    table.integer('csvCount');
    table.integer('fileMetadataCount');
    table.timestamp('downloadedAt', { useTz: true });
    table.integer('attempts').notNullable().defaultTo(0);
    table.text('failureCode');
    table.check(`"requestedByRole" IN ('super_admin', 'support')`);
    table.check(`"state" IN ('queued', 'generating', 'ready', 'expired', 'failed')`);
    table.check('char_length(btrim("workspaceName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("ownerName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("requestedByName")) BETWEEN 1 AND 256');
    table.check('char_length(btrim("reason")) BETWEEN 10 AND 500');
    table.check('"csvCount" IS NULL OR "csvCount" >= 0');
    table.check('"fileMetadataCount" IS NULL OR "fileMetadataCount" >= 0');
    table.check('"attempts" >= 0');
    table.index(['state', 'requestedAt']);
    table.index(['workspaceId', 'requestedAt']);
  });
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.schema.withSchema('admin').dropTable('workspaceExportRequests');
}
