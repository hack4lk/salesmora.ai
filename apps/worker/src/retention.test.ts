import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ cleanup: vi.fn(), schedule: vi.fn(), queueClose: vi.fn(), workerClose: vi.fn(), process: undefined as undefined | ((job: { name: string }) => Promise<unknown>) }));
vi.mock('@salesmora/data', () => ({ cleanupExpiredChat: mocks.cleanup }));
vi.mock('bullmq', () => ({
  Queue: class { on() {} upsertJobScheduler = mocks.schedule; close = mocks.queueClose; },
  Worker: class { constructor(_name: string, process: typeof mocks.process) { mocks.process = process; } on() {} async waitUntilReady() {} close = mocks.workerClose; },
}));
import { startChatRetention } from './retention';
import type { Knex } from '@salesmora/data';
const db = {} as Knex;
const config = { databaseURL: 'unused', queueName: 'help-ingestion-test', connection: { host: 'localhost', port: 56379 } };
describe('chat retention scheduler', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.schedule.mockResolvedValue({}); mocks.cleanup.mockResolvedValue({ scannedThreads: 0, deletedThreads: 0 }); });
  it('registers a stable daily UTC job, bounded retries/history, and closes both clients', async () => {
    const stop = await startChatRetention(db, config);
    expect(mocks.schedule).toHaveBeenCalledWith('daily-chat-retention', { pattern: '0 3 * * *', tz: 'UTC' }, expect.objectContaining({ name: 'expire-chat', opts: expect.objectContaining({ attempts: 3, removeOnComplete: 10, removeOnFail: 10 }) }));
    expect(await mocks.process!({ name: 'expire-chat' })).toEqual({ deletedThreads: 0 });
    await stop(); expect(mocks.workerClose).toHaveBeenCalledOnce(); expect(mocks.queueClose).toHaveBeenCalledOnce();
  });
  it('bounds a full backlog to ten batches and rejects unrelated jobs', async () => {
    mocks.cleanup.mockResolvedValue({ scannedThreads: 100, deletedThreads: 100 });
    await startChatRetention(db, config);
    expect(await mocks.process!({ name: 'expire-chat' })).toEqual({ deletedThreads: 1000 });
    expect(mocks.cleanup).toHaveBeenCalledTimes(10);
    await expect(mocks.process!({ name: 'other' })).rejects.toThrow('Unknown');
  });
  it('does not spin on locked candidates and propagates a cleanup failure for queue retry', async () => {
    await startChatRetention(db, config);
    mocks.cleanup.mockResolvedValueOnce({ scannedThreads: 100, deletedThreads: 0 });
    await mocks.process!({ name: 'expire-chat' }); expect(mocks.cleanup).toHaveBeenCalledOnce();
    mocks.cleanup.mockRejectedValueOnce(Error('fictional failure'));
    await expect(mocks.process!({ name: 'expire-chat' })).rejects.toThrow('Chat retention failed');
  });
  it('closes queue clients if registration fails', async () => {
    mocks.schedule.mockRejectedValueOnce(Error('unavailable'));
    await expect(startChatRetention(db, config)).rejects.toThrow('unavailable');
    expect(mocks.workerClose).toHaveBeenCalledOnce(); expect(mocks.queueClose).toHaveBeenCalledOnce();
  });
});
