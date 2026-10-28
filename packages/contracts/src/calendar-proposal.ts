import { z } from 'zod';
import { arrivalWindows, jobDateSchema } from './job';
import { calendarChatVisitSchema } from './calendar-chat';
import { calendarScheduleCommandSchema, calendarScheduleSchema, calendarRecordRefSchema } from './calendar';
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const recordReference = z.union([z.uuid(),z.string().regex(/^(?:J|WO)-\d{1,10}$/i)]).nullable();
const scheduleInput = z.object({ operation:z.literal('schedule'),recordRef:recordReference,scheduledDate:jobDateSchema,arrivalWindow:z.enum(arrivalWindows).nullable(),windowMode:z.enum(['keep','set','unset']).optional() }).strict().refine(v => v.windowMode === undefined || (v.windowMode === 'set' ? v.arrivalWindow !== null : v.arrivalWindow === null),{ message:'Choose keep, an explicit window, or explicit unset.' });
const clearInput = z.object({ operation:z.literal('clear'),recordRef:recordReference,scheduledDate:z.null(),arrivalWindow:z.null(),windowMode:z.literal('unset') }).strict();
export const calendarProposeSchema = z.discriminatedUnion('operation',[scheduleInput,clearInput]);
export const calendarProposalBindingSchema = z.object({ proposalId:z.uuid(),inputHash:hash,visitId:z.uuid(),revision:hash }).strict();
export const calendarProposalDecisionSchema = calendarProposalBindingSchema.extend({ workspaceId:z.uuid(),decision:z.enum(['confirm','cancel']) }).strict();
const states = z.enum(['pending','confirmed','cancelled','superseded','expired']);
export const calendarProposalTicketSchema = calendarProposalBindingSchema.extend({ state:states }).strict();
const recordOptions = calendarChatVisitSchema.shape.records.element.options;
const records = z.array(z.discriminatedUnion('type',[
  recordOptions[0].extend({ expectedVersion:z.number().int().positive() }),recordOptions[1].extend({ expectedVersion:z.number().int().positive() }),
])).min(1);
const proposalDraftBase = z.object({
  id:z.uuid(),inputHash:hash,visitId:z.uuid(),revision:hash,createdAt:z.iso.datetime(),expiresAt:z.iso.datetime(),state:states,
  timezone:z.string().min(1).max(100),from:calendarScheduleSchema,
  records,crew:calendarChatVisitSchema.shape.crew,warnings:z.array(z.string().min(1).max(1000)),
}).strict();
const datedSchedule = z.object({ scheduledDate:jobDateSchema,arrivalWindow:z.enum(arrivalWindows).nullable() }).strict();
export const calendarProposalDraftSchema = z.discriminatedUnion('intent',[
  proposalDraftBase.extend({ intent:z.literal('schedule').optional(),to:datedSchedule }),
  proposalDraftBase.extend({ intent:z.literal('clear'),from:datedSchedule,to:z.object({ scheduledDate:z.null(),arrivalWindow:z.null() }).strict(),warnings:z.array(z.string()).max(0) }),
]).superRefine((v,ctx) => {
  const duration = Date.parse(v.expiresAt) - Date.parse(v.createdAt);
  if (duration <= 0 || duration > 900000 || v.records.some(r => ['completed','canceled'].includes(r.status)) || new Set(v.records.map(r => `${r.type}:${r.id}`)).size !== v.records.length) ctx.addIssue({ code:'custom',message:'Invalid complete Calendar review.' });
  try { new Intl.DateTimeFormat('en',{ timeZone:v.timezone }); } catch { ctx.addIssue({ code:'custom',message:'Invalid timezone.' }); }
});
export const calendarProposalContextSchema = calendarProposalBindingSchema.extend({ records:z.array(calendarRecordRefSchema).min(1),read:z.literal(true),canSchedule:z.literal(true) }).strict();
export const calendarProposalViewSchema = z.object({ draft:calendarProposalDraftSchema,context:calendarProposalContextSchema }).strict().superRefine(({draft,context},ctx) => {
  const refs = (items: typeof context.records) => items.map(r => `${r.type}:${r.id}:${r.expectedVersion}`).sort();
  const expected = refs(draft.records),actual = refs(context.records);
  if (draft.id !== context.proposalId || draft.inputHash !== context.inputHash || draft.visitId !== context.visitId || draft.revision !== context.revision || expected.length !== actual.length || expected.some((v,i) => v !== actual[i])) ctx.addIssue({ code:'custom',message:'Invalid Calendar proposal binding.' });
});
export const calendarProposalEvidenceSchema = z.array(z.uuid()).max(7);
export const calendarProposalStoredSchema = z.object({
  draft:calendarProposalDraftSchema,command:calendarScheduleCommandSchema,stamp:hash,authority:hash,
  receipt:z.object({ visitId:z.uuid(),version:z.number().int().positive(),records:z.array(calendarRecordRefSchema).min(1),revision:hash }).strict().nullable(),resultStamp:hash.nullable(),
}).strict().superRefine((v,ctx) => {
  const expected = v.draft.records.map(r => `${r.type}:${r.id}:${r.expectedVersion}`).sort(),actual = v.command.records.map(r => `${r.type}:${r.id}:${r.expectedVersion}`).sort();
  if (v.command.submissionId !== v.draft.id || v.command.visitId !== v.draft.visitId || v.command.schedule.scheduledDate !== v.draft.to.scheduledDate || v.command.schedule.arrivalWindow !== v.draft.to.arrivalWindow || expected.length !== actual.length || expected.some((key,i) => key !== actual[i]) || (v.draft.state === 'confirmed') !== !!v.receipt || !!v.receipt !== !!v.resultStamp || (v.receipt && (v.receipt.visitId !== v.draft.visitId || v.receipt.version !== v.command.expectedVisitVersion + 1 || v.receipt.records.length !== v.command.records.length || new Set(v.receipt.records.map(r => `${r.type}:${r.id}`)).size !== v.receipt.records.length || v.receipt.records.some(r => !v.command.records.some(old => old.type === r.type && old.id === r.id && old.expectedVersion + 1 === r.expectedVersion))))) ctx.addIssue({ code:'custom',message:'Invalid Calendar schedule receipt or command.' });
});
export type CalendarProposalTicket = z.infer<typeof calendarProposalTicketSchema>;
export type CalendarProposalView = z.infer<typeof calendarProposalViewSchema>;
export type CalendarProposalStored = z.infer<typeof calendarProposalStoredSchema>;
export type CalendarProposalBinding = z.infer<typeof calendarProposalBindingSchema>;
