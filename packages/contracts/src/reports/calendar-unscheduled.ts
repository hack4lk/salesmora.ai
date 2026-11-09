import { z } from 'zod';
import { jobDateSchema, jobStatusSchema } from '../job';
import { workOrderStatusSchema } from '../work-order';
import { calendarReportFiltersSchema, calendarReportParticipantMatches, calendarReportRecordMatches, calendarReportAttributionMatches } from './calendar-filters';

const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
export const calendarUnscheduledQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('calendar-unscheduled'),
  selected: z.enum(['visits', 'jobs', 'workOrders']), page: page.default(1), pageSize: pageSize.default(25),
  filters: calendarReportFiltersSchema.default({ participants: [], recordTypes: [] }),
}).strict();
export type CalendarUnscheduledQuery = z.infer<typeof calendarUnscheduledQuerySchema>;

const record = { id: z.uuid(), recordId: z.uuid(), label: text, participantIds: z.array(text).optional() };
export const calendarUnscheduledResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('calendar-unscheduled'),
  today: jobDateSchema.refine(value => !value.startsWith('0000')),
  asOf: z.iso.datetime(), timezone: text, scopeLabel: text,
  scope: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('own'), viewerId: text }).strict(),
  ]),
  members: z.array(z.object({ id: text, label: text }).strict()),
  counts: z.object({ visits: count, jobs: count, workOrders: count }).strict(),
  visits: z.array(z.object({
    id: z.uuid(), label: text, scheduledDate: z.null(), participantIds: z.array(text),
    records: z.array(z.discriminatedUnion('type', [
      z.object({ ...record, type: z.literal('job'), status: jobStatusSchema.exclude(['completed', 'canceled']) }).strict(),
      z.object({ ...record, type: z.literal('work_order'), status: workOrderStatusSchema.exclude(['completed', 'canceled']), archived: z.literal(false) }).strict(),
    ])).min(1),
  }).strict()).max(100),
  evidence: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('visits'), visitIds: z.array(z.uuid()).max(100) }).strict(),
    z.object({ kind: z.enum(['jobs', 'workOrders']), records: z.array(z.object({
      visitId: z.uuid(), recordId: z.uuid(),
    }).strict()).max(100) }).strict(),
  ]),
  page, pageSize, evidenceTotal: count,
  filters: calendarReportFiltersSchema.default({ participants: [], recordTypes: [] }),
}).strict().superRefine((result, context) => {
  const { counts, evidence, visits, scope } = result;
  const records = visits.flatMap(visit => visit.records);
  const jobs = records.filter(row => row.type === 'job').length, orders = records.length - jobs;
  const recordTotal = counts.jobs + counts.workOrders;
  const unseenVisits = counts.visits - visits.length;
  const total = counts[evidence.kind];
  const length = evidence.kind === 'visits' ? evidence.visitIds.length : evidence.records.length;
  let valid = Number.isSafeInteger(recordTotal) && recordTotal >= counts.visits &&
    (counts.visits !== 0 || recordTotal === 0) && unseenVisits >= 0 &&
    jobs <= counts.jobs && orders <= counts.workOrders &&
    recordTotal - records.length >= unseenVisits &&
    (unseenVisits !== 0 || jobs === counts.jobs && orders === counts.workOrders) &&
    new Set(result.members.map(member => member.id)).size === result.members.length &&
    new Set(visits.map(visit => visit.id)).size === visits.length &&
    new Set(records.map(row => `${row.type}:${row.id}`)).size === records.length &&
    records.every(row => row.id === row.recordId && calendarReportRecordMatches(row, result.filters)) &&
    (result.filters.recordTypes.length === 0 || result.filters.recordTypes.includes('job') || counts.jobs === 0) &&
    (result.filters.recordTypes.length === 0 || result.filters.recordTypes.includes('work_order') || counts.workOrders === 0) &&
    result.members.every(member => calendarReportParticipantMatches(member.id, result.filters)) &&
    (scope.kind !== 'own' || result.filters.participants.every(id => id === scope.viewerId)) &&
    visits.every(visit => new Set(visit.participantIds).size === visit.participantIds.length &&
      calendarReportAttributionMatches(visit, result.filters, scope) &&
      visit.participantIds.every(id => result.members.some(member => member.id === id)) &&
      (scope.kind !== 'own' || visit.participantIds.length === 1 && visit.participantIds[0] === scope.viewerId) &&
      (result.filters.participants.length === 0 || visit.participantIds.length > 0)) &&
    (scope.kind !== 'own' || result.members.length === 1 && result.members[0]?.id === scope.viewerId) &&
    total === result.evidenceTotal && result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize));
  if (evidence.kind === 'visits') {
    valid &&= new Set(evidence.visitIds).size === length && length === visits.length &&
      evidence.visitIds.every(id => visits.some(visit => visit.id === id));
  } else {
    const referenced = new Set(evidence.records.map(row => row.visitId));
    const type = evidence.kind === 'jobs' ? 'job' : 'work_order';
    valid &&= referenced.size === visits.length && visits.every(visit => referenced.has(visit.id)) &&
      new Set(evidence.records.map(row => row.recordId)).size === length &&
      evidence.records.every(row => visits.some(visit => visit.id === row.visitId &&
        visit.records.some(record => record.id === row.recordId && record.type === type)));
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Unscheduled Calendar visits, active record counts, scope and evidence do not reconcile.' });
});
export type CalendarUnscheduledResult = z.infer<typeof calendarUnscheduledResultSchema>;
