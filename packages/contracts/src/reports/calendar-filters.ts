import { z } from 'zod';

const participant = z.string().trim().min(1).max(200).refine(value => value !== 'unassigned');
const recordType = z.enum(['job', 'work_order']);
export const calendarReportFiltersSchema = z.object({
  participants: z.array(participant).max(50).refine(values => new Set(values).size === values.length).default([]),
  recordTypes: z.array(recordType).max(2).refine(values => new Set(values).size === values.length).default([]),
}).strict();
export type CalendarReportFilters = z.infer<typeof calendarReportFiltersSchema>;
export const calendarReportFilterOptionsQuerySchema = z.object({
  workspaceId: z.uuid(), context: z.enum(['dated', 'unscheduled']),
}).strict();
export type CalendarReportFilterOptionsQuery = z.infer<typeof calendarReportFilterOptionsQuerySchema>;
export const calendarReportFilterOptionsResultSchema = z.object({
  workspaceId: z.uuid(), context: z.enum(['dated', 'unscheduled']),
  scope: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('own'), viewerId: participant }).strict(),
  ]),
  participants: z.array(z.object({ value: participant, label: z.string().trim().min(1) }).strict()),
  recordTypes: z.array(z.object({ value: recordType, label: z.string().trim().min(1) }).strict()).max(2),
}).strict().superRefine((result, context) => {
  const { scope } = result;
  if (new Set(result.participants.map(option => option.value)).size !== result.participants.length ||
    new Set(result.recordTypes.map(option => option.value)).size !== result.recordTypes.length ||
    scope.kind === 'own' && result.participants.some(option => option.value !== scope.viewerId)) {
    context.addIssue({ code: 'custom', message: 'Calendar filter options are duplicated or outside own scope.' });
  }
});
export type CalendarReportFilterOptionsResult = z.infer<typeof calendarReportFilterOptionsResultSchema>;
export function calendarReportParticipantMatches(id: string, filters: CalendarReportFilters): boolean {
  return filters.participants.length === 0 || filters.participants.includes(id);
}
export function calendarReportRecordMatches(
  record: { type: 'job' | 'work_order' }, filters: CalendarReportFilters,
): boolean {
  return filters.recordTypes.length === 0 || filters.recordTypes.includes(record.type);
}

/** Legacy standalone projections may omit attribution; supplied attribution must be complete and reconcile. */
export function calendarReportAttributionMatches(visit: {
  participantIds: readonly string[];
  records: readonly { participantIds?: readonly string[] }[];
}, filters: CalendarReportFilters, scope: { kind: 'workspace' } | { kind: 'own'; viewerId: string }): boolean {
  if (visit.records.every(record => record.participantIds === undefined)) return true;
  const union = new Set<string>();
  for (const record of visit.records) {
    if (!record.participantIds || new Set(record.participantIds).size !== record.participantIds.length ||
      record.participantIds.some(id => !visit.participantIds.includes(id) || !calendarReportParticipantMatches(id, filters)) ||
      filters.participants.length > 0 && record.participantIds.length === 0 ||
      scope.kind === 'own' && (record.participantIds.length !== 1 || record.participantIds[0] !== scope.viewerId)) return false;
    for (const id of record.participantIds) union.add(id);
  }
  return union.size === visit.participantIds.length && visit.participantIds.every(id => union.has(id));
}
