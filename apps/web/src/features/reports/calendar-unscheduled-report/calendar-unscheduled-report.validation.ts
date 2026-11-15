import { jobDateSchema, type JobStatus, type WorkOrderStatus } from '@salesmora/contracts';
import { validReportTimezone } from '../report-date-controls/report-date-controls.validation';
import type { CalendarScheduledResult } from '../calendar-scheduled-report/calendar-scheduled-report.validation';

export type CalendarUnscheduledRecord = { id: string; label: string; recordId?: string } & (
  { type: 'job'; status: JobStatus } | { type: 'work_order'; status: WorkOrderStatus; archived: boolean }
);
export type CalendarUnscheduledVisit = {
  id: string;
  label: string;
  scheduledDate: null;
  participantIds: readonly string[];
  records: readonly CalendarUnscheduledRecord[];
};
export type CalendarUnscheduledResult = Pick<CalendarScheduledResult,
  'today' | 'timezone' | 'snapshotLabel' | 'scopeLabel' | 'scope' | 'page' | 'pageSize'> & {
  members: readonly { id: string; label: string }[];
  counts: { visits: number; jobs: number; workOrders: number };
  evidenceIds: { visits?: string; jobs?: string; workOrders?: string };
  /** Exactly the authorized visits referenced by this evidence page, with authorized active records only. */
  visits: readonly CalendarUnscheduledVisit[];
  evidence: { kind: 'visits'; visitIds: readonly string[] }
    | { kind: 'jobs' | 'workOrders'; records: readonly { visitId: string; recordId: string }[] };
};
export const calendarUnscheduledRecordKey = (record: Pick<CalendarUnscheduledRecord, 'type' | 'id'>) => JSON.stringify([record.type, record.id]);
const text = (value: string) => value.trim() !== '';
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
export function validCalendarUnscheduledResult(result: CalendarUnscheduledResult): boolean {
  const { counts, scope, evidence } = result;
  if (!jobDateSchema.safeParse(result.today).success || result.today.startsWith('0000') || !validReportTimezone(result.timezone) ||
    ![result.snapshotLabel, result.scopeLabel].every(text) || !Object.values(counts).every(count) ||
    !Object.values(result.evidenceIds).every(value => value === undefined || text(value)) ||
    !['workspace', 'own'].includes(scope.kind) || new Set(result.members.map(member => member.id)).size !== result.members.length ||
    !result.members.every(member => text(member.id) && text(member.label)) ||
    scope.kind === 'own' && (!text(scope.viewerId) || result.members.length !== 1 || result.members[0]!.id !== scope.viewerId)) return false;
  const recordTotal = counts.jobs + counts.workOrders;
  if (!count(recordTotal) || recordTotal < counts.visits || counts.visits === 0 && recordTotal !== 0 ||
    !['visits', 'jobs', 'workOrders'].includes(evidence.kind) ||
    result.visits.length > counts.visits || new Set(result.visits.map(visit => visit.id)).size !== result.visits.length) return false;
  const keys = result.visits.flatMap(visit => visit.records.map(calendarUnscheduledRecordKey));
  if (new Set(keys).size !== keys.length || !result.visits.every(visit =>
    text(visit.id) && text(visit.label) && visit.scheduledDate === null && visit.records.length > 0 &&
    new Set(visit.participantIds).size === visit.participantIds.length &&
    visit.participantIds.every(id => result.members.some(member => member.id === id)) &&
    (scope.kind !== 'own' || visit.participantIds.length === 1 && visit.participantIds[0] === scope.viewerId) &&
    visit.records.every(record => text(record.id) && text(record.label) && (record.recordId === undefined || text(record.recordId)) &&
      (record.type === 'job' ? ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'].includes(record.status)
        : record.type === 'work_order' && !record.archived && ['draft', 'issued', 'in-progress'].includes(record.status))))) return false;
  const records = result.visits.flatMap(visit => visit.records);
  const jobs = records.filter(record => record.type === 'job').length, orders = records.length - jobs;
  const full = result.visits.length === counts.visits;
  if (jobs > counts.jobs || orders > counts.workOrders || full && (jobs !== counts.jobs || orders !== counts.workOrders)) return false;
  const total = counts[evidence.kind];
  const length = evidence.kind === 'visits' ? evidence.visitIds.length : evidence.records.length;
  if (!positive(result.page) || !positive(result.pageSize) || result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize))) return false;
  if (evidence.kind === 'visits') return new Set(evidence.visitIds).size === length && length === result.visits.length &&
    evidence.visitIds.every(id => result.visits.some(visit => visit.id === id));
  const type = evidence.kind === 'jobs' ? 'job' : 'work_order';
  const referencedVisits = new Set(evidence.records.map(row => row.visitId));
  if (referencedVisits.size !== result.visits.length || result.visits.some(visit => !referencedVisits.has(visit.id)) ||
    new Set(evidence.records.map(row => row.recordId)).size !== length) return false;
  return evidence.records.every(row => result.visits.some(visit => visit.id === row.visitId &&
    visit.records.some(record => record.type === type && record.id === row.recordId)));
}
