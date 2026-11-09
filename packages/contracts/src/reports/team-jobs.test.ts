import { describe, expect, it } from 'vitest';
import { teamJobsQuerySchema, teamJobsResultSchema } from './team-jobs';

const empty = { count: 0, overdue: 0, waiting: 0, statuses: { 'needs-scheduling': 0, scheduled: 0, 'in-progress': 0, waiting: 0 } };
const busy = { count: 1, overdue: 1, waiting: 1, statuses: { ...empty.statuses, waiting: 1 } };
const row = {
  id: '00000000-0000-4000-8000-000000000001',
  recordId: '00000000-0000-4000-8000-000000000001',
  label: 'J-0001 / Shared Job', status: 'waiting', completionDeadline: '2026-11-04',
  scheduledDate: null, waitingReason: 'materials', cells: { service: 'Repair' },
  primary: { kind: 'member', id: 'a' }, supportingMemberIds: ['b', 'c'],
} as const;
const result = {
  view: 'team-jobs', asOf: '2026-11-05T17:00:00.000Z', today: '2026-11-05', timezone: 'America/New_York',
  scopeLabel: 'Authorized Jobs.', scope: { kind: 'workspace' },
  filters: { members: [] },
  counts: { active: 1, overdue: 1, waiting: 1 },
  members: [
    { id: 'a', label: 'A', primary: busy, supporting: empty },
    { id: 'b', label: 'B', primary: empty, supporting: busy },
    { id: 'c', label: 'C', primary: empty, supporting: busy },
  ],
  unassigned: empty, selected: { kind: 'queue', queue: 'active' },
  page: 1, pageSize: 25, evidenceTotal: 1, rows: [row],
} as const;

describe('Team Jobs contracts', () => {
  it('accepts primary/supporting OR filters without discarding other responsibility cards', () => {
    expect(teamJobsResultSchema.safeParse({ ...result, filters: { members: ['b', 'c'] } }).success).toBe(true);
    expect(teamJobsResultSchema.safeParse({ ...result, filters: { members: ['a'] } }).success).toBe(true);
    expect(teamJobsResultSchema.safeParse({ ...result, filters: { members: ['missing'] } }).success).toBe(false);
    const unmatched = { ...result, filters: { members: ['d'] },
      members: [...result.members, { id: 'd', label: 'D', primary: empty, supporting: empty }] };
    expect(teamJobsResultSchema.safeParse(unmatched).success).toBe(false);
    expect(teamJobsResultSchema.safeParse({ ...result, filters: undefined }).success).toBe(false);
  });

  it('accepts strict bounded queries and rejects unknown selection shapes', () => {
    expect(teamJobsQuerySchema.parse({
      workspaceId: row.id, view: 'team-jobs', selected: result.selected,
    }).pageSize).toBe(25);
    expect(teamJobsQuerySchema.safeParse({
      workspaceId: row.id, view: 'team-jobs', selected: { kind: 'member', id: 'b', responsibility: 'supporting', filter: 'overdue' },
    }).success).toBe(true);
    expect(teamJobsQuerySchema.safeParse({
      workspaceId: row.id, view: 'team-jobs', selected: { kind: 'queue', queue: 'completed' },
    }).success).toBe(false);
  });

  it('counts a shared Job once overall while supporting totals are non-additive', () => {
    expect(teamJobsResultSchema.safeParse(result).success).toBe(true);
    expect(teamJobsResultSchema.safeParse({
      ...result, selected: { kind: 'member', id: 'b', responsibility: 'supporting', filter: 'overdue' },
    }).success).toBe(true);
  });

  it('withholds unrelated primary identities, roster and unassigned residuals under assigned scope', () => {
    const mine = {
      ...result, scope: { kind: 'assigned', currentMemberId: 'b' },
      members: [result.members[1]], unassigned: null,
      rows: [{ ...row, primary: { kind: 'withheld' }, supportingMemberIds: ['b'] }],
    };
    expect(teamJobsResultSchema.safeParse(mine).success).toBe(true);
    for (const patch of [
      { members: result.members },
      { unassigned: empty },
      { rows: [row] },
      { selected: { kind: 'queue', queue: 'unassigned' } },
    ]) expect(teamJobsResultSchema.safeParse({ ...mine, ...patch }).success).toBe(false);
  });

  it('rejects primary/support overlap, duplicate evidence, mismatched groups and invalid deadlines', () => {
    for (const patch of [
      { rows: [{ ...row, supportingMemberIds: ['a', 'b'] }] },
      { rows: [{ ...row, supportingMemberIds: ['b', 'b'] }] },
      { rows: [row, row] },
      { counts: { ...result.counts, active: 2 } },
      { rows: [{ ...row, completionDeadline: '2026-11-05' }] },
      { rows: [{ ...row, waitingReason: null }] },
      { page: 2 },
    ]) expect(teamJobsResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('supports empty workload and a separate unassigned primary queue', () => {
    expect(teamJobsResultSchema.safeParse({
      ...result, counts: { active: 0, overdue: 0, waiting: 0 }, members: [],
      evidenceTotal: 0, rows: [],
    }).success).toBe(true);
    expect(teamJobsResultSchema.safeParse({
      ...result, members: [], unassigned: busy,
      selected: { kind: 'unassigned', filter: 'waiting' },
      rows: [{ ...row, primary: { kind: 'unassigned' }, supportingMemberIds: [] }],
    }).success).toBe(true);
  });
});
