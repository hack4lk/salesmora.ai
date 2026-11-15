import { EventEmitter, errorMonitor } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { createDatabaseMeasurement, instrumentDatabaseClient, withDatabasePhase, withDatabaseOperation } from './database-metrics';

describe('request-scoped database measurement', () => {
  it('counts server statement responses separately from packed driver roundtrips', async () => {
    const client = { query: async () => [{ command: 'BEGIN' }, { command: 'SELECT' }, { command: 'SELECT' }] };
    instrumentDatabaseClient(client, 'application');
    const measurement = createDatabaseMeasurement();
    await measurement.run(() => client.query());
    expect(measurement.snapshot().totals).toMatchObject({ calls: 1, statements: 3, read: 1 });
    expect(JSON.stringify(measurement.snapshot())).not.toMatch(/BEGIN|SELECT/);
  });
  it('counts authority reloads and known workspace fingerprints without retaining SQL', async () => {
    const client = { query: async (_sql: string) => ({ command: 'SELECT' }) };
    instrumentDatabaseClient(client, 'application');
    const measurement = createDatabaseMeasurement();
    await measurement.run(async () => {
      await client.query('select 1 from workspaces left join "workspaceRolePolicies" on false');
      await client.query('select md5(string_agg(private_column, $1)) from private_table');
    });
    expect(measurement.snapshot().totals).toMatchObject({ calls: 2, authorityReads: 1, fingerprintQueries: 1 });
    expect(JSON.stringify(measurement.snapshot())).not.toMatch(/private_|workspaceRolePolicies/);
  });
  it('attributes nested operations without changing phases and restores the outer operation', async () => {
    const client = { query: async () => ({ command: 'SELECT' }) };
    instrumentDatabaseClient(client, 'application');
    const measurement = createDatabaseMeasurement();
    await measurement.run(() => withDatabasePhase('runtime', () => withDatabaseOperation('history', async () => {
      await client.query();
      await withDatabaseOperation('session', () => client.query());
      await client.query();
    })));
    await measurement.run(() => client.query());
    const snapshot = measurement.snapshot();
    expect(snapshot.operations['runtime:history']).toMatchObject({ calls: 2, read: 2, pending: 0 });
    expect(snapshot.operations['runtime:session']).toMatchObject({ calls: 1, read: 1, pending: 0 });
    expect(snapshot.operations['request:unattributed']).toMatchObject({ calls: 1, pending: 0 });
    expect(snapshot.phases.runtime?.calls).toBe(3);
    expect(Object.values(snapshot.operations).reduce((sum, item) => sum + item.calls, 0)).toBe(snapshot.totals.calls);
    await withDatabaseOperation('history', () => client.query());
    expect(measurement.snapshot().totals.calls).toBe(4);
  });

  it('passes through calls outside a measurement without wrapping callbacks or promises', async () => {
    const result = Promise.resolve({ command: 'SELECT' });
    const client = { query: vi.fn(() => result) };
    instrumentDatabaseClient(client, 'application');
    expect(client.query()).toBe(result);
    await result;
    expect(client.query).toHaveBeenCalledOnce();
  });

  it('counts completed driver calls by pool, phase and command without retaining private content', async () => {
    const measurement = createDatabaseMeasurement();
    const client = { query: vi.fn(async (sql: string, values?: string[]) => {
      expect(sql).toContain('WITH private-sql');
      expect(values).toEqual(['private-binding']);
      return { command: 'UPDATE', rows: [{ private: 'private-result' }] };
    }) };
    instrumentDatabaseClient(client, 'application');
    await measurement.run(() => withDatabasePhase('tools', () =>
      client.query('WITH private-sql AS (SELECT 1) UPDATE fictional SET value = $1', ['private-binding'])));
    const snapshot = measurement.snapshot();
    expect(snapshot.totals).toMatchObject({ calls: 1, write: 1, read: 0, failed: 0, pending: 0, unobserved: 0 });
    expect(snapshot.sources.application).toEqual(snapshot.totals);
    expect(snapshot.phases.tools).toEqual(snapshot.totals);
    expect(snapshot.totals.durationMs).toBeGreaterThanOrEqual(0);
    expect(JSON.stringify(snapshot)).not.toMatch(/private/);
    snapshot.totals.calls = 999;
    expect(measurement.snapshot().totals.calls).toBe(1);
  });

  it('preserves callback arguments, receiver and return value while counting failures once', () => {
    const error = new Error('private-error');
    const callback = vi.fn(function (this: object, failure: Error | null, result?: object) {
      expect(this).toBe(client);
      expect(failure).toBe(error);
      expect(result).toBeUndefined();
    });
    const client = { query(_sql: string, done: typeof callback) { done.call(this, error); return undefined; } };
    instrumentDatabaseClient(client, 'authentication');
    const measurement = createDatabaseMeasurement();
    expect(measurement.run(() => client.query('SELECT private-sql', callback))).toBeUndefined();
    expect(callback).toHaveBeenCalledOnce();
    expect(measurement.snapshot().sources.authentication).toMatchObject({ calls: 1, read: 1, failed: 1, pending: 0 });
    expect(JSON.stringify(measurement.snapshot())).not.toContain('private');
  });

  it('rethrows synchronous failures and preserves rejected promise identity', async () => {
    const error = new Error('private-error');
    const measurement = createDatabaseMeasurement();
    const sync = { query() { throw error; } };
    instrumentDatabaseClient(sync, 'application');
    expect(() => measurement.run(() => sync.query())).toThrow(error);
    const rejected = Promise.reject(error);
    const async = { query: () => rejected };
    instrumentDatabaseClient(async, 'graph');
    const returned = measurement.run(() => async.query());
    expect(returned).toBe(rejected);
    await expect(returned).rejects.toBe(error);
    expect(measurement.snapshot().totals).toMatchObject({ calls: 2, failed: 2, pending: 0 });
  });

  it('isolates overlapping requests and attributes completion to the initiating phase', async () => {
    let release!: (result: { command: string }) => void;
    const pending = new Promise<{ command: string }>(resolve => { release = resolve; });
    const client = { query: vi.fn((sql: string) => {
      expect(sql).toMatch(/^SELECT [12]$/);
      return pending;
    }) };
    instrumentDatabaseClient(client, 'graph');
    const first = createDatabaseMeasurement(), second = createDatabaseMeasurement();
    const a = first.run(() => withDatabasePhase('runtime', () => client.query('SELECT 1')));
    const b = second.run(() => withDatabasePhase('finalize', () => client.query('SELECT 2')));
    expect(first.snapshot().totals).toMatchObject({ calls: 1, pending: 1 });
    expect(second.snapshot().totals).toMatchObject({ calls: 1, pending: 1 });
    release({ command: 'SELECT' });
    await Promise.all([a, b]);
    expect(first.snapshot().phases.runtime).toMatchObject({ calls: 1, read: 1, pending: 0 });
    expect(first.snapshot().phases.finalize).toBeUndefined();
    expect(second.snapshot().phases.finalize).toMatchObject({ calls: 1, read: 1, pending: 0 });
  });

  it('counts transaction control separately and marks unsupported completion APIs explicitly', async () => {
    const client = { query: async (sql: string) => {
      expect(sql).toBe('BEGIN;');
      return { command: 'BEGIN' };
    } };
    instrumentDatabaseClient(client, 'application');
    const measurement = createDatabaseMeasurement();
    await measurement.run(() => client.query('BEGIN;'));
    const unsupported = { query: (sql: string) => { expect(sql).toBe('SELECT 1'); return undefined; } };
    instrumentDatabaseClient(unsupported, 'application');
    measurement.run(() => unsupported.query('SELECT 1'));
    expect(measurement.snapshot().totals).toMatchObject({ calls: 2, transaction: 1, read: 1, unobserved: 1, pending: 0 });
  });

  it('observes event-based queries without swallowing unhandled errors', () => {
    const query = new EventEmitter();
    const client = { query: () => query };
    instrumentDatabaseClient(client, 'graph');
    const measurement = createDatabaseMeasurement();
    expect(measurement.run(() => client.query())).toBe(query);
    expect(query.listenerCount('error')).toBe(0);
    expect(query.listenerCount(errorMonitor)).toBe(1);
    expect(() => query.emit('error', new Error('private-error'))).toThrow('private-error');
    expect(measurement.snapshot().totals).toMatchObject({ calls: 1, failed: 1, pending: 0 });
    query.emit('end', { command: 'SELECT' });
    expect(measurement.snapshot().totals.calls).toBe(1);
  });

  it('tracks timer-created queries inside their originating request', async () => {
    const client = { query: async () => ({ command: 'SELECT' }) };
    instrumentDatabaseClient(client, 'application');
    const measurement = createDatabaseMeasurement();
    await measurement.run(() => new Promise<void>(resolve => {
      setTimeout(() => { void withDatabasePhase('cancellation', () => client.query()).then(() => resolve()); }, 1);
    }));
    expect(measurement.snapshot().phases.cancellation).toMatchObject({ calls: 1, read: 1, pending: 0 });
  });
});
