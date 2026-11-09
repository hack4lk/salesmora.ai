import { workloadRows, workloadResult } from '../job-workload-report/job-workload-report.fixtures';
import { activeJobStatuses } from '../job-workload-report/job-workload-report.validation';
import { teamJobOverdue, type TeamJobWorkload, type TeamJobRow, type TeamJobsResult } from './team-jobs-report.validation';

export const teamJobRows: readonly TeamJobRow[] = workloadRows.map(row => {
  const { primaryOwnerId, ...job } = row;
  return { ...job, primary: primaryOwnerId === null ? { kind: 'unassigned' } : { kind: 'member', id: primaryOwnerId },
    supportingMemberIds: row.id === 'd0' ? ['member-b', 'member-c'] : row.id === 'd2' ? ['member-a'] : row.id === 'd3' ? ['member-c'] : [] };
});
/** Mock same-snapshot distinct aggregation only, not a production query. */
export function teamJobWorkload(rows: readonly TeamJobRow[], prefix: string): TeamJobWorkload {
  return {
    count: rows.length, overdue: rows.filter(row => teamJobOverdue(row, workloadResult.today)).length,
    waiting: rows.filter(row => row.status === 'waiting').length,
    statuses: {
      'needs-scheduling': rows.filter(row => row.status === 'needs-scheduling').length,
      scheduled: rows.filter(row => row.status === 'scheduled').length,
      'in-progress': rows.filter(row => row.status === 'in-progress').length,
      waiting: rows.filter(row => row.status === 'waiting').length,
    },
    evidenceId: `${prefix}:all`, overdueEvidenceId: `${prefix}:overdue`, waitingEvidenceId: `${prefix}:waiting`,
    statusEvidenceIds: Object.fromEntries(activeJobStatuses.map(status => [status, `${prefix}:${status}`])),
  };
}
export const teamJobsResult: TeamJobsResult = {
  scope: { kind: 'workspace' }, snapshotLabel: workloadResult.snapshotLabel, scopeLabel: 'All currently authorized active Jobs and current participants.',
  today: workloadResult.today, counts: { active: 5, overdue: 1, waiting: 1 },
  // Deliberately unsorted; members with only supporting participation still have their own card.
  members: [{ id: 'member-c', label: 'Casey' }, { id: 'member-a', label: 'Alex' }, { id: 'member-b', label: 'Blair' }].map(member => ({
    ...member,
    primary: teamJobWorkload(teamJobRows.filter(row => row.primary.kind === 'member' && row.primary.id === member.id), `${member.id}:primary`),
    supporting: teamJobWorkload(teamJobRows.filter(row => row.supportingMemberIds.includes(member.id)), `${member.id}:supporting`),
  })),
  unassigned: teamJobWorkload(teamJobRows.filter(row => row.primary.kind === 'unassigned'), 'unassigned'),
  evidenceIds: { active: 'active', overdue: 'overdue', waiting: 'waiting', unassigned: 'unassigned' },
  selected: { kind: 'queue', queue: 'active' }, rows: teamJobRows, page: 1, pageSize: 25,
};
export const myJobsResult: TeamJobsResult = {
  ...teamJobsResult, scope: { kind: 'assigned', currentMemberId: 'member-c' },
  scopeLabel: 'My currently authorized supporting Jobs only; no hidden primary identities or teammate roster.',
  counts: { active: 2, overdue: 1, waiting: 0 }, members: teamJobsResult.members.filter(member => member.id === 'member-c'), unassigned: null,
  evidenceIds: { active: 'active', overdue: 'overdue', waiting: 'waiting' },
  rows: teamJobRows.filter(row => row.supportingMemberIds.includes('member-c')).map(row => ({
    ...row, primary: { kind: 'withheld' }, supportingMemberIds: ['member-c'],
    cells: { ...row.cells, owner: 'Unreliable unrelated primary', supporting: 'Unreliable hidden roster' },
  })),
};
