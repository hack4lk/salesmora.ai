import { expect, it, vi } from 'vitest';
import type { Knex } from '@salesmora/data';
import { captureDeliveryAuthority, captureWebsiteReady } from './delivery';
import { captureInstallationOrigin } from './submission-policy';
import { captureReadiness } from './readiness';
const workspaceId = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const key = (n: number) => Buffer.alloc(32, n).toString('base64');
const env = { NODE_ENV: 'production', BETTER_AUTH_URL: 'https://app.salesmora.ai', CAPTURE_PUBLIC_ORIGIN: 'https://forms-staging.salesmora.ai', CAPTURE_SUBMISSIONS_ENABLED: 'true', CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'true', CAPTURE_PUBLICATION_WORKSPACE_IDS: workspaceId,
  CAPTURE_CONTEXT_SECRET: key(1), CAPTURE_ABUSE_SECRET: key(2), CAPTURE_INGRESS_SECRET: key(3), CAPTURE_READINESS_SECRET: key(4), TURNSTILE_SITE_KEY: 'staging-widget', TURNSTILE_SECRET_KEY: 'private-provider-secret', CAPTURE_CLIENT_IP_MODE: 'verified-header', CAPTURE_TRUSTED_IP_HEADER: 'x-real-ip', CAPTURE_REQUESTS_PER_MINUTE: '300', CAPTURE_SOURCE_REQUESTS_PER_MINUTE: '100', CAPTURE_MAX_PENDING_ITEMS: '1000', CAPTURE_MAX_RETAINED_BYTES: '16777216' };
const trx = { schema: { hasTable: vi.fn().mockResolvedValue(true) } } as unknown as Knex.Transaction;
it('shares explicit scoped readiness with installation and retains schema/Gmail denials', async () => {
  expect(captureWebsiteReady(workspaceId, env)).toBe(true); expect(captureWebsiteReady(other, env)).toBe(false);
  expect(captureInstallationOrigin(env, workspaceId)).toBe(env.CAPTURE_PUBLIC_ORIGIN); expect(captureInstallationOrigin(env, other)).toBeUndefined();
  const authority = captureDeliveryAuthority(env); expect(await authority.websiteReady(trx, workspaceId)).toBe(true);
  expect(await authority.gmailReady(trx, workspaceId, other, {} as never)).toBe(false);
  vi.mocked(trx.schema.hasTable).mockResolvedValueOnce(false); expect(await authority.websiteReady(trx, workspaceId)).toBe(false);
});
it('defaults off and rejects malformed scope, incomplete policy and production test configuration', () => {
  expect(captureWebsiteReady(workspaceId, {})).toBe(false);
  for (const override of [{ CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'false' }, { CAPTURE_SUBMISSIONS_ENABLED: 'false' }, { CAPTURE_PUBLICATION_WORKSPACE_IDS: '*' }, { CAPTURE_PUBLICATION_WORKSPACE_IDS: '' }, { CAPTURE_PUBLICATION_WORKSPACE_IDS: workspaceId + ',' }, { TURNSTILE_SECRET_KEY: '' }, { CAPTURE_CONTEXT_SECRET: '' }, { CAPTURE_CLIENT_IP_MODE: 'loopback' }, { CAPTURE_MAX_PENDING_ITEMS: '' }, { SALESMORA_TEST_SERVER: '1' }, { TEST_DATABASE_URL: 'local-fixture' }]) {
    expect(captureWebsiteReady(workspaceId, { ...env, ...override })).toBe(false); expect(captureInstallationOrigin({ ...env, ...override }, workspaceId)).toBeUndefined();
  }
});
function request(body: unknown = { workspaceId, requestId: other }, token = key(4), method = 'POST') {
  return new Request('http://web.railway.internal:3000/api/internal/lead-capture/readiness', { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
}
it('authenticates before parsing and returns only fresh bound environment metadata, with no database or session', async () => {
  const response = await captureReadiness(request(), env); expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ workspaceId, requestId: other, origin: env.CAPTURE_PUBLIC_ORIGIN, websiteReady: true });
  expect(response.headers.get('cache-control')).toContain('no-store'); expect(response.headers.get('set-cookie')).toBeNull();
  expect((await (await captureReadiness(request({ workspaceId: other, requestId: workspaceId }), env)).json()).websiteReady).toBe(false);
  expect((await (await captureReadiness(request(), { ...env, CAPTURE_SUBMISSIONS_ENABLED: 'false' })).json()).websiteReady).toBe(false);
  expect((await captureReadiness(request({ oversized: 'x'.repeat(2000) }, key(9)), env)).status).toBe(401);
  expect((await captureReadiness(request(), { ...env, CAPTURE_READINESS_SECRET: key(1) })).status).toBe(401);
  expect((await captureReadiness(request({ oversized: 'x'.repeat(2000) }), env)).status).toBe(413);
  expect((await captureReadiness(request({ workspaceId, requestId: other, ready: true }), env)).status).toBe(400);
  expect((await captureReadiness(request(null, key(4), 'GET'), env)).status).toBe(405);
});
it('bounds an authenticated client that never finishes its body', async () => {
  vi.useFakeTimers();
  try {
    const cancelled = vi.fn(), body = new ReadableStream<Uint8Array>({ cancel: cancelled });
    const pending = captureReadiness(new Request(request().url, { method: 'POST', headers: request().headers, body, duplex: 'half' } as RequestInit), env);
    await vi.advanceTimersByTimeAsync(2001); expect((await pending).status).toBe(400); expect(cancelled).toHaveBeenCalled();
  } finally { vi.useRealTimers(); }
});
