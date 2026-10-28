import type { Knex } from 'knex';
export async function up(db: Knex) {
  await db.schema.alterTable('chatTurns',t => { t.jsonb('calendarProposalEvidence').notNullable().defaultTo('[]'); });
  await db.raw(`ALTER TABLE "chatTurns" ADD CONSTRAINT chat_calendar_proposal_evidence CHECK (jsonb_typeof("calendarProposalEvidence")='array' AND jsonb_array_length("calendarProposalEvidence") <= 7)`);
  await db.schema.createTable('chatCalendarProposals',t => {
    t.uuid('id').primary(); t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('turnId').notNullable().references('id').inTable('chatTurns').onDelete('CASCADE');
    t.uuid('threadId').notNullable().references('id').inTable('chatThreads').onDelete('CASCADE');
    t.text('state').notNullable().defaultTo('pending'); t.jsonb('payload').notNullable();
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.timestamp('resolvedAt',{useTz:true});
    t.index(['workspaceId','userId','turnId']);t.check("state IN ('pending','confirmed','cancelled','superseded')");
  });
  await db.raw(`CREATE UNIQUE INDEX chat_calendar_pending_thread ON "chatCalendarProposals" ("workspaceId","userId","threadId") WHERE state='pending'`);
  await db.schema.createTable('chatCalendarProposalAudit',t => {
    t.uuid('id').primary();t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('actorId').references('id').inTable('users').onDelete('SET NULL');t.uuid('proposalId').notNullable();t.text('action').notNullable();t.string('inputHash',64).notNullable();t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());
  });
}
export async function down(db: Knex) {
  if (await db('chatCalendarProposals').first('id') || await db('chatCalendarProposalAudit').first('id') || await db('chatTurns').whereRaw(`jsonb_array_length("calendarProposalEvidence") > 0`).first('id')) throw Error('Retained Calendar proposals require this migration.');
  await db.schema.dropTable('chatCalendarProposalAudit');await db.schema.dropTable('chatCalendarProposals');
  await db.raw('ALTER TABLE "chatTurns" DROP CONSTRAINT chat_calendar_proposal_evidence');
  await db.schema.alterTable('chatTurns',t => { t.dropColumn('calendarProposalEvidence'); });
}
