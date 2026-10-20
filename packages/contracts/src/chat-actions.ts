import { z } from 'zod';
import { leadExportSchema, leadExportPreviewSchema } from './lead-export';
import { leadSchema } from './lead';
import { leadEditableFieldSchema } from './lead-read';

export const leadUpdateDraftInputSchema = z.object({ leadRef: z.string().trim().max(64), changes: z.array(z.object({ field: leadEditableFieldSchema, value: z.string().max(10000) }).strict()).min(1).max(8) }).strict().refine(value => new Set(value.changes.map(change => change.field)).size === value.changes.length, { message: 'Each field may appear only once.' });
// Compound proposals remain one approval and require both permissions.
export const leadUpdateWithStageDraftInputSchema = leadUpdateDraftInputSchema.safeExtend({
  stage: z.object({ to: leadSchema.shape.stage, reason: z.string().trim().max(500) }).strict(),
});
export type LeadUpdateWithStageDraftInput = z.infer<typeof leadUpdateWithStageDraftInputSchema>;
const updateStageReviewSchema = z.object({ from: leadSchema.shape.stage, to: leadSchema.shape.stage, reason: z.string().max(500).optional() }).strict();
export type LeadUpdateDraftInput = z.infer<typeof leadUpdateDraftInputSchema>;
const leadUpdateDraftReviewBaseSchema = z.object({
  actionType: z.literal('lead.update'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200) }).strict(),
  stage: updateStageReviewSchema.optional(),
  changes: z.array(z.object({ field: leadEditableFieldSchema, before: z.string().max(10000), after: z.string().max(10000) }).strict()).max(8),
}).strict();
const hasChanges = (value: { changes: unknown[]; stage?: { from: string; to: string } }) => value.changes.length > 0 || !!value.stage && value.stage.from !== value.stage.to;
export const leadUpdateDraftReviewSchema = leadUpdateDraftReviewBaseSchema.refine(hasChanges, { message: 'A proposal must contain changes.' });
export const leadUpdateDraftPayloadSchema = leadUpdateDraftReviewBaseSchema.pick({ lead: true, changes: true, stage: true }).extend({ expectedVersion: z.number().int().positive() }).strict().refine(hasChanges, { message: 'A proposal must contain changes.' });
export type LeadUpdateDraftPayload = z.infer<typeof leadUpdateDraftPayloadSchema>;
export type LeadUpdateDraftReview = z.infer<typeof leadUpdateDraftReviewSchema>;

export const leadStageDraftInputSchema = z.object({ leadRef: z.string().trim().max(64), to: leadSchema.shape.stage, reason: z.string().trim().max(500) }).strict();
export type LeadStageDraftInput = z.infer<typeof leadStageDraftInputSchema>;
export const leadStageDraftReviewSchema = z.object({
  actionType: z.literal('lead.stage'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200) }).strict(),
  from: leadSchema.shape.stage, to: leadSchema.shape.stage, reason: z.string().max(500).optional(),
}).strict();
export const leadStageDraftPayloadSchema = leadStageDraftReviewSchema.pick({ lead: true, from: true, to: true, reason: true }).extend({ expectedVersion: z.number().int().positive() }).strict();
export type LeadStageDraftPayload = z.infer<typeof leadStageDraftPayloadSchema>;
export type LeadStageDraftReview = z.infer<typeof leadStageDraftReviewSchema>;

export const leadAssignmentDraftInputSchema = z.object({
  leadRef: z.string().trim().max(64),
  assignment: z.object({ kind: z.enum(['teammate', 'self', 'unassign']), teammateRef: z.string().trim().max(254) }).strict(),
}).strict().refine(value => value.assignment.kind === 'teammate' ? value.assignment.teammateRef.length > 0 : value.assignment.teammateRef === '', { message: 'Only a teammate assignment accepts a teammate reference.' });
export type LeadAssignmentDraftInput = z.infer<typeof leadAssignmentDraftInputSchema>;
const assignmentTeammateSchema = z.object({ id: z.string().min(1).max(200), name: z.string().max(200) }).strict().nullable();
export const leadAssignmentDraftReviewSchema = z.object({
  actionType: z.literal('lead.assign'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200) }).strict(),
  from: assignmentTeammateSchema, to: assignmentTeammateSchema,
}).strict();
export const leadAssignmentDraftPayloadSchema = leadAssignmentDraftReviewSchema.pick({ lead: true, from: true, to: true }).extend({
  expectedVersion: z.number().int().positive(),
  targetSnapshot: z.object({ name: z.string().max(200), role: z.enum(['owner', 'admin', 'office', 'field']), membershipVersion: z.string().max(64) }).strict().nullable(),
}).strict();
export type LeadAssignmentDraftPayload = z.infer<typeof leadAssignmentDraftPayloadSchema>;
export type LeadAssignmentDraftReview = z.infer<typeof leadAssignmentDraftReviewSchema>;

export const leadNoteDraftInputSchema = z.object({ leadRef: z.string().trim().max(64), body: z.string().trim().max(2000) }).strict();
export type LeadNoteDraftInput = z.infer<typeof leadNoteDraftInputSchema>;
export const leadNoteDraftReviewSchema = z.object({
  actionType: z.literal('lead.note'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200) }).strict(),
  body: z.string().min(1).max(2000),
}).strict();
export const leadNoteDraftPayloadSchema = leadNoteDraftReviewSchema.pick({ lead: true, body: true }).extend({ expectedVersion: z.number().int().positive() }).strict();
export type LeadNoteDraftPayload = z.infer<typeof leadNoteDraftPayloadSchema>;
export type LeadNoteDraftReview = z.infer<typeof leadNoteDraftReviewSchema>;

export const leadArchiveDraftInputSchema = z.object({ leadRef: z.string().trim().max(64), archived: z.boolean() }).strict();
export type LeadArchiveDraftInput = z.infer<typeof leadArchiveDraftInputSchema>;
export const leadArchiveDraftReviewSchema = z.object({
  actionType: z.literal('lead.archive'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200) }).strict(),
  from: z.boolean(), to: z.boolean(),
}).strict();
export const leadArchiveDraftPayloadSchema = leadArchiveDraftReviewSchema.pick({ lead: true, from: true, to: true }).extend({ expectedVersion: z.number().int().positive() }).strict();
export type LeadArchiveDraftPayload = z.infer<typeof leadArchiveDraftPayloadSchema>;
export type LeadArchiveDraftReview = z.infer<typeof leadArchiveDraftReviewSchema>;

export const leadDeleteDraftInputSchema = z.object({ leadRef: z.string().trim().max(64) }).strict();
export type LeadDeleteDraftInput = z.infer<typeof leadDeleteDraftInputSchema>;
const deleteLeadIdentitySchema = z.object({ id: z.uuid(), number: z.string().min(1).max(64) }).strict();
export const leadDeleteDraftPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('proposal'), lead: deleteLeadIdentitySchema.extend({ name: z.string().max(200) }),
    stage: leadSchema.shape.stage, archived: z.boolean(), expectedVersion: z.number().int().positive() }).strict(),
  z.object({ kind: z.literal('receipt'), lead: deleteLeadIdentitySchema, expectedVersion: z.number().int().positive() }).strict(),
]);
export type LeadDeleteDraftPayload = z.infer<typeof leadDeleteDraftPayloadSchema>;
export const leadDeleteDraftReviewSchema = z.object({
  actionType: z.literal('lead.delete'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  lead: deleteLeadIdentitySchema.extend({ name: z.string().max(200) }),
  stage: leadSchema.shape.stage.optional(), archived: z.boolean().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.state === 'confirmed' ? value.lead.name !== '' || value.stage !== undefined || value.archived !== undefined : value.stage === undefined || value.archived === undefined)
    ctx.addIssue({ code: 'custom', message: 'Deleted receipts contain no customer details; other states require the reviewed snapshot.' });
});
export type LeadDeleteDraftReview = z.infer<typeof leadDeleteDraftReviewSchema>;

// Model intent contains filters only; authority, counts, labels and hashes are server-owned.
export const leadExportDraftInputSchema = z.object({ mode: z.enum(['current_filters', 'filters']), filters: leadExportSchema.shape.filters }).strict();
export type LeadExportDraftInput = z.infer<typeof leadExportDraftInputSchema>;
export const leadExportDraftPayloadSchema = z.object({
  filters: leadExportSchema.shape.filters,
  preview: leadExportPreviewSchema,
  filterLabels: z.array(z.string().max(500)).max(60),
}).strict();
export type LeadExportDraftPayload = z.infer<typeof leadExportDraftPayloadSchema>;
export const leadExportDraftReviewSchema = z.object({
  actionType: z.literal('lead.export'), id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime(), state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded', 'conflict', 'forbidden']),
  scope: z.enum(['workspace', 'assigned']), filterLabels: z.array(z.string().max(500)).max(60),
  includeArchived: z.boolean(), count: z.number().int().nonnegative(), rowLimit: z.number().int().positive(),
}).strict();
export type LeadExportDraftReview = z.infer<typeof leadExportDraftReviewSchema>;

// Empty required fields let the tool ask for missing facts rather than inventing them.
export const leadDraftInputSchema = leadSchema.extend({
  email: z.string().trim().max(254),
  name: z.string().trim().max(200), service: z.string().trim().max(200), stage: z.literal('new'),
}).strict();
export const leadDraftReviewSchema = z.object({
  id: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  state: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'superseded']),
  expiresAt: z.string().datetime(), lead: leadSchema, ownerName: z.string().max(200),
  leadId: z.uuid().optional(),
}).strict();
export type LeadDraftReview = z.infer<typeof leadDraftReviewSchema>;
export const chatActionRequestSchema = z.object({ workspaceId: z.uuid(), draftId: z.uuid(), inputHash: z.string().regex(/^[a-f0-9]{64}$/), decision: z.enum(['confirm', 'cancel']) }).strict();
export const chatDeleteActionRequestSchema = chatActionRequestSchema.extend({ typedConfirmation: z.string().max(64) }).strict();
export const chatActionReviewSchema = z.union([leadDeleteDraftReviewSchema, leadExportDraftReviewSchema, leadArchiveDraftReviewSchema, leadNoteDraftReviewSchema, leadAssignmentDraftReviewSchema, leadUpdateDraftReviewSchema, leadStageDraftReviewSchema, leadDraftReviewSchema]);
export type ChatActionReview = z.infer<typeof chatActionReviewSchema>;
export const chatActionResponseSchema = z.object({ action: chatActionReviewSchema }).strict();
