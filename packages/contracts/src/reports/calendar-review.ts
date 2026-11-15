import { z } from 'zod';
import { calendarScheduledQuerySchema, calendarScheduledResultSchema, calendarScheduledVisitSchema } from './calendar-scheduled';
import { calendarReportFiltersSchema, calendarReportParticipantMatches, calendarReportRecordMatches, calendarReportAttributionMatches } from './calendar-filters';

const text = z.string().trim().min(1);
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
export const calendarReportArrivalWindowSchema = z.string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/)
  .refine(value => value.slice(0, 5) < value.slice(6));
export function calendarReportWindowsOverlap(left: string, right: string): boolean {
  return calendarReportArrivalWindowSchema.safeParse(left).success && calendarReportArrivalWindowSchema.safeParse(right).success &&
    left.slice(0, 5) < right.slice(6) && right.slice(0, 5) < left.slice(6);
}
export const calendarReviewQuerySchema = calendarScheduledQuerySchema.omit({ view: true, selected: true }).extend({
  view: z.literal('calendar-review'), selected: z.enum(['overlaps', 'past']),
}).strict();
export type CalendarReviewQuery = z.infer<typeof calendarReviewQuerySchema>;
const scheduled = calendarScheduledResultSchema.shape;
export const calendarReviewResultSchema = z.object({
  workspaceId: scheduled.workspaceId, view: z.literal('calendar-review'),
  from: scheduled.from, to: scheduled.to, today: scheduled.today, asOf: scheduled.asOf,
  timezone: scheduled.timezone, scopeLabel: scheduled.scopeLabel, scope: scheduled.scope,
  members: z.array(z.object({ id: text, label: text }).strict()),
  counts: z.object({ scheduledVisits: count, missingWindows: count, overlapPairs: count, pastVisits: count }).strict(),
  visits: z.array(calendarScheduledVisitSchema.extend({ arrivalWindow: calendarReportArrivalWindowSchema.nullable() })).max(200),
  evidence: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('overlaps'), rows: z.array(z.object({
      personId: text, leftVisitId: z.uuid(), rightVisitId: z.uuid(),
    }).strict()).max(100) }).strict(),
    z.object({ kind: z.literal('past'), visitIds: z.array(z.uuid()).max(100) }).strict(),
  ]),
  page: scheduled.page, pageSize: scheduled.pageSize, evidenceTotal: count,
  filters: calendarReportFiltersSchema.default({ participants: [], recordTypes: [] }),
}).strict().superRefine((result, context) => {
  const { counts, visits, scope, evidence } = result;
  const known = counts.scheduledVisits - counts.missingWindows;
  const maximum = BigInt(Math.max(0, known)) * BigInt(Math.max(0, known - 1)) / 2n * BigInt(result.members.length);
  const observedMissing = visits.filter(visit => visit.arrivalWindow === null).length;
  const observedPast = visits.filter(visit => visit.date < result.today).length;
  const records = visits.flatMap(visit => visit.records);
  const byId = new Map(visits.map(visit => [visit.id, visit]));
  const memberIds = new Set(result.members.map(member => member.id));
  const full = visits.length === counts.scheduledVisits;
  let observedPairs = 0;
  for (const [index, left] of visits.entries()) for (const right of visits.slice(index + 1)) {
    if (left.date !== right.date || left.arrivalWindow === null || right.arrivalWindow === null ||
      !calendarReportWindowsOverlap(left.arrivalWindow, right.arrivalWindow)) continue;
    observedPairs += left.participantIds.filter(id => right.participantIds.includes(id)).length;
  }
  const total = evidence.kind === 'overlaps' ? counts.overlapPairs : counts.pastVisits;
  const length = evidence.kind === 'overlaps' ? evidence.rows.length : evidence.visitIds.length;
  let valid = calendarReviewQuerySchema.shape.period.safeParse({ from: result.from, to: result.to }).success &&
    counts.pastVisits <= counts.scheduledVisits && known >= 0 && BigInt(counts.overlapPairs) <= maximum &&
    (result.from < result.today || counts.pastVisits === 0) &&
    (result.to >= result.today || counts.pastVisits === counts.scheduledVisits) &&
    memberIds.size === result.members.length && byId.size === visits.length && visits.length <= counts.scheduledVisits &&
    new Set(records.map(record => `${record.type}:${record.id}`)).size === records.length &&
    records.every(record => record.id === record.recordId && calendarReportRecordMatches(record, result.filters)) &&
    result.members.every(member => calendarReportParticipantMatches(member.id, result.filters)) &&
    (scope.kind !== 'own' || result.filters.participants.every(id => id === scope.viewerId)) &&
    visits.every(visit => visit.date >= result.from && visit.date <= result.to &&
      calendarReportAttributionMatches(visit, result.filters, scope) &&
      new Set(visit.participantIds).size === visit.participantIds.length &&
      visit.participantIds.every(id => memberIds.has(id)) &&
      (scope.kind !== 'own' || visit.participantIds.length === 1 && visit.participantIds[0] === scope.viewerId) &&
      (result.filters.participants.length === 0 || visit.participantIds.length > 0)) &&
    (scope.kind !== 'own' || result.members.length === 1 && result.members[0]?.id === scope.viewerId) &&
    observedMissing <= counts.missingWindows && visits.length - observedMissing <= known &&
    observedPast <= counts.pastVisits && visits.length - observedPast <= counts.scheduledVisits - counts.pastVisits &&
    observedPairs <= counts.overlapPairs &&
    (!full || observedMissing === counts.missingWindows && observedPast === counts.pastVisits && observedPairs === counts.overlapPairs) &&
    total === result.evidenceTotal && result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize));
  if (evidence.kind === 'past') {
    valid &&= new Set(evidence.visitIds).size === length && length === visits.length &&
      evidence.visitIds.every(id => { const visit = byId.get(id); return visit && visit.date < result.today; });
  } else {
    const referenced = new Set(evidence.rows.flatMap(row => [row.leftVisitId, row.rightVisitId]));
    valid &&= referenced.size === visits.length && visits.every(visit => referenced.has(visit.id)) &&
      new Set(evidence.rows.map(row => JSON.stringify([row.personId, ...[row.leftVisitId, row.rightVisitId].sort()]))).size === length &&
      evidence.rows.every(row => {
        const left = byId.get(row.leftVisitId), right = byId.get(row.rightVisitId);
        return left && right && left.id !== right.id && left.date === right.date && memberIds.has(row.personId) &&
          left.participantIds.includes(row.personId) && right.participantIds.includes(row.personId) &&
          left.arrivalWindow !== null && right.arrivalWindow !== null &&
          calendarReportWindowsOverlap(left.arrivalWindow, right.arrivalWindow);
      });
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Calendar schedule-review counts, windows, scope and evidence do not reconcile.' });
});
export type CalendarReviewResult = z.infer<typeof calendarReviewResultSchema>;
