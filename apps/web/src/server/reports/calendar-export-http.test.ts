import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./calendar-export', () => ({ previewWorkspaceCalendarExport: mocks.preview, exportWorkspaceCalendar: mocks.download }));
import { POST as previewPost } from '../../app/api/reports/calendar/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/calendar/export/route';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { calendarExportInput, calendarExportFilename } from '../../features/reports/calendar-report-workspace/calendar-export.client';
import { calendarReadResponse, initialCalendarQuery } from '../../features/reports/calendar-report-workspace/calendar-read.fixtures';
import { calendarExportColumns } from '@salesmora/contracts';

const authority = calendarReadResponse(initialCalendarQuery), input = calendarExportInput(initialCalendarQuery, 'summary');
const metadata = { workspaceId: authority.workspaceId, policyRevision: authority.policyRevision, scope: authority.scope,
  outputScopes: authority.exportScopes, asOf: authority.report.asOf, today: authority.report.today, timezone: authority.report.timezone,
  dateBasis: 'current-scheduled-date', count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: authority.viewerId, coverage: 'Current authorized schedule.', columns: calendarExportColumns(input) };
const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
function request(body: unknown = input, headers = {}, suffix = '') {
  return new Request(`https://app.example.test/api/reports/calendar/export${suffix}`, {
    method: 'POST', headers: { origin: 'https://app.example.test', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
  mocks.session.mockResolvedValue({ user: { id: 'session-user' } }); mocks.preview.mockResolvedValue(preview);
  mocks.download.mockImplementation(async () => ({ ...preview, id: generation.id, generation,
    stream: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode('CSV')); controller.close(); } }),
  }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe('Calendar private export HTTP', () => {
  it('uses session identity and private preview metadata', async () => {
    const response = await previewPost(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual(preview);
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('streams generation with safe filename and request cancellation', async () => {
    const req = request(), response = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain(calendarExportFilename(input, metadata.today));
    expect(JSON.parse(Buffer.from(response.headers.get('x-report-export')!, 'base64url').toString())).toEqual(generation);
    expect(await response.text()).toBe('CSV');
  });
  it('rejects origin, query controls, pagination, media type and oversized bodies before service calls', async () => {
    expect((await previewPost(request(input, { origin: 'https://foreign.test' }))).status).toBe(403);
    expect((await previewPost(request(input, {}, '?dataset=visits'))).status).toBe(422);
    expect((await previewPost(request({ ...input, query: { ...input.query, page: 1 } }))).status).toBe(422);
    expect((await previewPost(request(input, { 'content-type': 'text/plain' }))).status).toBe(415);
    expect((await previewPost(request({ padding: 'x'.repeat(16001) }))).status).toBe(413);
    expect(mocks.preview).not.toHaveBeenCalled(); expect(mocks.download).not.toHaveBeenCalled();
  });
  it('maps missing session, denied authority and limits without server details', async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await previewPost(request())).status).toBe(401);
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new ReportExportLimitError(), 422]] as const) {
      mocks.preview.mockRejectedValueOnce(error);
      expect((await previewPost(request())).status).toBe(status);
    }
  });
});
