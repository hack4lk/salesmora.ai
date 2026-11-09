import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), read: vi.fn(), render: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./store', () => ({
  readReportChatSnapshot: mocks.read,
  ChatConflictError: class extends Error {}, ChatLimitError: class extends Error {},
}));
vi.mock('./report-result', () => ({ reportResultResponse: mocks.render }));
import { GET, POST } from '../../app/api/chat/reports/route';
import { AuthorizationAccessError } from '@salesmora/data';
import { reportSelectionExamples } from '../../../../../packages/contracts/src/reports/assistant-query.fixtures';
import { reportHref } from '../../features/reports/report-navigation';
const origin = 'http://localhost:3000';
const selection = reportSelectionExamples[1]!;
const input = { workspaceId: selection.query.workspaceId,
  turnId: '00000000-0000-4000-8000-000000000022', resultId: '00000000-0000-4000-8000-000000000023' };
const post = (body: object = input, requestOrigin = origin) => new Request(`${origin}/api/chat/reports`,
  { method: 'POST', headers: { origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const get = (values: Record<string, string> = input) => new Request(`${origin}/api/chat/reports?${new URLSearchParams(values)}`);
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('BETTER_AUTH_URL', origin);
  mocks.session.mockResolvedValue({ user: { id: 'current-session-viewer' } });
  mocks.read.mockResolvedValue({ binding: { selection } });
  mocks.render.mockReturnValue({ snapshot: { selection, result: { id: input.resultId } }, retrievedAt: '2026-11-09T15:00:00.000Z' });
});
describe('private report result and navigation HTTP', () => {
  it('binds result resolution to the current session, returns no-store presentation and no private native facts', async () => {
    const response = await GET(get());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(mocks.read).toHaveBeenCalledWith({ userId: 'current-session-viewer', workspaceId: input.workspaceId }, input.turnId, input.resultId);
    expect(await response.json()).toEqual(mocks.render.mock.results[0]!.value);
  });
  it.each(reportSelectionExamples)('navigates only from the revalidated saved $area / $query.view selection', async selected => {
    mocks.read.mockResolvedValueOnce({ binding: { selection: selected } });
    const response = await POST(post());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ href: reportHref(selected) });
    expect(mocks.render).not.toHaveBeenCalled();
  });
  it('rejects unauthenticated, foreign-origin, malformed and caller-authored query requests before result access', async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await GET(get())).status).toBe(401);
    expect((await POST(post(input, 'https://example.test'))).status).toBe(403);
    expect((await GET(get({ ...input, resultId: 'forged' }))).status).toBe(422);
    expect((await POST(post({ ...input, selection }))).status).toBe(422);
    expect((await GET(get({ ...input, href: '/reports/overview' }))).status).toBe(422);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('redacts revoked/stale/suspended results without successful navigation or a zero-valued result', async () => {
    mocks.read.mockRejectedValue(new AuthorizationAccessError());
    for (const response of [await GET(get()), await POST(post())]) {
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'access_denied' });
    }
    expect(mocks.render).not.toHaveBeenCalled();
  });
});
