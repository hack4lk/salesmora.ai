import { z } from 'zod';
import { captureContentSchema, captureFieldsSchema } from './configuration';
export const capturePublicKeySchema = z.string().regex(/^[a-f0-9]{64}$/);
export const captureSubmissionContextSchema = z.object({ purpose: z.literal('capture_submission'), audience: z.url(), publicKey: capturePublicKeySchema, publicationVersion: z.number().int().positive(), configurationVersion: z.number().int().positive(), submissionId: z.uuid(), issuedAt: z.number().int().nonnegative(), expiresAt: z.number().int().positive() }).strict();
export type CaptureSubmissionContext = z.infer<typeof captureSubmissionContextSchema>;
export const capturePublicDefinitionSchema = z.object({ publicKey: capturePublicKeySchema, version: z.number().int().positive(), fields: captureFieldsSchema.min(1), contactRequired: z.literal(true), content: captureContentSchema }).strict();
export const capturePublicUnavailableSchema = captureContentSchema.pick({ businessName: true, title: true, unavailableMessage: true, businessEmail: true, businessPhone: true, showBusinessEmail: true, showBusinessPhone: true });
export const capturePublicViewSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('ready'), definition: capturePublicDefinitionSchema, context: z.string().min(1).max(3000), submissionAvailable: z.boolean() }).strict(),
  z.object({ state: z.literal('unavailable'), content: capturePublicUnavailableSchema }).strict(),
  z.object({ state: z.literal('not-found') }).strict(), z.object({ state: z.literal('error') }).strict(),
]);
export type CapturePublicView = z.infer<typeof capturePublicViewSchema>;
