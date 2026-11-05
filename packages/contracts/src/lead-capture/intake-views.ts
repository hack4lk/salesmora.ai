import { z } from 'zod';
import { captureIdSchema, captureVersionSchema } from './common';
import { captureAnswersSchema, captureDraftConfigurationSchema } from './configuration';
import { captureIntakeItemSchema, captureEvidenceSchema, captureDuplicateCandidateSchema, intakeQuerySchema } from './intake';
const source = z.object({ id: captureIdSchema, name: z.string().max(200), type: z.enum(['website', 'gmail']) }).strict();
export const intakeDetailQuerySchema = z.object({ workspaceId: captureIdSchema, intakeId: captureIdSchema }).strict();
export const intakeListViewSchema = z.object({
  workspaceId: captureIdSchema, timezone: z.string().max(100), total: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.number().int().positive(),
  sources: z.array(z.object({ id: captureIdSchema, name: z.string().max(200) }).strict()).max(1000),
  rows: z.array(z.object({ id: captureIdSchema, name: z.string().max(2000), contact: z.string().max(2000), summary: z.string().max(10000), source,
    status: z.enum(['awaiting', 'approved', 'dismissed']), flags: z.array(z.enum(['duplicate', 'missing', 'uncertain', 'capacity'])).max(4), receivedAt: z.iso.datetime(), canOpen: z.boolean(), canReview: z.boolean() }).strict()).max(100),
}).strict();
export const intakeDetailViewSchema = z.object({
  workspaceId: captureIdSchema, item: captureIntakeItemSchema, decisionKind: z.enum(['create', 'separate', 'link', 'dismiss']).nullable(), source, timezone: z.string().max(100), configuration: captureDraftConfigurationSchema,
  receipt: z.object({ id: captureIdSchema, receivedAt: z.iso.datetime(), evidence: captureEvidenceSchema, originalAnswers: captureAnswersSchema }).strict(),
  capabilities: z.object({ canEdit: z.boolean(), canCreate: z.boolean(), canLink: z.boolean(), canDismiss: z.boolean(), canReadMatches: z.boolean() }).strict(),
}).strict();
export const prepareIntakeReviewSchema = intakeDetailQuerySchema.extend({ expectedVersion: captureVersionSchema, answers: captureAnswersSchema, requestId: captureIdSchema }).strict();
export const intakePreparedReviewSchema = z.object({ detail: intakeDetailViewSchema, reviewId: captureIdSchema, expiresAt: z.iso.datetime(), answers: captureAnswersSchema,
  candidates: z.array(captureDuplicateCandidateSchema).max(20), duplicateRequired: z.boolean(), capacity: z.enum(['available', 'exhausted']), assignmentReady: z.boolean() }).strict();
export type IntakeListView = z.infer<typeof intakeListViewSchema>;
export type IntakeDetailView = z.infer<typeof intakeDetailViewSchema>;
export type IntakePreparedReview = z.infer<typeof intakePreparedReviewSchema>;

export type IntakeQuery = z.infer<typeof intakeQuerySchema>;
