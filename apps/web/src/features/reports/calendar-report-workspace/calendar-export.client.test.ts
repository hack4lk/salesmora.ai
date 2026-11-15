import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarExportColumns, calendarExportPreviewSchema } from '@salesmora/contracts';
import { calendarReadResponse, initialCalendarQuery } from './calendar-read.fixtures';
import { calendarExportInput, CalendarCSVChangedError, CalendarCSVDeniedError,
  loadCalendarCSVPreview, receiveCalendarCSV } from './calendar-export.client';

const authority = calendarReadResponse(initialCalendarQuery);
const input = calendarExportInput(initialCalendarQuery, 'visits');
const preview = calendarExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  scope: authority.scope, outputScopes: authority.exportScopes, asOf: authority.report.asOf,
  today: authority.report.today, timezone: authority.report.timezone, dateBasis: 'current-scheduled-date',
  count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, columns: calendarExportColumns(input),
  coverage: 'Current authorized schedule.',
});
const generation = {
  id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId, policyRevision: preview.policyRevision,
  scope: preview.scope, outputScopes: preview.outputScopes, asOf: preview.asOf, today: preview.today,
  timezone: preview.timezone, dateBasis: preview.dateBasis, count: preview.count, limits: preview.limits,
};
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
function response(body = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url') } });
}
afterEach(() => vi.unstubAllGlobals());
describe('Calendar CSV client', () => {
  it('omits pagination and keeps current-only queries free of periods', () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    expect(calendarExportInput({ workspaceId: authority.workspaceId, view: 'calendar-unscheduled', selected: 'visits',
      filters: { participants: [], recordTypes: [] }, page: 3, pageSize: 50 }, 'jobs').query).not.toHaveProperty('period');
  });
  it('binds preview to current actor, scope, parent export scopes and authority', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadCalendarCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    fetch.mockResolvedValueOnce(Response.json({ ...preview, policyRevision: 2 }));
    await expect(loadCalendarCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(CalendarCSVChangedError);
    fetch.mockResolvedValueOnce(Response.json(preview));
    await expect(loadCalendarCSVPreview(input, { ...authority, canExport: false, exportScopes: null },
      new AbortController().signal)).rejects.toBeInstanceOf(CalendarCSVChangedError);
  });
  it('accepts only complete reviewed CSV with matching generation metadata', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    const blob = await receiveCalendarCSV(preview, new AbortController().signal);
    expect(Buffer.from(await blob.arrayBuffer()).toString('utf8')).toBe(csv);
    fetch.mockResolvedValueOnce(response(csv, { policyRevision: 2 }));
    await expect(receiveCalendarCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(CalendarCSVChangedError);
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveCalendarCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
  });
  it('rejects denial, cancellation and interrupted bodies without offering files', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 403 })); vi.stubGlobal('fetch', fetch);
    await expect(receiveCalendarCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(CalendarCSVDeniedError);
    fetch.mockResolvedValueOnce(response());
    const aborted = new AbortController(); aborted.abort();
    await expect(receiveCalendarCSV(preview, aborted.signal)).rejects.toThrow();
    const interrupted = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('Interrupted')); } });
    fetch.mockResolvedValueOnce(new Response(interrupted, { headers: response().headers }));
    await expect(receiveCalendarCSV(preview, new AbortController().signal)).rejects.toThrow('Interrupted');
  });
});
