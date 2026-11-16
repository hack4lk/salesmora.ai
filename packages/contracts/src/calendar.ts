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
export const calendarVisitSchema = z.object({
  scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable(),
  id: z.uuid(), title: z.string(), customerName: z.string(), timezone: z.string(), location: z.string().nullable(), nextStep: z.string().nullable(),
  records: z.array(z.discriminatedUnion("type", [
    z.object({ type: z.literal("job"), id: z.uuid(), number: z.string(), title: z.string(), status: z.enum(["needs-scheduling", "scheduled", "in-progress", "waiting", "completed", "canceled"]) }),
    z.object({ type: z.literal("work_order"), id: z.uuid(), number: z.string(), title: z.string(), status: z.enum(["draft", "issued", "in-progress", "completed", "canceled"]) }),
  ])), crew: z.array(z.object({ id: z.string(), name: z.string() })),
  completionDeadline: z.object({ date: jobDateSchema, overdue: z.boolean() }).nullable(),
  waiting: z.boolean(), canReschedule: z.boolean(), revision: z.string(),
  review: z.object({ expectedVisitVersion: z.number().int().positive(), records: z.array(calendarRecordRefSchema) }).nullable(),
}) satisfies z.ZodType<CalendarVisit>;
export const calendarResultSchema = z.object({
  query: calendarQuerySchema, weekDate: jobDateSchema, today: jobDateSchema, timezone: z.string(), scope: z.enum(["workspace", "own"]), viewerId: z.string(),
  members: z.array(z.object({ id: z.string(), name: z.string() })), canSchedule: z.boolean(),
  entries: z.array(calendarVisitSchema.extend({ scheduledDate: jobDateSchema })), unscheduled: z.array(calendarVisitSchema),
  unscheduledTotal: z.number().int().nonnegative(), queuePages: z.number().int().nonnegative(),
}) satisfies z.ZodType<CalendarResult>;
export const calendarAdvisoryResultSchema = z.object({ messages: z.array(z.string()) });
export const calendarSavedResultSchema = z.object({ visitId: z.uuid(), version: z.number().int().positive(), records: z.array(calendarRecordRefSchema) });
export { ZodError as CalendarContractError } from 'zod';

const visitRevision = z.string().regex(/^[a-f0-9]{64}$/);
export const workOrderCreationVisitSchema = z.object({
  id: z.uuid(), scheduledDate: jobDateSchema, arrivalWindow: z.enum(arrivalWindows).nullable(), timezone: z.string(),
  canJoin: z.boolean(), references: z.array(z.string()), revision: visitRevision,
}).nullable();
const workOrderVisitBase = { workspaceId: z.uuid(), submissionId: z.uuid(), workOrderId: z.uuid() };
export const workOrderVisitChangeSchema = z.discriminatedUnion('kind', [
  z.object({ ...workOrderVisitBase, kind: z.literal('join'), sourceVisitId: z.uuid(), sourceRevision: visitRevision, visitId: z.uuid(), revision: visitRevision }).strict(),
  z.object({ ...workOrderVisitBase, kind: z.literal('separate'), visitId: z.uuid(), revision: visitRevision,
    scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable() }).strict()
    .refine(value => !value.arrivalWindow || !!value.scheduledDate, { message: 'An arrival window requires a scheduled date.' }),
]);
export type WorkOrderVisitManagement = { source: CalendarVisit | null; target: CalendarVisit | null; today: string; canJoin: boolean; canSeparate: boolean };
export const workOrderVisitManagementSchema = z.object({
  source: calendarVisitSchema.nullable(), target: calendarVisitSchema.nullable(), today: jobDateSchema, canJoin: z.boolean(), canSeparate: z.boolean(),
}) satisfies z.ZodType<WorkOrderVisitManagement>;
