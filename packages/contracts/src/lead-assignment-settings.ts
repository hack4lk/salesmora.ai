import { z } from 'zod';
export const defaultLeadAssignmentRuleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unassigned') }).strict(),
  z.object({ kind: z.literal('teammate'), teammateId: z.string().min(1).max(200) }).strict(),
]);
export const leadAssignmentSettingsQuerySchema = z.object({ workspaceId: z.uuid() }).strict();
export const saveLeadAssignmentSettingsSchema = z.object({ workspaceId: z.uuid(), requestId: z.uuid(), expectedVersion: z.number().int().min(1).max(2147483646), value: defaultLeadAssignmentRuleSchema }).strict();
export const leadAssignmentSettingsSnapshotSchema = z.object({ workspaceId: z.uuid(), version: z.number().int().positive(), value: defaultLeadAssignmentRuleSchema, canManage: z.boolean(),
  teammates: z.array(z.object({ id: z.string().min(1).max(200), name: z.string() }).strict()),
}).strict();
export type DefaultLeadAssignmentRule = z.infer<typeof defaultLeadAssignmentRuleSchema>;
export type LeadAssignmentSettingsSnapshot = z.infer<typeof leadAssignmentSettingsSnapshotSchema>;
export type CaptureAssignmentResolution = { ready: boolean; assigneeId: string | null; settingVersion: number | null; basis: 'business_default' | 'source'; reason?: 'missing_rule' | 'invalid_rule' | 'unavailable_teammate' };
