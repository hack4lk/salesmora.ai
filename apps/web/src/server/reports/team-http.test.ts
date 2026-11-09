import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({ workspaceTeamReport: mocks.read }));
import { GET } from '../../app/api/reports/team/route';
import { AuthorizationAccessError, WorkspaceSuspendedError } from '@salesmora/data';
import { teamReportQuerySchema } from '@salesmora/contracts';
import { initialTeamQuery, teamReadResponse } from '../../features/reports/team-report-workspace/team-read.fixtures';

const request = (raw: unknown = initialTeamQuery) =>
  new Request(`https://app.example.test/api/reports/team?${new URLSearchParams({ query: JSON.stringify(raw) })}`);
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-viewer' } });
  mocks.read.mockImplementation((_user, query) => Promise.resolve(teamReadResponse(query)));
});
async function expectPrivate(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('vary')).toBe('Cookie');
}
describe('Team HTTP boundary', () => {
  it('passes session identity and strict current queries for both native domains', async () => {
    for (const raw of [initialTeamQuery,
      { ...initialTeamQuery, selected: { kind: 'owner', id: 'member:member-a', inactiveOnly: true } },
      { ...initialTeamQuery, view: 'team-jobs', selected: { kind: 'member', id: 'member-b', responsibility: 'supporting', filter: 'overdue' } }]) {
      const query = teamReportQuerySchema.parse(raw), response = await GET(request(query));
      await expectPrivate(response, 200);
      expect(await response.json()).toEqual(teamReadResponse(query));
      expect(mocks.read).toHaveBeenLastCalledWith('session-viewer', query);
    }
  });
  it('rejects forged identity, period controls, invalid selections, duplicate and oversized queries before reading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expectPrivate(await GET(request()), 401);
    for (const suffix of ['&query={}', '&role=owner']) await expectPrivate(await GET(new Request(request().url + suffix)), 422);
    await expectPrivate(await GET(new Request('https://app.example.test/api/reports/team?query=%7B')), 422);
    for (const raw of [{ ...initialTeamQuery, viewerId: 'forged' }, { ...initialTeamQuery, pageSize: 999 },
      { ...initialTeamQuery, period: { from: '2026-10-01', to: '2026-10-31' } },
      { ...initialTeamQuery, filters: { members: ['member-a', 'member-a'] } },
      { ...initialTeamQuery, filters: { members: ['unassigned'] } },
      { ...initialTeamQuery, selected: { kind: 'owner', id: 'member:member-a', stage: 'new', inactiveOnly: true } }]) {
      await expectPrivate(await GET(request(raw)), 422);
    }
    await expectPrivate(await GET(request('x'.repeat(16001))), 413);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('maps unavailable domain/member and suspended workspace failures to safe private responses', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new RangeError('private detail'), 422]] as const) {
      mocks.read.mockRejectedValueOnce(error);
      const response = await GET(request());
      await expectPrivate(response, status); expect(await response.text()).not.toContain('private');
    }
  });
  it('logs unexpected native failures without exposing internal details', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mocks.read.mockRejectedValueOnce(new Error('private SQL detail'));
      const response = await GET(request());
      await expectPrivate(response, 500); expect(await response.text()).not.toContain('private');
      expect(log).toHaveBeenCalledWith('Team report could not be loaded or failed server contract validation.');
    } finally { log.mockRestore(); }
  });
});
