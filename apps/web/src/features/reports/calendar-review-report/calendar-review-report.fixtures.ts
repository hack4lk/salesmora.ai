import { calendarScheduledResponse, calendarScheduledVisits } from '../calendar-scheduled-report/calendar-scheduled-report.fixtures';
import { calendarObservedOverlapPairs, type CalendarReviewResult, type CalendarReviewVisit } from './calendar-review-report.validation';

const windows: Readonly<Record<string, string | null>> = {
  'workspace-fixture:V1': '08:00-10:00', 'workspace-fixture:V2': '09:00-11:00',
  'workspace-fixture:V3': '11:00-13:00', 'workspace-fixture:V4': null,
};
export const calendarReviewVisits: readonly CalendarReviewVisit[] = calendarScheduledVisits.map(visit => ({
  ...visit, arrivalWindow: windows[visit.id]!,
}));

/** Reuses the authorized mock scheduled snapshot; never a production read or permission check. */
export function calendarReviewResponse(source = calendarReviewVisits, options: {
  kind?: CalendarReviewResult['evidence']['kind']; page?: number; pageSize?: number;
  from?: string; to?: string; today?: string; scope?: CalendarReviewResult['scope'];
} = {}): CalendarReviewResult {
  const { kind = 'overlaps', page = 1, pageSize = 25, today = '2026-11-06' } = options;
  const scheduled = calendarScheduledResponse(source, { kind: 'visits', page: 1, pageSize: Math.max(1, source.length),
    from: options.from ?? '2026-11-01', to: options.to, scope: options.scope });
  if (scheduled.evidence.kind !== 'visits') throw new RangeError('Mock schedule must supply visit evidence.');
  const visits = scheduled.evidence.rows.map(visit => ({ ...visit, arrivalWindow: source.find(row => row.id === visit.id)!.arrivalWindow }));
  const overlaps = calendarObservedOverlapPairs(visits);
  const past = visits.filter(visit => visit.date < today);
  const slice = <T,>(rows: readonly T[]) => rows.slice((page - 1) * pageSize, page * pageSize);
  const evidence: CalendarReviewResult['evidence'] = kind === 'overlaps' ? { kind, rows: slice(overlaps) } : { kind, visitIds: slice(past).map(visit => visit.id) };
  const ids = new Set(evidence.kind === 'overlaps' ? evidence.rows.flatMap(pair => [pair.leftVisitId, pair.rightVisitId]) : evidence.visitIds);
  return {
    from: scheduled.from, to: scheduled.to, today, timezone: scheduled.timezone, periodLabel: scheduled.periodLabel,
    snapshotLabel: `Current authorized schedule / business-local ${today}`, scopeLabel: scheduled.scopeLabel, scope: scheduled.scope,
    members: scheduled.members.map(({ id, label }) => ({ id, label })),
    counts: { scheduledVisits: visits.length, missingWindows: visits.filter(visit => visit.arrivalWindow === null).length,
      overlapPairs: overlaps.length, pastVisits: past.length },
    evidenceIds: { overlaps: 'overlapping-pairs', past: 'past-visits' },
    visits: visits.filter(visit => ids.has(visit.id)), evidence, page, pageSize,
  };
}
export const calendarReviewWorkOrders = calendarReviewVisits.flatMap(visit => {
  const records = visit.records.filter(record => record.type === 'work_order');
  return records.length ? [{ ...visit, records, label: `${visit.id.split(':')[1]} / Work Order visit`, participantIds: ['alex'] }] : [];
});
