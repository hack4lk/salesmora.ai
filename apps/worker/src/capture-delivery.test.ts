import { expect, it, vi } from 'vitest';
import type { Knex } from '@salesmora/data';
import { captureSchedulerConfiguration, workerCaptureDelivery } from './capture-delivery';
const workspaceId = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const env = { NODE_ENV: 'production', WORKER_TASKS: 'retention', CAPTURE_SCHEDULER_ENABLED: 'true', CAPTURE_PUBLICATION_WORKSPACE_IDS: workspaceId, CAPTURE_PUBLIC_ORIGIN: 'https://forms-staging.salesmora.ai', CAPTURE_READINESS_URL: 'http://web.railway.internal:3000/api/internal/lead-capture/readiness', CAPTURE_READINESS_SECRET: Buffer.alloc(32, 4).toString('base64') };
const trx = { schema: { hasTable: vi.fn().mockResolvedValue(true) } } as unknown as Knex.Transaction;
it('requires explicit scheduler scope, private URL, origin and dedicated token without changing retention mode', () => {
  expect(captureSchedulerConfiguration({})).toBeNull(); expect(captureSchedulerConfiguration(env)?.workspaces).toEqual([workspaceId]); expect(env.WORKER_TASKS).toBe('retention');
  for (const override of [{ CAPTURE_PUBLICATION_WORKSPACE_IDS: '*' }, { CAPTURE_PUBLICATION_WORKSPACE_IDS: '' }, { CAPTURE_READINESS_SECRET: '' }, { CAPTURE_READINESS_URL: 'https://evil.test/api/internal/lead-capture/readiness' }, { CAPTURE_READINESS_URL: 'http://web.railway.internal:3000/api/internal/lead-capture/readiness?extra=true' }, { CAPTURE_READINESS_URL: 'http://secret@web.railway.internal:3000/api/internal/lead-capture/readiness' }, { CAPTURE_PUBLIC_ORIGIN: 'http://localhost' }]) expect(() => captureSchedulerConfiguration({ ...env, ...override })).toThrow('Invalid capture scheduler configuration.');
});
it('requires a fresh request/workspace/origin-bound response and never grants Gmail or out-of-scope readiness', async () => {
  let override: Record<string, unknown> = {};
  const request = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => Response.json({ ...JSON.parse(String(init?.body)), origin: env.CAPTURE_PUBLIC_ORIGIN, websiteReady: true, ...override }));
  const authority = workerCaptureDelivery(captureSchedulerConfiguration(env)!, request);
  expect(await authority.websiteReady(trx, workspaceId)).toBe(true); expect(await authority.websiteReady(trx, workspaceId)).toBe(true);
  expect(JSON.parse(String(request.mock.calls[0][1]?.body)).requestId).not.toBe(JSON.parse(String(request.mock.calls[1][1]?.body)).requestId);
  expect(request.mock.calls[0][1]).toMatchObject({ redirect: 'error', headers: { Authorization: 'Bearer ' + env.CAPTURE_READINESS_SECRET } });
  for (override of [{ websiteReady: false }, { workspaceId: other }, { requestId: other }, { origin: 'https://evil.test' }, { secret: 'unexpected-field' }]) expect(await authority.websiteReady(trx, workspaceId)).toBe(false);
  request.mockClear(); expect(await authority.websiteReady(trx, other)).toBe(false); expect(request).not.toHaveBeenCalled();
  vi.mocked(trx.schema.hasTable).mockResolvedValueOnce(false); expect(await authority.websiteReady(trx, workspaceId)).toBe(false); expect(request).not.toHaveBeenCalled();
  expect(await authority.gmailReady(trx, workspaceId, other, {} as never)).toBe(false);
});
it('fails closed on network/redirect errors, denial, bad content and oversized responses', async () => {
  const config = captureSchedulerConfiguration(env)!;
  for (const response of [new Response(null, { status: 401 }), new Response(null, { status: 302, headers: { Location: 'https://evil.test' } }), new Response('{}'), new Response('{', { headers: { 'Content-Type': 'application/json' } }), Response.json({ oversized: 'x'.repeat(2049) })]) {
    expect(await workerCaptureDelivery(config, async () => response).websiteReady(trx, workspaceId)).toBe(false);
  }
  expect(await workerCaptureDelivery(config, async () => { throw Error('network unavailable'); }).websiteReady(trx, workspaceId)).toBe(false);
});
it('bounds both a stalled connection and a body that never ends', async () => {
  vi.useFakeTimers();
  try {
    const config = captureSchedulerConfiguration(env)!;
    const connection = workerCaptureDelivery(config, () => new Promise(() => {})).websiteReady(trx, workspaceId);
    await vi.advanceTimersByTimeAsync(3001); expect(await connection).toBe(false);
    const cancelled = vi.fn(), body = new ReadableStream<Uint8Array>({ cancel: cancelled });
    const response = workerCaptureDelivery(config, async () => new Response(body, { headers: { 'Content-Type': 'application/json' } })).websiteReady(trx, workspaceId);
    await vi.advanceTimersByTimeAsync(3001); expect(await response).toBe(false); expect(cancelled).toHaveBeenCalled();
  } finally { vi.useRealTimers(); }
});
