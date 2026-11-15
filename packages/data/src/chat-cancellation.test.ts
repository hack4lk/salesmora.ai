import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clients: [] as { emit: (event: string, ...args: unknown[]) => boolean; query: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> }[],
  pools: [] as { emit: (event: string, ...args: unknown[]) => boolean }[],
  raw: vi.fn(),
  listen: vi.fn(),
}));
vi.mock('pg', () => {
  class Emitter {
    private handlers = new Map<string, ((...args: unknown[]) => void)[]>();
    on(event: string, handler: (...args: unknown[]) => void) {
      this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
      return this;
    }
    emit(event: string, ...args: unknown[]) {
      for (const handler of this.handlers.get(event) ?? []) handler(...args);
      return true;
    }
  }
  class Client extends Emitter {
    query = vi.fn(() => mocks.listen());
    release = vi.fn();
    constructor() { super(); mocks.clients.push(this); }
  }
  class Pool extends Emitter {
    constructor() { super(); mocks.pools.push(this); }
    async connect() {
      const client = new Client();
      this.emit('connect', client);
      return client;
    }
  }
  return { default: { Pool } };
});
import { notifyChatCancellation, subscribeChatCancellation } from './chat-cancellation';

const turnId = '00000000-0000-4000-8000-000000000001';
beforeEach(() => {
  vi.stubEnv('DATABASE_URL', 'postgres://fictional-test');
  vi.clearAllMocks();
  mocks.listen.mockReset().mockResolvedValue({ command: 'LISTEN' });
  mocks.clients.length = 0;
  mocks.pools.length = 0;
  delete (globalThis as typeof globalThis & { salesmoraChatCancellation?: unknown }).salesmoraChatCancellation;
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete (globalThis as typeof globalThis & { salesmoraChatCancellation?: unknown }).salesmoraChatCancellation;
});

describe('chat cancellation PostgreSQL notifications', () => {
  it('listens once, routes only valid channel payloads and removes turn subscribers', async () => {
    const first = vi.fn(), second = vi.fn();
    const subscription = subscribeChatCancellation(turnId, first, vi.fn());
    const secondSubscription = subscribeChatCancellation(turnId, second, vi.fn());
    await expect(subscription.ready).resolves.toBe(true);
    await expect(secondSubscription.ready).resolves.toBe(true);
    expect(mocks.pools).toHaveLength(1);
    expect(mocks.clients).toHaveLength(1);
    expect(mocks.clients[0].query).toHaveBeenCalledExactlyOnceWith('LISTEN salesmora_chat_cancel');
    const client = mocks.clients[0];
    client.emit('notification', { channel: 'other', payload: turnId });
    client.emit('notification', { channel: 'salesmora_chat_cancel', payload: 'not-a-uuid' });
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    client.emit('notification', { channel: 'salesmora_chat_cancel', payload: turnId });
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    subscription.unsubscribe();
    client.emit('notification', { channel: 'salesmora_chat_cancel', payload: turnId });
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledTimes(2);
    secondSubscription.unsubscribe();
  });

  it('publishes the notification through the caller transaction using a bound turn ID', async () => {
    const trx = { raw: mocks.raw };
    await notifyChatCancellation(trx as never, turnId);
    expect(mocks.raw).toHaveBeenCalledExactlyOnceWith(
      'SELECT pg_notify(?, ?)', ['salesmora_chat_cancel', turnId],
    );
    await expect(notifyChatCancellation(trx as never, 'not-a-uuid')).rejects.toThrow('Invalid chat turn identifier.');
    expect(mocks.raw).toHaveBeenCalledOnce();
  });

  it('notifies active watchers of failure and reconnects for a new subscription', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const unavailable = vi.fn();
    const subscription = subscribeChatCancellation(turnId, vi.fn(), unavailable);
    await expect(subscription.ready).resolves.toBe(true);
    const first = mocks.clients[0];
    first.emit('error', Object.assign(new Error('private connection detail'), { code: '08006' }));
    expect(first.release).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledWith('chat_cancellation_listener_unavailable', { code: '08006' });
    expect(unavailable).toHaveBeenCalledOnce();
    first.emit('end');
    expect(first.release).toHaveBeenCalledOnce();
    expect(unavailable).toHaveBeenCalledOnce();
    subscription.unsubscribe();
    const next = subscribeChatCancellation(turnId, vi.fn(), vi.fn());
    await expect(next.ready).resolves.toBe(true);
    expect(mocks.clients).toHaveLength(2);
    expect(mocks.clients[1].query).toHaveBeenCalledWith('LISTEN salesmora_chat_cancel');
    next.unsubscribe();
  });

  it('reports unavailable configuration to the caller', async () => {
    vi.stubEnv('DATABASE_URL', '');
    const subscription = subscribeChatCancellation(turnId, vi.fn(), vi.fn());
    await expect(subscription.ready).resolves.toBe(false);
    subscription.unsubscribe();
  });

  it('fails closed and releases exactly once when LISTEN fails during setup', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.listen.mockRejectedValueOnce(new Error('private connection detail'));
    const unavailable = vi.fn();
    const subscription = subscribeChatCancellation(turnId, vi.fn(), unavailable);
    await expect(subscription.ready).resolves.toBe(false);
    expect(unavailable).toHaveBeenCalledOnce();
    mocks.clients[0].emit('end');
    expect(mocks.clients[0].release).toHaveBeenCalledOnce();
    subscription.unsubscribe();
  });

  it('does not mark a connection ready when it ends before LISTEN completes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let listened!: () => void;
    mocks.listen.mockImplementationOnce(() => new Promise<void>(resolve => { listened = resolve; }));
    const unavailable = vi.fn();
    const subscription = subscribeChatCancellation(turnId, vi.fn(), unavailable);
    await Promise.resolve();
    mocks.clients[0].emit('end');
    listened();
    await expect(subscription.ready).resolves.toBe(false);
    expect(unavailable).toHaveBeenCalledOnce();
    expect(mocks.clients[0].release).toHaveBeenCalledOnce();
    subscription.unsubscribe();
  });
});
