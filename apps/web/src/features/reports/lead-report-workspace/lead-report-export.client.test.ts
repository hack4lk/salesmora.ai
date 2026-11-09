import { afterEach, describe, expect, it, vi } from 'vitest';
import { leadExportInput, leadExportDatasets, leadExportFilename, loadLeadCSVPreview, receiveLeadCSV,
  LeadCSVChangedError, LeadCSVDeniedError } from './lead-report-export.client';
import { leadReportBackendResponse, initialLeadReportQuery } from './lead-report.adapter.fixtures';
import { leadReportExportColumns } from '@salesmora/contracts';

const authority = { ...leadReportBackendResponse(initialLeadReportQuery), exportScope: 'workspace' as const };
const input = leadExportInput(initialLeadReportQuery, 'evidence');
const preview = { input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  scope: 'workspace' as const, archiveVisibility: authority.archiveVisibility, asOf: authority.report.asOf,
  today: authority.report.today, timezone: authority.report.timezone, dateBasis: 'creation-date' as const,
  coverage: 'Native authorized evidence.', count: 131, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: leadReportExportColumns(input) };
const metadata = { id: '00000000-0000-4000-8000-000000000099', workspaceId: preview.workspaceId,
  policyRevision: preview.policyRevision, scope: preview.scope, archiveVisibility: preview.archiveVisibility,
  asOf: preview.asOf, today: preview.today, timezone: preview.timezone, dateBasis: preview.dateBasis,
  count: preview.count, limits: preview.limits };
const signal = () => new AbortController().signal;
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  Array.from({ length: 131 }, () => preview.columns.map(() => '"fixture"').join(',') + '\r\n').join('');
function response(body: BodyInit | null = csv, patch = {}) {
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...metadata, ...patch })).toString('base64url') } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('Leads CSV client boundary', () => {
  it('removes pagination, preserves selected evidence and removes Intake bucket for tables', () => {
    const bucket = { ...initialLeadReportQuery, view: 'intake' as const, period: { from: '2026-10-01', to: '2026-10-31' },
      currentFilters: { stages: [], owners: [], sources: [] }, trendBucket: '2026-10-15', page: 9, pageSize: 100 as const };
    expect(leadExportInput(bucket, 'evidence').query).toHaveProperty('trendBucket', '2026-10-15');
    expect(leadExportInput(bucket, 'intake-days').query).not.toHaveProperty('trendBucket');
    expect(input.query).not.toHaveProperty('page'); expect(input.query).not.toHaveProperty('pageSize');
    expect(leadExportDatasets('intake')).toEqual(['evidence', 'intake-days', 'intake-sources']);
    expect(leadExportDatasets('lost')).toEqual(['evidence', 'outcomes']);
    expect(leadExportFilename(input, preview.today)).toBe('salesmora-leads-intake-evidence-2026-11-05.csv');
  });
  it('checks session/query/authority/clock in live previews without accepting stale preview capabilities', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    expect(await loadLeadCSVPreview(input, authority, signal())).toEqual(preview);
    expect(fetch).toHaveBeenCalledWith('/api/reports/leads/export/preview', expect.objectContaining({
      method: 'POST', body: JSON.stringify(input), cache: 'no-store',
    }));
    for (const patch of [{ viewerId: 'foreign' }, { policyRevision: 2 }, { scope: 'assigned' }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...patch }));
      await expect(loadLeadCSVPreview(input, authority, signal())).rejects.toBeInstanceOf(LeadCSVChangedError);
    }
    fetch.mockResolvedValueOnce(Response.json({}, { status: 404 }));
    await expect(loadLeadCSVPreview(input, authority, signal())).rejects.toBeInstanceOf(LeadCSVDeniedError);
  });
  it('returns exact complete bytes including BOM, not a partial save, and passes cancellation to POST', async () => {
    const fetch = vi.fn().mockResolvedValue(response()); vi.stubGlobal('fetch', fetch);
    const abort = signal(), blob = await receiveLeadCSV(preview, abort);
    expect(Buffer.from(await blob.arrayBuffer()).toString('utf8')).toBe(csv);
    expect(fetch).toHaveBeenCalledWith('/api/reports/leads/export', expect.objectContaining({
      body: JSON.stringify(input), signal: abort, method: 'POST',
    }));
  });
  it('cancels changed count/grant/scope/archive/clock/limits before consuming a CSV', async () => {
    for (const patch of [{ count: 132 }, { policyRevision: 2 }, { scope: 'assigned' }, { archiveVisibility: 'excluded' },
      { timezone: 'UTC' }, { dateBasis: 'current-snapshot' }, { limits: { ...preview.limits, bytes: 1000000 } }]) {
      const cancel = vi.fn(), stream = new ReadableStream<Uint8Array>({ cancel });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(stream, patch)));
      await expect(receiveLeadCSV(preview, signal())).rejects.toBeInstanceOf(LeadCSVChangedError);
      expect(cancel).toHaveBeenCalled();
    }
  });
  it('rejects interrupted bodies, bounded byte violations, invalid metadata/type and explicit denied responses', async () => {
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('Interrupted CSV')); } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(stream)));
    await expect(receiveLeadCSV(preview, signal())).rejects.toThrow('Interrupted CSV');
    const limited = { ...preview, limits: { ...preview.limits, bytes: 4 } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response('too long', { limits: limited.limits })));
    await expect(receiveLeadCSV(limited, signal())).rejects.toThrow('byte limit');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('bad', { headers: { 'x-report-export': 'bad!' } })));
    await expect(receiveLeadCSV(preview, signal())).rejects.toThrow('metadata');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({}, { status: 423 })));
    await expect(receiveLeadCSV(preview, signal())).rejects.toBeInstanceOf(LeadCSVDeniedError);
  });
  it('aborts a blocked read even when a transport mock ignores the fetch AbortSignal', async () => {
    const cancel = vi.fn(), stream = new ReadableStream<Uint8Array>({ cancel });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(stream)));
    const controller = new AbortController(), received = receiveLeadCSV(preview, controller.signal);
    const denied = expect(received).rejects.toThrow();
    await vi.waitFor(() => expect(stream.locked).toBe(true));
    controller.abort(); await denied;
    expect(cancel).toHaveBeenCalled();
  });
  it('rejects clean but truncated EOF and wrong BOM/header rather than offering a success-shaped partial file', async () => {
    for (const body of ['\uFEFF"header"\r\n', csv.replace('\uFEFF', ''), csv.slice(0, -2)]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(body)));
      await expect(receiveLeadCSV(preview, signal())).rejects.toThrow('incomplete');
    }
  });
  it('verifies BOM/header and row endings split across transport chunks and accepts complete zero-row headers', async () => {
    const header = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n';
    const bytes = new TextEncoder().encode(csv), headerSize = new TextEncoder().encode(header).length;
    const stream = new ReadableStream<Uint8Array>({ start(controller) {
      for (const [from, to] of [[0, 1], [1, 2], [2, headerSize - 1], [headerSize - 1, headerSize],
        [headerSize, bytes.length - 1], [bytes.length - 1, bytes.length]]) controller.enqueue(bytes.slice(from, to));
      controller.close();
    } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(stream)));
    expect((await receiveLeadCSV(preview, signal())).size).toBe(bytes.length);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(header, { count: 0 })));
    expect((await receiveLeadCSV({ ...preview, count: 0 }, signal())).size).toBe(headerSize);
  });
});
