import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), authorized: vi.fn(), list: vi.fn(), create: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorized }));
vi.mock('@salesmora/data', async importOriginal => {
  const actual = await importOriginal<typeof import('@salesmora/data')>();
  return { ...actual, listReportTemplatesInTransaction: mocks.list, createReportTemplateInTransaction: mocks.create };
});
import { AuthorizationAccessError, ReportTemplateConflictError } from '@salesmora/data';
import { reportTemplateHttp } from './template-http';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const create = { workspaceId, name: 'Activity', configuration: {
  area: 'activity', query: { view: 'activity' }, period: { preset: 'last30days' },
} };
const request = (body: unknown, origin = 'https://app.example.test') => new Request('https://app.example.test/api/reports/templates', {
  method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const list = () => new Request(`https://app.example.test/api/reports/templates?workspaceId=${workspaceId}&area=activity`);
function privateResponse(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
  mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.authorized.mockImplementation(async (_user, _workspace, _write, callback) => callback({}, {}));
  mocks.list.mockResolvedValue([]);
  mocks.create.mockResolvedValue({ id: 'fixture' });
});
afterEach(() => vi.unstubAllEnvs());
describe('personal report template HTTP boundary', () => {
  it('uses the session and workspace for list and create', async () => {
    privateResponse(await reportTemplateHttp(list(), 'list'), 200);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-viewer', workspaceId, false, expect.any(Function));
    privateResponse(await reportTemplateHttp(request(create), 'create'), 201);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-viewer', workspaceId, true, expect.any(Function));
    expect(mocks.create).toHaveBeenCalledWith({}, {}, create);
  });
  it('rejects anonymous, cross-origin, forged and oversized requests', async () => {
    mocks.session.mockResolvedValueOnce(null);
    privateResponse(await reportTemplateHttp(list(), 'list'), 401);
    privateResponse(await reportTemplateHttp(request(create, 'https://other.example.test'), 'create'), 403);
    privateResponse(await reportTemplateHttp(request({ ...create, ownerId: 'forged' }), 'create'), 422);
    privateResponse(await reportTemplateHttp(request({ ...create, name: 'x'.repeat(17000) }), 'create'), 413);
    privateResponse(await reportTemplateHttp(new Request(`${list().url}&ownerId=forged`), 'list'), 422);
    expect(mocks.authorized).not.toHaveBeenCalled();
  });
  it('maps authorization and conflicts without leaking implementation details', async () => {
    mocks.authorized.mockRejectedValueOnce(new AuthorizationAccessError());
    privateResponse(await reportTemplateHttp(list(), 'list'), 404);
    mocks.authorized.mockRejectedValueOnce(new ReportTemplateConflictError());
    privateResponse(await reportTemplateHttp(request(create), 'create'), 409);
  });
});
