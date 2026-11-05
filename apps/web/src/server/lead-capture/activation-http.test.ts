import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), review: vi.fn(), publish: vi.fn(), read: vi.fn(), change: vi.fn(), database: {} }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('../workspaces/store', () => ({ database: () => mocks.database }));
vi.mock('../authorization/permissions', () => ({ enabledPermissions: ['leadCapture.read', 'leadCapture.activate', 'leadCapture.pause'] }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(), readCapturePublicationReview: mocks.review, publishCaptureDraft: mocks.publish, readCaptureSource: mocks.read, changeCaptureLifecycle: mocks.change }));
import { GET as review, POST as publish } from '../../app/api/lead-capture/[sourceId]/publication/route';
import { GET as read } from '../../app/api/lead-capture/[sourceId]/route';
import { POST as change } from '../../app/api/lead-capture/[sourceId]/lifecycle/route';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002', origin = 'http://127.0.0.1:3024';
const context = { params: Promise.resolve({ sourceId }) };
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'signed-in-owner' } });
  for (const mock of [mocks.review, mocks.publish, mocks.read, mocks.change]) mock.mockResolvedValue({ ok: true });
  const env = { NODE_ENV: 'test', BETTER_AUTH_URL: origin, CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3024', CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'true', CAPTURE_PUBLICATION_WORKSPACE_IDS: workspaceId, CAPTURE_SUBMISSIONS_ENABLED: 'true', CAPTURE_CONTEXT_SECRET: Buffer.alloc(32, 1).toString('base64'), CAPTURE_ABUSE_SECRET: Buffer.alloc(32, 2).toString('base64'), CAPTURE_CLIENT_IP_MODE: 'loopback', TURNSTILE_SITE_KEY: 'fixture', TURNSTILE_SECRET_KEY: 'local-fixture-provider-secret' };
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
});
afterEach(() => vi.unstubAllEnvs());
it('passes checked server authority through all API reads/writes, with workspace-bound installation origin', async () => {
  const get = new Request(`${origin}/api/lead-capture/${sourceId}?workspace=${workspaceId}`);
  const post = () => new Request(get.url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, sourceId }) });
  for (const response of [await review(get, context), await read(get, context), await publish(post(), context), await change(post(), context)]) expect(response.status).toBe(200);
  const trx = { schema: { hasTable: vi.fn().mockResolvedValue(true) } };
  for (const [mock, position] of [[mocks.review, 4], [mocks.publish, 4], [mocks.change, 4], [mocks.read, 5]] as const) {
    const authority = mock.mock.calls[0][position]; expect(await authority.websiteReady(trx, workspaceId)).toBe(true); expect(await authority.websiteReady(trx, sourceId)).toBe(false);
  }
  expect(mocks.read.mock.calls[0][4]).toBe('http://localhost:3024');
  vi.stubEnv('CAPTURE_PUBLICATION_WORKSPACE_IDS', sourceId); await read(get, context); expect(mocks.read.mock.calls[1][4]).toBeUndefined();
});
