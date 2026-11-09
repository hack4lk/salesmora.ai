import { describe, expect, it } from 'vitest';
import { estimateReportExportColumns, estimateReportExportInputSchema,
  estimateReportExportPreviewSchema, estimateReportExportGenerationSchema } from './estimate-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-10-01', to: '2026-11-05' }, filters = { owners: [], parents: [] };
const input = estimateReportExportInputSchema.parse({ dataset: 'evidence',
  query: { workspaceId, view: 'estimate-decisions', period, filters, selected: 'accepted' } });
const preview = { input, workspaceId, viewerId: 'owner', policyRevision: 1, scope: 'workspace',
  handoff: true, archiveVisibility: 'included', asOf: '2026-11-05T09:00:00.000Z',
  today: '2026-11-05', timezone: 'Europe/Warsaw', dateBasis: 'decision-date', count: 2,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, coverage: 'Authorized effective decisions.',
  columns: estimateReportExportColumns(input) };
describe('Estimate report CSV contracts', () => {
  it('accepts each native report view without pagination', () => {
    for (const query of [
      input.query,
      { workspaceId, view: 'estimate-first-quoted', period, filters },
      { workspaceId, view: 'estimate-current', selected: 'awaiting', filters },
    ]) for (const dataset of ['summary', 'evidence']) {
      expect(estimateReportExportInputSchema.safeParse({ query, dataset }).success).toBe(true);
      expect(estimateReportExportInputSchema.safeParse({ query: { ...query, page: 1 }, dataset }).success).toBe(false);
    }
  });
  it('rejects forged controls, dates and incompatible current filters', () => {
    for (const query of [
      { ...input.query, workspaceId: 'invalid' },
      { ...input.query, period: { from: '2024-01-01', to: '2025-01-01' } },
      { ...input.query, scope: 'workspace' },
      { workspaceId, view: 'estimate-current', period, selected: 'awaiting', filters },
    ]) expect(estimateReportExportInputSchema.safeParse({ query, dataset: 'evidence' }).success).toBe(false);
  });
  it('binds preview to the selected view, columns, clock and handoff authority', () => {
    expect(estimateReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const change of [{ workspaceId: '00000000-0000-4000-8000-000000000002' }, { dateBasis: 'current-snapshot' },
      { timezone: 'Invalid/Timezone' }, { columns: ['wrong'] }, { scope: 'assigned_job', handoff: true }]) {
      expect(estimateReportExportPreviewSchema.safeParse({ ...preview, ...change }).success).toBe(false);
    }
    const current = estimateReportExportInputSchema.parse({ dataset: 'evidence',
      query: { workspaceId, view: 'estimate-current', selected: 'handoff', filters } });
    expect(estimateReportExportPreviewSchema.safeParse({ ...preview, input: current, handoff: false,
      archiveVisibility: 'excluded', dateBasis: 'current-snapshot', columns: estimateReportExportColumns(current) }).success).toBe(false);
  });
  it('rejects over-limit or contradictory generation metadata', () => {
    const { input: ignoredInput, viewerId, coverage, columns, ...metadata } = preview;
    void ignoredInput; void viewerId; void coverage; void columns;
    const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000002' };
    expect(estimateReportExportGenerationSchema.safeParse(generation).success).toBe(true);
    expect(estimateReportExportGenerationSchema.safeParse({ ...generation, count: 50001 }).success).toBe(false);
    expect(estimateReportExportGenerationSchema.safeParse({ ...generation, scope: 'assigned_job' }).success).toBe(false);
  });
});
