import { describe, expect, it } from 'vitest';
import { leadSourceExportColumns, leadSourceExportInputSchema, leadSourceExportPreviewSchema,
  leadSourceExportGenerationSchema } from './lead-source-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-10-01', to: '2026-10-31' };
const input = (dataset: string, selected: string) => leadSourceExportInputSchema.parse({
  query: { workspaceId, view: 'lead-source', period, selected },
  dataset,
});
const sourceGroups = input('source-groups', 'cohort');
const preview = {
  input: sourceGroups, workspaceId, viewerId: 'owner', policyRevision: 4, leadScope: 'workspace',
  leadArchiveVisibility: 'included', conversion: { kind: 'available', scope: 'workspace' },
  acceptedValue: { kind: 'available', scope: 'workspace' }, asOf: '2026-11-05T10:00:00Z',
  today: '2026-11-05', timezone: 'Europe/Warsaw', dateBasis: 'lead-creation-cohort',
  coverage: 'Current source and linked business state as of the snapshot.', count: 6,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, columns: leadSourceExportColumns(sourceGroups),
};
describe('Sources CSV contracts', () => {
  it('accepts only the source-groups table or matching native full-evidence selections without UI pagination', () => {
    for (const [dataset, selected] of [['source-groups', 'cohort'], ['cohort', 'cohort'],
      ['converted', 'converted'], ['accepted-estimates', 'accepted-estimates']]) {
      const parsed = input(dataset, selected);
      expect(parsed.query).not.toHaveProperty('page');
      expect(parsed.query).not.toHaveProperty('pageSize');
      expect(leadSourceExportColumns(parsed).length).toBeGreaterThan(10);
    }
    for (const [dataset, selected] of [['source-groups', 'converted'], ['cohort', 'accepted-estimates'],
      ['converted', 'cohort'], ['accepted-estimates', 'converted']]) {
      expect(leadSourceExportInputSchema.safeParse({ query: { workspaceId, view: 'lead-source', period, selected }, dataset }).success).toBe(false);
    }
    for (const invalid of [{ actorId: 'forged' }, { authority: 'workspace' }, { columns: ['private'] }]) {
      expect(leadSourceExportInputSchema.safeParse({ ...sourceGroups, ...invalid }).success).toBe(false);
    }
  });
  it('defines fixed columns without payload, actor, internal family or contact fields', () => {
    const sensitive = ['email', 'phone', 'notes', 'details', 'snapshot_hash', 'family_id', 'workspace_id'];
    const rows = [
      leadSourceExportColumns(input('source-groups', 'cohort')),
      leadSourceExportColumns(input('cohort', 'cohort')),
      leadSourceExportColumns(input('converted', 'converted')),
      leadSourceExportColumns(input('accepted-estimates', 'accepted-estimates')),
    ];
    for (const columns of rows) {
      expect(new Set(columns).size).toBe(columns.length);
      expect(columns.slice(0, 5)).toEqual(['report_view', 'dataset', 'date_basis', 'period_from', 'period_to']);
      expect(sensitive.some(field => columns.includes(field))).toBe(false);
    }
    expect(rows[0]).toContain('accepted_value_coverage');
    expect(rows[0]).toContain('currency');
    expect(rows[3]).toContain('linked_lead_id');
    expect(rows[3]).toContain('attribution');
    expect(rows[2]).toContain('linked_job_numbers');
  });
  it('validates output-specific availability, clocks, scope, count and columns without treating unknown as zero', () => {
    expect(leadSourceExportPreviewSchema.safeParse(preview).success).toBe(true);
    expect(leadSourceExportPreviewSchema.safeParse({ ...preview,
      conversion: { kind: 'unavailable', reason: 'permissions' },
      acceptedValue: { kind: 'unavailable', reason: 'permissions' } }).success).toBe(true);
    expect(leadSourceExportPreviewSchema.safeParse({ ...preview, input: input('converted', 'converted') }).success).toBe(false);
    expect(leadSourceExportPreviewSchema.safeParse({ ...preview,
      input: input('accepted-estimates', 'accepted-estimates'),
      acceptedValue: { kind: 'unavailable', reason: 'invalid-money' } }).success).toBe(false);
    for (const patch of [{ workspaceId: '00000000-0000-4000-8000-000000000002' },
      { columns: [...preview.columns, 'notes'] }, { dateBasis: 'accepted-date' }, { today: '2026-11-06' },
      { leadScope: 'enabled' }, { count: Number.MAX_SAFE_INTEGER + 1 }, { timezone: 'invalid' },
      { acceptedValue: { kind: 'unavailable', reason: 'unexpected' } }]) {
      expect(leadSourceExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    }
  });
  it('binds compact generation metadata to current source/report availability and technical limits', () => {
    const generation = {
      id: '00000000-0000-4000-8000-000000000099', workspaceId, policyRevision: 4,
      leadScope: 'assigned', leadArchiveVisibility: 'excluded',
      conversion: { kind: 'unavailable', reason: 'permissions' },
      acceptedValue: { kind: 'unavailable', reason: 'permissions' }, asOf: preview.asOf, today: preview.today,
      timezone: preview.timezone, dateBasis: 'lead-creation-cohort', count: 0, limits: preview.limits,
    };
    expect(leadSourceExportGenerationSchema.safeParse(generation).success).toBe(true);
    for (const patch of [{ id: 'invalid' }, { count: 50001 }, { today: '2026-11-06' },
      { leadScope: 'enabled' }, { notes: 'private' }]) {
      expect(leadSourceExportGenerationSchema.safeParse({ ...generation, ...patch }).success).toBe(false);
    }
  });
});
