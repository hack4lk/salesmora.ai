import { z } from 'zod';
import type { JobStatus } from './job';
import { estimateStatusSchema, type EstimateStatus } from './estimate';
export const notificationPreferencesSchema = z.object({
  leadAssignedEmail: z.boolean(),
  visitChangedEmail: z.boolean().default(true),
  estimateEmail: z.boolean().default(true),
  deadlineReminderEmail: z.boolean().default(true),
  jobActivityEmail: z.boolean().default(true),
}).strict();
export const notificationQuerySchema = z.object({ workspaceId: z.uuid(), page: z.coerce.number().int().min(1).max(50).default(1) }).strict();
export const markNotificationReadSchema = z.object({ workspaceId: z.uuid(), id: z.uuid() }).strict();
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export const estimateNotificationEvents = ['sent', 'delivery_failed', 'viewed', 'decision_recorded', 'expiring_soon', 'expired'] as const;
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
  before: import('./calendar').CalendarSchedule; after: import('./calendar').CalendarSchedule; timezone: string;
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
export type NotificationRecord = JobAssignmentRemovalRecord | JobNotificationRecord | DeadlineNotificationRecord | VisitNotificationRecord | LeadNotificationRecord | WorkOrderNotificationRecord | MaterialNotificationRecord | EstimateNotificationRecord;
export type NotificationResult = { items: NotificationRecord[]; unreadCount: number; hasMore: boolean; page: number };
export const saveNotificationPreferencesSchema = notificationPreferencesSchema.extend({
  workspaceId: z.uuid(),
  visitChangedEmail: z.boolean().optional(),
  estimateEmail: z.boolean().optional(),
  deadlineReminderEmail: z.boolean().optional(),
  jobActivityEmail: z.boolean().optional(),
}).strict();
