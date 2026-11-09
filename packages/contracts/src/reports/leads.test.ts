import { describe, expect, it } from 'vitest';
import { leadReportQuerySchema, leadReportResultSchema } from './leads';

const filters = { stages: [], owners: [], sources: [] };
const context = {
  asOf: '2026-11-06T12:00:00.000Z',
  today: '2026-11-06',
  timezone: 'UTC',
  scopeLabel: 'Assigned Leads only. Archived Leads excluded by your access.',
  archiveVisibility: 'excluded',
} as const;
const page = { page: 1, pageSize: 25, evidenceTotal: 1 };
const row = {
  id: 'lead-1',
  label: 'Fixture lead',
  recordId: '00000000-0000-4000-8000-000000000001',
  cells: { created: '2026-10-10', assignment: 'Me', source: 'website', stage: 'new', activity: '2026-11-01T10:00:00.000Z', age: '27' },
};

describe('Lead report contracts', () => {
  it('accepts only closed report views and canonical selections', () => {
    expect(leadReportQuerySchema.safeParse({
      workspaceId: '00000000-0000-4000-8000-000000000001',
      view: 'pipeline',
      selection: { kind: 'stage', stage: 'new' },
      filters,
      page: 1,
      pageSize: 25,
    }).success).toBe(true);
    expect(leadReportQuerySchema.safeParse({
      workspaceId: '00000000-0000-4000-8000-000000000001',
      view: 'pipeline',
      selection: { kind: 'stage', stage: 'won' },
      filters,
      page: 1,
      pageSize: 25,
    }).success).toBe(false);
    expect(leadReportQuerySchema.safeParse({
      workspaceId: '00000000-0000-4000-8000-000000000001',
      view: 'pipeline',
      selection: { kind: 'pipeline' },
      filters,
      page: 1,
      pageSize: 25,
      actorId: 'browser-supplied',
    }).success).toBe(false);
  });

  it('rejects invalid dates, reversed periods and duplicate filters', () => {
    const base = {
      workspaceId: '00000000-0000-4000-8000-000000000001',
      view: 'intake',
      period: { from: '2026-10-01', to: '2026-10-31' },
      currentFilters: filters,
      filters,
      page: 1,
      pageSize: 25,
    };
    expect(leadReportQuerySchema.safeParse(base).success).toBe(true);
    expect(leadReportQuerySchema.safeParse({
      ...base,
      period: { from: '2026-02-30', to: '2026-03-01' },
    }).success).toBe(false);
    expect(leadReportQuerySchema.safeParse({
      ...base,
      period: { from: '2026-11-01', to: '2026-10-01' },
    }).success).toBe(false);
    expect(leadReportQuerySchema.safeParse({
      ...base,
      filters: { ...filters, sources: ['website', 'website'] },
    }).success).toBe(false);
  });

  it('reconciles intake group and trend totals with the evidence page', () => {
    const result = {
      ...context,
      view: 'intake',
      from: '2026-10-10',
      to: '2026-10-10',
      total: 1,
      sources: [
        { source: 'website', count: 1 },
        { source: 'referral', count: 0 },
        { source: 'phone', count: 0 },
        { source: 'gmail', count: 0 },
        { source: 'other', count: 0 },
      ],
      trend: [{ date: '2026-10-10', count: 1 }],
      currentOpenLeads: 1,
      ...page,
      rows: [row],
    };
    expect(leadReportResultSchema.safeParse(result).success).toBe(true);
    expect(leadReportResultSchema.safeParse({
      ...result,
      trend: [{ date: '2026-10-10', count: 0 }],
    }).success).toBe(false);
  });

  it('requires pipeline stage and age groups to reconcile independently', () => {
    const result = {
      ...context,
      view: 'pipeline',
      total: 1,
      stages: { new: 1, contacted: 0, 'estimate-sent': 0 },
      ages: { '0-7': 0, '8-14': 0, '15-30': 1, '31+': 0 },
      selection: { kind: 'pipeline' },
      ...page,
      rows: [row],
    };
    expect(leadReportResultSchema.safeParse(result).success).toBe(true);
    expect(leadReportResultSchema.safeParse({
      ...result,
      ages: { ...result.ages, '31+': 1 },
    }).success).toBe(false);
  });

  it('keeps overlapping outcomes and attention counts as distinct metrics', () => {
    const outcomes = {
      ...context,
      view: 'won',
      from: '2026-10-01',
      to: '2026-10-31',
      counts: { won: 1, lost: 1 },
      coverage: { kind: 'partial', explanation: 'Only recorded transitions are counted.' },
      ...page,
      rows: [row],
    };
    expect(leadReportResultSchema.safeParse(outcomes).success).toBe(true);
    const attention = {
      ...context,
      view: 'attention',
      inactivityCutoff: '2026-10-30T12:00:00.000Z',
      counts: { inactive: 1, unowned: 1, combined: 1 },
      selection: 'combined',
      ...page,
      rows: [row],
    };
    expect(leadReportResultSchema.safeParse(attention).success).toBe(true);
    expect(leadReportResultSchema.safeParse({
      ...attention,
      counts: { inactive: 1, unowned: 1, combined: 0 },
    }).success).toBe(false);
  });
});
