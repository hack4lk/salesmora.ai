// Rollback-only database accounting checks. No real provider calls or customer rows.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { createAIUsageRecorder, configureWorkspaceAIBudget, workspaceAIAllowance } from './ai-usage';
import { AIBudgetExceededError } from '@salesmora/contracts';
process.loadEnvFile(fileURLToPath(new URL('../../../.env.local', import.meta.url)));
const target = process.env.TEST_DATABASE_URL;
if (process.env.NODE_ENV === 'production' || !target || !['localhost', '127.0.0.1'].includes(new URL(target).hostname) || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL) throw Error('Usage rehearsal requires the isolated local test database');
const db = createDatabase(target);
const trx = await db.transaction();
try {
  const identity = { workspaceId: randomUUID(), userId: 'fictional-usage-user', turnId: randomUUID() };
  const recorder = createAIUsageRecorder(trx, identity);
  const finish = await recorder.start('fictional-model', 'answer', 100);
  const tokens = { inputTokens: 20, outputTokens: 10, totalTokens: 30, cachedInputTokens: 4, reasoningTokens: 2 };
  await finish({ outcome: 'completed', tokens }); await finish({ outcome: 'completed', tokens });
  const rows = await trx('aiUsageCalls').where({ turnId: identity.turnId });
  assert.equal(rows.length, 1); assert.equal(rows[0].totalTokens, '30'); assert.equal(rows[0].outcome, 'completed');
  await finish({ outcome: 'failed' });
  assert.equal((await trx('aiUsageCalls').where({ id: rows[0].id }).first()).outcome, 'completed');
  const failed = await recorder.start('fictional-model', 'planning', 100);
  await failed({ outcome: 'cancelled' });
  const unknown = await trx('aiUsageCalls').where({ turnId: identity.turnId, outcome: 'cancelled' }).first();
  assert.equal(unknown.totalTokens, null);
  const interrupted = await recorder.start('fictional-model', 'answer', 100);
  await assert.rejects(interrupted({ outcome: 'completed', tokens: { ...tokens, totalTokens: -1 } }));
  assert.equal(await trx('aiUsageCalls').where({ turnId: identity.turnId, outcome: 'started' }).count().first().then(row => Number(row?.count)), 1);
  const shared = await createAIUsageRecorder(trx).start('fictional-embedding', 'corpus_embedding');
  await shared({ outcome: 'completed', tokens: { inputTokens: 8, outputTokens: 0, totalTokens: 8, cachedInputTokens: 0, reasoningTokens: 0 } });
  const ingestion = await trx('aiUsageCalls').where({ model: 'fictional-embedding' }).first();
  assert.equal(ingestion.workspaceId, null); assert.equal(ingestion.turnId, null);
  console.log('PASS usage isolation, concurrent/repeated finalization, unknown cancellations, unfinished calls and shared ingestion.');
} finally { await trx.rollback(); }

// Separate pool connections exercise the actual concurrent reservation lock.
const workspaceId = randomUUID();
try {
  await configureWorkspaceAIBudget(db, workspaceId, 100);
  const first = createAIUsageRecorder(db, { workspaceId, userId: 'fictional-one' });
  const second = createAIUsageRecorder(db, { workspaceId, userId: 'fictional-two' });
  const attempts = await Promise.allSettled([first.start('fictional-model', 'answer', 60), second.start('fictional-model', 'answer', 60)]);
  assert.equal(attempts.filter(item => item.status === 'fulfilled').length, 1);
  const rejected = attempts.find(item => item.status === 'rejected') as PromiseRejectedResult;
  assert(rejected.reason instanceof AIBudgetExceededError);
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 60n);
  const winner = attempts.find(item => item.status === 'fulfilled') as PromiseFulfilledResult<Awaited<ReturnType<typeof first.start>>>;
  const result = { outcome: 'completed' as const, tokens: { inputTokens: 20, outputTokens: 10, totalTokens: 30, cachedInputTokens: 0, reasoningTokens: 0 } };
  await Promise.all([winner.value(result), winner.value(result)]);
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 30n);
  const cancelled = await second.start('fictional-model', 'answer', 60);
  await cancelled({ outcome: 'cancelled' });
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 90n);
  await assert.rejects(first.start('fictional-model', 'answer', 11), AIBudgetExceededError);
  await assert.rejects(first.start('fictional-model', 'answer'), /Invalid AI token reservation/);
  await configureWorkspaceAIBudget(db, workspaceId, 0);
  await assert.rejects(second.start('fictional-model', 'answer', 1), AIBudgetExceededError);
  await configureWorkspaceAIBudget(db, workspaceId, 100);
  await db('aiUsageCalls').where({ workspaceId }).update({ startedAt: db.raw("(date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 second'") });
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 0n);
  await first.start('fictional-model', 'answer', 100);
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 100n);
  const other = randomUUID();
  assert.equal((await workspaceAIAllowance(db, other)).usedTokens, 0n);
  console.log('PASS workspace concurrency, settlement, unknown holds, zero limits, invalid reservations, UTC rollover and isolation.');
} finally {
  await db('aiUsageCalls').where({ workspaceId }).delete();
  await db('workspaceAITokenBudgets').where({ workspaceId }).delete();
  await db.destroy();
}
