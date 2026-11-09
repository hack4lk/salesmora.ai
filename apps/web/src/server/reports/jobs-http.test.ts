import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceJobReport: mocks.read }));
import { GET } from '../../app/api/reports/jobs/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { jobReportQuerySchema } from '@salesmora/contracts';
import { initialJobQuery, jobReadResponse } from '../../features/reports/job-report-workspace/job-read.fixtures';

const request = (raw: unknown = initialJobQuery) =>
  new Request(`https://app.example.test/api/reports/jobs?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockImplementation((_user, query) => Promise.resolve(jobReadResponse(query)));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Jobs HTTP boundary', () => {
  it('passes only session identity and strict native queries for all three views', async () => {
    for (const raw of [initialJobQuery, { ...initialJobQuery, view: 'completion', selectedView: undefined, selectedDate: '2026-10-12' },
      { workspaceId: initialJobQuery.workspaceId, view: 'workload', filters: { statuses: [], owners: [], services: [] },
        selection: { kind: 'group', group: 'waitingReason', id: 'materials' } }]) {
      const query = jobReportQuerySchema.parse(JSON.parse(JSON.stringify(raw)));
      const response = await GET(request(query));
      await expectPrivate(response, 200);
      expect(await response.json()).toEqual(jobReadResponse(query));
      expect(mocks.read).toHaveBeenLastCalledWith('session-viewer', query);
    }
  });
  it('rejects forged identity, current dates, malformed, duplicate and oversized controls before reading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/jobs?query=%7B')), 422);
    const current = { workspaceId: initialJobQuery.workspaceId, view: 'workload',
      filters: { statuses: [], owners: [], services: [] }, selection: { kind: 'metric', metric: 'active' } };
    for (const raw of [{ ...initialJobQuery, viewerId: 'forged' }, { ...initialJobQuery, pageSize: 999 },
      { ...current, period: { from: '2026-10-01', to: '2026-10-31' } },
      { ...current, filters: { statuses: ['completed'], owners: [], services: [] } },
      { ...initialJobQuery, filters: { statuses: [], owners: ['unassigned', 'unassigned'], services: [] } },
      { ...initialJobQuery, view: 'completion', selectedView: undefined, selectedDate: '2026-11-01' }]) {
      await expectPrivate(await GET(request(raw)), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps denied, suspended and invalid-selection failures to safe private responses', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private detail'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status); expect(await response.text()).not.toContain('private');
    }
  });
  it('logs unexpected native failures without exposing internals', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL detail'));
      const response = await GET(request());
      await expectPrivate(response, 500); expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Jobs report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
