import type { Knex } from 'knex';

export async function createChatTables(db: Knex) {
  await db.schema.createTable('chatThreads', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['id', 'workspaceId', 'userId']);
    table.index(['workspaceId', 'userId', 'updatedAt']);
  });
  await db.schema.createTable('chatTurns', table => {
    table.uuid('id').primary();
    table.uuid('threadId').notNullable();
    table.uuid('workspaceId').notNullable();
    table.text('userId').notNullable();
    table.uuid('clientTurnId').notNullable();
    table.text('requestHash').notNullable();
    table.text('surfaceKey').notNullable();
    table.text('state').notNullable();
    table.timestamp('leaseUntil', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.text('accessHash');
    table.jsonb('sources').notNullable().defaultTo('[]');
    table.jsonb('pageContext').notNullable().defaultTo('{}');
    table.jsonb('leadEvidence').notNullable().defaultTo('[]');
    table.jsonb('leadSearchSnapshot');
    table.jsonb('leadSearchEvidence').notNullable().defaultTo('[]');
    table.jsonb('leadDetailsResult');
    table.jsonb('leadHistoryResult');
    table.string('customerStamp', 64);
    table.jsonb('customerResult');
    table.jsonb('workOrderResult');
    table.jsonb('estimateResult');
    table.string('estimateStamp', 32);
    table.jsonb('estimateDecisionEvidence').notNullable().defaultTo('[]');
    table.jsonb('estimateDraftActionEvidence').notNullable().defaultTo('[]');
    table.jsonb('estimateVoidEvidence').notNullable().defaultTo('[]');
    table.jsonb('calendarResult');
    table.text('calendarStamp');
    table.jsonb('calendarProposalEvidence').notNullable().defaultTo('[]');
    table.jsonb('estimateArchiveEvidence').notNullable().defaultTo('[]');
    table.jsonb('estimateDraftDeleteEvidence').notNullable().defaultTo('[]');
    table.jsonb('estimateConversionEvidence').notNullable().defaultTo('[]');
    table.text('captureStamp');
    table.jsonb('captureResult');
    table.jsonb('captureSetupEvidence').notNullable().defaultTo('[]');
    table.jsonb('captureSourceEvidence').notNullable().defaultTo('[]');
    table.jsonb('reportSnapshot');
    table.jsonb('reportEvidence').notNullable().defaultTo('[]');
    table.jsonb('historyEvidence').notNullable().defaultTo('[]');
    table.jsonb('workOrderReadEvidence');
    table.jsonb('proposalFamilies');
    table.foreign(['threadId', 'workspaceId', 'userId']).references(['id', 'workspaceId', 'userId']).inTable('chatThreads').onDelete('CASCADE');
    table.unique(['workspaceId', 'userId', 'clientTurnId']);
    table.unique(['id', 'threadId', 'workspaceId', 'userId'], { indexName: 'chat_turn_owned_proposal_key' });
    table.index(['workspaceId', 'userId', 'createdAt']);
    table.check(`state IN ('accepted', 'running', 'completed', 'failed', 'cancelled', 'interrupted')`);
    table.check(`"calendarStamp" IS NULL OR "calendarStamp" ~ '^[a-f0-9]{64}$'`, [], 'chat_calendar_stamp');
    table.check(`"captureStamp" IS NULL OR "captureStamp" ~ '^[a-f0-9]{64}$'`, [], 'chat_capture_stamp');
    for (const [field, name, limit] of [
      ['calendarProposalEvidence', 'chat_calendar_proposal_evidence', 7],
      ['captureSetupEvidence', 'chat_capture_setup_evidence', 7],
      ['captureSourceEvidence', 'chat_capture_source_evidence', 7],
      ['reportEvidence', 'chat_report_evidence_array', 7],
      ['historyEvidence', 'chat_history_evidence_array', 12],
    ] as const) {
      table.check(`jsonb_typeof("${field}") = 'array' AND jsonb_array_length("${field}") <= ${limit}`, [], name);
    }
    table.check(`"proposalFamilies" IS NULL OR (
      jsonb_typeof("proposalFamilies") = 'array' AND "proposalFamilies" <@
      '["calendar","captureSource","captureSetup","estimateDraft","estimateSharing","estimateDecision","estimateDraftAction","estimateVoid","estimateArchive","estimateDraftDelete","estimateConversion","action","customer","workOrder","material"]'::jsonb)`, [], 'chat_turn_proposal_families');
  });
  await db.raw(`CREATE UNIQUE INDEX chat_one_active_thread ON "chatTurns" ("threadId") WHERE state IN ('accepted', 'running')`);
  await db.schema.createTable('chatMessages', table => {
    table.uuid('id').primary();
    table.uuid('turnId').notNullable().references('id').inTable('chatTurns').onDelete('CASCADE');
    table.text('role').notNullable();
    table.text('text').notNullable();
    table.unique(['turnId', 'role']);
    table.check(`role IN ('user', 'assistant')`);
    table.check('length(text) <= 32000');
  });
}
