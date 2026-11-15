import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AsyncLocalStorage } from 'node:async_hooks';

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(), active: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@salesmora/data', () => ({
  subscribeChatCancellation: mocks.subscribe,
  withDatabasePhase: (_phase: string, work: () => unknown) => work(),
}));
vi.mock('./store', () => ({ turnStillActive: mocks.active }));
import { watchChatTurnCancellation } from './cancellation';

const identity = { userId: 'fictional-user', workspaceId: '00000000-0000-4000-8000-000000000001' };
const turnId = '00000000-0000-4000-8000-000000000002';
let notify: (() => void) | undefined;
let unavailable: (() => void) | undefined;
let unsubscribe: ReturnType<typeof vi.fn>;
async function flush() {
  for (let index = 0; index < 6; index++) await Promise.resolve();
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.active.mockResolvedValue(true);
  unsubscribe = vi.fn();
  mocks.subscribe.mockImplementation((_id, callback, onUnavailable) => {
    notify = callback;
    unavailable = onUnavailable;
    return { ready: Promise.resolve(true), unsubscribe };
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('chat turn cancellation watcher', () => {
  it('attributes notification-triggered queries to the subscribing turn rather than the shared connection', async () => {
    const context = new AsyncLocalStorage<string>();
    mocks.active.mockImplementation(async () => {
      expect(context.getStore()).toBe('subscribing-turn');
      return true;
    });
    const watch = context.run('subscribing-turn', () =>
      watchChatTurnCancellation(identity, turnId, new AbortController()));
    await watch.ready;
    context.run('listener-connection', () => notify?.());
    await flush();
    expect(mocks.active).toHaveBeenCalledTimes(2);
    await watch.stop();
  });

  it('subscribes before the initial persisted-state check and keeps database state authoritative', async () => {
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    expect(mocks.subscribe).toHaveBeenCalledOnce();
    expect(mocks.subscribe).toHaveBeenCalledWith(turnId, expect.any(Function), expect.any(Function));
    expect(mocks.active).toHaveBeenCalledOnce();
    expect(abort.signal.aborted).toBe(false);
    mocks.active.mockResolvedValueOnce(false);
    notify?.();
    await flush();
    expect(abort.signal.reason).toBe('cancelled');
    await watch.stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('performs no periodic queries while waiting for an event', async () => {
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    expect(mocks.active).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.active).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(abort.signal.aborted).toBe(false);
    await watch.stop();
  });

  it('aborts immediately on listener loss without polling or reconnecting an active run', async () => {
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    unavailable?.();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mocks.active).toHaveBeenCalledOnce();
    expect(abort.signal.reason).toBe('unavailable');
    await watch.stop();
  });

  it('aborts on database status failure and logs no database error contents', async () => {
    const error = new Error('private database connection detail');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.active.mockRejectedValueOnce(error);
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    expect(abort.signal.reason).toBe('unavailable');
    expect(log).toHaveBeenCalledWith('chat_cancellation_status_check_failed');
    expect(JSON.stringify(log.mock.calls)).not.toContain('private database');
    await watch.stop();
  });

  it('stops timers and unsubscribes without a later database query', async () => {
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    await watch.stop();
    notify?.();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.active).toHaveBeenCalledOnce();
    unavailable?.();
    expect(abort.signal.aborted).toBe(false);
  });

  it('fails closed without a state query when listener setup is unavailable', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.subscribe.mockReturnValueOnce({ ready: Promise.resolve(false), unsubscribe });
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await watch.ready;
    expect(abort.signal.reason).toBe('unavailable');
    expect(log).toHaveBeenCalledWith('chat_cancellation_listener_unavailable');
    expect(mocks.active).not.toHaveBeenCalled();
    await watch.stop();
  });

  it('does not query after being stopped during listener setup', async () => {
    let connected!: (available: boolean) => void;
    mocks.subscribe.mockReturnValueOnce({
      ready: new Promise<boolean>(resolve => { connected = resolve; }), unsubscribe,
    });
    const watch = watchChatTurnCancellation(identity, turnId, new AbortController());
    const stopped = watch.stop();
    connected(true);
    await stopped;
    expect(mocks.active).not.toHaveBeenCalled();
  });

  it('rechecks when Stop arrives during an in-flight initial status query', async () => {
    let active!: (value: boolean) => void;
    mocks.active.mockImplementationOnce(() => new Promise<boolean>(resolve => { active = resolve; }));
    mocks.active.mockResolvedValueOnce(false);
    const abort = new AbortController();
    const watch = watchChatTurnCancellation(identity, turnId, abort);
    await flush();
    notify?.();
    active(true);
    await watch.ready;
    expect(mocks.active).toHaveBeenCalledTimes(2);
    expect(abort.signal.reason).toBe('cancelled');
    await watch.stop();
  });
});
