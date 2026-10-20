import { z } from 'zod';
export const notificationPreferencesSchema = z.object({ leadAssignedEmail: z.boolean() }).strict();
export const notificationQuerySchema = z.object({ workspaceId: z.uuid(), page: z.coerce.number().int().min(1).max(50).default(1) }).strict();
export const markNotificationReadSchema = z.object({ workspaceId: z.uuid(), id: z.uuid() }).strict();
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export const workOrderNotificationEvents = ['issued', 'assigned', 'rescheduled', 'changed', 'completed', 'canceled'] as const;
export type WorkOrderNotificationEvent = (typeof workOrderNotificationEvents)[number];
export type LeadNotificationRecord = { kind: 'lead'; id: string; leadId: string; leadNumber: string; leadName: string; service: string; assignerName: string; createdAt: string; read: boolean };
/** Carries only the event, actor and the work order's number and title; never access notes, prices or contact details. */
export type WorkOrderNotificationRecord = { kind: 'work_order'; id: string; event: WorkOrderNotificationEvent; workOrderId: string; workOrderNumber: string; workOrderTitle: string; actorName: string; createdAt: string; read: boolean };
export const materialNotificationEvents = ['approved', 'rejected'] as const;
export type MaterialNotificationEvent = (typeof materialNotificationEvents)[number];
/** Goes only to the person who proposed the item; carries the item name and, for a rejection, the approver's reason. */
export type MaterialNotificationRecord = { kind: 'material'; id: string; event: MaterialNotificationEvent; materialId: string; materialName: string; reason: string; actorName: string; createdAt: string; read: boolean };
export type NotificationRecord = LeadNotificationRecord | WorkOrderNotificationRecord | MaterialNotificationRecord;
export type NotificationResult = { items: NotificationRecord[]; unreadCount: number; hasMore: boolean; page: number };
export const saveNotificationPreferencesSchema = notificationPreferencesSchema.extend({ workspaceId: z.uuid() }).strict();
