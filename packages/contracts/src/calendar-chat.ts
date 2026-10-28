import { z } from 'zod';
import { calendarQuerySchema } from './calendar';
import { arrivalWindows, jobDateSchema, jobStatusSchema } from './job';
import { workOrderStatusSchema } from './work-order';
export const calendarVisitReferenceSchema = z.object({ id:z.uuid(),revision:z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const calendarChatContextSchema = z.object({
  date: jobDateSchema, person: calendarQuerySchema.shape.person, recordType: calendarQuerySchema.shape.recordType,
  status: calendarQuerySchema.shape.status, customerQuery: calendarQuerySchema.shape.customerQuery,
}).strict().refine(v => v.status === 'all' || v.recordType === 'all' || v.status.startsWith(`${v.recordType}:`));
export const calendarChatQuerySchema = z.object({
  operation: z.enum(['schedule', 'unscheduled', 'availability']), date: jobDateSchema.nullable(), usePageFilters: z.boolean(),
  to: jobDateSchema.nullable().optional(), person: z.string().trim().min(1).max(200).nullable().optional(),
  arrivalWindow: z.enum(arrivalWindows).nullable().optional(), includeWeekends: z.boolean().optional(),
}).strict().superRefine((v, ctx) => {
  if (v.operation !== 'availability' && (v.to || v.person || v.arrivalWindow || v.includeWeekends)) ctx.addIssue({ code: 'custom', message: 'Advice parameters require availability.' });
  if (v.to && (!v.date || v.to < v.date || Date.parse(v.to) - Date.parse(v.date) > 30 * 86400000)) ctx.addIssue({ code: 'custom', message: 'Choose a range of up to 31 calendar days.' });
});
const record = z.discriminatedUnion('type', [
  z.object({ type: z.literal('job'), id: z.uuid(), number: z.string().regex(/^J-\d+$/), title: z.string().min(1).max(200), status: jobStatusSchema }).strict(),
  z.object({ type: z.literal('work_order'), id: z.uuid(), number: z.string().regex(/^WO-\d+$/), title: z.string().min(1).max(200), status: workOrderStatusSchema }).strict(),
]);
export const calendarChatVisitSchema = z.object({
  id: z.uuid(), title: z.string().min(1).max(200), scheduledDate: jobDateSchema.nullable(), arrivalWindow: z.enum(arrivalWindows).nullable(),
  records: z.array(record).min(1), crew: z.array(z.object({ id: z.string().min(1).max(200), name: z.string().max(200) }).strict()),
}).strict();
const calendarVisitResultSchema = z.object({
  id: z.uuid(), scope: z.enum(['workspace', 'own']), timezone: z.string().min(1).max(100), checkedAt: z.iso.datetime(),
  filterLabels: z.array(z.string().max(300)).max(6), total: z.number().int().nonnegative(), visits: z.array(calendarChatVisitSchema).max(25),
  mode: z.enum(['schedule', 'unscheduled']), from: jobDateSchema.optional(), to: jobDateSchema.optional(),
}).strict().superRefine((v, ctx) => {
  const keys = v.visits.flatMap(visit => visit.records.map(r => `${r.type}:${r.id}`));
  if (new Set(v.visits.map(visit => visit.id)).size !== v.visits.length || new Set(keys).size !== keys.length || v.total < v.visits.length || (v.total > 0 && !v.visits.length)) ctx.addIssue({ code: 'custom', message: 'Invalid visit set.' });
  if (v.mode === 'schedule' ? !v.from || !v.to || v.from > v.to || v.visits.some(visit => !visit.scheduledDate || visit.scheduledDate < v.from! || visit.scheduledDate > v.to!) : !!v.from || !!v.to || v.visits.some(visit => visit.scheduledDate !== null || visit.arrivalWindow !== null)) ctx.addIssue({ code: 'custom', message: 'Invalid Calendar range.' });
  try { new Intl.DateTimeFormat('en-US', { timeZone: v.timezone }); } catch { ctx.addIssue({ code: 'custom', message: 'Invalid timezone.' }); }
});
const person = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,200}$/), name: z.string().trim().min(1).max(200) }).strict();
export const calendarAvailabilityResultSchema = z.object({
  id: z.uuid(), mode: z.literal('availability'), from: jobDateSchema, to: jobDateSchema,
  timezone: z.string().min(1).max(100), checkedAt: z.iso.datetime(), scope: z.enum(['workspace','own']), viewerId: person.shape.id,
  people: z.array(person).min(1).max(10), arrivalWindow: z.enum(arrivalWindows).nullable(),
  total: z.number().int().nonnegative(), suggestions: z.array(z.object({
    id: z.uuid(), date: jobDateSchema, person, visitCount: z.number().int().nonnegative(), unknownWindowCount: z.number().int().nonnegative(),
    timing: z.enum(['no-known-overlap','not-checked']),
  }).strict()).max(3),
}).strict().superRefine((v, ctx) => {
  const invalid = v.from > v.to || Date.parse(v.to) - Date.parse(v.from) > 30 * 86400000 || v.total < v.suggestions.length || (v.total > 0 && !v.suggestions.length) ||
    new Set(v.people.map(p => p.id)).size !== v.people.length || (v.scope === 'own' && v.people.some(p => p.id !== v.viewerId)) ||
    new Set(v.suggestions.map(s => s.id)).size !== v.suggestions.length || new Set(v.suggestions.map(s => `${s.person.id}:${s.date}`)).size !== v.suggestions.length ||
    v.suggestions.some(s => s.date < v.from || s.date > v.to || !v.people.some(p => p.id === s.person.id && p.name === s.person.name) || s.unknownWindowCount > s.visitCount ||
      (s.timing === 'no-known-overlap' && (!v.arrivalWindow || (s.visitCount > 0 && s.unknownWindowCount === s.visitCount))));
  if (invalid) ctx.addIssue({ code: 'custom', message: 'Invalid Calendar advice.' });
  try { new Intl.DateTimeFormat('en-US', { timeZone: v.timezone }); } catch { ctx.addIssue({ code: 'custom', message: 'Invalid timezone.' }); }
});
/** Existing saved week/queue snapshots remain valid; advice shares their evidence lifecycle. */
export const calendarChatResultSchema = z.union([calendarVisitResultSchema, calendarAvailabilityResultSchema]);
export type CalendarChatAvailabilityResult = z.infer<typeof calendarAvailabilityResultSchema>;
export type CalendarChatResult = z.infer<typeof calendarChatResultSchema>;
export const calendarChatOpenSchema = z.object({ workspaceId: z.uuid(), turnId: z.uuid(), resultId: z.uuid(), visitId: z.uuid().optional(), suggestionId: z.uuid().optional() }).strict().refine(v => !v.visitId || !v.suggestionId);
export const calendarChatSnapshotSchema = z.object({ result: calendarChatResultSchema, query: calendarQuerySchema }).strict();
