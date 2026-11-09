import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./activity-export', () => ({ previewWorkspaceActivityExport: mocks.preview, exportWorkspaceActivity: mocks.download }));
import { POST as previewPost } from '../../app/api/reports/activity/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/activity/export/route';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { activityReportExportColumns, activityReportExportInputSchema } from '@salesmora/contracts';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const input = activityReportExportInputSchema.parse({ dataset: 'evidence', query: {
  workspaceId, view: 'activity', period: { from: '2026-10-01', to: '2026-10-31' }, filters: { domains: [], actions: [], actors: [] },
} });
const metadata = { workspaceId, policyRevision: 1, asOf: '2026-11-05T12:00:00.000Z', today: '2026-11-05', timezone: 'UTC',
  includedDomains: [{ domain: 'lead', scope: 'assigned', archiveVisibility: 'excluded' }],
  omittedDomains: ['customer', 'job', 'estimate', 'work-order'].map(domain => ({ domain, reason: 'permissions' })),
  count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: 'session-user', coverage: 'Authorized histories.',
  columns: activityReportExportColumns(input) };
const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
function request(body: unknown = input, headers = {}, suffix = '') {
  return new Request(`https://app.example.test/api/reports/activity/export${suffix}`, {
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
describe('Activity private export HTTP', () => {
  it('uses session identity and private preview and download metadata', async () => {
    const response = await previewPost(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual(preview);
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const req = request(), download = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(download.status).toBe(200);
    expect(download.headers.get('content-disposition')).toContain('salesmora-activity-evidence-2026-11-05.csv');
    expect(JSON.parse(Buffer.from(download.headers.get('x-report-export')!, 'base64url').toString())).toEqual(generation);
    expect(await download.text()).toBe('CSV');
  });
  it('rejects invalid origin and forged controls', async () => {
    expect((await previewPost(request(input, { origin: 'https://foreign.test' }))).status).toBe(403);
    expect((await previewPost(request(input, {}, '?dataset=summary'))).status).toBe(422);
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
