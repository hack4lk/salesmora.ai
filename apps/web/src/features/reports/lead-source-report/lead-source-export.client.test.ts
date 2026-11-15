import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  leadSourceExportColumns,
  leadSourceExportPreviewSchema,
  type LeadSourceExportPreview,
} from '@salesmora/contracts';
import { initialLeadSourceQuery, sourceReadResponse } from './lead-source-read.fixtures';
import {
  loadSourceCSVPreview,
  receiveSourceCSV,
  sourceExportFilename,
  sourceExportInput,
  SourceCSVChangedError,
  SourceCSVDeniedError,
} from './lead-source-export.client';

const authority = sourceReadResponse(initialLeadSourceQuery);
const input = sourceExportInput(initialLeadSourceQuery, 'cohort');
const preview = leadSourceExportPreviewSchema.parse({
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
}) as LeadSourceExportPreview;
const generation = {
  id: '00000000-0000-4000-8000-000000000099',
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
const csv = '\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n' +
  preview.columns.map(() => '"fixture"').join(',') + '\r\n';
const signal = () => new AbortController().signal;
function downloadResponse(body: BodyInit = csv, patch = {}) {
  return new Response(body, { headers: {
    'content-type': 'text/csv; charset=utf-8',
    'x-report-export': Buffer.from(JSON.stringify({ ...generation, ...patch })).toString('base64url'),
  } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Sources CSV client boundary', () => {
  it('creates pagination-free dataset requests with matching evidence selections', () => {
    const accepted = sourceExportInput(initialLeadSourceQuery, 'accepted-estimates');
    expect(accepted.query.selected).toBe('accepted-estimates');
    expect(accepted.query).not.toHaveProperty('page');
    expect(accepted.query).not.toHaveProperty('pageSize');
    expect(sourceExportFilename(input, preview.today)).toBe(
      `salesmora-sources-cohort-${preview.today}.csv`,
    );
  });

  it('binds preview input, session identity, permission revision and workspace clock', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview));
    vi.stubGlobal('fetch', fetch);
    expect(await loadSourceCSVPreview(input, authority, signal())).toEqual(preview);
    expect(fetch).toHaveBeenCalledWith('/api/reports/sources/export/preview', expect.objectContaining({
      method: 'POST', cache: 'no-store', body: JSON.stringify(input),
    }));
    fetch.mockResolvedValueOnce(Response.json({ ...preview, policyRevision: 2 }));
    await expect(loadSourceCSVPreview(input, authority, signal())).rejects.toBeInstanceOf(SourceCSVChangedError);
    fetch.mockResolvedValueOnce(Response.json({}, { status: 404 }));
    await expect(loadSourceCSVPreview(input, authority, signal())).rejects.toBeInstanceOf(SourceCSVDeniedError);
  });

  it('accepts only exact generation metadata and a complete CSV body', async () => {
    const fetch = vi.fn().mockResolvedValue(downloadResponse());
    vi.stubGlobal('fetch', fetch);
    const blob = await receiveSourceCSV(preview, signal());
    expect(Buffer.from(await blob.arrayBuffer()).toString('utf8')).toBe(csv);
    expect(fetch).toHaveBeenCalledWith('/api/reports/sources/export', expect.objectContaining({
      method: 'POST', body: JSON.stringify(input),
    }));
    fetch.mockResolvedValueOnce(downloadResponse(csv, { count: 2 }));
    await expect(receiveSourceCSV(preview, signal())).rejects.toBeInstanceOf(SourceCSVChangedError);
  });
});
