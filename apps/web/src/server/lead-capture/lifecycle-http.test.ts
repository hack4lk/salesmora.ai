import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), change: vi.fn(), database: {} }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('../workspaces/store', () => ({ database: () => mocks.database }));
vi.mock('../authorization/permissions', () => ({ enabledPermissions: ['leadCapture.read', 'leadCapture.pause', 'leadCapture.archive'] }));
vi.mock('@salesmora/data', async importOriginal => ({ ...await importOriginal<typeof import('@salesmora/data')>(), changeCaptureLifecycle: mocks.change }));
import { POST } from '../../app/api/lead-capture/[sourceId]/lifecycle/route';
import { AuthorizationAccessError, CapturePublicationError } from '@salesmora/data';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002';
const input = { workspaceId, sourceId, requestId: workspaceId, expectedVersion: 2, action: 'pause', confirmed: true };
const context = { params: Promise.resolve({ sourceId }) };
function request(body: unknown = input, origin = 'https://app.example.test') {
  return new Request(`https://app.example.test/api/lead-capture/${sourceId}/lifecycle`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
beforeEach(() => { vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test'); vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'signed-in-user' } }); mocks.change.mockResolvedValue({ ok: true, sourceId, sourceVersion: 3 }); });
afterEach(() => vi.unstubAllEnvs());
describe('capture lifecycle HTTP boundary', () => {
  it('uses the signed-in actor and preserves private response headers', async () => {
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(mocks.change).toHaveBeenCalledWith(mocks.database, { userId: 'signed-in-user', workspaceId }, ['leadCapture.read', 'leadCapture.pause', 'leadCapture.archive'], input, expect.objectContaining({ websiteReady: expect.any(Function), gmailReady: expect.any(Function) }));
    expect(response.headers.get('cache-control')).toContain('no-store'); expect(response.headers.get('vary')).toBe('Cookie');
  });
  it('denies cross-origin writes and unauthenticated callers before mutation', async () => {
    expect((await POST(request(input, 'https://forms-staging.salesmora.ai'), context)).status).toBe(403);
    expect((await POST(request(input, ''), context)).status).toBe(403);
    mocks.session.mockResolvedValue(null);
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it('rejects route/body identity mismatches and malformed or oversized JSON', async () => {
    expect((await POST(request({ ...input, sourceId: workspaceId }), context)).status).toBe(422);
    expect((await POST(request({ ...input, workspaceId: 'invalid' }), context)).status).toBe(404);
    const malformed = new Request(request().url, { method: 'POST', headers: { Origin: 'https://app.example.test' }, body: '{' });
    expect((await POST(malformed, context)).status).toBe(422);
    expect((await POST(request({ ...input, oversized: 'x'.repeat(2_000_001) }), context)).status).toBe(413);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it('returns scoped denial, version conflicts and readiness failures without leaking details', async () => {
    mocks.change.mockRejectedValue(new AuthorizationAccessError()); expect((await POST(request(), context)).status).toBe(404);
    mocks.change.mockRejectedValue(new CapturePublicationError('conflict')); expect((await POST(request(), context)).status).toBe(409);
    mocks.change.mockRejectedValue(new CapturePublicationError('readiness', ['delivery'])); const response = await POST(request(), context);
    expect(response.status).toBe(422); expect((await response.json()).failures).toEqual(['delivery']);
    mocks.change.mockRejectedValue(Error('private database connection detail')); const failure = await POST(request(), context);
    expect(failure.status).toBe(500); expect(await failure.text()).not.toContain('private database');
  });
});
