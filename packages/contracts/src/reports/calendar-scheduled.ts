import { z } from 'zod';
import { jobDateSchema } from '../job';
import { calendarReportFiltersSchema, calendarReportParticipantMatches, calendarReportRecordMatches, calendarReportAttributionMatches } from './calendar-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const period = z.object({ from: date, to: date }).strict().refine(value =>
  value.from <= value.to && (Date.parse(`${value.to}T00:00:00Z`) - Date.parse(`${value.from}T00:00:00Z`)) / 86_400_000 < 366);
export const calendarScheduledQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('calendar-scheduled'), period,
  selected: z.enum(['visits', 'busy-person-days']), page: page.default(1), pageSize: pageSize.default(25),
  filters: calendarReportFiltersSchema.default({ participants: [], recordTypes: [] }),
}).strict();
export type CalendarScheduledQuery = z.infer<typeof calendarScheduledQuerySchema>;
export const calendarScheduledBusyThreshold = 4;
export const calendarScheduledVisitSchema = z.object({
  id: z.uuid(), label: text, date, participantIds: z.array(text),
  records: z.array(z.object({
    id: z.uuid(), recordId: z.uuid(), type: z.enum(['job', 'work_order']), label: text,
    participantIds: z.array(text).optional(),
  }).strict()).min(1),
}).strict();
export const calendarScheduledResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('calendar-scheduled'), from: date, to: date, today: date,
  asOf: z.iso.datetime(), timezone: text, scopeLabel: text,
  scope: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('own'), viewerId: text }).strict(),
  ]),
  counts: z.object({ visits: count, busyPersonDays: count }).strict(),
  days: z.array(z.object({ date, count, unassignedCount: count }).strict()).max(366),
  members: z.array(z.object({ id: text, label: text, counts: z.array(count).max(366) }).strict()),
  evidence: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('visits'), rows: z.array(calendarScheduledVisitSchema).max(100) }).strict(),
    z.object({ kind: z.literal('busy-person-days'), rows: z.array(z.object({ personId: text, date }).strict()).max(100) }).strict(),
  ]),
  page, pageSize, evidenceTotal: count,
  filters: calendarReportFiltersSchema.default({ participants: [], recordTypes: [] }),
}).strict().superRefine((result, context) => {
  const { scope } = result;
  const size = (Date.parse(`${result.to}T00:00:00Z`) - Date.parse(`${result.from}T00:00:00Z`)) / 86_400_000 + 1;
  const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
  const total = result.evidence.kind === 'visits' ? result.counts.visits : result.counts.busyPersonDays;
  let valid = period.safeParse({ from: result.from, to: result.to }).success && result.days.length === size &&
    result.days.every((day, index) => Date.parse(`${day.date}T00:00:00Z`) === Date.parse(`${result.from}T00:00:00Z`) + index * 86_400_000 &&
      day.unassignedCount <= day.count && (result.filters.participants.length === 0 || day.unassignedCount === 0)) &&
    new Set(result.members.map(member => member.id)).size === result.members.length &&
    result.members.every(member => member.counts.length === size && calendarReportParticipantMatches(member.id, result.filters)) &&
    (scope.kind !== 'own' || result.filters.participants.every(id => id === scope.viewerId)) &&
    sum(result.days.map(day => day.count)) === result.counts.visits &&
    sum(result.members.map(member => member.counts.filter(value => value >= calendarScheduledBusyThreshold).length)) === result.counts.busyPersonDays &&
    result.days.every((day, index) => {
      const values = result.members.map(member => member.counts[index]!);
      const assigned = day.count - day.unassignedCount;
      return Number.isSafeInteger(sum(values)) && sum(values) >= assigned && values.every(value => value <= assigned);
    }) &&
    (result.scope.kind !== 'own' || result.members.length === 1 && result.members[0]?.id === result.scope.viewerId &&
      result.days.every((day, index) => day.unassignedCount === 0 && day.count === result.members[0]?.counts[index])) &&
    total === result.evidenceTotal && result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.evidence.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize));
  if (result.evidence.kind === 'busy-person-days') {
    const rows = result.evidence.rows;
    valid &&= new Set(rows.map(row => JSON.stringify([row.personId, row.date]))).size === rows.length &&
      rows.every(row => {
        const index = result.days.findIndex(day => day.date === row.date);
        return index >= 0 && (result.members.find(member => member.id === row.personId)?.counts[index] ?? 0) >= calendarScheduledBusyThreshold;
      });
  } else {
    const rows = result.evidence.rows;
    const recordKeys = rows.flatMap(row => row.records.map(record => `${record.type}:${record.id}`));
    valid &&= new Set(recordKeys).size === recordKeys.length && new Set(rows.map(row => row.id)).size === rows.length &&
      rows.every(row => row.date >= result.from && row.date <= result.to &&
        calendarReportAttributionMatches(row, result.filters, result.scope) &&
        new Set(row.participantIds).size === row.participantIds.length &&
        (result.filters.participants.length === 0 || row.participantIds.length > 0) &&
        row.participantIds.every(id => result.members.some(member => member.id === id)) &&
        row.records.every(record => record.id === record.recordId && calendarReportRecordMatches(record, result.filters)) &&
        (result.scope.kind !== 'own' || row.participantIds.length === 1 && row.participantIds[0] === result.scope.viewerId)) &&
      result.days.every((day, index) => {
        const observed = rows.filter(row => row.date === day.date);
        const unseen = result.counts.visits - rows.length;
        const reconciles = (value: number, expected: number) => value <= expected && expected - value <= unseen;
        return reconciles(observed.length, day.count) &&
          reconciles(observed.filter(row => row.participantIds.length === 0).length, day.unassignedCount) &&
          result.members.every(member => reconciles(observed.filter(row => row.participantIds.includes(member.id)).length, member.counts[index]!));
      });
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Scheduled Calendar visits, people and evidence do not reconcile.' });
});
export type CalendarScheduledResult = z.infer<typeof calendarScheduledResultSchema>;
