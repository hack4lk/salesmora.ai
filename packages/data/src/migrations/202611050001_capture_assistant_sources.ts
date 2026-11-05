import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';
export async function up(db: Knex) {
  await db.schema.createTable('chatCaptureSourceProposals', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('threadId').notNullable(); table.uuid('turnId').notNullable().references('id').inTable('chatTurns').onDelete('CASCADE');
    table.foreign(['threadId','workspaceId','userId']).references(['id','workspaceId','userId']).inTable('chatThreads').onDelete('CASCADE');
    table.uuid('requestId').notNullable(); table.text('state').notNullable().defaultTo('pending'); table.jsonb('payload').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now()); table.timestamp('resolvedAt', { useTz: true });
    table.unique(['workspaceId','userId','requestId']); table.index(['workspaceId','userId','turnId']); table.check("state IN ('pending','confirmed','cancelled','superseded')");
  });
  await db.raw(`CREATE UNIQUE INDEX chat_capture_source_pending ON "chatCaptureSourceProposals" ("workspaceId","userId","threadId") WHERE state='pending'`);
  await db.schema.createTable('chatCaptureSourceAudit', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL'); table.uuid('proposalId').notNullable();
    table.text('operation').notNullable(); table.text('action').notNullable(); table.string('inputHash',64).notNullable();
    table.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
  });
  await db.raw('CREATE TRIGGER capture_source_audit_immutable BEFORE UPDATE OR DELETE ON "chatCaptureSourceAudit" FOR EACH ROW EXECUTE FUNCTION capture_setup_audit_immutable()');
  await db.schema.alterTable('chatTurns',table=>{table.jsonb('captureSourceEvidence').notNullable().defaultTo('[]');});
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_capture_source_evidence CHECK (jsonb_typeof("captureSourceEvidence")='array' AND jsonb_array_length("captureSourceEvidence")<=7)`);
  await applyRuntimeGrants(db);
}
export async function down(db: Knex) {
  if(await db('chatCaptureSourceProposals').first('id')||await db('chatCaptureSourceAudit').first('id'))throw Error('Retained publication/lifecycle evidence requires this migration.');
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_capture_source_evidence');
  await db.schema.alterTable('chatTurns',table=>{table.dropColumn('captureSourceEvidence');});
  await db.schema.dropTable('chatCaptureSourceAudit');await db.schema.dropTable('chatCaptureSourceProposals');
}
