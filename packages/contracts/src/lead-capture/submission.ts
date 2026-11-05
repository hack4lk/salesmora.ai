import { z } from 'zod';
import { captureAnswersSchema } from './configuration';
export const capturePublicSubmissionSchema = z.object({ context: z.string().min(1).max(3000), requestId: z.uuid(), answers: captureAnswersSchema,
  consent: z.object({ id: z.string().min(1).max(100), version: z.number().int().positive(), accepted: z.boolean() }).strict().nullable(), website: z.string().max(1000), challengeToken: z.string().min(1).max(2048).optional(),
}).strict();
export const captureSubmissionResponseSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('accepted'), requestId: z.uuid() }).strict(),
  z.object({ state: z.literal('challenge-required'), siteKey: z.string().min(1).max(200), action: z.literal('capture_submit'), cData: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ state: z.literal('rate-limited'), retryAt: z.iso.datetime() }).strict(),
  ...(['challenge-error', 'stale', 'conflict', 'invalid', 'unavailable', 'retry'] as const).map(state => z.object({ state: z.literal(state) }).strict()),
]);
export type CapturePublicSubmission = z.infer<typeof capturePublicSubmissionSchema>;
export type CaptureSubmissionResponse = z.infer<typeof captureSubmissionResponseSchema>;
