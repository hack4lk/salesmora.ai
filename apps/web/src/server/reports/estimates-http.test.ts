import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceEstimateReport: mocks.read }));
import { GET } from '../../app/api/reports/estimates/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { estimateReportQuerySchema } from '@salesmora/contracts';
import { initialEstimateQuery, estimateReadResponse } from '../../features/reports/estimate-report-workspace/estimate-read.fixtures';

const request = (raw: unknown = initialEstimateQuery) =>
  new Request(`https://app.example.test/api/reports/estimates?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockImplementation((_user, query) => Promise.resolve(estimateReadResponse(query)));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Estimates HTTP boundary', () => {
  it('passes strict native queries for all views with session-only actor identity', async () => {
    for (const raw of [initialEstimateQuery,
      { workspaceId: initialEstimateQuery.workspaceId, view: 'estimate-first-quoted', period: { from: '2026-10-01', to: '2026-10-31' } },
      { workspaceId: initialEstimateQuery.workspaceId, view: 'estimate-current', selected: 'handoff' }]) {
      const query = estimateReportQuerySchema.parse(raw), response = await GET(request(query));
      await expectPrivate(response, 200);
      expect(await response.json()).toEqual(estimateReadResponse(query));
      expect(mocks.read).toHaveBeenLastCalledWith('session-viewer', query);
    }
  });
  it('rejects forged grants, current periods, malformed/duplicate controls and oversized queries before reading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/estimates?query=%7B')), 422);
    for (const raw of [{ ...initialEstimateQuery, viewerId: 'forged' }, { ...initialEstimateQuery, canReadMoney: true },
      { ...initialEstimateQuery, pageSize: 999 }, { ...initialEstimateQuery, filters: { owners: ['unassigned', 'unassigned'] } },
      { ...initialEstimateQuery, view: 'estimate-current', selected: 'awaiting' },
      { ...initialEstimateQuery, period: { from: '2025-01-01', to: '2026-01-02' } }]) {
      await expectPrivate(await GET(request(raw)), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps denied, suspended and unavailable selections to safe private responses', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private selection'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status); expect(await response.text()).not.toContain('private');
    }
  });
  it('logs unexpected native failures without disclosing frozen contents or SQL', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private frozen content'));
      const response = await GET(request());
      await expectPrivate(response, 500); expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Estimates report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
