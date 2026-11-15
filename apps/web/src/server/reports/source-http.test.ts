import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceLeadSourceReport: mocks.read }));
import { GET } from '../../app/api/reports/sources/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { initialLeadSourceQuery, sourceReadResponse } from '../../features/reports/lead-source-report/lead-source-read.fixtures';

const request = (raw: unknown = initialLeadSourceQuery) =>
  new Request(`https://app.example.test/api/reports/sources?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'signed-in-user' } });
  mocks.read.mockResolvedValue(sourceReadResponse(initialLeadSourceQuery));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Sources HTTP boundary', () => {
  it('passes only the strict query and session actor through the authorized store', async () => {
    const response = await GET(request());
    await expectPrivate(response, 200);
    expect(await response.json()).toEqual(sourceReadResponse(initialLeadSourceQuery));
    expect(mocks.read).toHaveBeenCalledWith('signed-in-user', initialLeadSourceQuery);
  });
  it('rejects signed-out, duplicate, oversized, malformed, identity and unsupported facet requests before reads', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/sources')), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/sources?query=%7B')), 422);
    for (const raw of [{ ...initialLeadSourceQuery, userId: 'forged' }, { ...initialLeadSourceQuery, filters: {} },
      { ...initialLeadSourceQuery, selected: 'unknown' }, { ...initialLeadSourceQuery, pageSize: 1000 }]) {
      await expectPrivate(await GET(request(raw)), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('preserves private headers and safe denial/suspension/invalid-selection errors', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private date detail'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status);
      expect(await response.text()).not.toContain('private');
    }
  });
  it('reports server failure explicitly without SQL or private payloads', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL payload'));
      const response = await GET(request());
      await expectPrivate(response, 500);
      expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Sources report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
