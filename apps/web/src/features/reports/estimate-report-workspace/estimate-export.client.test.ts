import { afterEach, describe, expect, it, vi } from 'vitest';
import { estimateReportExportColumns, estimateReportExportPreviewSchema, estimateReportReadResultSchema } from '@salesmora/contracts';
import { initialEstimateQuery, estimateReadResponse } from './estimate-read.fixtures';
import { estimateExportInput, EstimateCSVChangedError, EstimateCSVDeniedError,
  loadEstimateCSVPreview, receiveEstimateCSV } from './estimate-export.client';

const authority = estimateReportReadResultSchema.parse({ ...estimateReadResponse(initialEstimateQuery),
  exportAccess: { scope: 'assigned_job', handoff: false } });
const input = estimateExportInput(initialEstimateQuery, 'evidence');
const preview = estimateReportExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  scope: 'assigned_job', handoff: false, archiveVisibility: 'included', asOf: authority.report.asOf,
  today: authority.today, timezone: authority.report.timezone, dateBasis: 'decision-date', count: 1,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: estimateReportExportColumns(input), coverage: 'Authorized decisions.',
});
const generation = { id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision, scope: preview.scope, handoff: preview.handoff, archiveVisibility: preview.archiveVisibility,
  asOf: preview.asOf, today: preview.today, timezone: preview.timezone, dateBasis: preview.dateBasis,
  count: preview.count, limits: preview.limits };
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Estimate CSV client', () => {
  it('omits pagination and binds preview to independently narrowed authority', async () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadEstimateCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    for (const altered of [{ policyRevision: 2 }, { scope: 'workspace' }, { viewerId: 'other' }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...altered }));
      await expect(loadEstimateCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(EstimateCSVChangedError);
    }
    const lead = estimateExportInput({ ...initialEstimateQuery, filters: { owners: [], parents: ['lead'] } }, 'evidence');
    await expect(loadEstimateCSVPreview(lead, authority, new AbortController().signal)).rejects.toBeInstanceOf(EstimateCSVDeniedError);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
  it('denies handoff without complete export authority', async () => {
    const handoff = estimateExportInput({ workspaceId: input.query.workspaceId, view: 'estimate-current', selected: 'handoff',
      filters: { owners: [], parents: [] }, page: 1, pageSize: 25 }, 'evidence');
    await expect(loadEstimateCSVPreview(handoff, authority, new AbortController().signal)).rejects.toBeInstanceOf(EstimateCSVDeniedError);
  });
  it('accepts only complete CSV with reviewed generation metadata', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    expect(Buffer.from(await (await receiveEstimateCSV(preview, new AbortController().signal)).arrayBuffer()).toString()).toBe(csv);
    for (const patch of [{ policyRevision: 2 }, { scope: 'workspace' }, { count: 0 }]) {
      fetch.mockResolvedValueOnce(response(csv, patch));
      await expect(receiveEstimateCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(EstimateCSVChangedError);
    }
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveEstimateCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
    fetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(receiveEstimateCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(EstimateCSVDeniedError);
  });
});
