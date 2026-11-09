import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceCalendarReport: mocks.read }));
import { GET } from '../../app/api/reports/calendar/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { initialCalendarQuery, calendarReadResponse } from '../../features/reports/calendar-report-workspace/calendar-read.fixtures';

const request = (raw: unknown = initialCalendarQuery) =>
  new Request(`https://app.example.test/api/reports/calendar?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockResolvedValue(calendarReadResponse(initialCalendarQuery));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Calendar HTTP boundary', () => {
  it('passes only current session identity and strict native Calendar query', async () => {
    const response = await GET(request());
    await expectPrivate(response, 200);
    expect(await response.json()).toEqual(calendarReadResponse(initialCalendarQuery));
    expect(mocks.read).toHaveBeenCalledWith('session-viewer', initialCalendarQuery);
  });
  it('rejects forged identity, unsupported undated dates, malformed, duplicate and oversized controls before reading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/calendar?query=%7B')), 422);
    for (const raw of [{ ...initialCalendarQuery, viewerId: 'forged' }, { ...initialCalendarQuery, pageSize: 999 },
      { ...initialCalendarQuery, view: 'calendar-unscheduled', selected: 'visits' },
      { ...initialCalendarQuery, filters: { participants: ['alex', 'alex'], recordTypes: [] } }]) {
      await expectPrivate(await GET(request(raw)), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps denied, suspended and invalid-selection failures to private safe responses', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private detail'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status); expect(await response.text()).not.toContain('private');
    }
  });
  it('reports unexpected native failures without exposing private internals', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL detail'));
      const response = await GET(request());
      await expectPrivate(response, 500); expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Calendar report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
