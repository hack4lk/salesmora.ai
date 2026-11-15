import { describe, expect, it } from 'vitest';
import { teamLeadsQuerySchema, teamLeadsResultSchema } from './team-leads';

const empty = { count: 0, inactive: 0, stages: { new: 0, contacted: 0, 'estimate-sent': 0 } };
const result = {
  view: 'team-leads', asOf: '2026-11-05T17:00:00.000Z', today: '2026-11-05', timezone: 'America/New_York',
  inactivityCutoff: '2026-10-29T17:00:00.000000Z', scopeLabel: 'Current open Leads.',
  scope: { kind: 'workspace' },
  filters: { members: [] },
  counts: { open: 2, inactive: 1, unassigned: 1 },
  owners: [
    { id: 'member:a', label: 'A', count: 1, inactive: 1, stages: { new: 1, contacted: 0, 'estimate-sent': 0 } },
    { id: 'unassigned', label: 'Reassignment needed', count: 1, inactive: 0, stages: { new: 0, contacted: 1, 'estimate-sent': 0 } },
  ],
  selected: { kind: 'queue', queue: 'open' }, page: 1, pageSize: 25, evidenceTotal: 2,
  rows: [
    {
      id: '00000000-0000-4000-8000-000000000001', recordId: '00000000-0000-4000-8000-000000000001',
      label: 'Lead A', stage: 'new', archived: false, currentOwnerId: 'a', ownerState: 'member', inactive: true,
      cells: { created: '2026-10-01T17:00:00.000000Z', activity: '2026-10-29T16:59:59.999999Z', owner: 'A' },
    },
    {
      id: '00000000-0000-4000-8000-000000000002', recordId: '00000000-0000-4000-8000-000000000002',
      label: 'Lead B', stage: 'contacted', archived: false, currentOwnerId: null, ownerState: 'former', inactive: false,
      cells: { created: '2026-10-01T17:00:00.000000Z', activity: '2026-10-29T17:00:00.000000Z', owner: 'Former owner' },
    },
  ],
} as const;

describe('Team Lead contracts', () => {
  it('requires the applied member snapshot and validates matching owner aggregates and evidence', () => {
    const filtered = {
      ...result, filters: { members: ['a'] }, counts: { open: 1, inactive: 1, unassigned: 0 },
      owners: [result.owners[0], { ...result.owners[1], ...empty }],
      evidenceTotal: 1, rows: [result.rows[0]],
    };
    expect(teamLeadsResultSchema.safeParse(filtered).success).toBe(true);
    expect(teamLeadsResultSchema.safeParse({ ...result, filters: { members: ['a'] } }).success).toBe(false);
    expect(teamLeadsResultSchema.safeParse({ ...filtered, filters: { members: ['missing'] } }).success).toBe(false);
    expect(teamLeadsResultSchema.safeParse({ ...result, filters: undefined }).success).toBe(false);
  });

  it('accepts strict queries and rejects incompatible stage/inactivity evidence selections', () => {
    const base = { workspaceId: result.rows[0].id, view: 'team-leads' };
    expect(teamLeadsQuerySchema.parse({ ...base, selected: result.selected }).pageSize).toBe(25);
    expect(teamLeadsQuerySchema.safeParse({
      ...base, selected: { kind: 'owner', id: 'member:a', stage: 'new', inactiveOnly: true },
    }).success).toBe(false);
    expect(teamLeadsQuerySchema.safeParse({
      ...base, selected: { kind: 'owner', id: 'a' },
    }).success).toBe(false);
  });

  it('reconciles current owner/stage workload and preserves former-owner state', () => {
    expect(teamLeadsResultSchema.safeParse(result).success).toBe(true);
    expect(teamLeadsResultSchema.safeParse({
      ...result, selected: { kind: 'owner', id: 'unassigned' }, evidenceTotal: 1, rows: [result.rows[1]],
    }).success).toBe(true);
  });

  it('honors the exact strict inactivity cutoff including microseconds', () => {
    const cutoff = result.inactivityCutoff;
    expect(teamLeadsResultSchema.safeParse({
      ...result, rows: [{ ...result.rows[0], cells: { ...result.rows[0].cells, activity: cutoff } }, result.rows[1]],
    }).success).toBe(false);
    expect(teamLeadsResultSchema.safeParse({
      ...result, inactivityCutoff: '2026-10-29T17:00:00.000001Z',
    }).success).toBe(false);
  });

  it('suppresses unrelated owners and residual queues under assigned scope', () => {
    const mine = {
      ...result, scope: { kind: 'assigned', currentMemberId: 'a' },
      counts: { open: 1, inactive: 1, unassigned: 0 }, owners: [result.owners[0]],
      evidenceTotal: 1, rows: [result.rows[0]],
    };
    expect(teamLeadsResultSchema.safeParse(mine).success).toBe(true);
    expect(teamLeadsResultSchema.safeParse({ ...mine, owners: result.owners }).success).toBe(false);
    expect(teamLeadsResultSchema.safeParse({
      ...mine, selected: { kind: 'queue', queue: 'unassigned' }, rows: [], evidenceTotal: 0,
    }).success).toBe(false);
  });

  it('rejects mismatched totals, duplicate evidence, closed/archived Leads and stale pages', () => {
    for (const patch of [
      { counts: { ...result.counts, inactive: 2 } },
      { rows: [result.rows[0], result.rows[0]] },
      { rows: [{ ...result.rows[0], stage: 'won' }, result.rows[1]] },
      { rows: [{ ...result.rows[0], archived: true }, result.rows[1]] },
      { rows: [{ ...result.rows[0], currentOwnerId: null }, result.rows[1]] },
      { page: 2 },
    ]) expect(teamLeadsResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('represents empty workload without inventing owner or inactivity counts', () => {
    expect(teamLeadsResultSchema.safeParse({
      ...result, counts: { open: 0, inactive: 0, unassigned: 0 },
      owners: [{ id: 'unassigned', label: 'No current owner', ...empty }],
      evidenceTotal: 0, rows: [],
    }).success).toBe(true);
  });
});
