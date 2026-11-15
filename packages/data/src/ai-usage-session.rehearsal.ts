// Isolated accounting checks; only this run's random workspace rows are removed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { AIBudgetExceededError } from '@salesmora/contracts';
import { createDatabase } from './database';
import { createDatabaseMeasurement } from './database-metrics';
import { configureWorkspaceAIBudget, createAIUsageSession, workspaceAIAllowance } from './ai-usage';

process.loadEnvFile(fileURLToPath(new URL('../../../.env.local', import.meta.url)));
const target = process.env.TEST_DATABASE_URL;
if (process.env.NODE_ENV === 'production' || !target ||
  !['localhost', '127.0.0.1'].includes(new URL(target).hostname) ||
  !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL) {
  throw Error('Usage session rehearsal requires the isolated local test database');
}
const db = createDatabase(target);
const workspaces = Array.from({ length: 6 }, () => randomUUID());
const tokens = { inputTokens: 20, outputTokens: 10, totalTokens: 30, cachedInputTokens: 4, reasoningTokens: 2 };
try {
  const [workspaceId, concurrentId, unknownId, monthId, deniedId, embeddingId] = workspaces;
  await configureWorkspaceAIBudget(db, workspaceId, 100);
  const identity = { workspaceId, userId: 'fictional-session', turnId: randomUUID() };
  const model = String.raw`fictional\\??'"; COMMIT; -- \?`;
  const session = createAIUsageSession(db, identity);
  const metrics = createDatabaseMeasurement();
  await metrics.run(async () => {
    const planning = await session.recorder.start(model, 'planning', 80);
    await planning({ outcome: 'completed', tokens });
    const answer = await session.recorder.start(model, 'answer', 60);
    await answer({ outcome: 'completed', tokens });
    await session.flush();
    await session.flush();
  });
  assert.equal(metrics.snapshot().totals.calls, 5);
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 60n);
  const rows = await db('aiUsageCalls').where({ workspaceId }).orderBy('startedAt');
  assert.deepEqual(rows.map(row => [row.phase, row.outcome, row.totalTokens]), [
    ['planning', 'completed', '30'], ['answer', 'completed', '30'],
  ]);
  assert(rows.every(row => row.turnId === identity.turnId && row.userId === identity.userId));
  assert(rows.every(row => row.model === model), 'Quotes, backslashes and question marks round-trip without changing SQL boundaries');

  await configureWorkspaceAIBudget(db, concurrentId, 100);
  const first = createAIUsageSession(db, { workspaceId: concurrentId });
  const second = createAIUsageSession(db, { workspaceId: concurrentId });
  const attempts = await Promise.allSettled([
    first.recorder.start('fictional', 'planning', 60),
    second.recorder.start('fictional', 'planning', 60),
  ]);
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  const denied = attempts.find(result => result.status === 'rejected') as PromiseRejectedResult;
  assert(denied.reason instanceof AIBudgetExceededError);
  await Promise.all([first.flush('cancelled'), second.flush('cancelled')]);
  assert.equal((await workspaceAIAllowance(db, concurrentId)).usedTokens, 60n);

  await configureWorkspaceAIBudget(db, unknownId, 100);
  const interrupted = createAIUsageSession(db, { workspaceId: unknownId });
  const finish = await interrupted.recorder.start('fictional', 'planning', 60);
  await finish({ outcome: 'failed' });
  await assert.rejects(interrupted.recorder.start('fictional', 'answer', 60), AIBudgetExceededError);
  await interrupted.flush();
  const unknown = await db('aiUsageCalls').where({ workspaceId: unknownId }).first();
  assert.equal(unknown.outcome, 'failed');
  assert.equal(unknown.totalTokens, null);
  assert.equal((await workspaceAIAllowance(db, unknownId)).usedTokens, 60n);

  await configureWorkspaceAIBudget(db, monthId, 100);
  const rollover = createAIUsageSession(db, { workspaceId: monthId });
  const old = await rollover.recorder.start('fictional', 'planning', 80);
  await old({ outcome: 'completed', tokens });
  await db('aiUsageCalls').where({ workspaceId: monthId }).update({
    startedAt: db.raw(`(date_trunc('month', clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 second'`),
  });
  const current = await rollover.recorder.start('fictional', 'answer', 100);
  await current({ outcome: 'cancelled' });
  await rollover.flush();
  assert.equal((await workspaceAIAllowance(db, monthId)).usedTokens, 100n);

  await configureWorkspaceAIBudget(db, deniedId, 100);
  const limited = createAIUsageSession(db, { workspaceId: deniedId });
  const accepted = await limited.recorder.start('fictional', 'planning', 80);
  await accepted({ outcome: 'completed', tokens });
  await assert.rejects(limited.recorder.start('fictional', 'answer', 80), AIBudgetExceededError);
  assert.equal((await db('aiUsageCalls').where({ workspaceId: deniedId }).first()).outcome, 'started',
    'A denied admission rolls back the settlement in the same transaction');
  await limited.flush();
  assert.equal((await workspaceAIAllowance(db, deniedId)).usedTokens, 30n);

  const invalid = createAIUsageSession(db, { workspaceId: 'not-a-uuid' });
  await assert.rejects(invalid.recorder.start('fictional', 'planning', 1));
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 60n,
    'Admission query failure does not leak a failed transaction into the pool');

  await configureWorkspaceAIBudget(db, embeddingId, 100);
  const embedding = createAIUsageSession(db, { workspaceId: embeddingId });
  const embedded = await embedding.recorder.start('text-embedding-3-small', 'query_embedding', 9);
  await embedded({ outcome: 'completed', tokens: {
    inputTokens: 8, outputTokens: 0, totalTokens: 8, cachedInputTokens: 0, reasoningTokens: 0,
  } });
  await embedding.recorder.start('fictional', 'answer', 60);
  await embedding.flush('cancelled');
  assert.equal((await workspaceAIAllowance(db, embeddingId)).usedTokens, 68n);
  assert.equal((await db('aiUsageCalls').where({ workspaceId: embeddingId, phase: 'query_embedding' }).first()).totalTokens, '8');

  const trx = await db.transaction();
  try {
    const nested = createAIUsageSession(trx, { workspaceId });
    const nestedFinish = await nested.recorder.start('fictional', 'answer', 30);
    await nestedFinish({ outcome: 'completed', tokens });
    await nested.flush();
    assert.equal((await workspaceAIAllowance(trx, workspaceId)).usedTokens, 90n);
  } finally { await trx.rollback(); }
  assert.equal((await workspaceAIAllowance(db, workspaceId)).usedTokens, 60n);
  console.log('PASS five accounting driver calls, exact near-limit admission, concurrent quota, unknown usage, month boundary, rollback, nested transactions and embedding phases.');
} finally {
  try {
    await db.transaction(async trx => {
      await trx('aiUsageCalls').whereIn('workspaceId', workspaces).delete();
      await trx('workspaceAITokenBudgets').whereIn('workspaceId', workspaces).delete();
    });
  } finally { await db.destroy(); }
}
