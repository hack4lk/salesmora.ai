import { jobDateSchema } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { resolveReportPeriod, validReportTimezone } from '../report-date-controls/report-date-controls.validation';

export type CalendarScheduledDay = { date: string; count: number; unassignedCount: number };
export type CalendarScheduledMember = { id: string; label: string; counts: readonly number[] };
export type CalendarScheduledVisit = {
  /** Workspace-qualified canonical visit identity; never inferred from matching fields. */
  id: string;
  label: string;
  date: string;
  participantIds: readonly string[];
  /** Only currently authorized active records, without hidden parent/crew context. */
  records: readonly { id: string; type: 'job' | 'work_order'; label: string; recordId?: string }[];
};
export type CalendarBusyPersonDay = { personId: string; date: string };
export type CalendarScheduledResult = {
  from: string;
  to: string;
  today: string;
  timezone: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  scope: { kind: 'workspace' } | { kind: 'own'; viewerId: string };
  counts: { visits: number; busyPersonDays: number };
  days: readonly CalendarScheduledDay[];
  members: readonly CalendarScheduledMember[];
  evidenceIds: { visits?: string; busyPersonDays?: string };
  evidence: { kind: 'visits'; rows: readonly CalendarScheduledVisit[] }
    | { kind: 'busy-person-days'; rows: readonly CalendarBusyPersonDay[] };
  page: number;
  pageSize: number;
};
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const text = (value: string) => value.trim() !== '';
const date = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;
export const calendarBusyThreshold = 4;
export const calendarBusyDayKey = (row: CalendarBusyPersonDay) => JSON.stringify([row.personId, row.date]);

export function validCalendarScheduledVisit(row: CalendarScheduledVisit,
  context: Pick<CalendarScheduledResult, 'from' | 'to' | 'scope'> & { members: readonly { id: string }[] }): boolean {
  const { scope } = context;
  return text(row.id) && text(row.label) && date(row.date) && row.date >= context.from && row.date <= context.to &&
    new Set(row.participantIds).size === row.participantIds.length &&
    row.participantIds.every(id => context.members.some(member => member.id === id)) &&
    (scope.kind !== 'own' || row.participantIds.length === 1 && row.participantIds[0] === scope.viewerId) &&
    row.records.length > 0 && new Set(row.records.map(record => JSON.stringify([record.type, record.id]))).size === row.records.length &&
    row.records.every(record => ['job', 'work_order'].includes(record.type) && text(record.id) && text(record.label) &&
      (record.recordId === undefined || text(record.recordId)));
}

/** Observable reconciliation only; the host must authorize/filter the full snapshot before paging. */
export function validCalendarScheduledResult(result: CalendarScheduledResult): boolean {
  const range = resolveReportPeriod({ preset: 'custom', from: result.from, to: result.to }, result.today, 'calendar').range;
  if (!range || !validReportTimezone(result.timezone) ||
    ![result.periodLabel, result.snapshotLabel, result.scopeLabel].every(text) ||
    !Object.values(result.evidenceIds).every(value => value === undefined || text(value)) ||
    !count(result.counts.visits) || !count(result.counts.busyPersonDays) ||
    !['workspace', 'own'].includes(result.scope.kind) ||
    result.days.length !== range.count || new Set(result.members.map(member => member.id)).size !== result.members.length ||
    !result.days.every((day, index) => day.date === addCalendarDays(result.from, index) && count(day.count) &&
      count(day.unassignedCount) && day.unassignedCount <= day.count) ||
    !result.members.every(member => text(member.id) && text(member.label) && member.counts.length === range.count && member.counts.every(count))) return false;
  const { scope } = result;
  if (scope.kind === 'own' && (!text(scope.viewerId) || result.members.length !== 1 || result.members[0]!.id !== scope.viewerId ||
    result.days.some((day, index) => day.unassignedCount !== 0 || day.count !== result.members[0]!.counts[index]))) return false;
  const visits = result.days.reduce((sum, day) => sum + day.count, 0);
  const busy = result.members.reduce((sum, member) => sum + member.counts.filter(value => value >= calendarBusyThreshold).length, 0);
  if (!count(visits) || visits !== result.counts.visits || busy !== result.counts.busyPersonDays ||
    result.days.some((day, index) => {
      const participation = result.members.map(member => member.counts[index]!);
      const sum = participation.reduce((total, value) => total + value, 0), assigned = day.count - day.unassignedCount;
      return !count(sum) || sum < assigned || participation.some(value => value > assigned);
    })) return false;
  const total = result.evidence.kind === 'visits' ? visits : busy;
  if (!['visits', 'busy-person-days'].includes(result.evidence.kind) || !positive(result.page) || !positive(result.pageSize) ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.evidence.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize))) return false;
  if (result.evidence.kind === 'busy-person-days') {
    const rows = result.evidence.rows;
    return new Set(rows.map(calendarBusyDayKey)).size === rows.length && rows.every(row => {
      const member = result.members.find(person => person.id === row.personId), index = result.days.findIndex(day => day.date === row.date);
      return !!member && index >= 0 && member.counts[index]! >= calendarBusyThreshold;
    });
  }
  const rows = result.evidence.rows, recordKeys = rows.flatMap(row => row.records.map(record => JSON.stringify([record.type, record.id])));
  if (new Set(rows.map(row => row.id)).size !== rows.length || !rows.every(row => validCalendarScheduledVisit(row, result))) return false;
  if (new Set(recordKeys).size !== recordKeys.length) return false;
  return result.days.every((day, index) => {
    const observed = rows.filter(row => row.date === day.date), full = rows.length === visits;
    const unassigned = observed.filter(row => row.participantIds.length === 0).length;
    const within = (value: number, expected: number) => full ? value === expected : value <= expected;
    return within(observed.length, day.count) && within(unassigned, day.unassignedCount) &&
      within(observed.length - unassigned, day.count - day.unassignedCount) &&
      result.members.every(member => within(observed.filter(row => row.participantIds.includes(member.id)).length, member.counts[index]!));
  });
}
