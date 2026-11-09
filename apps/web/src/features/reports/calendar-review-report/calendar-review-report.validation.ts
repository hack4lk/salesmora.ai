import { validCalendarScheduledVisit, type CalendarScheduledResult, type CalendarScheduledVisit } from '../calendar-scheduled-report/calendar-scheduled-report.validation';
import { resolveReportPeriod, validReportTimezone } from '../report-date-controls/report-date-controls.validation';

export type CalendarReviewVisit = CalendarScheduledVisit & { arrivalWindow: string | null };
export type CalendarOverlapPair = { personId: string; leftVisitId: string; rightVisitId: string };
export type CalendarReviewResult = Pick<CalendarScheduledResult,
  'from' | 'to' | 'today' | 'timezone' | 'periodLabel' | 'snapshotLabel' | 'scopeLabel' | 'scope' | 'page' | 'pageSize'> & {
  members: readonly { id: string; label: string }[];
  counts: { scheduledVisits: number; missingWindows: number; overlapPairs: number; pastVisits: number };
  evidenceIds: { overlaps?: string; past?: string };
  /** Exactly the authorized visits referenced by this evidence page, once each. */
  visits: readonly CalendarReviewVisit[];
  evidence: { kind: 'overlaps'; rows: readonly CalendarOverlapPair[] } | { kind: 'past'; visitIds: readonly string[] };
};
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const text = (value: string) => value.trim() !== '';
const windowPattern = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

/** Validate persisted time spans without limiting history to today's preset choices. */
export function validCalendarArrivalWindow(value: string): boolean {
  return windowPattern.test(value) && value.slice(0, 5) < value.slice(6);
}
export function calendarArrivalWindowsOverlap(left: string, right: string): boolean {
  return validCalendarArrivalWindow(left) && validCalendarArrivalWindow(right) &&
    left.slice(0, 5) < right.slice(6) && right.slice(0, 5) < left.slice(6);
}
export const calendarOverlapKey = (pair: CalendarOverlapPair) =>
  JSON.stringify([pair.personId, ...[pair.leftVisitId, pair.rightVisitId].sort()]);

export function calendarObservedOverlapPairs(visits: readonly CalendarReviewVisit[]): CalendarOverlapPair[] {
  const pairs: CalendarOverlapPair[] = [];
  for (const [index, left] of visits.entries()) for (const right of visits.slice(index + 1)) {
    if (left.date !== right.date || left.arrivalWindow === null || right.arrivalWindow === null ||
      !calendarArrivalWindowsOverlap(left.arrivalWindow, right.arrivalWindow)) continue;
    for (const personId of left.participantIds.filter(id => right.participantIds.includes(id))) {
      pairs.push({ personId, leftVisitId: left.id, rightVisitId: right.id });
    }
  }
  return pairs;
}

/** Counts outside the observed page still require the host's complete authorized snapshot. */
export function validCalendarReviewResult(result: CalendarReviewResult): boolean {
  if (!resolveReportPeriod({ preset: 'custom', from: result.from, to: result.to }, result.today, 'calendar').range ||
    !validReportTimezone(result.timezone) || ![result.periodLabel, result.snapshotLabel, result.scopeLabel].every(text) ||
    !Object.values(result.counts).every(count) || result.counts.pastVisits > result.counts.scheduledVisits ||
    result.counts.missingWindows > result.counts.scheduledVisits ||
    !Object.values(result.evidenceIds).every(value => value === undefined || text(value)) ||
    !['workspace', 'own'].includes(result.scope.kind) ||
    new Set(result.members.map(member => member.id)).size !== result.members.length ||
    !result.members.every(member => text(member.id) && text(member.label))) return false;
  const { scope } = result;
  if (scope.kind === 'own' && (!text(scope.viewerId) || result.members.length !== 1 || result.members[0]!.id !== scope.viewerId)) return false;
  const knownWindows = result.counts.scheduledVisits - result.counts.missingWindows;
  if (knownWindows < 2 && result.counts.overlapPairs !== 0 ||
    result.members.length === 0 && result.counts.overlapPairs !== 0 ||
    result.from >= result.today && result.counts.pastVisits !== 0 ||
    result.to < result.today && result.counts.pastVisits !== result.counts.scheduledVisits) return false;
  // Avoid unsafe intermediate products when checking the maximum possible person/pair total.
  const maximumPairs = BigInt(knownWindows) * BigInt(Math.max(0, knownWindows - 1)) / 2n * BigInt(result.members.length);
  if (BigInt(result.counts.overlapPairs) > maximumPairs) return false;
  const recordKeys = result.visits.flatMap(visit => visit.records.map(record => JSON.stringify([record.type, record.id])));
  if (new Set(result.visits.map(visit => visit.id)).size !== result.visits.length ||
    result.visits.length > result.counts.scheduledVisits ||
    new Set(recordKeys).size !== recordKeys.length ||
    !result.visits.every(visit => validCalendarScheduledVisit(visit, result) &&
      (visit.arrivalWindow === null || validCalendarArrivalWindow(visit.arrivalWindow)))) return false;
  const observedMissing = result.visits.filter(visit => visit.arrivalWindow === null).length;
  const observedPast = result.visits.filter(visit => visit.date < result.today).length;
  const full = result.visits.length === result.counts.scheduledVisits;
  if (observedMissing > result.counts.missingWindows || result.visits.length - observedMissing > knownWindows ||
    observedPast > result.counts.pastVisits || result.visits.length - observedPast > result.counts.scheduledVisits - result.counts.pastVisits ||
    full && (observedMissing !== result.counts.missingWindows || observedPast !== result.counts.pastVisits)) return false;
  const observedPairs = calendarObservedOverlapPairs(result.visits).length;
  if (observedPairs > result.counts.overlapPairs || full && observedPairs !== result.counts.overlapPairs) return false;
  const selected = result.evidence;
  const total = selected.kind === 'overlaps' ? result.counts.overlapPairs : result.counts.pastVisits;
  const length = selected.kind === 'overlaps' ? selected.rows.length : selected.visitIds.length;
  if (!['overlaps', 'past'].includes(selected.kind) || !positive(result.page) || !positive(result.pageSize) ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize))) return false;
  if (selected.kind === 'past') return new Set(selected.visitIds).size === length && result.visits.length === length &&
    selected.visitIds.every(id => result.visits.some(visit => visit.id === id && visit.date < result.today));
  const referenced = new Set(selected.rows.flatMap(pair => [pair.leftVisitId, pair.rightVisitId]));
  if (new Set(selected.rows.map(calendarOverlapKey)).size !== length ||
    referenced.size !== result.visits.length || result.visits.some(visit => !referenced.has(visit.id))) return false;
  return selected.rows.every(pair => {
    const left = result.visits.find(visit => visit.id === pair.leftVisitId), right = result.visits.find(visit => visit.id === pair.rightVisitId);
    return left && right && left.id !== right.id && left.date === right.date &&
      result.members.some(member => member.id === pair.personId) &&
      left.participantIds.includes(pair.personId) && right.participantIds.includes(pair.personId) &&
      left.arrivalWindow !== null && right.arrivalWindow !== null && calendarArrivalWindowsOverlap(left.arrivalWindow, right.arrivalWindow);
  });
}
