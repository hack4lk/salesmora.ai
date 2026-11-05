import { z } from 'zod';

export const captureIdSchema = z.uuid();
export const captureVersionSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const captureKeySchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/).refine(value => !['__proto__', 'prototype', 'constructor'].includes(value), 'Unsafe identity');
export const captureSourceTypeSchema = z.enum(['website', 'gmail']);
export const captureSourceStatusSchema = z.enum(['draft', 'active', 'paused', 'scheduled', 'archived']);
export const captureBlockSchema = z.enum(['none', 'entitlement', 'source_capacity', 'connection', 'workspace']);
export const captureTimezoneSchema = z.string().min(1).max(100).refine(value => { try { new Intl.DateTimeFormat('en-US', { timeZone: value }); return true; } catch { return false; } }, 'Invalid timezone');
export const captureRequestIdentitySchema = z.object({ workspaceId: captureIdSchema, requestId: captureIdSchema }).strict();
export const captureSourceRefSchema = z.object({ workspaceId: captureIdSchema, sourceId: captureIdSchema, expectedVersion: captureVersionSchema }).strict();
export const captureSourceListQuerySchema = z.object({
  workspaceId: captureIdSchema, search: z.string().trim().max(200).default(''), type: captureSourceTypeSchema.optional(),
  status: captureSourceStatusSchema.optional(), archived: z.boolean().default(false),
  page: z.number().int().min(1).max(100000).default(1), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict();
export const captureMetricsSchema = z.object({ captured: z.number().int().nonnegative(), awaitingReview: z.number().int().nonnegative(), approved: z.number().int().nonnegative() }).strict().refine(value => value.approved + value.awaitingReview <= value.captured, 'Invalid source totals');
export const captureFailureSchema = z.object({ ok: z.literal(false), kind: z.enum(['permission', 'validation', 'conflict', 'capacity', 'connection', 'unavailable', 'error']), message: z.string().max(1000), retryable: z.boolean() }).strict();
export const captureActorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('user'), userId: z.string().min(1).max(200) }).strict(),
  z.object({ kind: z.literal('service'), service: z.enum(['website', 'gmail', 'scheduler', 'billing']) }).strict(),
]);
export type CaptureSourceStatus = z.infer<typeof captureSourceStatusSchema>;
export type CaptureActor = z.infer<typeof captureActorSchema>;

export const captureSourceEventSchema = z.object({ workspaceId: captureIdSchema, sourceId: captureIdSchema, kind: z.enum(['draft.saved', 'source.launched', 'source.scheduled', 'source.schedule_cancelled', 'source.schedule_blocked', 'source.paused', 'source.archived', 'source.restored', 'source.duplicated', 'source.blocked', 'receipt.accepted', 'intake.decided']), actor: captureActorSchema, data: z.object({ sourceVersion: captureVersionSchema, configurationVersion: captureVersionSchema.optional(), intakeId: captureIdSchema.optional(), requestId: captureIdSchema.optional(), block: captureBlockSchema.optional(), status: captureSourceStatusSchema.optional() }).strict() }).strict();

export type CaptureSourceListQuery = z.infer<typeof captureSourceListQuerySchema>;
