import { describe, expect, it } from 'vitest';
import { teamReportFiltersSchema } from './team-filters';
import { teamJobsQuerySchema } from './team-jobs';
import { teamLeadsQuerySchema } from './team-leads';

describe('Team member filters', () => {
  it('defaults omitted filters to the unfiltered population on both views', () => {
    const workspaceId = '00000000-0000-4000-8000-000000000001';
    for (const [schema, view, queue] of [
      [teamJobsQuerySchema, 'team-jobs', 'active'],
      [teamLeadsQuerySchema, 'team-leads', 'open'],
    ] as const) {
      expect(schema.parse({ workspaceId, view, selected: { kind: 'queue', queue } }).filters).toEqual({ members: [] });
    }
  });

  it('accepts at most 50 unique current member IDs and rejects sentinels and unknown facets', () => {
    expect(teamReportFiltersSchema.parse({ members: [' a ', 'b'] })).toEqual({ members: ['a', 'b'] });
    expect(teamReportFiltersSchema.safeParse({ members: Array.from({ length: 50 }, (_, i) => `m${i}`) }).success).toBe(true);
    for (const members of [[''], ['unassigned'], ['a', ' a '], ['a'.repeat(201)],
      Array.from({ length: 51 }, (_, i) => `m${i}`)]) {
      expect(teamReportFiltersSchema.safeParse({ members }).success).toBe(false);
    }
    expect(teamReportFiltersSchema.safeParse({ members: [], owners: [] }).success).toBe(false);
  });
});
