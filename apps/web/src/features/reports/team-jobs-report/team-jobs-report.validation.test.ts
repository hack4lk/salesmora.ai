import { describe, expect, it } from 'vitest';
import { validTeamJobsResult, teamJobMatchesSelection } from './team-jobs-report.validation';
import { teamJobRows as rows, teamJobsResult as result, myJobsResult, teamJobWorkload } from './team-jobs-report.fixtures';

describe('Team Jobs distinct responsibility and participation', () => {
  it('counts a primary A/support B,C Job once overall and once per applicable person', () => {
    const row = rows[0]!;
    const fixture = { ...result, counts: { active: 1, overdue: 1, waiting: 0 }, rows: [row],
      members: result.members.map(member => ({ ...member,
        primary: teamJobWorkload(row.primary.kind === 'member' && row.primary.id === member.id ? [row] : [], 'primary'),
        supporting: teamJobWorkload(row.supportingMemberIds.includes(member.id) ? [row] : [], 'supporting'),
      })), unassigned: teamJobWorkload([], 'unassigned') };
    expect(validTeamJobsResult(fixture)).toBe(true);
    expect(fixture.members.find(member => member.id === 'member-a')!.primary.count).toBe(1);
    expect(fixture.members.find(member => member.id === 'member-b')!.supporting.count).toBe(1);
    expect(fixture.members.find(member => member.id === 'member-c')!.supporting.count).toBe(1);
    expect(fixture.counts.active).toBe(1);
  });
  it('accepts reconciled workspace and self-only assigned results', () => {
    expect(validTeamJobsResult(result)).toBe(true);
    expect(validTeamJobsResult(myJobsResult)).toBe(true);
  });
  it('rejects duplicate participant relations, duplicate Jobs and primary/support overlap', () => {
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, supportingMemberIds: ['member-b', 'member-b'] }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, supportingMemberIds: ['member-a'] }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamJobsResult({ ...result, rows: [rows[0]!, rows[0]!, ...rows.slice(2)] })).toBe(false);
  });
  it('excludes closed Jobs and rejects invalid deadline/schedule/Waiting evidence', () => {
    for (const status of ['completed', 'canceled'] as const) {
      expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, status }, ...rows.slice(1)] })).toBe(false);
    }
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, completionDeadline: '2026-02-30' }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, scheduledDate: 'bad' }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamJobsResult({ ...result, rows: rows.map(row => row.status === 'waiting' ? { ...row, waitingReason: null } : row) })).toBe(false);
  });
  it('uses strict overdue deadlines, not scheduled dates or missing deadlines', () => {
    expect(teamJobMatchesSelection(rows[0]!, { kind: 'queue', queue: 'overdue' }, result.today)).toBe(true);
    for (const row of rows.slice(1)) expect(teamJobMatchesSelection(row, { kind: 'queue', queue: 'overdue' }, result.today)).toBe(false);
    expect(validTeamJobsResult({ ...result, selected: { kind: 'queue', queue: 'overdue' }, rows: [rows[1]!] })).toBe(false);
  });
  it('rejects impossible primary, supporting and global counts', () => {
    for (const active of [-1, 0.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      expect(validTeamJobsResult({ ...result, counts: { ...result.counts, active } })).toBe(false);
    }
    expect(validTeamJobsResult({ ...result, counts: { ...result.counts, waiting: 2 } })).toBe(false);
    expect(validTeamJobsResult({ ...result, members: result.members.map(member => ({ ...member, supporting: { ...member.supporting, count: 5 } })) })).toBe(false);
  });
  it('rejects hidden participant IDs and withheld ownership in workspace results', () => {
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, supportingMemberIds: ['hidden'] }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamJobsResult({ ...result, rows: [{ ...rows[0]!, primary: { kind: 'withheld' } }, ...rows.slice(1)] })).toBe(false);
  });
  it('withholds unrelated primary identities, rosters and unassigned residuals in assigned scope', () => {
    expect(validTeamJobsResult({ ...myJobsResult, rows: [{ ...myJobsResult.rows[0]!, primary: { kind: 'member', id: 'member-a' } }, myJobsResult.rows[1]!] })).toBe(false);
    expect(validTeamJobsResult({ ...myJobsResult, rows: [{ ...myJobsResult.rows[0]!, supportingMemberIds: ['member-c', 'member-b'] }, myJobsResult.rows[1]!] })).toBe(false);
    expect(validTeamJobsResult({ ...myJobsResult, unassigned: result.unassigned })).toBe(false);
    expect(validTeamJobsResult({ ...myJobsResult, selected: { kind: 'queue', queue: 'unassigned' }, rows: [] })).toBe(false);
  });
  it('requires own primary/supporting counts to reconcile to the assigned distinct total', () => {
    expect(validTeamJobsResult({ ...myJobsResult, counts: { active: 3, overdue: 1, waiting: 0 } })).toBe(false);
    expect(validTeamJobsResult({ ...myJobsResult, rows: [{ ...myJobsResult.rows[0]!, supportingMemberIds: [] }, myJobsResult.rows[1]!] })).toBe(false);
  });
  it('accepts self-owned and self-supporting Jobs as separate parts of My workload', () => {
    const primaryRows = rows.filter(row => row.primary.kind === 'member' && row.primary.id === 'member-a')
      .map(row => ({ ...row, supportingMemberIds: [] }));
    const supportingRows = rows.filter(row => row.supportingMemberIds.includes('member-a'))
      .map(row => ({ ...row, primary: { kind: 'withheld' as const }, supportingMemberIds: ['member-a'] }));
    expect(validTeamJobsResult({ ...myJobsResult, scope: { kind: 'assigned', currentMemberId: 'member-a' },
      counts: { active: 3, overdue: 1, waiting: 1 }, rows: [...primaryRows, ...supportingRows],
      members: [{ id: 'member-a', label: 'Me', primary: teamJobWorkload(primaryRows, 'primary'), supporting: teamJobWorkload(supportingRows, 'supporting') }],
    })).toBe(true);
  });
  it('supports filtered unassigned evidence without confusing it with member participation', () => {
    expect(validTeamJobsResult({ ...result, selected: { kind: 'unassigned', filter: 'needs-scheduling' }, rows: [rows[3]!] })).toBe(true);
    expect(validTeamJobsResult({ ...result, selected: { kind: 'unassigned', filter: 'overdue' }, rows: [] })).toBe(true);
    expect(validTeamJobsResult({ ...myJobsResult, selected: { kind: 'unassigned', filter: 'all' }, rows: [] })).toBe(false);
  });
  it('supports member status/overdue/Waiting evidence and rejects wrong responsibility', () => {
    expect(validTeamJobsResult({ ...result, selected: { kind: 'member', id: 'member-b', responsibility: 'supporting', filter: 'overdue' }, rows: [rows[0]!] })).toBe(true);
    expect(validTeamJobsResult({ ...result, selected: { kind: 'member', id: 'member-a', responsibility: 'supporting', filter: 'waiting' }, rows: [rows[2]!] })).toBe(true);
    expect(validTeamJobsResult({ ...result, selected: { kind: 'member', id: 'member-a', responsibility: 'primary', filter: 'scheduled' }, rows: [rows[1]!] })).toBe(true);
    expect(validTeamJobsResult({ ...result, selected: { kind: 'member', id: 'member-b', responsibility: 'primary', filter: 'waiting' }, rows: [rows[0]!] })).toBe(false);
  });
  it('supports empty and paginated evidence but rejects observed count inconsistencies', () => {
    expect(validTeamJobsResult({ ...result, pageSize: 2, rows: rows.slice(0, 2) })).toBe(true);
    expect(validTeamJobsResult({ ...result, pageSize: 2, page: 3, rows: rows.slice(4) })).toBe(true);
    expect(validTeamJobsResult({ ...result, pageSize: 2, page: 4, rows: [] })).toBe(false);
    expect(validTeamJobsResult({ ...result, counts: { active: 0, overdue: 0, waiting: 0 }, members: [], rows: [], unassigned: teamJobWorkload([], 'unassigned') })).toBe(true);
  });
});
