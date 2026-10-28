import { z } from "zod";
import { arrivalWindows, jobDateSchema } from "./job";

/** Explicit identity only: matching dates, customers or assignees never establish a shared visit. */
export const calendarRecordRefSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("job"), id: z.uuid(), expectedVersion: z.number().int().positive() }).strict(),
  z.object({ type: z.literal("work_order"), id: z.uuid(), expectedVersion: z.number().int().positive() }).strict(),
]);
export type CalendarRecordRef = z.infer<typeof calendarRecordRefSchema>;
export const calendarScheduleSchema = z.object({
  scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable(),
}).strict().refine(value => !value.arrivalWindow || !!value.scheduledDate, {
  message: "An arrival window requires a scheduled visit date.", path: ["arrivalWindow"],
});
export type CalendarSchedule = z.infer<typeof calendarScheduleSchema>;
/** Server must compare the full active membership, versions and permissions under one transaction lock. */
export const calendarScheduleCommandSchema = z.object({
  workspaceId: z.uuid(), visitId: z.uuid(), submissionId: z.uuid(), expectedVisitVersion: z.number().int().positive(),
  records: z.array(calendarRecordRefSchema).min(1).refine(records => new Set(records.map(record => `${record.type}:${record.id}`)).size === records.length,
    { message: "Each affected record must be listed once." }),
  schedule: calendarScheduleSchema,
}).strict();
export type CalendarScheduleCommand = z.infer<typeof calendarScheduleCommandSchema>;

/** Joining is explicit; the source Work Order must currently have its own independent visit. */
export const calendarLinkCommandSchema = z.object({
  workspaceId: z.uuid(), submissionId: z.uuid(), visitId: z.uuid(), expectedVisitVersion: z.number().int().positive(),
  records: calendarScheduleCommandSchema.shape.records,
  workOrderId: z.uuid(), expectedWorkOrderVersion: z.number().int().positive(),
  sourceVisitId: z.uuid(), expectedSourceVisitVersion: z.number().int().positive(),
}).strict();
export const calendarSeparateCommandSchema = z.object({
  workspaceId: z.uuid(), submissionId: z.uuid(), visitId: z.uuid(), expectedVisitVersion: z.number().int().positive(),
  records: calendarScheduleCommandSchema.shape.records,
  workOrderId: z.uuid(), schedule: calendarScheduleSchema,
}).strict();

export const calendarFilterStatusSchema = z.enum(['all', 'job:needs-scheduling', 'job:scheduled', 'job:in-progress', 'job:waiting', 'work_order:draft', 'work_order:issued', 'work_order:in-progress']);
export const calendarQuerySchema = z.object({
  workspaceId: z.uuid(), date: jobDateSchema.optional(), view: z.literal('week').default('week'),
  person: z.union([z.literal('all'), z.literal('me'), z.literal('unassigned'), z.string().regex(/^member:[A-Za-z0-9_-]{1,200}$/)]).default('all'),
  recordType: z.enum(['all', 'job', 'work_order']).default('all'), status: calendarFilterStatusSchema.default('all'),
  customerQuery: z.string().max(200).default(''), queuePage: z.number().int().min(1).max(100000).default(1),
}).strict().refine(value => value.status === 'all' || value.recordType === 'all' || value.status.startsWith(`${value.recordType}:`), {
  message: 'Choose a status belonging to the selected record type.', path: ['status'],
});
export type CalendarQuery = z.input<typeof calendarQuerySchema>;
export type CalendarQueryValue = z.output<typeof calendarQuerySchema>;
export function calendarQueryFromURL(workspaceId: string, params: URLSearchParams) {
  const optional = (key: string) => params.get(key) || undefined;
  return calendarQuerySchema.parse({ workspaceId, date: optional('date'), view: optional('view'), person: optional('person'),
    recordType: optional('recordType'), status: optional('status'), customerQuery: optional('customerQuery'),
    queuePage: params.has('queuePage') ? Number(params.get('queuePage')) : undefined });
}
export type CalendarVisit = CalendarSchedule & {
  id: string; title: string; customerName: string; timezone: string; location: string | null; nextStep: string | null;
  records: ({ id: string; number: string; title: string } & ({ type: 'job'; status: import('./job').JobStatus } | { type: 'work_order'; status: import('./work-order').WorkOrderStatus }))[];
  crew: { id: string; name: string }[]; completionDeadline: { date: string; overdue: boolean } | null;
  waiting: boolean; canReschedule: boolean; revision: string;
  review: { expectedVisitVersion: number; records: CalendarRecordRef[] } | null;
};
export type CalendarResult = {
  query: CalendarQueryValue; weekDate: string; today: string; timezone: string; scope: 'workspace' | 'own'; viewerId: string;
  members: { id: string; name: string }[]; canSchedule: boolean;
  entries: (CalendarVisit & { scheduledDate: string })[]; unscheduled: CalendarVisit[]; unscheduledTotal: number; queuePages: number;
};
export const calendarAdvisorySchema = z.object({ workspaceId: z.uuid(), visitId: z.uuid(), revision: z.string().min(1).max(200), schedule: calendarScheduleSchema }).strict();
export { ZodError as CalendarContractError } from 'zod';

const visitRevision = z.string().regex(/^[a-f0-9]{64}$/);
const workOrderVisitBase = { workspaceId: z.uuid(), submissionId: z.uuid(), workOrderId: z.uuid() };
export const workOrderVisitChangeSchema = z.discriminatedUnion('kind', [
  z.object({ ...workOrderVisitBase, kind: z.literal('join'), sourceVisitId: z.uuid(), sourceRevision: visitRevision, visitId: z.uuid(), revision: visitRevision }).strict(),
  z.object({ ...workOrderVisitBase, kind: z.literal('separate'), visitId: z.uuid(), revision: visitRevision,
    scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable() }).strict()
    .refine(value => !value.arrivalWindow || !!value.scheduledDate, { message: 'An arrival window requires a scheduled date.' }),
]);
export type WorkOrderVisitManagement = { source: CalendarVisit | null; target: CalendarVisit | null; today: string; canJoin: boolean; canSeparate: boolean };
