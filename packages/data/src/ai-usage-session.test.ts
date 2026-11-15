import knex from 'knex';
import { describe, expect, it, vi } from 'vitest';
import { AIBudgetExceededError } from '@salesmora/contracts';
import { createAIUsageSession } from './ai-usage';
import { createDatabaseMeasurement, instrumentDatabaseClient } from './database-metrics';

const tokens = { inputTokens: 20, outputTokens: 10, totalTokens: 30, cachedInputTokens: 4, reasoningTokens: 2 };
const identity = { workspaceId: '00000000-0000-4000-8000-000000000001', userId: 'fictional', turnId: '00000000-0000-4000-8000-000000000002' };

function fixture() {
  const db = knex({ client: 'pg' });
  const queries: { text: string; values?: unknown[] }[] = [];
  const state = { used: '0', fail: undefined as string | undefined, rollbackFails: false };
  const connection = {
    __knex__disposed: undefined as unknown,
    query(query: { text: string; values?: unknown[] }, done: (error: Error | null, response?: unknown) => void) {
      queries.push(query);
      queueMicrotask(() => {
        if (state.rollbackFails && query.text === 'ROLLBACK') return done(Error('rollback unavailable'));
        if (state.fail && query.text.includes(state.fail)) {
          state.fail = undefined;
          return done(Error('database unavailable'));
        }
        done(null, query.text.startsWith('BEGIN ') ? [
          { rows: [] }, { rows: [] }, { rows: [{
            at: new Date('2026-11-13T12:00:00Z'), override: '100', defaultTokens: null,
            used: state.used, billing: null, workspace: { planOverride: null, planOverrideEndsAt: null },
          }] },
        ] : { rows: [], command: query.text.startsWith('insert') ? 'INSERT' : 'SELECT' });
      });
    },
  };
  instrumentDatabaseClient(connection, 'application');
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue(connection);
  const release = vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  return { db, queries, state, connection, release };
}

describe('request-local AI usage session', () => {
  it('uses five actual driver calls for planning and answer without holding a connection across provider work', async () => {
    const { db, queries, release } = fixture();
    const session = createAIUsageSession(db, identity);
    const metrics = createDatabaseMeasurement();
    await metrics.run(async () => {
      const planning = await session.recorder.start('fictional', 'planning', 60);
      expect(release).toHaveBeenCalledTimes(1);
      await planning({ outcome: 'completed', tokens });
      expect(queries).toHaveLength(2);
      const answer = await session.recorder.start('fictional', 'answer', 60);
      expect(queries[2].text).toContain('"totalTokens":30');
      expect(queries[2].text.indexOf('pg_advisory_xact_lock')).toBeLessThan(queries[2].text.indexOf('WITH settled'));
      expect(queries[2].text).toContain('coalesce("totalTokens", "reservationTokens") - "reservationTokens"');
      await answer({ outcome: 'cancelled' });
      await session.flush();
      await session.flush();
    });
    expect(metrics.snapshot().totals.calls).toBe(5);
    expect(metrics.snapshot().operations['request:usage-reserve']?.calls).toBe(4);
    expect(metrics.snapshot().operations['request:usage-finalize']?.calls).toBe(1);
    expect(queries[4].values?.at(-1)).toContain('"outcome":"cancelled"');
    expect(queries[4].text).toContain('EXISTS (SELECT 1 FROM budget_lock)');
  });

  it('retains the first validated result and rejects invalid usage without losing the reservation', async () => {
    const { db, queries } = fixture();
    const session = createAIUsageSession(db, identity);
    const finish = await session.recorder.start('fictional', 'answer', 60);
    await expect(finish({ outcome: 'completed', tokens: { ...tokens, totalTokens: -1 } })).rejects.toThrow('Invalid AI usage');
    await finish({ outcome: 'completed', tokens });
    await finish({ outcome: 'failed' });
    await session.flush();
    expect(queries.at(-1)?.values?.at(-1)).toContain('"outcome":"completed"');
    expect(queries.at(-1)?.values?.at(-1)).toContain('"totalTokens":30');
    await expect(session.recorder.start('fictional', 'answer', 1)).rejects.toThrow('closed');
  });

  it('flushes an admitted but interrupted phase as unknown and retries failed persistence', async () => {
    const { db, queries, state } = fixture();
    const session = createAIUsageSession(db, identity);
    await session.recorder.start('fictional', 'answer', 60);
    state.fail = 'with "budget_lock"';
    await expect(session.flush('cancelled')).rejects.toThrow('database unavailable');
    await session.flush('cancelled');
    expect(queries.at(-1)?.values?.at(-1)).toContain('"outcome":"cancelled"');
    expect(queries.at(-1)?.values?.at(-1)).not.toContain('totalTokens');
  });

  it('rolls back a denied admission and never returns a provider finalizer', async () => {
    const { db, queries, state, release } = fixture();
    state.used = '50';
    const session = createAIUsageSession(db, identity);
    await expect(session.recorder.start('fictional', 'answer', 60)).rejects.toBeInstanceOf(AIBudgetExceededError);
    expect(queries.map(query => query.text.startsWith('BEGIN ') ? 'admission' : query.text)).toEqual(['admission', 'ROLLBACK']);
    expect(release).toHaveBeenCalledTimes(1);
    await session.flush();
    expect(queries).toHaveLength(2);
  });

  it('rolls back insertion failures and disposes connections if rollback also fails', async () => {
    const { db, state, connection, release } = fixture();
    state.fail = 'insert into';
    state.rollbackFails = true;
    await expect(createAIUsageSession(db, identity).recorder.start('fictional', 'answer', 60)).rejects.toBeInstanceOf(AggregateError);
    expect(connection.__knex__disposed).toBeInstanceOf(Error);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["fictional?'; COMMIT; --", "'fictional?''; COMMIT; --'"],
    [String.raw`fictional\?'\tail??; --`, String.raw`E'fictional\\?''\\tail??; --'`],
    [String.raw`fictional\\??'"; ROLLBACK; /*`, String.raw`E'fictional\\\\??''"; ROLLBACK; /*'`],
  ])('keeps SQL-looking model %s inside one escaped value', async (model, literal) => {
    const { db, queries } = fixture();
    const session = createAIUsageSession(db, identity);
    await session.recorder.start(model, 'answer', 60);
    expect(queries[1].text).toContain(literal);
    expect(queries[1].values).toBeUndefined();
    await session.flush();
  });

  it('captures phase completion time and usage before the eventual flush', async () => {
    const { db, queries } = fixture();
    const session = createAIUsageSession(db, identity);
    const finish = await session.recorder.start('fictional', 'answer', 60);
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(new Date('2026-11-13T12:01:00Z'));
      const mutable = { ...tokens };
      await finish({ outcome: 'completed', tokens: mutable });
      mutable.totalTokens = 999;
      vi.setSystemTime(new Date('2026-11-13T12:02:00Z'));
      await session.flush();
      const result = JSON.parse(String(queries.at(-1)?.values?.at(-1)))[0];
      expect(result.finishedAt).toBe('2026-11-13T12:01:00.000Z');
      expect(result.totalTokens).toBe(30);
    } finally { vi.useRealTimers(); }
  });
});
