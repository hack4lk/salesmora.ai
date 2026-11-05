import { z } from 'zod';
import { captureIdSchema, captureSourceRefSchema, captureVersionSchema } from './common';

/** Browser-safe projection only. Provider identity, scopes and credentials stay on the server. */
export const captureGmailAccountSchema = z.object({
  id: captureIdSchema,
  email: z.email().max(254),
  status: z.enum(['connected', 'reconnect-required', 'disconnected']),
  version: captureVersionSchema,
}).strict();
export const captureGmailCapabilitiesSchema = z.object({
  canRead: z.boolean(), canConnect: z.boolean(), canReconnect: z.boolean(),
  canSelect: z.boolean(), canDisconnect: z.boolean(),
}).strict();
export const captureGmailAccountListQuerySchema = z.object({ workspaceId: captureIdSchema }).strict();
export const captureGmailAccountListSchema = z.object({
  available: z.boolean().default(false),
  accounts: z.array(captureGmailAccountSchema).max(100),
  capabilities: captureGmailCapabilitiesSchema,
}).strict();
const sourceDraft = captureSourceRefSchema.extend({ expectedDraftVersion: captureVersionSchema });
export const captureGmailConnectSchema = sourceDraft.extend({
  requestId: captureIdSchema,
  reconnect: z.object({ accountId: captureIdSchema, expectedAccountVersion: captureVersionSchema }).strict().nullable(),
}).strict();
export const captureGmailSelectAccountSchema = sourceDraft.extend({
  requestId: captureIdSchema, accountId: captureIdSchema, expectedAccountVersion: captureVersionSchema,
}).strict();
export const captureGmailDisconnectSchema = z.object({
  workspaceId: captureIdSchema, accountId: captureIdSchema, expectedAccountVersion: captureVersionSchema,
  requestId: captureIdSchema, reviewId: captureIdSchema, confirmed: z.literal(true),
}).strict();
/** Exact affected source versions will be bound by the server's disconnect review service. */
export const captureGmailDisconnectReviewSchema = z.object({
  account: captureGmailAccountSchema,
  sources: z.array(z.object({ sourceId: captureIdSchema, sourceVersion: captureVersionSchema, name: z.string().max(200) }).strict()).max(1000),
  reviewId: captureIdSchema, expiresAt: z.iso.datetime(),
}).strict();
export const captureGmailOAuthStartSchema = z.object({ authorizationUrl: z.url(), expiresAt: z.iso.datetime() }).strict();
export const captureGmailSelectionSavedSchema = z.object({ ok: z.literal(true), sourceId: captureIdSchema, sourceVersion: captureVersionSchema, draftVersion: captureVersionSchema }).strict();
export const captureGmailDisconnectReviewQuerySchema = z.object({ workspaceId: captureIdSchema, accountId: captureIdSchema }).strict();
export const captureGmailDisconnectSavedSchema = z.object({ ok: z.literal(true), account: captureGmailAccountSchema }).strict();
export type CaptureGmailAccount = z.infer<typeof captureGmailAccountSchema>;
export type CaptureGmailCapabilities = z.infer<typeof captureGmailCapabilitiesSchema>;
export type CaptureGmailAccountList = z.infer<typeof captureGmailAccountListSchema>;

/** Opaque, encrypted, short-lived candidate authority; never a provider message ID. */
export const captureGmailSampleReferenceSchema = z.string().min(40).max(4096).regex(/^[A-Za-z0-9_-]+$/);
export const captureGmailSampleSearchSchema = sourceDraft.extend({ subjectPhrase: z.string().trim().min(3).max(100) }).strict();
export const captureGmailSamplePreviewSchema = sourceDraft.extend({ reference: captureGmailSampleReferenceSchema }).strict();
export const captureGmailSampleCandidateSchema = z.object({ id: captureGmailSampleReferenceSchema, subject: z.string().max(500), sender: z.string().max(500), receivedAt: z.iso.datetime() }).strict();
export const captureGmailSampleCandidatesSchema = z.object({ candidates: z.array(captureGmailSampleCandidateSchema).max(10) }).strict();
export const captureGmailSelectedExampleSchema = captureGmailSampleCandidateSchema.extend({ body: z.string().min(1).max(20000), retrievalId: captureIdSchema.optional() }).strict();
