import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./business-overview-export', () => ({ previewWorkspaceOverviewExport: mocks.preview, exportWorkspaceOverview: mocks.download }));
import { POST as previewPost } from '../../app/api/reports/overview/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/overview/export/route';
import { AuthorizationAccessError } from '@salesmora/data';
import { businessOverviewExportColumns, businessOverviewExportInputSchema } from '@salesmora/contracts';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const input = businessOverviewExportInputSchema.parse({ dataset: 'summary',
  query: { workspaceId, view: 'business-overview', period: { from: '2026-10-01', to: '2026-10-31' } } });
const metadata = { workspaceId, policyRevision: 1, asOf: '2026-11-05T12:00:00.000Z', today: '2026-11-05', timezone: 'UTC',
  scopes: { lead: null, job: 'assigned', estimate: null, calendar: null }, count: 4,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: 'session-user', coverage: 'Partial scope.', columns: businessOverviewExportColumns };
const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
function request(body: unknown = input, headers = {}, suffix = '') {
  return new Request(`https://app.example.test/api/reports/overview/export${suffix}`, {
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
describe('Overview private export HTTP', () => {
  it('binds preview and download to session identity and private metadata', async () => {
    const response = await previewPost(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual(preview);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    const req = request(), download = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(JSON.parse(Buffer.from(download.headers.get('x-report-export')!, 'base64url').toString())).toEqual(generation);
    expect(await download.text()).toBe('CSV');
  });
  it('rejects forged controls, cross-origin requests and revoked access', async () => {
    expect((await previewPost(request(input, { origin: 'https://foreign.test' }))).status).toBe(403);
    expect((await previewPost(request(input, {}, '?dataset=summary'))).status).toBe(422);
    expect((await previewPost(request({ ...input, scope: 'workspace' }))).status).toBe(422);
    expect(mocks.preview).not.toHaveBeenCalled();
    mocks.preview.mockRejectedValueOnce(new AuthorizationAccessError());
    expect((await previewPost(request())).status).toBe(404);
  });
});
