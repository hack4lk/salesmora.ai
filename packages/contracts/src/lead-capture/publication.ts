import { z } from 'zod';
import { captureIdSchema, captureVersionSchema, captureSourceRefSchema } from './common';
import { captureLaunchSchema } from './commands';
export const capturePublishCommandSchema = captureLaunchSchema.extend({ confirmed: z.literal(true), baseApprovedVersion: captureVersionSchema.nullable() }).strict();
export const captureCancelPublicationSchema = captureSourceRefSchema.extend({ requestId: captureIdSchema, transitionId: captureIdSchema, confirmed: z.literal(true) }).strict();
export const captureReadinessCodeSchema = z.enum(['configuration', 'fields', 'workflow', 'access', 'capacity', 'delivery', 'account', 'sample', 'permission', 'pending', 'workspace']);
export const capturePublicationReviewSchema = z.object({
  sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema.nullable(), baseApprovedVersion: captureVersionSchema.nullable(), configurationVersion: captureVersionSchema,
  canActivate: z.boolean(), ready: z.boolean(), plan: z.enum(['free', 'standard', 'premium']), used: z.number().int().nonnegative(), limit: z.number().int().positive().nullable(),
  checks: z.array(z.object({ code: captureReadinessCodeSchema, ready: z.boolean() }).strict()).max(11),
  pendingReady: z.boolean().optional(), pendingChecks: z.array(z.object({ code: captureReadinessCodeSchema, ready: z.boolean() }).strict()).max(11).optional(),
  pending: z.object({ id: captureIdSchema, configurationVersion: captureVersionSchema, at: z.iso.datetime(), timezone: z.string() }).strict().nullable(),
}).strict();
export type CapturePublicationReview = z.infer<typeof capturePublicationReviewSchema>;
export type CaptureReadinessCode = z.infer<typeof captureReadinessCodeSchema>;

export const captureChangePublicationSchema = captureCancelPublicationSchema.extend({ timing: captureLaunchSchema.shape.timing }).strict();
