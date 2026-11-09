import { describe, expect, it } from 'vitest';
import { jobCompletionQuerySchema, jobCompletionResultSchema } from './job-completion';

const query = {
  workspaceId: '00000000-0000-4000-8000-000000000001',
  view: 'completion',
  period: { from: '2026-10-07', to: '2026-10-10' },
  page: 1,
  pageSize: 25,
} as const;
const result = {
  view: 'completion',
  asOf: '2026-11-05T17:00:00.000Z',
  from: query.period.from,
  to: query.period.to,
  timezone: 'America/New_York',
  scopeLabel: 'Authorized Jobs.',
  filters: { statuses: [], owners: [], services: [] },
  total: 2,
  coverage: { kind: 'complete' },
  days: [
    { date: '2026-10-07', count: 1, evidenceId: 'completion:day:2026-10-07' },
    { date: '2026-10-08', count: 0, evidenceId: 'completion:day:2026-10-08' },
    { date: '2026-10-09', count: 0, evidenceId: 'completion:day:2026-10-09' },
    { date: '2026-10-10', count: 1, evidenceId: 'completion:day:2026-10-10' },
  ],
  duration: { sampleSize: 2, totalElapsedDays: 15, averageElapsedDays: 7.5 },
  evidenceId: 'completion:all',
  page: 1,
  pageSize: 25,
  evidenceTotal: 2,
  rows: [
    {
      id: '00000000-0000-4000-8000-000000000002',
      recordId: '00000000-0000-4000-8000-000000000002',
      label: 'J-0001 / Job A',
      createdDate: '2026-09-30',
      completionDate: '2026-10-10',
      cells: { status: 'in-progress', owner: 'Current teammate' },
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      recordId: '00000000-0000-4000-8000-000000000003',
      label: 'J-0002 / Job B',
      createdDate: '2026-10-02',
      completionDate: '2026-10-07',
      cells: { status: 'completed', owner: 'Current teammate' },
    },
  ],
} as const;

describe('Job completion contracts', () => {
  it('accepts exactly 366 inclusive dates and rejects 367, reversed, invalid and out-of-period selections', () => {
    expect(jobCompletionQuerySchema.parse(query).page).toBe(1);
    expect(jobCompletionQuerySchema.safeParse({
      ...query, period: { from: '2024-01-01', to: '2024-12-31' },
    }).success).toBe(true);
    for (const patch of [
      { period: { from: '2024-01-01', to: '2025-01-01' } },
      { period: { from: '2026-10-10', to: '2026-10-07' } },
      { period: { from: '2026-02-29', to: '2026-03-01' } },
      { selectedDate: '2026-10-11' },
      { unexpected: true },
    ]) expect(jobCompletionQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });

  it('reconciles the selected completion set, zero days, sample size and unrounded mean', () => {
    expect(jobCompletionResultSchema.safeParse(result).success).toBe(true);
    expect(jobCompletionResultSchema.safeParse({
      ...result, selectedDate: '2026-10-10', evidenceTotal: 1, rows: [result.rows[0]],
    }).success).toBe(true);
    expect(jobCompletionResultSchema.safeParse({
      ...result, selectedDate: '2026-10-08', evidenceTotal: 0, rows: [],
    }).success).toBe(true);
  });

  it('makes an empty sample unavailable instead of claiming an average of zero', () => {
    const empty = {
      ...result, total: 0, evidenceTotal: 0, rows: [],
      days: result.days.map(day => ({ ...day, count: 0 })),
      duration: { sampleSize: 0, totalElapsedDays: 0, averageElapsedDays: null },
    };
    expect(jobCompletionResultSchema.safeParse(empty).success).toBe(true);
    expect(jobCompletionResultSchema.safeParse({
      ...empty, duration: { ...empty.duration, averageElapsedDays: 0 },
    }).success).toBe(false);
  });

  it('rejects broken daily totals, missing dates, duplicate evidence, sample sums and page shapes', () => {
    for (const patch of [
      { days: result.days.slice(1) },
      { days: result.days.map(day => ({ ...day, count: 0 })) },
      { days: result.days.map(day => ({ ...day, evidenceId: 'duplicate' })) },
      { rows: [result.rows[0], result.rows[0]] },
      { page: 2 },
      { duration: { sampleSize: 1, totalElapsedDays: 15, averageElapsedDays: 15 } },
      { duration: { sampleSize: 2, totalElapsedDays: 14, averageElapsedDays: 7 } },
      { duration: { sampleSize: 2, totalElapsedDays: Number.MAX_SAFE_INTEGER + 1, averageElapsedDays: 0 } },
    ]) expect(jobCompletionResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('rejects chronology errors and missing canonical creation dates without zero-shaped fallbacks', () => {
    for (const createdDate of ['2026-10-11', '2026-02-30', null]) {
      expect(jobCompletionResultSchema.safeParse({
        ...result, rows: [{ ...result.rows[0], createdDate }, result.rows[1]],
      }).success).toBe(false);
    }
  });

  it('rejects evidence outside the returned current-status filter snapshot', () => {
    expect(jobCompletionResultSchema.safeParse({
      ...result, filters: { statuses: ['canceled'], owners: [], services: [] },
    }).success).toBe(false);
  });

  it('uses calendar days across DST, leap dates and multi-year ages', () => {
    for (const [createdDate, completionDate, days] of [
      ['2026-10-31', '2026-11-02', 2],
      ['2024-02-28', '2024-03-01', 2],
      ['2024-01-01', '2026-01-01', 731],
    ] as const) {
      expect(jobCompletionResultSchema.safeParse({
        ...result, from: completionDate, to: completionDate, total: 1, evidenceTotal: 1,
        days: [{ date: completionDate, count: 1, evidenceId: `day:${completionDate}` }],
        duration: { sampleSize: 1, totalElapsedDays: days, averageElapsedDays: days },
        rows: [{ ...result.rows[0], createdDate, completionDate }],
      }).success).toBe(true);
    }
  });
});
