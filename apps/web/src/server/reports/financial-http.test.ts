import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceFinancialReport: mocks.read }));
import { GET } from '../../app/api/reports/financial/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { initialFinancialQuery, financialReadResponse } from '../../features/reports/financial-report/financial-read.fixtures';
const request = (raw: unknown = initialFinancialQuery) =>
  new Request(`https://app.example.test/api/reports/financial?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockImplementation((_user, query) => Promise.resolve(financialReadResponse(query)));
});
function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store'); expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Financial HTTP boundary', () => {
  it('loads each selected native subsection using session identity only', async () => {
    for (const selected of ['accepted', 'awaiting', 'materials'] as const) {
      const query = { ...initialFinancialQuery, selected }, response = await GET(request(query));
      expectPrivate(response, 200); expect(await response.json()).toEqual(financialReadResponse(query));
      expect(mocks.read).toHaveBeenLastCalledWith('session-viewer', query);
    }
  });
  it('rejects forged authority, unsupported filters, duplicate controls, malformed dates and oversized input before reading', async () => {
    mocks.session.mockResolvedValueOnce(null); expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) expectPrivate(await GET(new Request(request().url + suffix)), 422);
    expectPrivate(await GET(new Request('https://app.example.test/api/reports/financial?query=%7B')), 422);
    for (const raw of [{ ...initialFinancialQuery, viewerId: 'forged' }, { ...initialFinancialQuery, authority: { financial: true } },
      { ...initialFinancialQuery, filters: { owners: [] } }, { ...initialFinancialQuery, selected: 'known' },
      { ...initialFinancialQuery, pageSize: 999 }, { ...initialFinancialQuery, period: { from: '2025-01-01', to: '2026-01-02' } }]) {
      expectPrivate(await GET(request(raw)), 422);
    }
    expectPrivate(await GET(request('x'.repeat(16001))), 413); expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps safe denial, suspension and range failures without disclosing monetary contents', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private costs'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error); const response = await GET(request());
      expectPrivate(response, status); expect(await response.text()).not.toContain('private costs');
    }
  });
  it('logs unexpected native failures without returning private values', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private frozen value')); const response = await GET(request());
      expectPrivate(response, 500); expect(await response.text()).not.toContain('private frozen value');
      expect(log).toHaveBeenCalledWith('Financial report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
