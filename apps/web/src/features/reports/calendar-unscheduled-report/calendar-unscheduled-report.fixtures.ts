import { calendarReportMembers } from '../calendar-scheduled-report/calendar-scheduled-report.fixtures';
import type { CalendarUnscheduledRecord, CalendarUnscheduledResult } from './calendar-unscheduled-report.validation';

type SourceVisit = {
  id: string; label: string; scheduledDate: string | null; participantIds: readonly string[]; records: readonly CalendarUnscheduledRecord[];
};
export const calendarUnscheduledVisits: readonly SourceVisit[] = [
  { id: 'workspace-fixture:U1', label: 'U1 / explicitly shared unscheduled visit', scheduledDate: null, participantIds: ['alex', 'alex', 'blair'],
    records: [
      { id: 'workspace-fixture:J1', type: 'job', label: 'J-001 / active Job', status: 'needs-scheduling', recordId: 'workspace-fixture:J1' },
      { id: 'workspace-fixture:W1', type: 'work_order', label: 'WO-001 / active Work Order', status: 'issued', archived: false, recordId: 'workspace-fixture:W1' },
      { id: 'workspace-fixture:W2', type: 'work_order', label: 'WO-002 / active Work Order', status: 'in-progress', archived: false, recordId: 'workspace-fixture:W2' },
    ] },
];

/** Fictional already-authorized host source; filters current eligibility before aggregation/pagination. */
export function calendarUnscheduledResponse(source = calendarUnscheduledVisits, options: {
  kind?: CalendarUnscheduledResult['evidence']['kind']; page?: number; pageSize?: number; scope?: CalendarUnscheduledResult['scope'];
} = {}): CalendarUnscheduledResult {
  const { kind = 'visits', page = 1, pageSize = 25, scope = { kind: 'workspace' } } = options;
  const grouped = new Map<string, SourceVisit>();
  for (const visit of source) {
    const previous = grouped.get(visit.id);
    grouped.set(visit.id, { ...visit, participantIds: [...new Set([...(previous?.participantIds ?? []), ...visit.participantIds])],
      records: [...new Map([...(previous?.records ?? []), ...visit.records].map(record => [`${record.type}:${record.id}`, record])).values()] });
  }
  const visits = [...grouped.values()].filter(visit => visit.scheduledDate === null && (scope.kind !== 'own' || visit.participantIds.includes(scope.viewerId)))
    .map(visit => ({ ...visit, scheduledDate: null, participantIds: visit.participantIds.filter(id => scope.kind !== 'own' || id === scope.viewerId),
      records: visit.records.filter(record => !['completed', 'canceled'].includes(record.status) && (record.type === 'job' || !record.archived)) }))
    .filter(visit => visit.records.length > 0);
  const jobs = visits.flatMap(visit => visit.records.filter(record => record.type === 'job').map(record => ({ visitId: visit.id, recordId: record.id })));
  const orders = visits.flatMap(visit => visit.records.filter(record => record.type === 'work_order').map(record => ({ visitId: visit.id, recordId: record.id })));
  const slice = <T,>(rows: readonly T[]) => rows.slice((page - 1) * pageSize, page * pageSize);
  const evidence: CalendarUnscheduledResult['evidence'] = kind === 'visits' ? { kind, visitIds: slice(visits).map(visit => visit.id) }
    : { kind, records: slice(kind === 'jobs' ? jobs : orders) };
  const ids = new Set(evidence.kind === 'visits' ? evidence.visitIds : evidence.records.map(row => row.visitId));
  return {
    today: '2026-11-06', timezone: 'America/New_York', snapshotLabel: 'Current authorized schedule / November 6, 2026 at 09:00',
    scopeLabel: scope.kind === 'own' ? 'My authorized active records' : 'Authorized active Jobs and Work Orders', scope,
    members: calendarReportMembers.filter(member => scope.kind === 'own' ? member.id === scope.viewerId : visits.some(visit => visit.participantIds.includes(member.id))),
    counts: { visits: visits.length, jobs: jobs.length, workOrders: orders.length },
    evidenceIds: { visits: 'unscheduled-visits', jobs: 'unscheduled-jobs', workOrders: 'unscheduled-work-orders' },
    visits: visits.filter(visit => ids.has(visit.id)), evidence, page, pageSize,
  };
}
export const calendarUnscheduledWorkOrders = calendarUnscheduledVisits.map(visit => ({ ...visit,
  label: 'U1 / unscheduled Work Order visit', participantIds: ['alex'],
  records: visit.records.filter(record => record.type === 'work_order'),
}));
