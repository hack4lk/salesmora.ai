import { afterEach, describe, expect, it, vi } from 'vitest';
import { activityReportExportColumns, activityReportExportPreviewSchema, activityReportReadResultSchema } from '@salesmora/contracts';
import { initialActivityQuery, activityReadResponse } from './activity-read.fixtures';
import { activityExportInput, ActivityCSVChangedError, ActivityCSVDeniedError,
  loadActivityCSVPreview, receiveActivityCSV } from './activity-export.client';

const authority = activityReportReadResultSchema.parse({ ...activityReadResponse(),
  exportScopes: [{ domain: 'lead', scope: 'workspace' }] });
const input = activityExportInput(initialActivityQuery, 'evidence');
const includedDomains = authority.report.includedDomains.filter(item => item.domain === 'lead');
const omittedDomains = authority.report.includedDomains.filter(item => item.domain !== 'lead')
  .map(item => ({ domain: item.domain, reason: 'permissions' }));
const preview = activityReportExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  asOf: authority.report.asOf, today: authority.report.today, timezone: authority.report.timezone,
  includedDomains, omittedDomains, count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: activityReportExportColumns(input), coverage: 'Authorized histories.',
});
const generation = { id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision, asOf: preview.asOf, today: preview.today, timezone: preview.timezone,
  includedDomains: preview.includedDomains, omittedDomains: preview.omittedDomains, count: preview.count, limits: preview.limits };
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Activity CSV client', () => {
  it('omits pagination and binds preview to independently narrowed domains', async () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadActivityCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    for (const altered of [{ policyRevision: 2 }, { viewerId: 'other' },
      { includedDomains: [{ ...includedDomains[0], scope: 'assigned' }] }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...altered }));
      await expect(loadActivityCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(ActivityCSVChangedError);
    }
    const job = activityExportInput({ ...initialActivityQuery, filters: { domains: ['job'], actions: [], actors: [] } }, 'evidence');
    await expect(loadActivityCSVPreview(job, authority, new AbortController().signal)).rejects.toBeInstanceOf(ActivityCSVDeniedError);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
  it('saves only complete CSV with reviewed generation metadata', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    expect(Buffer.from(await (await receiveActivityCSV(preview, new AbortController().signal)).arrayBuffer()).toString()).toBe(csv);
    for (const patch of [{ policyRevision: 2 }, { count: 0 },
      { includedDomains: [{ ...includedDomains[0], scope: 'assigned' }] }]) {
      fetch.mockResolvedValueOnce(response(csv, patch));
      await expect(receiveActivityCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(ActivityCSVChangedError);
    }
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveActivityCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
    fetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(receiveActivityCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(ActivityCSVDeniedError);
  });
});
