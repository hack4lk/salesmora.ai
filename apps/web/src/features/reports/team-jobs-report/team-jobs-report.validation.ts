import { jobDateSchema, jobWaitingReasons } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import { activeJobStatuses, jobMatchesWorkload, type JobWorkloadRow } from '../job-workload-report/job-workload-report.validation';

export type TeamJobStatus = typeof activeJobStatuses[number];
export type TeamJobWorkload = {
  count: number;
  overdue: number;
  waiting: number;
  statuses: Readonly<Record<TeamJobStatus, number>>;
  evidenceId?: string;
  overdueEvidenceId?: string;
  waitingEvidenceId?: string;
  statusEvidenceIds?: Readonly<Partial<Record<TeamJobStatus, string>>>;
};
export type TeamJobMember = { id: string; label: string; primary: TeamJobWorkload; supporting: TeamJobWorkload };
export type TeamJobRow = Omit<JobWorkloadRow, 'primaryOwnerId'> & {
  /** Assigned-only projections withhold unrelated primary identities, including roster residuals. */
  primary: { kind: 'member'; id: string } | { kind: 'unassigned' } | { kind: 'withheld' };
  /** Surviving authorized supporting memberships only; assigned scope includes self only. */
  supportingMemberIds: readonly string[];
};
export type TeamJobQueue = 'active' | 'overdue' | 'waiting' | 'unassigned';
export type TeamJobFilter = 'all' | 'overdue' | TeamJobStatus;
export type TeamJobSelection =
  | { kind: 'queue'; queue: TeamJobQueue }
  | { kind: 'member'; id: string; responsibility: 'primary' | 'supporting'; filter: TeamJobFilter }
  | { kind: 'unassigned'; filter: TeamJobFilter };
export type TeamJobsResult = {
  scope: { kind: 'workspace' } | { kind: 'assigned'; currentMemberId: string };
  snapshotLabel: string;
  scopeLabel: string;
  today: string;
  counts: Readonly<Record<'active' | 'overdue' | 'waiting', number>>;
  members: readonly TeamJobMember[];
  /** Withheld under assigned scope; never expose a residual unassigned queue. */
  unassigned: TeamJobWorkload | null;
  evidenceIds: Readonly<Partial<Record<TeamJobQueue, string>>>;
  selected: TeamJobSelection;
  rows: readonly TeamJobRow[];
  page: number;
  pageSize: number;
};
const validDate = (date: string) => !date.startsWith('0000') && jobDateSchema.safeParse(date).success;
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;

export function teamJobOverdue(row: TeamJobRow, today: string): boolean {
  return jobMatchesWorkload({ ...row, primaryOwnerId: null }, 'overdue', today);
}

export function teamJobMatchesSelection(row: TeamJobRow, selected: TeamJobSelection, today: string): boolean {
  if (selected.kind === 'queue') {
    switch (selected.queue) {
      case 'active': return true;
      case 'overdue': return teamJobOverdue(row, today);
      case 'waiting': return row.status === 'waiting';
      case 'unassigned': return row.primary.kind === 'unassigned';
    }
  }
  const participant = selected.kind === 'unassigned' ? row.primary.kind === 'unassigned'
    : selected.responsibility === 'primary' ? row.primary.kind === 'member' && row.primary.id === selected.id
      : row.supportingMemberIds.includes(selected.id);
  return participant && (selected.filter === 'all' || (selected.filter === 'overdue' ? teamJobOverdue(row, today) : row.status === selected.filter));
}

export function teamJobSelectionTotal(result: TeamJobsResult): number | undefined {
  const selected = result.selected;
  if (selected.kind === 'queue') return selected.queue === 'unassigned' ? result.unassigned?.count : result.counts[selected.queue];
  const workload = selected.kind === 'unassigned' ? result.unassigned
    : result.members.find(member => member.id === selected.id)?.[selected.responsibility];
  if (!workload) return undefined;
  return selected.filter === 'all' ? workload.count : selected.filter === 'overdue' ? workload.overdue
    : workload.statuses[selected.filter];
}

function validWorkload(workload: TeamJobWorkload, active: number): boolean {
  return count(workload.count) && workload.count <= active && count(workload.overdue) && workload.overdue <= workload.count &&
    count(workload.waiting) && workload.waiting === workload.statuses.waiting &&
    validReportBreakdown(workload.count, activeJobStatuses.map(status => ({ id: status, count: workload.statuses[status] })));
}

export function validTeamJobsResult(result: TeamJobsResult): boolean {
  const { scope, counts, members } = result;
  if (!validDate(result.today) || !validDate(addCalendarDays(result.today, 7)) ||
    !Object.values(counts).every(value => count(value) && value <= counts.active) ||
    new Set(members.map(member => member.id)).size !== members.length ||
    !members.every(member => member.id.trim() && member.label.trim() && validWorkload(member.primary, counts.active) &&
      validWorkload(member.supporting, counts.active) && member.supporting.count <= counts.active - member.primary.count &&
      [member.primary, member.supporting].every(workload => workload.overdue <= counts.overdue && workload.waiting <= counts.waiting))) return false;
  if (scope.kind === 'assigned') {
    if (!scope.currentMemberId.trim() || result.unassigned !== null || members.some(member => member.id !== scope.currentMemberId) ||
      result.selected.kind === 'unassigned' || (result.selected.kind === 'queue' && result.selected.queue === 'unassigned') ||
      !validReportBreakdown(counts.active, members.flatMap(member => [
        { id: 'primary', count: member.primary.count }, { id: 'supporting', count: member.supporting.count },
      ])) ||
      !validReportBreakdown(counts.overdue, members.flatMap(member => [
        { id: 'primary', count: member.primary.overdue }, { id: 'supporting', count: member.supporting.overdue },
      ])) ||
      !validReportBreakdown(counts.waiting, members.flatMap(member => [
        { id: 'primary', count: member.primary.waiting }, { id: 'supporting', count: member.supporting.waiting },
      ]))) return false;
  } else {
    if (result.unassigned === null || !validWorkload(result.unassigned, counts.active) ||
      !(['count', 'overdue', 'waiting'] as const).every(key => validReportBreakdown(
        key === 'count' ? counts.active : counts[key],
        [...members.map(member => ({ id: `member:${member.id}`, count: member.primary[key] })), { id: 'unassigned', count: result.unassigned![key] }],
      ))) return false;
  }
  const total = teamJobSelectionTotal(result);
  if (total === undefined || !Number.isSafeInteger(result.page) || result.page < 1 ||
    !Number.isSafeInteger(result.pageSize) || result.pageSize < 1 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.id)).size !== result.rows.length) return false;
  if (!result.rows.every(row => {
    const primary = row.primary;
    if (!row.id.trim() || !jobMatchesWorkload({ ...row, primaryOwnerId: null }, 'active', result.today) ||
      (row.scheduledDate !== null && !validDate(row.scheduledDate)) ||
      (row.status === 'waiting' ? !jobWaitingReasons.some(reason => reason === row.waitingReason) : row.waitingReason !== null) ||
      !Object.hasOwn(row.cells, 'service') || new Set(row.supportingMemberIds).size !== row.supportingMemberIds.length ||
      row.supportingMemberIds.some(id => !members.some(member => member.id === id)) ||
      (primary.kind === 'member' && (!members.some(member => member.id === primary.id) || row.supportingMemberIds.includes(primary.id)))) return false;
    if (scope.kind === 'assigned') {
      if (row.supportingMemberIds.some(id => id !== scope.currentMemberId) || row.primary.kind === 'unassigned' ||
        (row.primary.kind === 'member' && row.primary.id !== scope.currentMemberId) ||
        (row.primary.kind === 'withheld' && !row.supportingMemberIds.includes(scope.currentMemberId))) return false;
    } else if (row.primary.kind === 'withheld') return false;
    return teamJobMatchesSelection(row, result.selected, result.today);
  })) return false;
  const unseen = counts.active - result.rows.length;
  const consistent = (observed: number, total: number) => observed <= total && total - observed <= unseen;
  const rows = result.rows;
  const matchesWorkload = (workload: TeamJobWorkload, rows: readonly TeamJobRow[]) =>
    consistent(rows.length, workload.count) && consistent(rows.filter(row => teamJobOverdue(row, result.today)).length, workload.overdue) &&
    activeJobStatuses.every(status => consistent(rows.filter(row => row.status === status).length, workload.statuses[status]));
  return consistent(rows.filter(row => teamJobOverdue(row, result.today)).length, counts.overdue) &&
    consistent(rows.filter(row => row.status === 'waiting').length, counts.waiting) &&
    (result.unassigned === null || matchesWorkload(result.unassigned, rows.filter(row => row.primary.kind === 'unassigned'))) &&
    members.every(member => matchesWorkload(member.primary, rows.filter(row => row.primary.kind === 'member' && row.primary.id === member.id)) &&
      matchesWorkload(member.supporting, rows.filter(row => row.supportingMemberIds.includes(member.id))));
}
