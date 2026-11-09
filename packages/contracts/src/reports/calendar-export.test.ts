import { describe, expect, it } from 'vitest';
import { calendarExportColumns, calendarExportInputSchema, calendarExportPreviewSchema,
  calendarExportGenerationSchema } from './calendar-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-11-01', to: '2026-11-07' };
const input = (view: string, dataset: string, selected: string) => calendarExportInputSchema.parse({
  dataset, query: { workspaceId, view, selected, ...(view === 'calendar-unscheduled' ? {} : { period }) },
});
const scheduled = input('calendar-scheduled', 'summary', 'visits');
const metadata = {
  workspaceId, policyRevision: 1, scope: { kind: 'workspace' },
  outputScopes: { jobs: { kind: 'available', scope: 'workspace' },
    workOrders: { kind: 'available', scope: 'assigned_job' } },
  asOf: '2026-11-05T10:00:00Z', today: '2026-11-05', timezone: 'Europe/Warsaw',
  dateBasis: 'current-scheduled-date', count: 1,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
};
const preview = { ...metadata, input: scheduled, viewerId: 'owner',
  coverage: 'Current authorized active records; shared visits count once.',
  columns: calendarExportColumns(scheduled) };

describe('Calendar CSV contracts', () => {
  it('supports all native evidence and summary tables without pagination or forged authority', () => {
    for (const [view, dataset, selected] of [
      ['calendar-scheduled', 'summary', 'visits'], ['calendar-scheduled', 'days', 'visits'],
      ['calendar-scheduled', 'person-days', 'busy-person-days'], ['calendar-scheduled', 'visits', 'visits'],
      ['calendar-scheduled', 'busy-person-days', 'busy-person-days'],
      ['calendar-review', 'summary', 'overlaps'], ['calendar-review', 'overlaps', 'overlaps'],
      ['calendar-review', 'past', 'past'], ['calendar-unscheduled', 'summary', 'visits'],
      ['calendar-unscheduled', 'visits', 'visits'], ['calendar-unscheduled', 'jobs', 'jobs'],
      ['calendar-unscheduled', 'workOrders', 'workOrders'],
    ]) {
      const parsed = input(view!, dataset!, selected!);
      expect(parsed.query).not.toHaveProperty('page');
      expect(parsed.query).not.toHaveProperty('pageSize');
      const columns = calendarExportColumns(parsed);
      expect(new Set(columns).size).toBe(columns.length);
      expect(columns).not.toContain('email');
      expect(columns).not.toContain('notes');
      for (const patch of [{ page: 1 }, { pageSize: 25 }, { scope: 'workspace' }, { actorId: 'forged' }]) {
        expect(calendarExportInputSchema.safeParse({ ...parsed, query: { ...parsed.query, ...patch } }).success).toBe(false);
      }
    }
    expect(calendarExportInputSchema.safeParse({ ...scheduled, columns: ['private'] }).success).toBe(false);
  });
  it('rejects incompatible views/selections and historical controls on current-only unscheduled work', () => {
    for (const patch of [
      { dataset: 'overlaps' }, { dataset: 'workOrders' },
      { query: { ...scheduled.query, selected: 'busy-person-days' } },
      { query: { ...scheduled.query, period: { from: '2026-01-01', to: '2027-01-02' } } },
      { query: { ...scheduled.query, filters: { participants: [], recordTypes: ['lead'] } } },
    ]) expect(calendarExportInputSchema.safeParse({ ...scheduled, ...patch }).success).toBe(false);
    const unscheduled = input('calendar-unscheduled', 'visits', 'visits');
    expect(calendarExportInputSchema.safeParse({ ...unscheduled, query: { ...unscheduled.query, period } }).success).toBe(false);
    expect(calendarExportInputSchema.safeParse({ ...scheduled,
      query: { ...scheduled.query, period: { from: '2026-11-01', to: '2027-01-01' } } }).success).toBe(true);
  });
  it('binds previews to exact columns, native clocks, own scope and supporting export authority', () => {
    expect(calendarExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { today: '2026-11-06' },
      { timezone: 'invalid' }, { columns: [...preview.columns, 'notes'] }, { count: 0 },
      { dateBasis: 'current-unscheduled' }, { scope: { kind: 'own', viewerId: 'other' } },
      { outputScopes: { jobs: { kind: 'unavailable', reason: 'permissions' },
        workOrders: { kind: 'unavailable', reason: 'permissions' } } },
    ]) expect(calendarExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    const days = input('calendar-scheduled', 'days', 'visits');
    expect(calendarExportPreviewSchema.safeParse({ ...preview, input: days, columns: calendarExportColumns(days), count: 7 }).success).toBe(true);
    expect(calendarExportPreviewSchema.safeParse({ ...preview, input: days, columns: calendarExportColumns(days), count: 6 }).success).toBe(false);
    const jobs = input('calendar-unscheduled', 'jobs', 'jobs');
    const jobsPreview = { ...preview, input: jobs, columns: calendarExportColumns(jobs),
      dateBasis: 'current-unscheduled', count: 0 };
    expect(calendarExportPreviewSchema.safeParse(jobsPreview).success).toBe(true);
    expect(calendarExportPreviewSchema.safeParse({ ...jobsPreview, outputScopes: {
      ...metadata.outputScopes, jobs: { kind: 'unavailable', reason: 'permissions' },
    } }).success).toBe(false);
    expect(calendarExportPreviewSchema.safeParse({ ...preview, input: { ...scheduled,
      query: { ...scheduled.query, filters: { participants: [], recordTypes: ['work_order'] } } },
      outputScopes: { ...metadata.outputScopes, workOrders: { kind: 'unavailable', reason: 'permissions' } },
    }).success).toBe(false);
    expect(calendarExportPreviewSchema.safeParse({ ...preview, count: 50001,
      input: input('calendar-scheduled', 'visits', 'visits'),
      columns: calendarExportColumns(input('calendar-scheduled', 'visits', 'visits')) }).success).toBe(true);
  });
  it('rejects invalid generation metadata and counts beyond generation limits', () => {
    const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
    expect(calendarExportGenerationSchema.safeParse(generation).success).toBe(true);
    for (const patch of [{ count: 50001 }, { today: '2026-11-06' }, { id: 'invalid' },
      { count: Number.MAX_SAFE_INTEGER + 1 }, { notes: 'private' }]) {
      expect(calendarExportGenerationSchema.safeParse({ ...generation, ...patch }).success).toBe(false);
    }
  });
});
