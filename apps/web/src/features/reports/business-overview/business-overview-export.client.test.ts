import { afterEach, describe, expect, it, vi } from 'vitest';
import { businessOverviewExportColumns, businessOverviewExportPreviewSchema } from '@salesmora/contracts';
import { initialOverviewQuery, overviewReadResponse } from './business-overview-read.fixtures';
import { loadOverviewCSVPreview, receiveOverviewCSV, OverviewCSVChangedError, OverviewCSVDeniedError } from './business-overview-export.client';

const authority = overviewReadResponse(initialOverviewQuery);
const preview = businessOverviewExportPreviewSchema.parse({
  input: { query: initialOverviewQuery, dataset: 'summary' }, workspaceId: authority.workspaceId,
  viewerId: authority.viewerId, policyRevision: authority.policyRevision, asOf: '2026-11-06T10:00:00Z',
  today: authority.report.today, timezone: authority.report.timezone,
  scopes: { lead: null, job: 'assigned', estimate: null, calendar: null },
  count: 4, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: businessOverviewExportColumns, coverage: 'Partial export authority.',
});
const generation = { id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision, asOf: preview.asOf, today: preview.today, timezone: preview.timezone,
  scopes: preview.scopes, count: preview.count, limits: preview.limits };
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  Array.from({ length: 4 }, () => preview.columns.map(() => '"fixture"').join(',') + '\r\n').join('');
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Overview CSV client', () => {
  it('explains required permissions when the preview is denied', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    const request = loadOverviewCSVPreview(initialOverviewQuery, authority, new AbortController().signal);
    await expect(request).rejects.toBeInstanceOf(OverviewCSVDeniedError);
    await expect(request).rejects.toThrow('Settings > Permissions');
  });
  it('binds preview to the request and prevents widening read authority', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadOverviewCSVPreview(initialOverviewQuery, authority, new AbortController().signal)).resolves.toEqual(preview);
    fetch.mockResolvedValueOnce(Response.json({ ...preview, policyRevision: 2 }));
    await expect(loadOverviewCSVPreview(initialOverviewQuery, authority, new AbortController().signal)).rejects.toBeInstanceOf(OverviewCSVChangedError);
    const narrow = { ...authority, authority: { ...authority.authority, job: { scope: 'assigned' as const } } };
    fetch.mockResolvedValueOnce(Response.json({ ...preview, scopes: { ...preview.scopes, job: 'workspace' } }));
    await expect(loadOverviewCSVPreview(initialOverviewQuery, narrow, new AbortController().signal)).rejects.toBeInstanceOf(OverviewCSVChangedError);
  });
  it('requires complete CSV and unchanged export scopes', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    expect(Buffer.from(await (await receiveOverviewCSV(preview, new AbortController().signal)).arrayBuffer()).toString()).toBe(csv);
    fetch.mockResolvedValueOnce(response(csv, { scopes: { ...preview.scopes, job: 'workspace' } }));
    await expect(receiveOverviewCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(OverviewCSVChangedError);
    fetch.mockResolvedValueOnce(response(csv.slice(0, -2)));
    await expect(receiveOverviewCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
  });
});
