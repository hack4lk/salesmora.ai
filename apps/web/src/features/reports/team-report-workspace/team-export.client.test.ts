import { afterEach, describe, expect, it, vi } from 'vitest';
import { teamReportExportColumns, teamReportExportPreviewSchema, teamReportReadResultSchema } from '@salesmora/contracts';
import { initialTeamQuery, teamReadResponse } from './team-read.fixtures';
import { teamExportDatasetsForView, teamExportInput, TeamCSVChangedError, TeamCSVDeniedError,
  loadTeamCSVPreview, receiveTeamCSV } from './team-export.client';

const assigned = { kind: 'assigned' as const, currentMemberId: 'member-c' };
const authority = teamReportReadResultSchema.parse({ ...teamReadResponse(initialTeamQuery),
  exportScopes: { leads: assigned, jobs: null } });
const input = teamExportInput(initialTeamQuery, 'evidence');
const preview = teamReportExportPreviewSchema.parse({
  input, workspaceId: authority.workspaceId, viewerId: authority.viewerId, policyRevision: authority.policyRevision,
  scope: assigned, archiveVisibility: 'excluded', asOf: authority.report.asOf,
  today: authority.report.today, timezone: authority.report.timezone, dateBasis: 'current-snapshot',
  inactivityCutoff: '2026-10-29T09:00:00.000000Z', count: 1,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
  columns: teamReportExportColumns(input), coverage: 'Current authorized workload.',
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
describe('Team CSV client', () => {
  it('omits pagination and hides assigned unassigned workload', () => {
    expect(input.query).not.toHaveProperty('page');
    expect(input.query).not.toHaveProperty('pageSize');
    expect(teamExportDatasetsForView('team-jobs', true)).not.toContain('unassigned');
    expect(teamExportDatasetsForView('team-jobs', false)).toContain('unassigned');
  });
  it('binds preview to independent export authority and rejects foreign selections', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(preview)); vi.stubGlobal('fetch', fetch);
    await expect(loadTeamCSVPreview(input, authority, new AbortController().signal)).resolves.toEqual(preview);
    for (const altered of [{ policyRevision: 2 }, { scope: { kind: 'workspace' } }]) {
      fetch.mockResolvedValueOnce(Response.json({ ...preview, ...altered }));
      await expect(loadTeamCSVPreview(input, authority, new AbortController().signal)).rejects.toBeInstanceOf(TeamCSVChangedError);
    }
    fetch.mockResolvedValueOnce(Response.json({ ...preview, viewerId: 'other' }));
    await expect(loadTeamCSVPreview(input, authority, new AbortController().signal)).rejects.toThrow();
    const foreign = teamExportInput({ ...initialTeamQuery, filters: { members: ['member-a'] } }, 'evidence');
    await expect(loadTeamCSVPreview(foreign, authority, new AbortController().signal)).rejects.toBeInstanceOf(TeamCSVDeniedError);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
  it('accepts only a complete CSV with the reviewed authority and count', async () => {
    const fetch = vi.fn().mockImplementation(() => response()); vi.stubGlobal('fetch', fetch);
    expect(Buffer.from(await (await receiveTeamCSV(preview, new AbortController().signal)).arrayBuffer()).toString()).toBe(csv);
    for (const patch of [{ policyRevision: 2 }, { scope: { kind: 'workspace' } }, { count: 0 }]) {
      fetch.mockResolvedValueOnce(response(csv, patch));
      await expect(receiveTeamCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(TeamCSVChangedError);
    }
    for (const body of [csv.slice(0, -2), csv + '"extra"\r\n', '"wrong"\r\n']) {
      fetch.mockResolvedValueOnce(response(body));
      await expect(receiveTeamCSV(preview, new AbortController().signal)).rejects.toThrow(/incomplete/);
    }
    fetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(receiveTeamCSV(preview, new AbortController().signal)).rejects.toBeInstanceOf(TeamCSVDeniedError);
  });
});
