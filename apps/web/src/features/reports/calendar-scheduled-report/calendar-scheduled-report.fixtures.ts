import { addCalendarDays } from '@salesmora/domain';
import { calendarBusyThreshold, type CalendarScheduledResult, type CalendarScheduledVisit } from './calendar-scheduled-report.validation';

export const calendarReportMembers = [{ id: 'alex', label: 'Alex' }, { id: 'blair', label: 'Blair' }] as const;
const record = (id: string, type: 'job' | 'work_order', label: string) => ({ id: `workspace-fixture:${id}`, type, label, recordId: `workspace-fixture:${id}` });
export const calendarScheduledVisits: readonly CalendarScheduledVisit[] = [
  { id: 'workspace-fixture:V1', label: 'V1 / shared visit', date: '2026-11-05', participantIds: ['alex', 'alex', 'blair', 'alex'],
    records: [record('J1', 'job', 'J-001 / shared Job'), record('W1', 'work_order', 'WO-001 / shared Work Order'), record('W2', 'work_order', 'WO-002 / shared Work Order')] },
  { id: 'workspace-fixture:V2', label: 'V2 / separate Job visit', date: '2026-11-05', participantIds: ['alex'], records: [record('J2', 'job', 'J-002 / separate Job')] },
  { id: 'workspace-fixture:V3', label: 'V3 / separate Work Order visit', date: '2026-11-05', participantIds: ['alex'], records: [record('W3', 'work_order', 'WO-003 / separate Work Order')] },
  { id: 'workspace-fixture:V4', label: 'V4 / separate Job visit', date: '2026-11-05', participantIds: ['alex'], records: [record('J4', 'job', 'J-004 / separate Job')] },
];

/** Fictional host aggregation, not a production query or authorization implementation. */
export function calendarScheduledResponse(source = calendarScheduledVisits, options: {
  kind?: CalendarScheduledResult['evidence']['kind']; page?: number; pageSize?: number;
  from?: string; to?: string; scope?: CalendarScheduledResult['scope'];
} = {}): CalendarScheduledResult {
  const { kind = 'visits', page = 1, pageSize = 25, from = '2026-11-05', to = '2026-11-11', scope = { kind: 'workspace' } } = options;
  const grouped = new Map<string, CalendarScheduledVisit>();
  for (const visit of source) {
    const previous = grouped.get(visit.id);
    grouped.set(visit.id, { ...visit, participantIds: [...new Set([...(previous?.participantIds ?? []), ...visit.participantIds])],
      records: [...new Map([...(previous?.records ?? []), ...visit.records].map(record => [`${record.type}:${record.id}`, record])).values()] });
  }
  const visits = [...grouped.values()].filter(visit => visit.date >= from && visit.date <= to &&
    (scope.kind !== 'own' || visit.participantIds.includes(scope.viewerId)))
    .map(visit => ({ ...visit, participantIds: visit.participantIds.filter(id => scope.kind !== 'own' || id === scope.viewerId) }));
  const days: CalendarScheduledResult['days'][number][] = [];
  for (let date = from; date <= to; date = addCalendarDays(date, 1)) {
    const matching = visits.filter(visit => visit.date === date);
    days.push({ date, count: matching.length, unassignedCount: matching.filter(visit => !visit.participantIds.length).length });
  }
  const members = calendarReportMembers.filter(member => scope.kind === 'own' ? member.id === scope.viewerId : visits.some(visit => visit.participantIds.includes(member.id)))
    .map(member => ({ ...member, counts: days.map(day => visits.filter(visit => visit.date === day.date && visit.participantIds.includes(member.id)).length) }));
  const busy = members.flatMap(member => days.flatMap((day, index) => member.counts[index]! >= calendarBusyThreshold ? [{ personId: member.id, date: day.date }] : []));
  const slice = <T,>(rows: readonly T[]) => rows.slice((page - 1) * pageSize, page * pageSize);
  return {
    from, to, today: '2026-11-05', timezone: 'America/New_York', periodLabel: `${from} to ${to}`,
    snapshotLabel: 'Current authorized schedule / November 5, 2026 at 09:00', scopeLabel: scope.kind === 'own' ? 'My authorized active records' : 'Authorized active Jobs and Work Orders',
    scope, counts: { visits: visits.length, busyPersonDays: busy.length }, days, members,
    evidenceIds: { visits: 'scheduled-visits', busyPersonDays: 'busy-person-days' },
    evidence: kind === 'visits' ? { kind, rows: slice(visits) } : { kind, rows: slice(busy) }, page, pageSize,
  };
}

export const calendarWorkOrderOnlyVisits = calendarScheduledVisits.flatMap(visit => {
  const records = visit.records.filter(record => record.type === 'work_order');
  return records.length ? [{ ...visit, label: `${visit.id.split(':')[1]} / Work Order visit`, records, participantIds: ['alex'] }] : [];
});
