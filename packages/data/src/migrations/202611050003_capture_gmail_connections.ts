import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.raw(`ALTER TABLE "captureOperations" DROP CONSTRAINT "captureOperations_operation_check", ADD CONSTRAINT "captureOperations_operation_check" CHECK (operation IN ('draft.create','draft.save','source.launch','source.pause','source.resume','source.archive','source.restore','source.duplicate','source.reschedule','intake.decide','gmail.select'))`);
  await db.schema.alterTable('captureGmailOAuthAttempts', table => { table.text('inputHash'); table.check('"inputHash" IS NULL OR "inputHash" ~ \'^[a-f0-9]{64}$\'', [], 'capture_gmail_oauth_hash'); });
  await db.schema.alterTable('captureGmailCredentials', table => {
    table.uuid('refreshLeaseId'); table.timestamp('refreshLeaseUntil', { useTz: true });
    table.check('("refreshLeaseId" IS NULL) = ("refreshLeaseUntil" IS NULL)', [], 'capture_gmail_refresh_lease');
  });
  await db.schema.createTable('captureGmailDisconnectReviews', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('accountId').notNullable(); table.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    table.text('actorId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('payload').notNullable(); table.text('state').notNullable().defaultTo('pending'); table.uuid('requestId'); table.text('inputHash'); table.jsonb('receipt');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.check("state IN ('pending','confirmed')"); table.check('jsonb_typeof(payload) = \'object\'');
    table.check('(state = \'confirmed\') = ("receipt" IS NOT NULL AND "requestId" IS NOT NULL AND "inputHash" IS NOT NULL)');
    table.check('"expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + interval \'10 minutes\'');
    table.unique(['workspaceId', 'requestId']);
  });
  await db.schema.createTable('captureGmailConnectionEvents', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('accountId').notNullable(); table.foreign(['workspaceId', 'accountId']).references(['workspaceId', 'id']).inTable('captureGmailAccounts').deferrable('deferred');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL'); table.uuid('sourceId');
    table.foreign(['workspaceId', 'sourceId']).references(['workspaceId', 'id']).inTable('captureSources').deferrable('deferred');
    table.text('kind').notNullable(); table.integer('accountVersion').notNullable(); table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check("kind IN ('connected','reconnected','selected','disconnected','authorization-lost')"); table.check('"accountVersion" > 0');
  });
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  if (await db('captureOperations').where({ operation: 'gmail.select' }).first('id')) throw Error('Retained Gmail account selections require this migration.');
  if (await db('captureGmailDisconnectReviews').first('id') || await db('captureGmailConnectionEvents').first('id') || await db('captureGmailOAuthAttempts').whereNotNull('inputHash').first('id')) throw Error('Retained Gmail connection evidence requires this migration.');
  await db.schema.dropTable('captureGmailConnectionEvents'); await db.schema.dropTable('captureGmailDisconnectReviews');
  await db.schema.alterTable('captureGmailCredentials', table => { table.dropColumn('refreshLeaseId'); table.dropColumn('refreshLeaseUntil'); });
  await db.schema.alterTable('captureGmailOAuthAttempts', table => { table.dropColumn('inputHash'); });
  await db.raw(`ALTER TABLE "captureOperations" DROP CONSTRAINT "captureOperations_operation_check", ADD CONSTRAINT "captureOperations_operation_check" CHECK (operation IN ('draft.create','draft.save','source.launch','source.pause','source.resume','source.archive','source.restore','source.duplicate','source.reschedule','intake.decide'))`);
}
