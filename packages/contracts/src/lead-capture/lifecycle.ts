import { z } from 'zod';
import { captureIdSchema, captureSourceRefSchema, captureVersionSchema } from './common';
import { captureReadinessCodeSchema } from './publication';

/** Lifecycle mutations select persisted approved work; clients cannot supply readiness. */
export const captureLifecycleCommandSchema = captureSourceRefSchema.extend({
  requestId: captureIdSchema,
  action: z.enum(['pause', 'resume', 'archive', 'restore']),
  confirmed: z.literal(true),
  configuration: z.object({ kind: z.literal('approved'), version: captureVersionSchema }).strict().optional(),
}).strict().superRefine((input, context) => {
  if ((input.action === 'resume') !== !!input.configuration) context.addIssue({ code: 'custom', message: 'Select the approved configuration only when resuming.' });
});
export const captureLifecycleSavedSchema = z.object({ ok: z.literal(true), sourceId: captureIdSchema, sourceVersion: captureVersionSchema }).strict();
export const captureLifecycleReviewSchema = z.object({
  sourceId: captureIdSchema, sourceVersion: captureVersionSchema, approvedVersion: captureVersionSchema.nullable(),
  canPause: z.boolean(), canResume: z.boolean(), canArchive: z.boolean(),
  canRestore: z.boolean().default(false), restoreReady: z.boolean().default(false), restoreFailures: z.array(captureReadinessCodeSchema).max(11).default([]),
  resumeReady: z.boolean(), resumeFailures: z.array(captureReadinessCodeSchema).max(11),
}).strict();

export const captureDuplicateCommandSchema = captureSourceRefSchema.extend({
  requestId: captureIdSchema, confirmed: z.literal(true), name: z.string().trim().min(1).max(80),
  configuration: z.object({ kind: z.enum(['draft', 'approved']), version: captureVersionSchema }).strict(),
}).strict();
