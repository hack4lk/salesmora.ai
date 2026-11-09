import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceLeadReport: mocks.read }));
import { GET } from '../../app/api/reports/leads/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { initialLeadReportQuery, leadReportBackendResponse } from '../../features/reports/lead-report-workspace/lead-report.adapter.fixtures';

const request = (raw: unknown = initialLeadReportQuery) => new Request(`https://app.example.test/api/reports/leads?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'signed-in-user' } }); mocks.read.mockResolvedValue(leadReportBackendResponse(initialLeadReportQuery)); });
describe('Leads report HTTP boundary', () => {
  it('passes only the session actor and strict request to the authorized store with private headers', async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(mocks.read).toHaveBeenCalledWith('signed-in-user', initialLeadReportQuery);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie');
  });
  it('denies unauthenticated, duplicate, unknown, malformed and oversized requests before querying', async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await GET(request())).status).toBe(401);
    const url = request().url;
    for (const suffix of ['&query={}', '&role=owner']) expect((await GET(new Request(url + suffix))).status).toBe(422);
    expect((await GET(new Request('https://app.example.test/api/reports/leads?query=%7B'))).status).toBe(422);
    expect((await GET(request({ ...initialLeadReportQuery, userId: 'forged' }))).status).toBe(422);
    expect((await GET(request({ ...initialLeadReportQuery, filters: { stages: ['new', 'new'], owners: [], sources: [] } }))).status).toBe(422);
    expect((await GET(request({ ...initialLeadReportQuery, pageSize: 1000 }))).status).toBe(422);
    expect((await GET(request('x'.repeat(16001)))).status).toBe(413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('keeps disabled Reports and foreign workspaces unavailable, distinguishes suspension and exposes no server details', async () => {
    mocks.read.mockRejectedValueOnce(new AuthorizationAccessError());
    expect((await GET(request())).status).toBe(404);
    mocks.read.mockRejectedValueOnce(new WorkspaceSuspendedError());
    expect((await GET(request())).status).toBe(423);
    mocks.read.mockRejectedValueOnce(new RangeError('private filter detail'));
    const invalid = await GET(request()); expect(invalid.status).toBe(422); expect(await invalid.text()).not.toContain('private');
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL payload'));
      const failed = await GET(request()); expect(failed.status).toBe(500); expect(await failed.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Leads report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
