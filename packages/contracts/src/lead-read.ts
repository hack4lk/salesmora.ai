import { z } from 'zod';
import { leadSchema } from './lead';
export const leadStages = ['new', 'contacted', 'estimate-sent', 'won', 'lost'] as const;
export const leadSources = ['website', 'referral', 'phone', 'gmail', 'other'] as const;
export const leadListQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.enum(['list', 'pipeline']).default('pipeline'), q: z.string().trim().max(200).default(''),
  stages: z.array(z.enum(leadStages)).max(5).default([]), sources: z.array(z.enum(leadSources)).max(5).default([]),
  ownerIds: z.array(z.string().min(1).max(200)).max(50).default([]),
  created: z.enum(['any', '7days', '30days', 'custom']).default('any'), from: z.iso.date().optional(), to: z.iso.date().optional(),
  attention: z.boolean().default(false), archived: z.boolean().default(false),
  sort: z.enum(['name', 'service', 'stage', 'source', 'owner', 'created']).default('created'), direction: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).max(100000).default(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
  column: z.enum(leadStages).optional(), columnPage: z.number().int().min(1).max(100000).default(1),
}).strict().superRefine((value, context) => {
  if (value.created === 'custom' && (!value.from || !value.to || value.from > value.to)) context.addIssue({ code: 'custom', message: 'Choose a valid ordered date range.', path: ['from'] });
});
export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
export const leadDetailQuerySchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), activityPage: z.coerce.number().int().min(1).max(100000).default(1) }).strict();
export const leadCreatedActivitySchema = z.object({ source: z.enum(leadSources) });
export type LeadReadRecord = {
  id: string; leadNumber: string; version: number; name: string; service: string; email: string; phone: string; address: string; postalCode?: string; countryCode?: 'US'; details: string; notes: string;
  stage: typeof leadStages[number]; source: typeof leadSources[number]; owner: { id: string; name: string; former: boolean } | null;
  createdAt: string; updatedAt: string; lastActivityAt: string; archived: boolean; needsAttention: boolean; canMove: boolean; canEdit: boolean; canAssign: boolean; canArchive: boolean; canRestore: boolean; canDelete: boolean; origin: 'manual' | 'gmail' | 'campaign' | 'lead_capture';
};
export type LeadListResult = {
  rows: LeadReadRecord[]; total: number; page: number; pageSize: number; timezone: string;
  columns: { stage: typeof leadStages[number]; total: number; leads: LeadReadRecord[]; hasMore: boolean; page: number }[];
  owners: { id: string; name: string; openLeadCount: number }[]; canExport: boolean; exportScope: 'workspace' | 'assigned'; canAssign: boolean; scope: 'workspace' | 'assigned'; canCreate: boolean; canShowArchived: boolean;
  policyRevision: number;
};
export type LeadDetailResult = { relatedCustomer?: {name:string;number:string;email:string;phone:string;differs:boolean;customerId?:string}; owners: LeadListResult['owners']; canExport: boolean; exportScope: 'workspace' | 'assigned'; canAssign: boolean; lead: LeadReadRecord; teamNotes: LeadReadNote[]; notesTotal: number; activity: { id: string; actorName: string | null; actorType: string; type: string; changes: unknown; createdAt: string }[]; activityTotal: number; timezone: string; scope: 'workspace' | 'assigned'; canCreate: boolean; canShowArchived: boolean; policyRevision: number };

export const leadReadRecordSchema = z.object({
  id: z.uuid(), leadNumber: z.string().min(1), version: z.number().int().positive(),
  name: z.string(), service: z.string(), email: z.string(), phone: z.string(), address: z.string(), postalCode: z.string().optional(), countryCode: z.literal('US').optional(), details: z.string(), notes: z.string(),
  stage: z.enum(leadStages), source: z.enum(leadSources),
  owner: z.object({ id: z.string().min(1), name: z.string(), former: z.boolean() }).nullable(),
  createdAt: z.iso.datetime({ offset: true }), updatedAt: z.iso.datetime({ offset: true }), lastActivityAt: z.iso.datetime({ offset: true }),
  archived: z.boolean(), needsAttention: z.boolean(), canMove: z.boolean(), canEdit: z.boolean(), canAssign: z.boolean(),
  canArchive: z.boolean(), canRestore: z.boolean(), canDelete: z.boolean(), origin: z.enum(['manual', 'gmail', 'campaign', 'lead_capture']),
}) satisfies z.ZodType<LeadReadRecord>;
const leadReadAccessShape = {
  owners: z.array(z.object({ id: z.string().min(1), name: z.string(), openLeadCount: z.number().int().nonnegative() })),
  canExport: z.boolean(), exportScope: z.enum(['workspace', 'assigned']), canAssign: z.boolean(),
  scope: z.enum(['workspace', 'assigned']), canCreate: z.boolean(), canShowArchived: z.boolean(),
  timezone: z.string().min(1), policyRevision: z.number().int().nonnegative(),
};
export const leadListResultSchema = z.object({
  ...leadReadAccessShape,
  rows: z.array(leadReadRecordSchema), total: z.number().int().nonnegative(),
  page: z.number().int().positive(), pageSize: z.number().int().positive(),
  columns: z.array(z.object({
    stage: z.enum(leadStages), total: z.number().int().nonnegative(), leads: z.array(leadReadRecordSchema),
    hasMore: z.boolean(), page: z.number().int().positive(),
  })),
}) satisfies z.ZodType<LeadListResult>;
export const leadReadNoteSchema = z.object({
  id: z.uuid(), body: z.string(), authorName: z.string(), createdAt: z.iso.datetime({ offset: true }), viaAssistant: z.boolean(),
}) satisfies z.ZodType<LeadReadNote>;
export const leadDetailResultSchema = z.object({
  ...leadReadAccessShape,
  relatedCustomer: z.object({ name: z.string(), number: z.string(), email: z.string(), phone: z.string(), differs: z.boolean(), customerId: z.uuid().optional() }).optional(),
  lead: leadReadRecordSchema, teamNotes: z.array(leadReadNoteSchema), notesTotal: z.number().int().nonnegative(),
  activity: z.array(z.object({
    id: z.uuid(), actorName: z.string().nullable(), actorType: z.string(), type: z.string(),
    changes: z.unknown(), createdAt: z.iso.datetime({ offset: true }),
  })),
  activityTotal: z.number().int().nonnegative(),
}) satisfies z.ZodType<LeadDetailResult>;
export const leadNotesResultSchema = z.object({ notes: z.array(leadReadNoteSchema), total: z.number().int().nonnegative() });
export const leadNoteSavedSchema = z.object({ ok: z.literal(true), note: leadReadNoteSchema });
export const leadVersionSavedSchema = z.object({ version: z.number().int().positive() });
export const leadArchiveSavedSchema = leadVersionSavedSchema.extend({ archived: z.boolean() });
export const leadDeletedSchema = z.object({ deleted: z.literal(true) });
export const leadCreatedSchema = z.object({ leadId: z.uuid() });

export const leadStageActivitySchema = z.object({ from: z.enum(leadStages), to: z.enum(leadStages), reason: z.string().max(500).optional() });
export const moveLeadStageSchema = z.object({
  workspaceId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive(),
  to: z.enum(leadStages), reason: z.string().trim().max(500).optional(),
}).strict().refine(value => value.to === 'lost' || !value.reason, { message: 'A reason is only accepted when moving to Lost.', path: ['reason'] });
export type MoveLeadStageInput = z.infer<typeof moveLeadStageSchema>;

export const leadNoteActivitySchema = z.object({ body: z.string().trim().min(1).max(2000) });
export const addLeadNoteSchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), body: z.string().trim().min(1).max(2000) }).strict();
export const leadNotesQuerySchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), page: z.coerce.number().int().min(1).max(100000).default(1) }).strict();
export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>;
export type LeadReadNote = { id: string; body: string; authorName: string; createdAt: string; viaAssistant: boolean };

export const leadCreationProvenanceSchema = leadCreatedActivitySchema.extend({ origin: z.enum(['manual', 'gmail', 'campaign', 'lead_capture']).optional() });
export const leadEditableFields = ['name', 'email', 'phone', 'service', 'address', 'postalCode', 'details', 'notes', 'source'] as const;
export const leadEditableFieldSchema = z.enum(leadEditableFields);
export const leadEditValuesSchema = leadSchema.pick({ name: true, email: true, phone: true, service: true, address: true, postalCode: true, details: true, notes: true, source: true }).extend({ source: leadSchema.shape.source.optional() }).strict();
export const updateLeadSchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive(), ownerId: z.string().min(1).max(200).nullable().optional(), values: leadEditValuesSchema }).strict();
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export const leadEditedActivitySchema = z.object({ fromVersion: z.number().int().positive(), toVersion: z.number().int().positive(), fields: z.array(z.object({ field: leadEditableFieldSchema, before: z.string(), after: z.string() })).min(1).max(10) });
export const leadEditConflictSchema = z.object({ error: z.string(), changedFields: z.array(leadEditableFieldSchema).max(10) });
export const assignLeadSchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive(), ownerId: z.string().min(1).max(200).nullable() }).strict();
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export const leadAssignedActivitySchema = z.object({ from: z.string().nullable(), to: z.string().nullable() });

export const leadArchiveSchema = z.object({ workspaceId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), expectedVersion: z.number().int().positive() }).strict();
export type LeadArchiveInput = z.infer<typeof leadArchiveSchema>;

export const deleteLeadSchema = leadArchiveSchema.extend({ typedConfirmation: z.string().min(1).max(40) }).strict();
export type DeleteLeadInput = z.infer<typeof deleteLeadSchema>;
