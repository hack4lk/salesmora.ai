import {completionHandoffSnapshotSchema,type CompletionHandoffSnapshot} from './workflow-completion-handoff';
import { z } from 'zod';
import { workflowBriefingSnapshotSchema, workflowVisitSnapshotSchema, type WorkflowBriefingSnapshot, type WorkflowVisitSnapshot } from './workflows';
import { jobDateSchema, jobStatusSchema, type JobStatus } from './job';
import { calendarScheduleSnapshotSchema } from './calendar';
import { estimateStatusSchema, type EstimateStatus } from './estimate';
export const notificationPreferencesSchema = z.object({
  leadAssignedEmail: z.boolean(),
  workflowBriefingEmail: z.boolean().default(true),
  workflowVisitEmail: z.boolean().default(true),
  workflowMaterialsEmail: z.boolean().default(true),
  visitChangedEmail: z.boolean().default(true),
  estimateEmail: z.boolean().default(true),
  deadlineReminderEmail: z.boolean().default(true),
  jobActivityEmail: z.boolean().default(true),
}).strict();
export const notificationQuerySchema = z.object({ workspaceId: z.uuid(), page: z.coerce.number().int().min(1).max(50).default(1) }).strict();
export const markNotificationReadSchema = z.object({ workspaceId: z.uuid(), id: z.uuid() }).strict();
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export const estimateNotificationEvents = ['awaiting_decision', 'needs_scheduling', 'sent', 'delivery_failed', 'viewed', 'decision_recorded', 'expiring_soon', 'expired'] as const;
export const estimateNotificationEventSchema = z.enum(estimateNotificationEvents);
export type EstimateNotificationEvent = (typeof estimateNotificationEvents)[number];
export type EstimateNotificationRecord = {
  kind: 'estimate';
  id: string;
  event: EstimateNotificationEvent;
  estimateId: string;
  estimateNumber: string;
  estimateName: string;
  status: EstimateStatus;
  createdAt: string;
  read: boolean;
};
export const workOrderNotificationEvents = ['issued', 'assigned', 'rescheduled', 'changed', 'completed', 'canceled'] as const;
export type WorkOrderNotificationEvent = (typeof workOrderNotificationEvents)[number];
export type LeadNotificationRecord = { kind: 'lead'; id: string; leadId: string; leadNumber: string; leadName: string; service: string; assignerName: string; createdAt: string; read: boolean };
/** Carries only the event, actor and the work order's number and title; never access notes, prices or contact details. */
export type WorkOrderNotificationRecord = { kind: 'work_order'; id: string; event: WorkOrderNotificationEvent; workOrderId: string; workOrderNumber: string; workOrderTitle: string; actorName: string; createdAt: string; read: boolean };
export const materialNotificationEvents = ['proposed', 'approved', 'edited', 'rejected'] as const;
export type MaterialNotificationEvent = (typeof materialNotificationEvents)[number];
/** Goes only to the person who proposed the item; carries the item name and, for a rejection, the approver's reason. */
export type MaterialNotificationRecord = { kind: 'material'; id: string; event: MaterialNotificationEvent; materialId: string; materialName: string; reason: string; actorName: string; createdAt: string; read: boolean };
export type VisitNotificationRecord = { kind: 'visit'; id: string; event: 'scheduled' | 'rescheduled' | 'cleared' | 'joined' | 'separated'; actorName: string;
  before: import('./calendar').CalendarScheduleSnapshot; after: import('./calendar').CalendarScheduleSnapshot; timezone: string;
  records: { type: 'job' | 'work_order'; id: string; number: string; title: string }[]; createdAt: string; read: boolean };
export type DeadlineNotificationRecord = {
  kind: 'deadline'; id: string; jobId: string; jobNumber: string; jobTitle: string;
  completionDeadline: string; reminderDate: string; timezone: string;
  event: 'approaching' | 'due' | 'overdue'; createdAt: string; read: boolean;
};
export type JobNotificationRecord = {
  kind: 'job'; id: string; jobId: string; jobNumber: string; jobTitle: string;
  actorName: string; createdAt: string; read: boolean;
} & ({ event: 'created' } | { event: 'status'; before: JobStatus; after: JobStatus } |
  { event: 'deadline'; before: string | null; after: string | null; timezone: string } |
  { event: 'assignment'; access: 'current'; change: 'primary' | 'team' | 'updated' | 'removed' });
/** Narrow historical notice; carries no record ID, title or actor after Job access ends. */
export type JobAssignmentRemovalRecord = {
  kind: 'job'; event: 'assignment'; access: 'ended'; change: 'removed'; id: string;
  jobNumber: string; createdAt: string; read: boolean;
};
export const captureNoticeReasonSchema = z.enum(['entitlement','source_capacity','workspace','connection','publication']);
export type CaptureNotificationRecord = { kind: 'capture'; id: string; sourceId: string; sourceName: string; reason: z.infer<typeof captureNoticeReasonSchema>; createdAt: string; read: boolean };
export type LeadWorkflowNotificationRecord = { kind: "lead_workflow"; businessDays?:number; id: string; leadId: string; leadNumber: string; leadName: string; createdAt: string; read: boolean };
export type WorkflowBriefingNotificationRecord = { kind: "workflow_briefing"; id: string; briefingId: string; snapshot: WorkflowBriefingSnapshot; createdAt: string; read: boolean };
export type WorkflowVisitNotificationRecord = { kind: "workflow_visit"; id: string; visitId: string; snapshot: WorkflowVisitSnapshot; createdAt: string; read: boolean };
export type CancellationNotificationRecord={kind:"workflow_cancellation";id:string;openingId:string;description:string;createdAt:string;read:boolean};
export type WorkflowBookingNotificationRecord = {kind:"workflow_booking";id:string;jobId:string;jobNumber:string;event:"booked"|"no_slot";description:string;createdAt:string;read:boolean};
export type ServiceDueNotificationRecord={kind:"service_due";id:string;workflowId:string;serviceName:string;count:number;annual?:boolean;createdAt:string;read:boolean};
export type CompletionHandoffNotificationRecord={kind:"completion_handoff";id:string;snapshot:CompletionHandoffSnapshot;createdAt:string;read:boolean};
export type PostJobNotificationRecord={kind:"post_job";id:string;jobId:string;jobNumber:string;reason:string;createdAt:string;read:boolean};
export type ScheduleChangeNotificationRecord={kind:"customer_schedule_change";id:string;jobId:string;jobNumber:string;visitId:string|null;date:string|null;reason:string;createdAt:string;read:boolean};
export type NotificationRecord = ScheduleChangeNotificationRecord | PostJobNotificationRecord | CompletionHandoffNotificationRecord | ServiceDueNotificationRecord | CancellationNotificationRecord | WorkflowBookingNotificationRecord | WorkflowVisitNotificationRecord | WorkflowBriefingNotificationRecord | LeadWorkflowNotificationRecord | CaptureNotificationRecord | JobAssignmentRemovalRecord | JobNotificationRecord | DeadlineNotificationRecord | VisitNotificationRecord | LeadNotificationRecord | WorkOrderNotificationRecord | MaterialNotificationRecord | EstimateNotificationRecord;
export type NotificationResult = { items: NotificationRecord[]; unreadCount: number; hasMore: boolean; page: number };
const notificationFields = { id: z.uuid(), createdAt: z.iso.datetime({ offset: true }), read: z.boolean() };
const jobNotificationFields = {
  ...notificationFields, kind: z.literal('job'), jobId: z.uuid(), jobNumber: z.string(),
  jobTitle: z.string(), actorName: z.string(),
};
export const notificationRecordSchema: z.ZodType<NotificationRecord> = z.union([
  z.object({...notificationFields,kind:z.literal("customer_schedule_change"),jobId:z.uuid(),jobNumber:z.string(),visitId:z.uuid().nullable(),date:z.iso.date().nullable(),reason:z.string()}).strict(),
  z.object({...notificationFields,kind:z.literal("post_job"),jobId:z.uuid(),jobNumber:z.string(),reason:z.string()}).strict(),
  z.object({...notificationFields,kind:z.literal("completion_handoff"),snapshot:completionHandoffSnapshotSchema}).strict(),
  z.object({...notificationFields,kind:z.literal("service_due"),annual:z.boolean().optional(),workflowId:z.uuid(),serviceName:z.string(),count:z.number().int().positive()}).strict(),
  z.object({...notificationFields,kind:z.literal("workflow_cancellation"),openingId:z.uuid(),description:z.string()}).strict(),
  z.object({...notificationFields,kind:z.literal("workflow_booking"),jobId:z.uuid(),jobNumber:z.string(),event:z.enum(["booked","no_slot"]),description:z.string()}).strict(),
  z.object({ ...notificationFields, kind: z.literal("workflow_visit"), visitId: z.uuid(), snapshot: workflowVisitSnapshotSchema }).strict(),
  z.object({ ...notificationFields, kind: z.literal("workflow_briefing"), briefingId: z.uuid(), snapshot: workflowBriefingSnapshotSchema }).strict(),
  z.object({ ...notificationFields, kind: z.literal("lead_workflow"), businessDays:z.number().int().min(1).max(30).optional(), leadId: z.uuid(), leadNumber: z.string(), leadName: z.string() }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('capture'), sourceId: z.uuid(), sourceName: z.string(), reason: captureNoticeReasonSchema,
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('lead'), leadId: z.uuid(), leadNumber: z.string(), leadName: z.string(),
    service: z.string(), assignerName: z.string(),
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('estimate'), event: estimateNotificationEventSchema,
    estimateId: z.uuid(), estimateNumber: z.string(), estimateName: z.string(), status: estimateStatusSchema,
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('work_order'), event: z.enum(workOrderNotificationEvents),
    workOrderId: z.uuid(), workOrderNumber: z.string(), workOrderTitle: z.string(), actorName: z.string(),
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('material'), event: z.enum(materialNotificationEvents),
    materialId: z.uuid(), materialName: z.string(), reason: z.string(), actorName: z.string(),
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('visit'), event: z.enum(['scheduled', 'rescheduled', 'cleared', 'joined', 'separated']),
    actorName: z.string(), before: calendarScheduleSnapshotSchema, after: calendarScheduleSnapshotSchema, timezone: z.string(),
    records: z.array(z.object({ type: z.enum(['job', 'work_order']), id: z.uuid(), number: z.string(), title: z.string() }).strict()).min(1),
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('deadline'), jobId: z.uuid(), jobNumber: z.string(), jobTitle: z.string(),
    completionDeadline: jobDateSchema, reminderDate: jobDateSchema, timezone: z.string(), event: z.enum(['approaching', 'due', 'overdue']),
  }).strict(),
  z.object({ ...jobNotificationFields, event: z.literal('created') }).strict(),
  z.object({ ...jobNotificationFields, event: z.literal('status'), before: jobStatusSchema, after: jobStatusSchema }).strict(),
  z.object({
    ...jobNotificationFields, event: z.literal('deadline'), before: jobDateSchema.nullable(), after: jobDateSchema.nullable(), timezone: z.string(),
  }).strict(),
  z.object({
    ...jobNotificationFields, event: z.literal('assignment'), access: z.literal('current'), change: z.enum(['primary', 'team', 'updated', 'removed']),
  }).strict(),
  z.object({
    ...notificationFields, kind: z.literal('job'), event: z.literal('assignment'), access: z.literal('ended'),
    change: z.literal('removed'), jobNumber: z.string(),
  }).strict(),
]);
export const notificationResultSchema = z.object({
  items: z.array(notificationRecordSchema), unreadCount: z.number().int().nonnegative(),
  hasMore: z.boolean(), page: z.number().int().min(1).max(50),
}).strict();
export const markNotificationReadResultSchema = z.object({ ok: z.literal(true) }).strict();
export const saveNotificationPreferencesSchema = notificationPreferencesSchema.extend({
  workspaceId: z.uuid(),
  workflowBriefingEmail: z.boolean().optional(),
  workflowVisitEmail: z.boolean().optional(),
  workflowMaterialsEmail: z.boolean().optional(),
  visitChangedEmail: z.boolean().optional(),
  estimateEmail: z.boolean().optional(),
  deadlineReminderEmail: z.boolean().optional(),
  jobActivityEmail: z.boolean().optional(),
}).strict();
