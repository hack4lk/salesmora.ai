import { describe, expect, it } from 'vitest';
import { estimateReportFiltersSchema, estimateAttributionMatches } from './estimate-filters';
import { estimateDecisionsQuerySchema } from './estimate-decisions';
import { estimateCurrentQuerySchema } from './estimate-current';
import { estimateFirstQuotedQuerySchema } from './estimate-first-quoted';

describe('Estimate report facets', () => {
  it('defaults omitted facets for all three report query shapes', () => {
    const workspaceId = '00000000-0000-4000-8000-000000000001';
    const period = { from: '2026-10-01', to: '2026-10-31' };
    expect(estimateDecisionsQuerySchema.parse({ workspaceId, view: 'estimate-decisions', period, selected: 'decided' }).filters)
      .toEqual({ owners: [], parents: [] });
    expect(estimateCurrentQuerySchema.parse({ workspaceId, view: 'estimate-current', selected: 'awaiting' }).filters)
      .toEqual({ owners: [], parents: [] });
    expect(estimateFirstQuotedQuerySchema.parse({ workspaceId, view: 'estimate-first-quoted', period }).filters)
      .toEqual({ owners: [], parents: [] });
  });
  it('bounds unique owner tokens and parent types without conflicting status filters', () => {
    expect(estimateReportFiltersSchema.safeParse({ owners: ['member:a', 'unassigned'], parents: ['lead', 'job'] }).success).toBe(true);
    for (const filters of [
      { owners: ['a'] }, { owners: ['member:'] }, { owners: ['unassigned', 'unassigned'] },
      { owners: ['member:a', ' member:a '] }, { parents: ['lead', 'lead'] }, { parents: ['customer'] },
      { statuses: ['accepted'] }, { owners: Array.from({ length: 51 }, (_, i) => `member:${i}`) },
    ]) expect(estimateReportFiltersSchema.safeParse(filters).success).toBe(false);
    expect(estimateReportFiltersSchema.safeParse({ owners: Array.from({ length: 50 }, (_, i) => `member:${i}`) }).success).toBe(true);
  });
  it('uses OR within each facet and AND across owner and parent facets', () => {
    const filters = { owners: ['member:a', 'unassigned'], parents: ['lead'] as const };
    expect(estimateAttributionMatches({ ownerKey: 'member:a', parentType: 'lead' }, { ...filters, parents: [...filters.parents] })).toBe(true);
    expect(estimateAttributionMatches({ ownerKey: 'unassigned', parentType: 'lead' }, { ...filters, parents: [...filters.parents] })).toBe(true);
    expect(estimateAttributionMatches({ ownerKey: 'member:a', parentType: 'job' }, { ...filters, parents: [...filters.parents] })).toBe(false);
  });
});
