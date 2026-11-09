import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceBusinessOverview: mocks.read }));
import { GET } from '../../app/api/reports/overview/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { initialOverviewQuery, overviewReadResponse } from '../../features/reports/business-overview/business-overview-read.fixtures';

const request = (raw: unknown = initialOverviewQuery) =>
  new Request(`https://app.example.test/api/reports/overview?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockResolvedValue(overviewReadResponse(initialOverviewQuery));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Overview HTTP boundary', () => {
  it('passes only current session identity and strict Overview query', async () => {
    const response = await GET(request());
    await expectPrivate(response, 200);
    expect(await response.json()).toEqual(overviewReadResponse(initialOverviewQuery));
    expect(mocks.read).toHaveBeenCalledWith('session-viewer', initialOverviewQuery);
  });
  it('rejects unsigned, malformed, duplicated, oversized and unsupported controls before reading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/overview?query=%7B')), 422);
    for (const patch of [{ viewerId: 'forged' }, { filters: {} }, { page: 1 }, { period: { from: '2026-11-06', to: '2026-10-01' } }]) {
      await expectPrivate(await GET(request({ ...initialOverviewQuery, ...patch })), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps denied, suspended and invalid-date failures to private safe responses', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private detail'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status);
      expect(await response.text()).not.toContain('private');
    }
  });
  it('reports unexpected native failures without exposing private internals', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL detail'));
      const response = await GET(request());
      await expectPrivate(response, 500);
      expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Business Overview report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
