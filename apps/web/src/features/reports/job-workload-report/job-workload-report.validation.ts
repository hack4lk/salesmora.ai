import { jobDateSchema, jobWaitingReasons, type JobStatus } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import type { ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';

export const activeJobStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
export const jobWorkloadMetrics = ['active', 'overdue', 'dueSoon', 'noDeadline', 'waiting', 'unassigned'] as const;
export type JobWorkloadMetric = typeof jobWorkloadMetrics[number];
export type JobWorkloadGroup = { id: string; label: string; count: number; evidenceId?: string };
export type JobWorkloadRow = ReportEvidenceRow & {
  status: JobStatus;
  completionDeadline: string | null;
  scheduledDate: string | null;
  /** Surviving current primary membership; a removed member resolves to null. */
  primaryOwnerId: string | null;
  /** Host-owned stable service group key, including an explicit key for no recorded service. */
  serviceId: string;
  waitingReason: typeof jobWaitingReasons[number] | null;
};
export type JobWorkloadGrouping = 'status' | 'owner' | 'service' | 'waitingReason';
export type JobWorkloadProjection =
  | { kind: 'metric'; metric: JobWorkloadMetric }
  | { kind: 'group'; group: JobWorkloadGrouping; id: string };
export type JobWorkloadResult = {
  snapshotLabel: string;
  scopeLabel: string;
  /** Business-local today from the same server-owned snapshot as the result. */
  today: string;
  counts: Readonly<Record<JobWorkloadMetric, number>>;
  /** Owner group IDs are member:<current ID> or unassigned; other groups use contract tokens/service keys. */
  groups: Readonly<Record<JobWorkloadGrouping, readonly JobWorkloadGroup[]>>;
  evidenceIds: Readonly<Partial<Record<JobWorkloadMetric, string>>>;
  selected: JobWorkloadProjection;
  rows: readonly JobWorkloadRow[];
  page: number;
  pageSize: number;
};
const validDate = (date: string) => !date.startsWith('0000') && jobDateSchema.safeParse(date).success;

export function jobWorkloadGroupId(row: JobWorkloadRow, group: JobWorkloadGrouping): string | null {
  switch (group) {
    case 'status': return row.status;
    case 'owner': return row.primaryOwnerId === null ? 'unassigned' : `member:${row.primaryOwnerId}`;
    case 'service': return row.serviceId;
    case 'waitingReason': return row.waitingReason;
  }
}

export function jobMatchesWorkload(row: JobWorkloadRow, metric: JobWorkloadMetric, today: string): boolean {
  if (!validDate(today) || !validDate(addCalendarDays(today, 7)) || !activeJobStatuses.some(status => status === row.status) ||
    (row.completionDeadline !== null && !validDate(row.completionDeadline))) return false;
  switch (metric) {
    case 'active': return true;
    case 'overdue': return row.completionDeadline !== null && row.completionDeadline < today;
    case 'dueSoon': return row.completionDeadline !== null && row.completionDeadline >= today && row.completionDeadline <= addCalendarDays(today, 7);
    case 'noDeadline': return row.completionDeadline === null;
    case 'waiting': return row.status === 'waiting';
    case 'unassigned': return row.primaryOwnerId === null;
  }
}

export function jobWorkloadProjectionTotal(result: JobWorkloadResult): number | undefined {
  const selected = result.selected;
  return selected.kind === 'metric' ? result.counts[selected.metric]
    : result.groups[selected.group].find(group => group.id === selected.id)?.count;
}

export function validJobWorkloadResult(result: JobWorkloadResult): boolean {
  const { counts, groups } = result;
  if (!validDate(result.today) || !validDate(addCalendarDays(result.today, 7)) ||
    !jobWorkloadMetrics.every(metric => Number.isSafeInteger(counts[metric]) && counts[metric] >= 0 && counts[metric] <= counts.active) ||
    counts.overdue > counts.active - counts.dueSoon || counts.noDeadline > counts.active - counts.dueSoon - counts.overdue) return false;
  if (!(['status', 'owner', 'service'] as const).every(key => validReportBreakdown(counts.active, groups[key])) ||
    !validReportBreakdown(counts.waiting, groups.waitingReason) ||
    groups.status.some(group => !activeJobStatuses.some(status => status === group.id)) ||
    (groups.status.find(group => group.id === 'waiting')?.count ?? 0) !== counts.waiting ||
    (groups.owner.find(group => group.id === 'unassigned')?.count ?? 0) !== counts.unassigned ||
    groups.waitingReason.some(group => !jobWaitingReasons.some(reason => reason === group.id))) return false;
  const total = jobWorkloadProjectionTotal(result);
  if (total === undefined || !Number.isSafeInteger(result.page) || result.page < 1 || !Number.isSafeInteger(result.pageSize) || result.pageSize < 1 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.id)).size !== result.rows.length) return false;
  const validRows = result.rows.every(row => {
    if (!row.id.trim() || !jobMatchesWorkload(row, 'active', result.today) ||
      (row.scheduledDate !== null && !validDate(row.scheduledDate)) ||
      (row.primaryOwnerId !== null && !row.primaryOwnerId.trim()) ||
      !(['status', 'owner', 'service'] as const).every(key => groups[key].some(group => group.id === jobWorkloadGroupId(row, key) && group.count > 0)) ||
      (row.status === 'waiting' ? row.waitingReason === null || !groups.waitingReason.some(group => group.id === row.waitingReason && group.count > 0) : row.waitingReason !== null) ||
      !['owner', 'service'].every(column => Object.hasOwn(row.cells, column))) return false;
    const selected = result.selected;
    if (selected.kind === 'metric') return jobMatchesWorkload(row, selected.metric, result.today);
    return jobWorkloadGroupId(row, selected.group) === selected.id;
  });
  if (!validRows) return false;
  const unobserved = counts.active - result.rows.length;
  const consistentCount = (observed: number, total: number) => observed <= total && total - observed <= unobserved;
  return jobWorkloadMetrics.every(metric =>
    consistentCount(result.rows.filter(row => jobMatchesWorkload(row, metric, result.today)).length, counts[metric])) &&
    (['status', 'owner', 'service', 'waitingReason'] as const).every(key => groups[key].every(group =>
      consistentCount(result.rows.filter(row => jobWorkloadGroupId(row, key) === group.id).length, group.count)));
}
