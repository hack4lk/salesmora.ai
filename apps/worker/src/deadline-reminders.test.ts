import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Knex } from '@salesmora/data';
const mocks = vi.hoisted(() => ({ schedule: vi.fn(), deliver: vi.fn(), send: vi.fn(), render: vi.fn() }));
vi.mock('@salesmora/data', () => ({ scheduleDeadlineReminders: mocks.schedule, processDeadlineEmails: mocks.deliver }));
vi.mock('@salesmora/data/email/transport', () => ({ sendEmail: mocks.send }));
vi.mock('@salesmora/data/email/deadline-reminder', () => ({ renderDeadlineReminderEmail: mocks.render }));
vi.mock('node:fs/promises', () => ({ readFile: vi.fn().mockResolvedValue(Buffer.from('fixture logo')) }));
import { startDeadlineReminders } from './deadline-reminders';
const hasTable = vi.fn(), hasColumn = vi.fn(), db = { schema: { hasTable, hasColumn } } as unknown as Knex;
describe('deadline reminder worker', () => {
  beforeEach(() => {
    vi.useFakeTimers(); vi.stubEnv('BETTER_AUTH_URL', 'http://127.0.0.1:3000');
    hasTable.mockResolvedValue(true); hasColumn.mockResolvedValue(true);
    mocks.schedule.mockResolvedValue({ created: 0, failed: 0 });
    mocks.deliver.mockResolvedValue({ sent: 0, skipped: 0, retryPending: 0, failed: 0 });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.resetAllMocks(); vi.unstubAllEnvs(); });
  it('refuses startup without migrated schema or app origin', async () => {
    hasColumn.mockResolvedValue(false);
    await expect(startDeadlineReminders(db)).rejects.toThrow('Apply deadline reminder migrations');
    hasColumn.mockResolvedValue(true); hasTable.mockResolvedValue(false);
    await expect(startDeadlineReminders(db)).rejects.toThrow('Apply deadline reminder migrations');
    hasTable.mockResolvedValue(true); vi.stubEnv('BETTER_AUTH_URL', '');
    await expect(startDeadlineReminders(db)).rejects.toThrow('Configure the app origin');
    expect(mocks.schedule).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('runs immediately, once per minute, without passing a browser/process clock', async () => {
    const stop = await startDeadlineReminders(db);
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.schedule).toHaveBeenCalledOnce();
    expect(mocks.schedule.mock.calls[0]).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.schedule).toHaveBeenCalledTimes(2);
    expect(mocks.deliver).toHaveBeenCalledTimes(2);
    await stop(); expect(vi.getTimerCount()).toBe(0);
  });
  it('prevents overlapping runs and waits for active work on shutdown', async () => {
    let complete!: (value: { created: number; failed: number }) => void;
    mocks.schedule.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startDeadlineReminders(db);
    await vi.advanceTimersByTimeAsync(180_000);
    expect(mocks.schedule).toHaveBeenCalledOnce();
    let stopped = false; const closing = stop().then(() => { stopped = true; });
    expect(stopped).toBe(false); complete({ created: 1, failed: 0 }); await closing;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.schedule).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it('sends the approved template with stable provider idempotency and inline logo', async () => {
    const mail = { id: 'fixture-notice', to: 'fixture@example.test', workspaceId: 'fixture' };
    mocks.render.mockReturnValue({ subject: 'Fixture reminder', html: '<p>Fixture</p>', text: 'Fixture' });
    mocks.deliver.mockImplementation(async (_db, _enabled, send) => { await send(mail); return { sent: 1, skipped: 0, retryPending: 0, failed: 0 }; });
    const stop = await startDeadlineReminders(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(mocks.render).toHaveBeenCalledWith({ ...mail, baseURL: 'http://127.0.0.1:3000' });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: mail.to, idempotencyKey: 'deadline-reminder-fixture-notice',
      attachments: [expect.objectContaining({ cid: 'salesmora-logo', contentDisposition: 'inline' })] }), 'http://127.0.0.1:3000');
  });
  it('logs sanitized failures and resumes after a failed batch', async () => {
    mocks.schedule.mockRejectedValueOnce(Error('PRIVATE customer and provider credentials'));
    const stop = await startDeadlineReminders(db); await vi.advanceTimersByTimeAsync(60_000); await stop();
    expect(console.error).toHaveBeenCalledExactlyOnceWith('{"event":"worker.deadline_reminder_error"}');
    expect(mocks.schedule).toHaveBeenCalledTimes(2);
  });
});
