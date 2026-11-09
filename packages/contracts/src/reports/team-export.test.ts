import { describe, expect, it } from 'vitest';
import { teamReportExportColumns, teamReportExportGenerationSchema, teamReportExportInputSchema,
  teamReportExportPreviewSchema, teamReportExportSelectionAllowed } from './team-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const queries = {
  leads: { workspaceId, view: 'team-leads', filters: { members: [] }, selected: { kind: 'queue', queue: 'open' } },
  jobs: { workspaceId, view: 'team-jobs', filters: { members: [] }, selected: { kind: 'queue', queue: 'active' } },
};
const input = teamReportExportInputSchema.parse({ query: queries.leads, dataset: 'summary' });
const metadata = {
  workspaceId, policyRevision: 1, scope: { kind: 'workspace' }, archiveVisibility: 'excluded',
  asOf: '2026-11-05T10:00:00Z', today: '2026-11-05', timezone: 'Europe/Warsaw',
  dateBasis: 'current-snapshot', count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
};
const preview = { ...metadata, input, viewerId: 'owner', coverage: 'Current authorized workload.',
  inactivityCutoff: '2026-10-29T10:00:00.000000Z', columns: teamReportExportColumns(input) };

describe('Team report CSV contracts', () => {
  it('accepts each native dataset without pagination, periods or forged authority', () => {
    for (const [view, datasets] of [
      ['leads', ['summary', 'owners', 'evidence']],
      ['jobs', ['summary', 'members', 'unassigned', 'evidence']],
    ] as const) {
      for (const dataset of datasets) {
        const parsed = teamReportExportInputSchema.parse({ query: queries[view], dataset });
        const columns = teamReportExportColumns(parsed);
        expect(new Set(columns).size).toBe(columns.length);
        expect(columns).not.toContain('notes'); expect(columns).not.toContain('email');
        for (const patch of [{ page: 1 }, { pageSize: 25 }, { scope: 'workspace' },
          { period: { from: '2026-01-01', to: '2026-01-02' } }]) {
          expect(teamReportExportInputSchema.safeParse({ dataset, query: { ...queries[view], ...patch } }).success).toBe(false);
        }
      }
    }
    expect(teamReportExportInputSchema.safeParse({ ...input, columns: ['private'] }).success).toBe(false);
    for (const candidate of [{ query: queries.leads, dataset: 'members' },
      { query: queries.leads, dataset: 'unassigned' }, { query: queries.jobs, dataset: 'owners' }]) {
      expect(teamReportExportInputSchema.safeParse(candidate).success).toBe(false);
    }
    expect(teamReportExportInputSchema.safeParse({ dataset: 'evidence', query: { ...queries.leads,
      selected: { kind: 'owner', id: 'member:owner', stage: 'new', inactiveOnly: true } } }).success).toBe(false);
  });
  it('restricts assigned member filters, selections and unassigned datasets for every view', () => {
    const scope = { kind: 'assigned' as const, currentMemberId: 'owner' };
    for (const [view, selected] of [
      ['leads', { kind: 'owner', id: 'member:owner' }],
      ['jobs', { kind: 'member', id: 'owner', responsibility: 'supporting', filter: 'all' }],
    ] as const) {
      const allowed = teamReportExportInputSchema.parse({ dataset: 'evidence', query: { ...queries[view], selected } });
      expect(teamReportExportSelectionAllowed(allowed, scope)).toBe(true);
      const foreign = teamReportExportInputSchema.parse({ ...allowed, query: { ...allowed.query, filters: { members: ['other'] } } });
      expect(teamReportExportSelectionAllowed(foreign, scope)).toBe(false);
      const different = teamReportExportInputSchema.parse({ dataset: 'evidence', query: {
        ...queries[view], selected: view === 'leads' ? { kind: 'owner', id: 'member:other' }
          : { kind: 'member', id: 'other', responsibility: 'supporting', filter: 'all' },
      } });
      expect(teamReportExportSelectionAllowed(different, scope)).toBe(false);
      const unassigned = teamReportExportInputSchema.parse({ dataset: 'evidence', query: {
        ...queries[view], selected: { kind: 'queue', queue: 'unassigned' },
      } });
      expect(teamReportExportSelectionAllowed(unassigned, scope)).toBe(false);
    }
    const unassignedTable = teamReportExportInputSchema.parse({ query: queries.jobs, dataset: 'unassigned' });
    expect(teamReportExportSelectionAllowed(unassignedTable, scope)).toBe(false);
    expect(teamReportExportSelectionAllowed(unassignedTable, { kind: 'workspace' })).toBe(true);
  });
  it('binds preview scope, date basis, archive rules, cutoff, columns and native clock', () => {
    expect(teamReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [{ workspaceId: '00000000-0000-4000-8000-000000000002' }, { today: '2026-11-06' },
      { timezone: 'invalid' }, { columns: [...preview.columns, 'notes'] }, { count: 0 },
      { archiveVisibility: 'included' }, { inactivityCutoff: null },
      { scope: { kind: 'assigned', currentMemberId: 'other' } }]) {
      expect(teamReportExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    }
    const jobs = teamReportExportInputSchema.parse({ query: queries.jobs, dataset: 'unassigned' });
    const jobsPreview = { ...preview, input: jobs, columns: teamReportExportColumns(jobs),
      archiveVisibility: 'included', inactivityCutoff: null };
    expect(teamReportExportPreviewSchema.safeParse(jobsPreview).success).toBe(true);
    expect(teamReportExportPreviewSchema.safeParse({ ...jobsPreview, scope: { kind: 'assigned', currentMemberId: 'owner' } }).success).toBe(false);
    expect(teamReportExportPreviewSchema.safeParse({ ...jobsPreview, count: 0 }).success).toBe(false);
  });
  it('rejects invalid generation clocks, counts and unrecognized fields', () => {
    const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
    expect(teamReportExportGenerationSchema.safeParse(generation).success).toBe(true);
    for (const patch of [{ count: 50001 }, { today: '2026-11-06' }, { id: 'invalid' },
      { count: Number.MAX_SAFE_INTEGER + 1 }, { notes: 'private' }]) {
      expect(teamReportExportGenerationSchema.safeParse({ ...generation, ...patch }).success).toBe(false);
    }
  });
});
