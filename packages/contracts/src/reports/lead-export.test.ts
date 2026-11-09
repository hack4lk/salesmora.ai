import { describe, expect, it } from 'vitest';
import { leadReportExportInputSchema, leadReportExportColumns, leadReportExportPreviewSchema } from './lead-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const filters = { stages: [], sources: [], owners: [] };
const period = { from: '2026-10-01', to: '2026-10-31' };
const queries = [
  { workspaceId, filters, view: 'intake', period, currentFilters: filters },
  { workspaceId, filters, view: 'won', period }, { workspaceId, filters, view: 'lost', period },
  { workspaceId, filters, view: 'pipeline', selection: { kind: 'pipeline' } },
  { workspaceId, filters, view: 'age', selection: { kind: 'age', band: '31+' } },
  { workspaceId, filters, view: 'attention', selection: 'combined' },
];
const datasets = ['intake-days', 'outcomes', 'outcomes', 'pipeline-stages', 'age-bands', 'attention-categories'];
const input = leadReportExportInputSchema.parse({ query: queries[0], dataset: 'evidence' });
const preview = { input, workspaceId, viewerId: 'viewer', policyRevision: 1,
  scope: 'workspace', archiveVisibility: 'included', asOf: '2026-11-05T12:00:00Z',
  today: '2026-11-05', timezone: 'Europe/Warsaw', dateBasis: 'creation-date', coverage: 'Native authorized report.',
  count: 0, limits: { rows: 50000, bytes: 1000000, durationMs: 30000 }, columns: leadReportExportColumns(input) };
describe('Leads report CSV contracts', () => {
  it('supports explicit per-view tables and evidence with stable columns and no contact/note fields', () => {
    queries.forEach((query, index) => {
      for (const dataset of ['evidence', datasets[index]]) {
        const parsed = leadReportExportInputSchema.parse({ query, dataset });
        const columns = leadReportExportColumns(parsed);
        expect(columns).toContain('date_basis');
        expect(new Set(columns).size).toBe(columns.length);
        for (const secret of ['email', 'phone', 'notes', 'details']) expect(columns).not.toContain(secret);
        expect(columns.includes('lead_id')).toBe(dataset === 'evidence');
      }
    });
    expect(leadReportExportInputSchema.safeParse({ query: queries[0], dataset: 'intake-sources' }).success).toBe(true);
  });
  it('rejects unsupported table/view pairs and browser actor/grant/pagination controls', () => {
    for (const patch of [{ dataset: 'age-bands' }, { actorId: 'forged' }, { authority: 'workspace' },
      { query: { ...queries[0], page: 1 } }, { query: { ...queries[0], pageSize: 100 } },
      { query: { ...queries[0], includeNotes: true } },
      { query: { ...queries[0], filters: { ...filters, owners: ['me', 'me'] } } }]) {
      expect(leadReportExportInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
    }
  });
  it('preserves selected evidence bounds while table rows remain explicitly whole-view projections', () => {
    const bucket = { ...queries[0], trendBucket: '2026-10-15' };
    expect(leadReportExportInputSchema.safeParse({ query: bucket, dataset: 'evidence' }).success).toBe(true);
    expect(leadReportExportInputSchema.safeParse({ query: bucket, dataset: 'intake-days' }).success).toBe(false);
    expect(leadReportExportInputSchema.safeParse({ query: { ...bucket, trendBucket: '2026-09-30' }, dataset: 'evidence' }).success).toBe(false);
    expect(leadReportExportInputSchema.safeParse({ query: { ...queries[3], period }, dataset: 'evidence' }).success).toBe(false);
  });
  it('enforces the inclusive 366-date ceiling and valid ordered calendar dates', () => {
    for (const range of [{ from: '2025-01-01', to: '2026-01-02' },
      { from: '2026-02-30', to: '2026-03-01' }, { from: '2026-11-01', to: '2026-10-01' }]) {
      expect(leadReportExportInputSchema.safeParse({ ...input, query: { ...queries[0], period: range } }).success).toBe(false);
    }
    expect(leadReportExportInputSchema.safeParse({ ...input,
      query: { ...queries[0], period: { from: '2025-01-01', to: '2026-01-01' } } }).success).toBe(true);
  });
  it('binds preview columns, native scope/date context and exact integer limits while allowing explicit over-limit counts', () => {
    expect(leadReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    expect(leadReportExportPreviewSchema.safeParse({ ...preview, count: 50001 }).success).toBe(true);
    for (const patch of [{ workspaceId: '00000000-0000-4000-8000-000000000002' },
      { columns: [...preview.columns, 'notes'] }, { dateBasis: 'current-snapshot' }, { today: '2026-11-06' },
      { viewerId: '' }, { timezone: 'invalid' }, { count: Number.MAX_SAFE_INTEGER + 1 },
      { limits: { ...preview.limits, bytes: 0 } }, { downloadToken: 'forged' }]) {
      expect(leadReportExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    }
  });
});
