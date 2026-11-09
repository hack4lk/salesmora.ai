import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./team-export', () => ({ previewWorkspaceTeamExport: mocks.preview, exportWorkspaceTeam: mocks.download }));
import { POST as previewPost } from '../../app/api/reports/team/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/team/export/route';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { teamExportInput, teamExportFilename } from '../../features/reports/team-report-workspace/team-export.client';
import { teamReadResponse, initialTeamQuery } from '../../features/reports/team-report-workspace/team-read.fixtures';
import { teamReportExportColumns } from '@salesmora/contracts';

const authority = teamReadResponse(initialTeamQuery), input = teamExportInput(initialTeamQuery, 'summary');
const metadata = { workspaceId: authority.workspaceId, policyRevision: authority.policyRevision, scope: { kind: 'workspace' },
  archiveVisibility: 'excluded', asOf: authority.report.asOf, today: authority.report.today, timezone: authority.report.timezone,
  dateBasis: 'current-snapshot', count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: authority.viewerId, inactivityCutoff: '2026-10-29T09:00:00.000000Z',
  coverage: 'Current authorized Team.', columns: teamReportExportColumns(input) };
const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
function request(body: unknown = input, headers = {}, suffix = '') {
  return new Request(`https://app.example.test/api/reports/team/export${suffix}`, {
    method: 'POST', headers: { origin: 'https://app.example.test', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
  mocks.session.mockResolvedValue({ user: { id: 'session-user' } }); mocks.preview.mockResolvedValue(preview);
  mocks.download.mockImplementation(async () => ({ input, id: generation.id, generation,
    stream: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode('CSV')); controller.close(); } }),
  }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe('Team private export HTTP', () => {
  it('uses session identity and private preview and download metadata', async () => {
    const result = await previewPost(request());
    expect(result.status).toBe(200); expect(await result.json()).toEqual(preview);
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    const req = request(), response = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain(teamExportFilename(input, metadata.today));
    expect(JSON.parse(Buffer.from(response.headers.get('x-report-export')!, 'base64url').toString())).toEqual(generation);
    expect(await response.text()).toBe('CSV');
  });
  it('rejects invalid origin and forged controls', async () => {
    expect((await previewPost(request(input, { origin: 'https://foreign.test' }))).status).toBe(403);
    expect((await previewPost(request(input, {}, '?dataset=evidence'))).status).toBe(422);
    expect((await previewPost(request({ ...input, query: { ...input.query, page: 1 } }))).status).toBe(422);
    expect((await previewPost(request({ ...input, scope: 'workspace' }))).status).toBe(422);
    expect((await previewPost(request({ padding: 'x'.repeat(16001) }))).status).toBe(413);
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('maps session, authority and limit failures', async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await previewPost(request())).status).toBe(401);
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new ReportExportLimitError(), 422]] as const) {
      mocks.preview.mockRejectedValueOnce(error);
      expect((await previewPost(request())).status).toBe(status);
    }
  });
});
