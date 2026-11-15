import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTranscriptDelivery } from './transcript-delivery';

afterEach(() => vi.useRealTimers());
function fixture() {
  const abort = new AbortController();
  const options = { signal: abort.signal, authorize: vi.fn(async () => {}), persist: vi.fn<(text: string) => Promise<void>>(async () => {}),
    send: vi.fn(), onFailure: vi.fn() };
  return { abort, options, delivery: createTranscriptDelivery(options) };
}
describe('completion-only transcript delivery', () => {
  it('delivers 100 fragments with one initial authorization and one final text write', async () => {
    const { options, delivery } = fixture();
    for (let index = 0; index < 100; index++) await delivery.push('word ');
    expect(options.authorize).toHaveBeenCalledOnce();
    expect(options.send).toHaveBeenCalledTimes(100);
    expect(options.persist).not.toHaveBeenCalled();
    await delivery.finish();
    expect(options.persist).toHaveBeenCalledExactlyOnceWith('word '.repeat(100));
  });
  it('does not save during a long stream and saves the complete text at completion', async () => {
    vi.useFakeTimers();
    const { options, delivery } = fixture();
    await delivery.push('first');
    await vi.advanceTimersByTimeAsync(60_000);
    expect(options.persist).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    await delivery.push('second');
    await delivery.finish();
    expect(options.persist.mock.calls).toEqual([['firstsecond']]);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(options.persist).toHaveBeenCalledOnce();
    expect(delivery.metrics.completionWrites).toBe(1);
  });
  it('waits for the final write and rejects late delivery and duplicate completion', async () => {
    const { options, delivery } = fixture();
    let release!: () => void;
    options.persist.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    await delivery.push('first');
    const pending = delivery.finish();
    await Promise.resolve();
    expect(options.send).toHaveBeenCalledTimes(1);
    await expect(delivery.push('second')).rejects.toThrow('closed');
    await expect(delivery.finish()).rejects.toThrow('closed');
    release();
    await pending;
    expect(options.persist.mock.calls).toEqual([['first']]);
  });
  it('retains a bounded complete answer without size-triggered writes', async () => {
    const { options, delivery } = fixture();
    await delivery.push('a'.repeat(8000));
    for (let index = 0; index < 3; index++) await delivery.push('b'.repeat(8000));
    expect(options.persist).not.toHaveBeenCalled();
    await expect(delivery.push('overflow')).rejects.toThrow('limit');
    expect(options.send).toHaveBeenCalledTimes(4);
    await expect(delivery.finish()).rejects.toThrow('limit');
    expect(options.persist).not.toHaveBeenCalled();
  });
  it('persists answers larger than a delivery batch in one completion write', async () => {
    const { options, delivery } = fixture();
    await delivery.push('a'.repeat(8000));
    await delivery.push('b');
    await delivery.finish();
    expect(options.persist).toHaveBeenCalledExactlyOnceWith('a'.repeat(8000) + 'b');
  });
  it('does not send or save text when initial authorization fails', async () => {
    const { options, delivery } = fixture();
    options.authorize.mockRejectedValueOnce(new Error('Access denied.'));
    await expect(delivery.push('private')).rejects.toThrow('Access denied.');
    await expect(delivery.stop()).rejects.toThrow('Access denied.');
    expect(options.send).not.toHaveBeenCalled();
    expect(options.persist).not.toHaveBeenCalled();
  });
  it('does not reauthorize later batches after the first release succeeds', async () => {
    const { options, delivery } = fixture();
    await delivery.push('first');
    options.authorize.mockRejectedValue(new Error('Access revoked.'));
    await delivery.push('second');
    expect(options.authorize).toHaveBeenCalledOnce();
    expect(options.send.mock.calls).toEqual([['first'], ['second']]);
  });
  it('serializes concurrent batches behind the same initial authorization', async () => {
    const { options, delivery } = fixture();
    let release!: () => void;
    options.authorize.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const first = delivery.push('first'), second = delivery.push('second');
    await Promise.resolve();
    expect(options.send).not.toHaveBeenCalled();
    release();
    await Promise.all([first, second]);
    expect(options.authorize).toHaveBeenCalledOnce();
    expect(options.send.mock.calls).toEqual([['first'], ['second']]);
  });
  it('honors cancellation after authorization without another database check', async () => {
    const { abort, options, delivery } = fixture();
    await delivery.push('first');
    abort.abort(new Error('Stopped'));
    await expect(delivery.push('late')).rejects.toThrow('Stopped');
    await expect(delivery.finish()).rejects.toThrow('Stopped');
    expect(options.authorize).toHaveBeenCalledOnce();
    expect(options.send.mock.calls).toEqual([['first']]);
    expect(options.persist).not.toHaveBeenCalled();
  });
  it('does not release text when cancellation arrives during the initial check', async () => {
    const { abort, options, delivery } = fixture();
    options.authorize.mockImplementationOnce(async () => { abort.abort(new Error('Disconnected')); });
    await expect(delivery.push('private')).rejects.toThrow('Disconnected');
    expect(options.send).not.toHaveBeenCalled();
  });
  it('surfaces completion save failures and never reports successful completion', async () => {
    const { options, delivery } = fixture();
    const failure = new Error('Database unavailable');
    options.persist.mockRejectedValueOnce(failure);
    await delivery.push('first');
    await expect(delivery.finish()).rejects.toBe(failure);
    expect(options.onFailure).toHaveBeenCalledExactlyOnceWith(failure);
    expect(delivery.metrics.completionWrites).toBe(0);
    expect(options.send.mock.calls).toEqual([['first']]);
  });
  it('discards partial text on Stop without a write', async () => {
    const { options, delivery } = fixture();
    await delivery.push('partial');
    await delivery.stop();
    expect(options.persist).not.toHaveBeenCalled();
    await expect(delivery.push('late')).rejects.toThrow('closed');
    await expect(delivery.finish()).rejects.toThrow('closed');
  });
  it('finalizes even an empty successful answer', async () => {
    const { options, delivery } = fixture();
    await delivery.finish();
    expect(options.persist).toHaveBeenCalledExactlyOnceWith('');
  });
});
