import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ process: vi.fn(), purge: vi.fn() }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(), processCapturePublications: mocks.process, purgeCaptureSubmissionAbuse: mocks.purge }));
import { startCapturePublications } from './capture-publication';
import type { Knex } from '@salesmora/data';
const workspaceId = '00000000-0000-4000-8000-000000000001';
const env = { NODE_ENV: 'production', WORKER_TASKS: 'retention', CAPTURE_SCHEDULER_ENABLED: 'true', CAPTURE_PUBLICATION_WORKSPACE_IDS: workspaceId, CAPTURE_PUBLIC_ORIGIN: 'https://forms-staging.salesmora.ai', CAPTURE_READINESS_URL: 'http://web.railway.internal:3000/api/internal/lead-capture/readiness', CAPTURE_READINESS_SECRET: Buffer.alloc(32, 4).toString('base64') };
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.clearAllMocks(); });
it('does no database work while disabled, and enabled retention scope waits for its active tick on shutdown', async () => {
  vi.useFakeTimers(); vi.spyOn(console, 'log').mockImplementation(() => {});
  const hasTable = vi.fn().mockResolvedValue(true), db = { schema: { hasTable } } as unknown as Knex;
  await (await startCapturePublications(db, {}))(); expect(hasTable).not.toHaveBeenCalled();
  let finish!: (count: number) => void; mocks.process.mockImplementation(() => new Promise(resolve => { finish = resolve; })); mocks.purge.mockResolvedValue(0);
  const stop = await startCapturePublications(db, env); expect(mocks.process).toHaveBeenCalledWith(db, ['leadCapture.read', 'leadCapture.activate'], expect.objectContaining({ websiteReady: expect.any(Function) }), 100, [workspaceId]);
  await vi.advanceTimersByTimeAsync(90000); expect(mocks.process).toHaveBeenCalledTimes(1);
  let stopped = false; const closing = stop().then(() => { stopped = true; }); await Promise.resolve(); expect(stopped).toBe(false);
  finish(0); await closing; expect(stopped).toBe(true); await vi.advanceTimersByTimeAsync(90000); expect(mocks.process).toHaveBeenCalledTimes(1);
});
