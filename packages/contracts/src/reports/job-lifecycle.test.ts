import { describe, expect, it } from 'vitest';
import { jobLifecycleQuerySchema, jobLifecycleResultSchema } from './job-lifecycle';

const query = {
  workspaceId: '00000000-0000-4000-8000-000000000001',
  view: 'lifecycle',
  period: { from: '2026-10-01', to: '2026-10-31' },
  selectedView: 'completed',
  page: 1,
  pageSize: 25,
} as const;

const result = {
  view: 'lifecycle',
  asOf: '2026-11-05T17:00:00.000Z',
  from: query.period.from,
  to: query.period.to,
  timezone: 'America/New_York',
  scopeLabel: 'All Jobs authorized by current workspace access.',
  filters: { statuses: [], owners: [], services: [] },
  counts: { created: 2, completed: 2, canceled: 1, reopened: 1 },
  coverage: {
    created: { kind: 'complete' },
    completed: { kind: 'complete' },
    canceled: { kind: 'complete' },
    reopened: { kind: 'complete' },
  },
  evidenceIds: { created: 'created', completed: 'completed', canceled: 'canceled', reopened: 'reopened' },
  selectedView: 'completed',
  page: 1,
  pageSize: 25,
  evidenceTotal: 2,
  rows: [
    {
      id: '00000000-0000-4000-8000-000000000002',
      recordId: '00000000-0000-4000-8000-000000000002',
      label: 'J-0001 / Fictional job',
      cells: { date: '2026-10-10', status: 'in-progress', owner: 'Current teammate', service: 'Repair' },
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      recordId: '00000000-0000-4000-8000-000000000003',
      label: 'J-0002 / Fictional job',
      cells: { date: '2026-10-07', status: 'completed', owner: 'Current teammate', service: 'Repair' },
    },
  ],
} as const;

describe('jobLifecycleQuerySchema', () => {
  it('accepts a strict inclusive period and applies paging defaults', () => {
    expect(jobLifecycleQuerySchema.parse({
      workspaceId: query.workspaceId,
      view: query.view,
      period: query.period,
      selectedView: query.selectedView,
    })).toMatchObject({ page: 1, pageSize: 25 });
  });

  it('rejects reversed, oversized, invalid, and unknown query shapes', () => {
    expect(jobLifecycleQuerySchema.safeParse({ ...query, period: { from: '2026-10-31', to: '2026-10-01' } }).success).toBe(false);
    expect(jobLifecycleQuerySchema.safeParse({
      ...query,
      period: { from: '2025-01-01', to: '2026-01-02' },
    }).success).toBe(false);
    expect(jobLifecycleQuerySchema.safeParse({
      ...query,
      period: { from: '2026-02-30', to: '2026-03-01' },
    }).success).toBe(false);
    expect(jobLifecycleQuerySchema.safeParse({ ...query, unexpected: true }).success).toBe(false);
  });
});

describe('jobLifecycleResultSchema', () => {
  it('accepts distinct selected Jobs and reconciled metrics', () => {
    expect(jobLifecycleResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects mismatched counts, duplicate Jobs, out-of-period dates, and bad pages', () => {
    expect(jobLifecycleResultSchema.safeParse({
      ...result, filters: { statuses: ['canceled'], owners: [], services: [] },
    }).success).toBe(false);
    expect(jobLifecycleResultSchema.safeParse({
      ...result,
      evidenceTotal: 1,
    }).success).toBe(false);
    expect(jobLifecycleResultSchema.safeParse({
      ...result,
      rows: [result.rows[0], result.rows[0]],
    }).success).toBe(false);
    expect(jobLifecycleResultSchema.safeParse({
      ...result,
      rows: [{ ...result.rows[0], cells: { ...result.rows[0].cells, date: '2026-11-01' } }, result.rows[1]],
    }).success).toBe(false);
    expect(jobLifecycleResultSchema.safeParse({ ...result, page: 2, rows: result.rows }).success).toBe(false);
  });
});
