import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.schema.createTable('captureRequestBuckets', t => {
    t.text('key').primary(); t.integer('count').notNullable(); t.timestamp('expiresAt', { useTz: true }).notNullable(); t.index('expiresAt'); t.check('count > 0');
  });
  await db.schema.createTable('captureSubmissionAttempts', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('publicationId').notNullable(); t.uuid('requestId').notNullable();
    t.text('inputHash').notNullable(); t.uuid('contextId').notNullable(); t.text('clientHash').notNullable(); t.boolean('challengeRequired').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.primary(['publicationId', 'requestId']); t.foreign(['workspaceId', 'publicationId']).references(['workspaceId', 'id']).inTable('capturePublications').onDelete('CASCADE');
    t.index(['publicationId', 'clientHash', 'createdAt']); t.index('expiresAt');
  });
  await db.schema.createTable('captureChallengeChecks', t => {
    t.text('tokenHash').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('publicationId').notNullable(); t.uuid('requestId').notNullable(); t.uuid('contextId').notNullable();
    t.text('inputHash').notNullable(); t.uuid('verificationId').notNullable().unique(); t.timestamp('verifiedAt', { useTz: true }); t.timestamp('expiresAt', { useTz: true }).notNullable();
    t.foreign(['workspaceId', 'publicationId']).references(['workspaceId', 'id']).inTable('capturePublications').onDelete('CASCADE'); t.index('expiresAt');
  });
  await db.schema.createTable('captureReceiptProcessing', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('receiptId').notNullable(); t.uuid('contextId').notNullable(); t.jsonb('assignment').notNullable(); t.jsonb('tags').notNullable();
    t.primary(['workspaceId', 'receiptId']); t.foreign(['workspaceId', 'receiptId']).references(['workspaceId', 'id']).inTable('captureReceipts').onDelete('CASCADE');
    t.check(`jsonb_typeof(assignment) = 'object' AND jsonb_typeof(tags) = 'array'`);
  });
  await db.raw('CREATE TRIGGER capture_processing_immutable BEFORE UPDATE OR DELETE ON "captureReceiptProcessing" FOR EACH ROW EXECUTE FUNCTION capture_preserve_snapshot()');
  await db.schema.createTable('captureInputUsage', t => { t.uuid('workspaceId').primary().references('id').inTable('workspaces').onDelete('CASCADE'); t.bigInteger('retainedBytes').notNullable().defaultTo(0); t.check('"retainedBytes" >= 0'); });
  await db.raw(`INSERT INTO "captureInputUsage" ("workspaceId","retainedBytes") SELECT "workspaceId",sum(octet_length(evidence::text)+octet_length("originalAnswers"::text)) FROM "captureReceipts" GROUP BY "workspaceId"`);
  await db.schema.createTable('leadTags', t => {
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE'); t.uuid('leadId').notNullable(); t.text('tag').notNullable();
    t.primary(['workspaceId', 'leadId', 'tag']); t.foreign(['workspaceId', 'leadId']).references(['workspaceId', 'id']).inTable('leads').onDelete('CASCADE'); t.check('length(tag) BETWEEN 1 AND 50');
  });
  await applyRuntimeGrants(db);
}
export async function down() { throw Error('Submission receipts and processing evidence are retained; use a forward migration.'); }
