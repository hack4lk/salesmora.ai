import { describe, expect, it } from 'vitest';
import { jobReportExportColumns, jobReportExportGenerationSchema, jobReportExportInputSchema,
  jobReportExportPreviewSchema } from './job-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-11-01', to: '2026-11-05' };
const filters = { statuses: [], owners: [], services: [] };
const queries = {
  lifecycle: { workspaceId, view: 'lifecycle', period, selectedView: 'created', filters },
  completion: { workspaceId, view: 'completion', period, filters },
  workload: { workspaceId, view: 'workload', filters, selection: { kind: 'metric', metric: 'active' } },
};
const input = jobReportExportInputSchema.parse({ query: queries.lifecycle, dataset: 'summary' });
const metadata = {
  workspaceId, policyRevision: 1, scope: 'workspace', archiveVisibility: 'included',
  asOf: '2026-11-05T10:00:00Z', today: '2026-11-05', timezone: 'Europe/Warsaw',
  dateBasis: 'lifecycle-local-dates', count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
};
const preview = { ...metadata, input, viewerId: 'owner', coverage: 'Current authorized jobs.',
  columns: jobReportExportColumns(input) };

describe('Jobs report CSV contracts', () => {
  it('accepts native datasets and rejects pagination and forged inputs', () => {
    for (const [view, datasets] of [
      ['lifecycle', ['summary', 'evidence']],
      ['completion', ['summary', 'days', 'evidence']],
      ['workload', ['summary', 'status', 'owner', 'service', 'waiting-reasons', 'evidence']],
    ] as const) {
      for (const dataset of datasets) {
        const parsed = jobReportExportInputSchema.parse({ query: queries[view], dataset });
        const columns = jobReportExportColumns(parsed);
        expect(new Set(columns).size).toBe(columns.length);
        expect(columns).not.toContain('notes');
        expect(columns).not.toContain('email');
        for (const patch of [{ page: 1 }, { pageSize: 25 }, { scope: 'workspace' }]) {
          expect(jobReportExportInputSchema.safeParse({ dataset, query: { ...queries[view], ...patch } }).success).toBe(false);
        }
      }
    }
    expect(jobReportExportInputSchema.safeParse({ ...input, columns: ['notes'] }).success).toBe(false);
  });
  it('enforces dataset compatibility, dated query refinements and current-only workload', () => {
    for (const candidate of [
      { query: queries.lifecycle, dataset: 'days' },
      { query: queries.completion, dataset: 'owner' },
      { query: { ...queries.workload, period }, dataset: 'summary' },
      { query: { ...queries.lifecycle, period: { from: '2025-01-01', to: '2026-11-05' } }, dataset: 'summary' },
      { query: { ...queries.completion, selectedDate: '2026-11-06' }, dataset: 'evidence' },
      { query: { ...queries.workload, selection: { kind: 'group', group: 'status', id: 'completed' } }, dataset: 'evidence' },
    ]) expect(jobReportExportInputSchema.safeParse(candidate).success).toBe(false);
  });
  it('binds preview metadata, fixed columns, full day coverage and native clock', () => {
    expect(jobReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { today: '2026-11-06' },
      { timezone: 'invalid' }, { columns: [...preview.columns, 'notes'] }, { count: 0 },
      { dateBasis: 'current-snapshot' }, { archiveVisibility: 'excluded' },
    ]) expect(jobReportExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    const days = jobReportExportInputSchema.parse({ query: queries.completion, dataset: 'days' });
    const dayPreview = { ...preview, input: days, columns: jobReportExportColumns(days), dateBasis: 'completion-date', count: 5 };
    expect(jobReportExportPreviewSchema.safeParse(dayPreview).success).toBe(true);
    expect(jobReportExportPreviewSchema.safeParse({ ...dayPreview, count: 4 }).success).toBe(false);
    const future = jobReportExportInputSchema.parse({
      query: { ...queries.completion, period: { from: '2026-11-01', to: '2026-11-06' } }, dataset: 'evidence',
    });
    expect(jobReportExportPreviewSchema.safeParse({ ...preview, input: future, columns: jobReportExportColumns(future),
      dateBasis: 'completion-date', count: 0 }).success).toBe(false);
  });
  it('enforces generation limits and clock', () => {
    const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
    expect(jobReportExportGenerationSchema.safeParse(generation).success).toBe(true);
    for (const patch of [{ count: 50001 }, { today: '2026-11-06' }, { id: 'invalid' },
      { count: Number.MAX_SAFE_INTEGER + 1 }, { notes: 'private' }]) {
      expect(jobReportExportGenerationSchema.safeParse({ ...generation, ...patch }).success).toBe(false);
    }
  });
});
