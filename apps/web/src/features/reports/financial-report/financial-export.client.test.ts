import { afterEach, describe, expect, it, vi } from 'vitest';
import { financialReportExportColumns, financialReportExportPreviewSchema, financialReportReadResultSchema } from '@salesmora/contracts';
import { initialFinancialQuery, financialReadResponse } from './financial-read.fixtures';
import { financialExportInput, FinancialCSVChangedError, FinancialCSVDeniedError,
  loadFinancialCSVPreview, receiveFinancialCSV } from './financial-export.client';

const authority = financialReportReadResultSchema.parse({ ...financialReadResponse(),
  exportAccess: { estimates: 'workspace', materials: { scope: 'assigned', jobScope: null } } });
const input = financialExportInput({ ...initialFinancialQuery, selected: 'materials' }, 'evidence');
const preview = financialReportExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  asOf: authority.reports.materials.asOf, today: authority.today, timezone: authority.timezone,
  section: 'materials', scope: 'assigned', jobScope: null, archiveVisibility: 'excluded',
  count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: financialReportExportColumns(input), coverage: 'Current recorded costs.',
});
const generation = { id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision, asOf: preview.asOf, today: preview.today, timezone: preview.timezone,
  section: preview.section, scope: preview.scope, jobScope: preview.jobScope, archiveVisibility: preview.archiveVisibility,
  count: preview.count, limits: preview.limits };
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Financial CSV client', () => {
  it('omits pagination and binds selected section to narrowed authority', async () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadFinancialCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    for (const altered of [{ policyRevision: 2 }, { scope: 'workspace' }, { jobScope: 'workspace' }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...altered }));
      await expect(loadFinancialCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(FinancialCSVChangedError);
    }
    await expect(loadFinancialCSVPreview(input, { ...authority, exportAccess: { estimates: 'workspace', materials: null } },
      new AbortController().signal)).rejects.toBeInstanceOf(FinancialCSVDeniedError);
  });
  it('accepts only complete CSV with reviewed generation authority and count', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    expect(Buffer.from(await (await receiveFinancialCSV(preview, new AbortController().signal)).arrayBuffer()).toString()).toBe(csv);
    for (const patch of [{ policyRevision: 2 }, { scope: 'workspace' }, { count: 0 }, { jobScope: 'workspace' }]) {
      fetch.mockResolvedValueOnce(response(csv, patch));
      await expect(receiveFinancialCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(FinancialCSVChangedError);
    }
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveFinancialCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
  });
});
