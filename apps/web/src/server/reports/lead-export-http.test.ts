import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./lead-export', () => ({ previewWorkspaceLeadReportExport: mocks.preview, exportWorkspaceLeadReport: mocks.download }));
import { POST as previewPost } from '../../app/api/reports/leads/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/leads/export/route';
import { AuthorizationAccessError, WorkspaceSuspendedError, ReportExportLimitError } from '@salesmora/data';
import { leadReportExportInputSchema, leadReportExportColumns, leadReportExportGenerationSchema } from '@salesmora/contracts';
import { initialLeadReportQuery } from '../../features/reports/lead-report-workspace/lead-report.adapter.fixtures';

const input = leadReportExportInputSchema.parse({ query: Object.fromEntries(
  Object.entries(initialLeadReportQuery).filter(([key]) => key !== 'page' && key !== 'pageSize'),
), dataset: 'evidence' });
const query = input.query;
const preview = { input, workspaceId: query.workspaceId, viewerId: 'session-user', policyRevision: 1,
  scope: 'workspace', archiveVisibility: 'included', asOf: '2026-11-05T12:00:00Z', today: '2026-11-05',
  timezone: 'Europe/Warsaw', dateBasis: 'creation-date', coverage: 'Native authorized report.', count: 131,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, columns: leadReportExportColumns(input) };
const id = '00000000-0000-4000-8000-000000000099';
const csv = '\uFEFF"report_view","dataset"\r\n"intake","evidence"\r\n';
function result(stream = new ReadableStream<Uint8Array>({ start(controller) {
  controller.enqueue(new TextEncoder().encode(csv)); controller.close();
} })) {
  return { ...preview, id, stream, completion: Promise.resolve({ outcome: 'completed', rowsSent: 131, bytesSent: 1 }) };
}
function request(body: unknown = input, patch: { headers?: Record<string, string>; suffix?: string } = {}) {
  return new Request(`https://app.example.test/api/reports/leads/export${patch.suffix ?? ''}`, {
    method: 'POST', headers: { origin: 'https://app.example.test', 'content-type': 'application/json', ...patch.headers },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
  mocks.session.mockResolvedValue({ user: { id: 'session-user' } });
  mocks.preview.mockResolvedValue(preview); mocks.download.mockImplementation(async () => result());
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe('Leads report CSV private HTTP boundary', () => {
  it('binds live preview to only the session actor and strict pagination-free input', async () => {
    const response = await previewPost(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual(preview);
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie'); expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it('exposes fresh generation metadata, safe native filename and unbuffered CSV while passing request cancellation', async () => {
    const req = request(), generation = { ...result(), policyRevision: 2, count: 132, scope: 'assigned' };
    mocks.download.mockResolvedValueOnce(generation);
    const response = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="salesmora-leads-intake-evidence-2026-11-05.csv"');
    expect(response.headers.get('x-accel-buffering')).toBe('no');
    const metadata = leadReportExportGenerationSchema.parse(JSON.parse(Buffer.from(response.headers.get('x-report-export')!, 'base64url').toString()));
    expect(metadata).toMatchObject({ id, count: 132, policyRevision: 2, scope: 'assigned', limits: preview.limits });
    expect(metadata).not.toHaveProperty('viewerId'); expect(metadata).not.toHaveProperty('input');
    expect(response.headers.get('x-report-export')!.length).toBeLessThan(2048);
    expect(Buffer.from(await response.arrayBuffer()).toString('utf8')).toBe(csv);
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('denies missing/mismatching origins, cross-site requests and signed-out sessions before data access', async () => {
    for (const post of [previewPost, downloadPost]) {
      expect((await post(request(input, { headers: { origin: '' } }))).status).toBe(403);
      expect((await post(request(input, { headers: { origin: 'https://foreign.example.test' } }))).status).toBe(403);
      expect((await post(request(input, { headers: { 'sec-fetch-site': 'cross-site' } }))).status).toBe(403);
      mocks.session.mockResolvedValueOnce(null);
      expect((await post(request())).status).toBe(401);
    }
    expect(mocks.preview).not.toHaveBeenCalled(); expect(mocks.download).not.toHaveBeenCalled();
  });
  it('rejects malformed, foreign actor, pagination, unsupported dataset and unknown query controls before reading', async () => {
    for (const post of [previewPost, downloadPost]) {
      for (const raw of [{ ...input, actorId: 'forged' }, { ...input, query: { ...query, page: 1 } },
        { ...input, query: { ...query, pageSize: 100 } }, { ...input, dataset: 'outcomes' },
        { ...input, query: { ...query, filters: { ...query.filters, owners: ['me', 'me'] } } }]) {
        expect((await post(request(raw))).status).toBe(422);
      }
      expect((await post(request(input, { suffix: '?dataset=evidence' }))).status).toBe(422);
      expect((await post(request(input, { headers: { 'content-type': 'text/plain' } }))).status).toBe(415);
      expect((await post(new Request(request().url, { method: 'POST', headers: request().headers, body: '{' }))).status).toBe(422);
    }
    expect(mocks.preview).not.toHaveBeenCalled(); expect(mocks.download).not.toHaveBeenCalled();
  });
  it('bounds streamed UTF-8 request bytes even without Content-Length and cancels an oversized upload', async () => {
    const cancel = vi.fn();
    const init: RequestInit & { duplex: 'half' } = { method: 'POST', headers: request().headers,
      body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('Ł'.repeat(8001))); }, cancel }),
      duplex: 'half' };
    const req = new Request(request().url, init);
    expect((await previewPost(req)).status).toBe(413); expect(cancel).toHaveBeenCalled();
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('distinguishes unavailable, suspension, limit and native selection errors without disclosing data', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new WorkspaceSuspendedError(), 423],
      [new ReportExportLimitError(), 422], [new RangeError('PRIVATE_SELECTION'), 422]] as const) {
      for (const [post, read] of [[previewPost, mocks.preview], [downloadPost, mocks.download]] as const) {
        read.mockRejectedValueOnce(error); const response = await post(request());
        expect(response.status).toBe(status); expect(await response.text()).not.toContain('PRIVATE');
      }
    }
  });
  it('logs failures content-free, rejects invalid server output and cancels generation before returning JSON errors', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.preview.mockRejectedValueOnce(new Error('PRIVATE_SQL'));
    const failed = await previewPost(request());
    expect(failed.status).toBe(500); expect(await failed.text()).not.toContain('PRIVATE');
    mocks.preview.mockResolvedValueOnce({ ...preview, columns: ['notes'] });
    expect((await previewPost(request())).status).toBe(500);
    const cancel = vi.fn(), stream = new ReadableStream<Uint8Array>({ cancel });
    mocks.download.mockResolvedValueOnce({ ...result(stream), id: 'invalid' });
    expect((await downloadPost(request())).status).toBe(500); expect(cancel).toHaveBeenCalled();
    expect(log.mock.calls).toEqual(Array.from({ length: 3 }, () => [
      'Leads report CSV request could not be completed or failed server contract validation.',
    ]));
  });
  it('rejects generation belonging to another input, workspace or date basis and closes its unused stream', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (const patch of [{ workspaceId: id }, { dateBasis: 'current-snapshot' }, { input: { ...input, dataset: 'intake-days' } }]) {
      const cancel = vi.fn(), stream = new ReadableStream<Uint8Array>({ cancel });
      mocks.download.mockResolvedValueOnce({ ...result(stream), ...patch });
      expect((await downloadPost(request())).status).toBe(500);
      expect(cancel).toHaveBeenCalled();
    }
  });
  it('serves full evidence and the applicable table dataset for every native view, including zero-row evidence', async () => {
    const filters = { stages: [], owners: [], sources: [] }, period = { from: '2026-10-01', to: '2026-10-31' };
    const variants = [
      { view: 'intake', period, currentFilters: filters }, { view: 'won', period }, { view: 'lost', period },
      { view: 'pipeline', selection: { kind: 'pipeline' } }, { view: 'age', selection: { kind: 'age', band: '31+' } },
      { view: 'attention', selection: 'combined' },
    ];
    const tables = ['intake-days', 'outcomes', 'outcomes', 'pipeline-stages', 'age-bands', 'attention-categories'];
    for (const [index, variant] of variants.entries()) {
      for (const dataset of ['evidence', tables[index], ...(index === 0 ? ['intake-sources'] : [])]) {
        const submitted = leadReportExportInputSchema.parse({ query: { workspaceId: query.workspaceId, filters, ...variant }, dataset });
        const count = dataset === 'evidence' ? 0 : 3;
        const context = { ...preview, input: submitted, columns: leadReportExportColumns(submitted), count,
          dateBasis: index === 0 ? 'creation-date' : index < 3 ? 'recorded-transition-date' : 'current-snapshot' };
        mocks.preview.mockResolvedValueOnce(context);
        expect((await previewPost(request(submitted))).status).toBe(200);
        mocks.download.mockResolvedValueOnce({ ...result(), ...context });
        const response = await downloadPost(request(submitted));
        expect(response.status).toBe(200);
        expect(response.headers.get('content-disposition')).toContain(`${variant.view}-${dataset}-2026-11-05.csv`);
        await response.arrayBuffer();
      }
    }
  });
  it('preserves post-header stream errors so an interrupted response cannot become a complete CSV', async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({ start(value) { controller = value; } });
    mocks.download.mockResolvedValueOnce(result(stream));
    const response = await downloadPost(request()), reader = response.body!.getReader();
    controller.enqueue(new TextEncoder().encode('\uFEFF"header"\r\n'));
    expect((await reader.read()).done).toBe(false);
    controller.error(new Error('Report CSV export could not be completed.'));
    await expect(reader.read()).rejects.toThrow('could not be completed');
  });
  it('fails explicitly for missing/invalid origin configuration and unreadable upload bodies', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (const value of ['', 'not a URL']) {
      vi.stubEnv('BETTER_AUTH_URL', value); expect((await previewPost(request())).status).toBe(503);
    }
    vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
    const init: RequestInit & { duplex: 'half' } = { method: 'POST', headers: request().headers, body: new ReadableStream({
      start(controller) { controller.error(new Error('PRIVATE_BODY')); },
    }), duplex: 'half' };
    const req = new Request(request().url, init);
    expect((await previewPost(req)).status).toBe(422);
    expect(log).toHaveBeenLastCalledWith('Report CSV request body could not be read.');
    expect(JSON.stringify(log.mock.calls)).not.toContain('PRIVATE');
  });
});
