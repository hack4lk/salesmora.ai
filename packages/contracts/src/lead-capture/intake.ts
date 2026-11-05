import { z } from 'zod';
import { captureActorSchema, captureIdSchema, captureKeySchema, captureVersionSchema } from './common';
import { captureAnswersSchema } from './configuration';

export const captureEvidenceOriginSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('email'), location: z.enum(['from', 'subject', 'body']), quote: z.string().min(1).max(10000) }).strict(),
  z.object({ kind: z.literal('form'), answerId: captureKeySchema, quote: z.string().min(1).max(10000) }).strict(),
]);
const original = { schemaVersion: z.literal(1), fields: z.array(z.object({ fieldId: captureKeySchema, uncertain: z.boolean(), origin: captureEvidenceOriginSchema.nullable() }).strict()).max(50).refine(fields => new Set(fields.map(field => field.fieldId)).size === fields.length, 'Duplicate evidence') };
export const captureEvidenceSchema = z.discriminatedUnion('type', [
  z.object({ ...original, type: z.literal('gmail'), from: z.string().max(1000), subject: z.string().max(2000), body: z.string().max(100000) }).strict(),
  z.object({ ...original, type: z.literal('website'), answers: captureAnswersSchema, consent: z.object({ id: captureKeySchema, version: captureVersionSchema, wording: z.string().max(2000), accepted: z.boolean(), privacyHref: z.string().max(2000).nullable() }).strict().nullable() }).strict(),
]).superRefine((value, ctx) => {
  for (const field of value.fields) {
    const origin = field.origin;
    if (!origin) continue;
    const supported = value.type === 'gmail' && origin.kind === 'email' ? value[origin.location].includes(origin.quote) : value.type === 'website' && origin.kind === 'form' && Object.hasOwn(value.answers, origin.answerId) ? (Array.isArray(value.answers[origin.answerId]) ? value.answers[origin.answerId].includes(origin.quote) : value.answers[origin.answerId].includes(origin.quote)) : false;
    if (!supported) ctx.addIssue({ code: 'custom', message: 'Unverified source quote', path: ['fields'] });
  }
});
export const captureDuplicateChangeSchema = z.object({ id: captureKeySchema, label: z.string().min(1).max(60), existing: z.string().max(10000), proposed: z.string().max(10000) }).strict();
export const captureDuplicateCandidateSchema = z.object({ leadId: captureIdSchema, leadVersion: captureVersionSchema, name: z.string().min(1).max(200), contact: z.string().max(1000), reason: z.string().max(1000), canLink: z.boolean(), changes: z.array(captureDuplicateChangeSchema).max(50).refine(changes => new Set(changes.map(change => change.id)).size === changes.length, 'Duplicate changes') }).strict();
export const intakeQuerySchema = z.object({ workspaceId: captureIdSchema, sourceId: captureIdSchema.optional(), search: z.string().trim().max(200).default(''), status: z.enum(['all', 'awaiting', 'approved', 'dismissed']).default('awaiting'), flag: z.enum(['all', 'attention', 'duplicate', 'missing', 'clear']).default('all'), page: z.number().int().min(1).max(100000).default(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25) }).strict();
const decision = { workspaceId: captureIdSchema, intakeId: captureIdSchema, expectedVersion: captureVersionSchema, reviewId: captureIdSchema, requestId: captureIdSchema };
const create = { ...decision, definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, answers: captureAnswersSchema };
export const captureIntakeDecisionSchema = z.discriminatedUnion('kind', [
  z.object({ ...create, kind: z.literal('create') }).strict(), z.object({ ...create, kind: z.literal('separate') }).strict(),
  z.object({ ...decision, kind: z.literal('link'), leadId: captureIdSchema, expectedLeadVersion: captureVersionSchema, changeIds: z.array(captureKeySchema).max(50).refine(ids => new Set(ids).size === ids.length, 'Duplicate selected changes') }).strict(),
  z.object({ ...decision, kind: z.literal('dismiss') }).strict(),
]);
export const captureReviewSnapshotSchema = z.object({ id: captureIdSchema, workspaceId: captureIdSchema, intakeId: captureIdSchema, intakeVersion: captureVersionSchema, actor: captureActorSchema, policyRevision: z.number().int().nonnegative(), definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, candidates: z.array(captureDuplicateCandidateSchema).max(20).refine(items => new Set(items.map(item => item.leadId)).size === items.length), requestHash: z.string().regex(/^[a-f0-9]{64}$/), createdAt: z.iso.datetime(), expiresAt: z.iso.datetime() }).strict().refine(value => value.expiresAt > value.createdAt, 'Expired review interval');
export type CaptureIntakeDecision = z.infer<typeof captureIntakeDecisionSchema>;

export const captureGmailSampleSchema = z.object({ id: captureIdSchema, workspaceId: captureIdSchema, sourceId: captureIdSchema, draftId: captureIdSchema, draftVersion: captureVersionSchema, connectionId: captureIdSchema, accountEmail: z.email().max(254), bindingHash: z.string().regex(/^[a-f0-9]{64}$/), evidence: captureEvidenceSchema.refine(value => value.type === 'gmail'), answers: captureAnswersSchema, reviewedBy: z.string().min(1).max(200).nullable(), reviewedAt: z.iso.datetime().nullable() }).strict().refine(value => (value.reviewedBy === null) === (value.reviewedAt === null), 'Incomplete sample approval');
const receiptCommon = { id: captureIdSchema, workspaceId: captureIdSchema, sourceId: captureIdSchema, configurationVersion: captureVersionSchema, definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, inputHash: z.string().regex(/^[a-f0-9]{64}$/), evidence: captureEvidenceSchema, originalAnswers: captureAnswersSchema, receivedAt: z.iso.datetime() };
export const captureReceiptSchema = z.discriminatedUnion('type', [z.object({ ...receiptCommon, type: z.literal('website'), publicationId: captureIdSchema, submissionId: captureIdSchema, admission: z.enum(['review', 'automatic']) }).strict(), z.object({ ...receiptCommon, type: z.literal('gmail'), connectionId: captureIdSchema, messageId: z.string().min(1).max(500), admission: z.literal('review') }).strict()]).refine(value => value.type === value.evidence.type, 'Evidence/source mismatch');
export const captureIntakeItemSchema = z.object({ id: captureIdSchema, workspaceId: captureIdSchema, sourceId: captureIdSchema, receiptId: captureIdSchema, version: captureVersionSchema, definitionVersion: captureVersionSchema, workflowVersion: captureVersionSchema, status: z.enum(['awaiting', 'approved', 'dismissed']), answers: captureAnswersSchema, flags: z.array(z.enum(['duplicate', 'missing', 'uncertain', 'capacity'])).max(4).refine(flags => new Set(flags).size === flags.length) }).strict();
