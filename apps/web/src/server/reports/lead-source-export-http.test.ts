import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), preview: vi.fn(), download: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('./lead-source-export', () => ({
  previewWorkspaceLeadSourceExport: mocks.preview,
  exportWorkspaceLeadSource: mocks.download,
}));

import { POST as previewPost } from '../../app/api/reports/sources/export/preview/route';
import { POST as downloadPost } from '../../app/api/reports/sources/export/route';
import { AuthorizationAccessError, ReportExportLimitError } from '@salesmora/data';
import { leadSourceExportColumns, leadSourceExportInputSchema } from '@salesmora/contracts';
import { initialLeadSourceQuery, sourceReadResponse } from '../../features/reports/lead-source-report/lead-source-read.fixtures';

const authority = sourceReadResponse(initialLeadSourceQuery);
const input = leadSourceExportInputSchema.parse({
  query: {
    workspaceId: initialLeadSourceQuery.workspaceId,
    view: 'lead-source',
    period: initialLeadSourceQuery.period,
    selected: 'cohort',
  },
  dataset: 'cohort',
});
const preview = {
  input,
  workspaceId: authority.workspaceId,
  viewerId: authority.viewerId,
  policyRevision: authority.policyRevision,
  leadScope: authority.scope,
  leadArchiveVisibility: authority.archiveVisibility,
  conversion: { kind: 'available', scope: 'workspace' },
  acceptedValue: { kind: 'available', scope: 'workspace' },
  asOf: authority.report.asOf,
  today: authority.report.today,
  timezone: authority.report.timezone,
  dateBasis: 'lead-creation-cohort',
  coverage: 'Authorized Sources cohort.',
  count: 1,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: leadSourceExportColumns(input),
};
const id = '00000000-0000-4000-8000-000000000099';
const generation = {
  id,
  workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision,
  leadScope: preview.leadScope,
  leadArchiveVisibility: preview.leadArchiveVisibility,
  conversion: preview.conversion,
  acceptedValue: preview.acceptedValue,
  asOf: preview.asOf,
  today: preview.today,
  timezone: preview.timezone,
  dateBasis: preview.dateBasis,
  count: preview.count,
  limits: preview.limits,
};
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n"fixture"\r\n';
function result() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode(csv)); controller.close(); },
  });
  return { ...preview, ...generation, id, generation, stream };
}
function request(body: unknown = input, patch: { headers?: Record<string, string>; suffix?: string } = {}) {
  return new Request(`https://app.example.test/api/reports/sources/export${patch.suffix ?? ''}`, {
    method: 'POST',
    headers: { origin: 'https://app.example.test', 'content-type': 'application/json', ...patch.headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('BETTER_AUTH_URL', 'https://app.example.test');
  mocks.session.mockResolvedValue({ user: { id: 'session-user' } });
  mocks.preview.mockResolvedValue(preview);
  mocks.download.mockImplementation(async () => result());
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('Sources CSV private HTTP boundary', () => {
  it('binds preview to the session identity and returns private no-store metadata', async () => {
    const response = await previewPost(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(preview);
    expect(mocks.preview).toHaveBeenCalledWith('session-user', input);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.download).not.toHaveBeenCalled();
  });

  it('returns a safe filename and generation metadata while streaming CSV', async () => {
    const req = request();
    const response = await downloadPost(req);
    expect(mocks.download).toHaveBeenCalledWith('session-user', input, req.signal);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('content-disposition')).toContain(
      `salesmora-sources-cohort-${preview.today}.csv`,
    );
    expect(response.headers.get('x-accel-buffering')).toBe('no');
    expect(JSON.parse(Buffer.from(response.headers.get('x-report-export')!, 'base64url').toString()))
      .toEqual(generation);
    expect(Buffer.from(await response.arrayBuffer()).toString('utf8')).toBe(csv);
  });

  it('rejects invalid origin and pagination/unknown controls before reading data', async () => {
    for (const endpoint of [previewPost, downloadPost]) {
      expect((await endpoint(request(input, { headers: { origin: 'https://foreign.test' } }))).status).toBe(403);
      expect((await endpoint(request({ ...input, query: { ...input.query, page: 1 } }))).status).toBe(422);
      expect((await endpoint(request(input, { suffix: '?dataset=cohort' }))).status).toBe(422);
    }
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.download).not.toHaveBeenCalled();
  });

  it('maps authorization and limit errors without disclosing server details', async () => {
    for (const [error, status] of [[new AuthorizationAccessError(), 404], [new ReportExportLimitError(), 422]] as const) {
      mocks.preview.mockRejectedValueOnce(error);
      const response = await previewPost(request());
      expect(response.status).toBe(status);
      expect(await response.text()).not.toContain('PRIVATE');
    }
  });
});
