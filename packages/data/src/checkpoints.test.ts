import { describe, it, expect, vi } from 'vitest';
import type { Knex } from 'knex';
const captured = vi.hoisted(() => ({ options: [] as { database?: string; password?: string }[], setup: vi.fn(async () => {}) }));
vi.mock('@langchain/langgraph-checkpoint-postgres', () => ({ PostgresSaver: class {
  pool: { options: { database?: string; password?: string }; end(): Promise<void> };
  constructor(pool: { options: { database?: string; password?: string }; end(): Promise<void> }) { this.pool = pool; captured.options.push(pool.options); }
  setup() { return captured.setup(); }
  end() { return this.pool.end(); }
} }));
import { createChatCheckpointer, setupChatCheckpoints } from './checkpoints';
describe('checkpoint migration targeting', () => {
  it('uses the active transaction target and password, never incomplete cloned Knex configuration or default PG settings', async () => {
    const client = { connectionParameters: { host: '127.0.0.1', port: 55432, user: 'salesmora', database: 'fictional_restore_test' }, password: 'fictional-test-password' };
    const releaseConnection = vi.fn(async () => {});
    const db = { client: { config: { connection: { database: 'wrong-default' } }, acquireConnection: async () => client, releaseConnection } } as unknown as Knex;
    await setupChatCheckpoints(db);
    expect(captured.options.at(-1)).toMatchObject({ database: 'fictional_restore_test', password: 'fictional-test-password' });
    expect(releaseConnection).toHaveBeenCalledWith(client);
    expect(() => createChatCheckpointer('')).toThrow('Checkpoint database is not configured');
  });
});
