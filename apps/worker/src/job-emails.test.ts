import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Knex } from '@salesmora/data';
const mocks = vi.hoisted(() => ({ deliver: vi.fn(), send: vi.fn(), render: vi.fn(), renderStatus: vi.fn(), renderAssignment: vi.fn(), renderDeadline: vi.fn() }));
vi.mock('@salesmora/data', () => ({ processJobEmails: mocks.deliver }));
vi.mock('@salesmora/data/email/transport', () => ({ sendEmail: mocks.send }));
vi.mock('@salesmora/data/email/job-assignment-changed', () => ({ renderJobAssignmentChangedEmail: mocks.renderAssignment }));
vi.mock('@salesmora/data/email/job-deadline-changed', () => ({ renderJobDeadlineChangedEmail: mocks.renderDeadline }));
vi.mock('@salesmora/data/email/job-created', () => ({ renderJobCreatedEmail: mocks.render }));
vi.mock('@salesmora/data/email/job-status-changed', () => ({ renderJobStatusChangedEmail: mocks.renderStatus }));
vi.mock('node:fs/promises', () => ({ readFile: vi.fn().mockResolvedValue(Buffer.from('fixture logo')) }));
import { startJobEmails } from './job-emails';
const hasTable = vi.fn(), hasColumn = vi.fn(), db = { schema: { hasTable, hasColumn } } as unknown as Knex;
describe('Job-created email worker', () => {
  beforeEach(() => {
    vi.useFakeTimers(); vi.stubEnv('BETTER_AUTH_URL', 'http://127.0.0.1:3000');
    hasTable.mockResolvedValue(true); hasColumn.mockResolvedValue(true);
    mocks.deliver.mockResolvedValue({ sent: 0, skipped: 0, retryPending: 0, failed: 0 });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.resetAllMocks(); vi.unstubAllEnvs(); });
  it('refuses startup without required migrations or app origin', async () => {
    hasColumn.mockResolvedValue(false); await expect(startJobEmails(db)).rejects.toThrow('Apply Job notification migrations');
    hasColumn.mockResolvedValue(true); hasTable.mockResolvedValue(false); await expect(startJobEmails(db)).rejects.toThrow('Apply Job notification migrations');
    hasTable.mockResolvedValue(true); vi.stubEnv('BETTER_AUTH_URL', ''); await expect(startJobEmails(db)).rejects.toThrow('Configure the app origin');
    expect(mocks.deliver).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('runs immediately and every five seconds without overlapping batches; waits on shutdown', async () => {
    let complete!: (value: { sent: number; skipped: number; retryPending: number; failed: number }) => void;
    mocks.deliver.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(15000); expect(mocks.deliver).toHaveBeenCalledOnce();
    complete({ sent: 1, skipped: 0, retryPending: 0, failed: 0 }); await vi.advanceTimersByTimeAsync(5000); expect(mocks.deliver).toHaveBeenCalledTimes(2);
    let finish!: (value: { sent: number; skipped: number; retryPending: number; failed: number }) => void;
    mocks.deliver.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await vi.advanceTimersByTimeAsync(5000);
    let stopped = false; const closing = stop().then(() => { stopped = true; }); expect(stopped).toBe(false);
    finish({ sent: 0, skipped: 0, retryPending: 0, failed: 0 }); await closing;
    await vi.advanceTimersByTimeAsync(15000); expect(mocks.deliver).toHaveBeenCalledTimes(3); expect(vi.getTimerCount()).toBe(0);
  });
  it('uses the approved template, stable provider key and inline logo', async () => {
    const mail = { event: 'created', id: 'fixture-notice', to: 'fixture@example.test', actorName: 'Fixture' };
    mocks.render.mockReturnValue({ subject: 'Job created', html: '<p>Fixture</p>', text: 'Fixture' });
    mocks.deliver.mockImplementation(async (_db, _enabled, send) => { await send(mail); return { sent: 1, skipped: 0, retryPending: 0, failed: 0 }; });
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(mocks.render).toHaveBeenCalledWith({ ...mail, baseURL: 'http://127.0.0.1:3000' });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: mail.to, idempotencyKey: 'job-created-fixture-notice',
      attachments: [expect.objectContaining({ cid: 'salesmora-logo', contentDisposition: 'inline' })] }), 'http://127.0.0.1:3000');
  });
  it('dispatches status snapshots to the approved status template with an independent stable key', async () => {
    const mail = { event: 'status', id: 'status-notice', to: 'fixture@example.test', actorName: 'Fixture', before: 'in-progress', after: 'completed' };
    mocks.renderStatus.mockReturnValue({ subject: 'Job completed', html: '<p>Completed</p>', text: 'Completed' });
    mocks.deliver.mockImplementation(async (_db, _enabled, send) => { await send(mail); return { sent: 1, skipped: 0, retryPending: 0, failed: 0 }; });
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(mocks.renderStatus).toHaveBeenCalledWith({ ...mail, baseURL: 'http://127.0.0.1:3000' });
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Job completed', idempotencyKey: 'job-status-status-notice' }), 'http://127.0.0.1:3000');
  });
  it.each(['current', 'ended'])('dispatches %s assignment projections with a stable independent key', async access => {
    const mail = { event: 'assignment', access, change: 'removed', id: 'assignment-notice', to: 'fixture@example.test', actorName: access === 'ended' ? '' : 'Fixture',
      job: access === 'ended' ? { number: 'J-1042' } : { number: 'J-1042', id: 'fixture-job', title: 'Fixture Job' } };
    mocks.renderAssignment.mockReturnValue({ subject: 'Assignment changed', html: '<p>Changed</p>', text: 'Changed' });
    mocks.deliver.mockImplementation(async (_db, _enabled, send) => { await send(mail); return { sent: 1, skipped: 0, retryPending: 0, failed: 0 }; });
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(mocks.renderAssignment).toHaveBeenCalledWith({ ...mail, baseURL: 'http://127.0.0.1:3000' });
    expect(mocks.render).not.toHaveBeenCalled(); expect(mocks.renderStatus).not.toHaveBeenCalled();
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'job-assignment-assignment-notice' }), 'http://127.0.0.1:3000');
  });
  it.each([[null, '2026-11-06'], ['2026-10-30', '2026-11-06'], ['2026-10-30', null]])('dispatches deadline %s to %s snapshots with an independent stable key', async (before, after) => {
    const mail = { event: 'deadline', id: 'deadline-notice', to: 'fixture@example.test', actorName: 'Fixture', before, after, timezone: 'America/New_York' };
    mocks.renderDeadline.mockReturnValue({ subject: 'Deadline changed', html: '<p>Changed</p>', text: 'Changed' });
    mocks.deliver.mockImplementation(async (_db, _enabled, send) => { await send(mail); return { sent: 1, skipped: 0, retryPending: 0, failed: 0 }; });
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(mocks.renderDeadline).toHaveBeenCalledWith({ ...mail, baseURL: 'http://127.0.0.1:3000' });
    expect(mocks.render).not.toHaveBeenCalled(); expect(mocks.renderStatus).not.toHaveBeenCalled(); expect(mocks.renderAssignment).not.toHaveBeenCalled();
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'job-deadline-deadline-notice' }), 'http://127.0.0.1:3000');
  });
  it('logs sanitized errors and resumes on the next interval', async () => {
    mocks.deliver.mockRejectedValueOnce(Error('PRIVATE provider payload'));
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(5000); await stop();
    expect(console.error).toHaveBeenCalledExactlyOnceWith('{"event":"worker.job_email_error"}'); expect(mocks.deliver).toHaveBeenCalledTimes(2);
  });
  it('reports only aggregate retry/failure state', async () => {
    mocks.deliver.mockResolvedValue({ sent: 0, skipped: 0, retryPending: 2, failed: 1 });
    const stop = await startJobEmails(db); await vi.advanceTimersByTimeAsync(0); await stop();
    expect(console.error).toHaveBeenCalledExactlyOnceWith('{"event":"worker.job_email_status","failed":1,"retryPending":2}');
  });
});
