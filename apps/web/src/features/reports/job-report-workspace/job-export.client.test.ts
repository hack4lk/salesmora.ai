import { afterEach, describe, expect, it, vi } from 'vitest';
import { jobReportExportColumns, jobReportExportPreviewSchema } from '@salesmora/contracts';
import { initialJobQuery, jobReadResponse } from './job-read.fixtures';
import { jobExportInput, JobCSVChangedError, JobCSVDeniedError, loadJobCSVPreview, receiveJobCSV } from './job-export.client';

const authority = { ...jobReadResponse(initialJobQuery), exportScope: 'assigned' as const };
const input = jobExportInput(initialJobQuery, 'evidence');
const preview = jobReportExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  scope: authority.exportScope, archiveVisibility: 'included', asOf: authority.report.asOf,
  today: authority.today, timezone: authority.report.timezone, dateBasis: 'lifecycle-local-dates',
  count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: jobReportExportColumns(input), coverage: 'Current authorized Jobs.',
});
const generation = {
  id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId, policyRevision: preview.policyRevision,
  scope: preview.scope, archiveVisibility: preview.archiveVisibility, asOf: preview.asOf, today: preview.today,
  timezone: preview.timezone, dateBasis: preview.dateBasis, count: preview.count, limits: preview.limits,
};
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Jobs CSV client', () => {
  it('omits pagination while retaining the selected evidence', () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    expect(input.query).toMatchObject({ selectedView: 'created' });
  });
  it('binds preview to the separately narrowed export scope and current authority', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadJobCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    for (const altered of [{ policyRevision: 2 }, { scope: 'workspace' }, { viewerId: 'other' }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...altered }));
      await expect(loadJobCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(JobCSVChangedError);
    }
    fetch.mockResolvedValueOnce(Response.json(preview));
    await expect(loadJobCSVPreview(input, { ...authority, exportScope: null }, new AbortController().signal))
      .rejects.toBeInstanceOf(JobCSVChangedError);
  });
  it('accepts only a complete CSV matching reviewed generation metadata', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    const blob = await receiveJobCSV(preview, new AbortController().signal);
    expect(Buffer.from(await blob.arrayBuffer()).toString('utf8')).toBe(csv);
    for (const patch of [{ policyRevision: 2 }, { scope: 'workspace' }, { count: 0 }]) {
      fetch.mockResolvedValueOnce(response(csv, patch));
      await expect(receiveJobCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(JobCSVChangedError);
    }
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveJobCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
  });
  it('rejects denial, cancellation and interrupted bodies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 403 })); vi.stubGlobal('fetch', fetch);
    await expect(receiveJobCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(JobCSVDeniedError);
    fetch.mockResolvedValueOnce(response());
    const aborted = new AbortController(); aborted.abort();
    await expect(receiveJobCSV(preview, aborted.signal)).rejects.toThrow();
    const interrupted = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('Interrupted')); } });
    fetch.mockResolvedValueOnce(new Response(interrupted, { headers: response().headers }));
    await expect(receiveJobCSV(preview, new AbortController().signal)).rejects.toThrow('Interrupted');
  });
});
