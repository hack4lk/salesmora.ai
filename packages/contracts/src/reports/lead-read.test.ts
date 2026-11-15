import { describe, expect, it } from 'vitest';
import { leadSources, leadStages } from '../lead-read';
import { leadReportQuerySchema } from './leads';
import { leadReportReadResultSchema } from './lead-read';
const workspaceId = '00000000-0000-4000-8000-000000000001';
const query = leadReportQuerySchema.parse({ workspaceId, view: 'pipeline', filters: { stages: [], owners: ['user-text-id'], sources: [] },
  selection: { kind: 'pipeline' }, page: 1, pageSize: 25 });
const result = {
  workspaceId, viewerId: 'user-text-id', policyRevision: 0, scope: 'workspace', archiveVisibility: 'excluded', query,
  options: { stages: leadStages.map(value => ({ value, label: value })), sources: leadSources.map(value => ({ value, label: value })),
    owners: [{ value: 'user-text-id', label: 'Current teammate' }, { value: 'me', label: 'Me' }, { value: 'unassigned', label: 'Unassigned' }] },
  report: { view: 'pipeline', asOf: '2026-11-05T10:00:00Z', today: '2026-11-05', timezone: 'Europe/Warsaw', scopeLabel: 'Currently authorized assigned records.',
    archiveVisibility: 'excluded', total: 0, stages: { new: 0, contacted: 0, 'estimate-sent': 0 }, ages: { '0-7': 0, '8-14': 0, '15-30': 0, '31+': 0 },
    selection: { kind: 'pipeline' }, page: 1, pageSize: 25, evidenceTotal: 0, rows: [] },
};
describe('Leads report read envelope', () => {
  it('fails closed for absent export authority and accepts only non-widening explicit export scopes', () => {
    expect(leadReportReadResultSchema.parse(result).exportScope).toBeUndefined();
    for (const exportScope of [null, 'workspace', 'assigned']) {
      expect(leadReportReadResultSchema.safeParse({ ...result, exportScope }).success).toBe(true);
    }
    expect(leadReportReadResultSchema.safeParse({ ...result, exportScope: 'enabled' }).success).toBe(false);
    expect(leadReportReadResultSchema.safeParse({ ...result, scope: 'assigned', exportScope: 'workspace',
      query: { ...query, filters: { ...query.filters, owners: [] } }, options: { ...result.options, owners: [] } }).success).toBe(false);
  });
  it('preserves non-UUID current member identifiers and initial policy revisions without widening read authority', () => {
    expect(leadReportReadResultSchema.safeParse(result).success).toBe(true);
    expect(leadReportQuerySchema.safeParse({ ...query, filters: { stages: [], owners: ['bad\u0000owner'], sources: [] } }).success).toBe(false);
    expect(leadReportReadResultSchema.safeParse({ ...result, scope: 'assigned' }).success).toBe(false);
    expect(leadReportReadResultSchema.safeParse({ ...result, options: { ...result.options, owners: [] } }).success).toBe(false);
  });
  it('rejects private top-level content and contradictory workspace, page, view and clock associations', () => {
    for (const patch of [{ privateNotes: 'hidden' }, { workspaceId: '00000000-0000-4000-8000-000000000002' },
      { report: { ...result.report, pageSize: 50 } }, { report: { ...result.report, asOf: '2026-11-04T10:00:00Z' } },
      { report: { ...result.report, evidenceTotal: 1 } }]) {
      expect(leadReportReadResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    }
  });
});
