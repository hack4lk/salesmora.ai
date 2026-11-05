import { z } from 'zod';
import { captureIdSchema } from './common';

export const captureReadinessRequestSchema = z.object({ workspaceId: captureIdSchema, requestId: z.uuid() }).strict();
export const captureReadinessResponseSchema = captureReadinessRequestSchema.extend({ origin: z.string().max(2048).nullable(), websiteReady: z.boolean() }).strict();
