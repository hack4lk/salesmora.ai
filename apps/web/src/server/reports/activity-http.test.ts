import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceActivityReport: mocks.read }));
import { GET } from '../../app/api/reports/activity/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { activityReportQuerySchema } from '@salesmora/contracts';
import { initialActivityQuery, activityReadResponse } from '../../features/reports/activity-report/activity-read.fixtures';

const request = (raw: unknown = initialActivityQuery) =>
  new Request(`https://app.example.test/api/reports/activity?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockImplementation((_user, query) => Promise.resolve(activityReadResponse(query)));
});
function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Activity HTTP boundary', () => {
  it('reads with session identity and preserves native facet normalization', async () => {
    const raw = { ...initialActivityQuery, filters: { domains: ['lead', 'lead'], actions: [], actors: [] } };
    const query = activityReportQuerySchema.parse(raw), response = await GET(request(raw));
    expectPrivate(response, 200); expect(await response.json()).toEqual(activityReadResponse(query));
    expect(mocks.read).toHaveBeenCalledWith('session-viewer', query);
  });
  it('rejects forged actors/grants, invalid dates, unknown controls and oversized queries before reading', async () => {
    mocks.session.mockResolvedValueOnce(null); expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) expectPrivate(await GET(new Request(request().url + suffix)), 422);
    expectPrivate(await GET(new Request('https://app.example.test/api/reports/activity?query=%7B')), 422);
    for (const raw of [{ ...initialActivityQuery, viewerId: 'forged' }, { ...initialActivityQuery, authority: { scope: 'workspace' } },
      { ...initialActivityQuery, pageSize: 999 }, { ...initialActivityQuery, filters: { domains: [], actions: ['note'], actors: [] } },
      { ...initialActivityQuery, period: { from: '2025-01-01', to: '2026-01-02' } }]) expectPrivate(await GET(request(raw)), 422);
    expectPrivate(await GET(request('x'.repeat(16001))), 413); expect(mocks.read).not.toHaveBeenCalled();
  });
  it('returns safe denied/suspended/range failures without disclosing native contents', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private history'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error); const response = await GET(request());
      expectPrivate(response, status); expect(await response.text()).not.toContain('private history');
    }
  });
  it('logs unsupported native failures without returning changes or private history', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private history payload')); const response = await GET(request());
      expectPrivate(response, 500); expect(await response.text()).not.toContain('private history');
      expect(log).toHaveBeenCalledWith('Activity report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
