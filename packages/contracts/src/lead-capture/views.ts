import { z } from 'zod';
import { captureInstallationSchema } from './installation';
import { capturePublicationReviewSchema } from './publication';
import { captureIdSchema, captureSourceRefSchema } from './common';
import { captureSourceDetailSchema, captureSourceListResultSchema } from './commands';
import { captureLifecycleReviewSchema } from './lifecycle';

export const captureBeginRevisionSchema = captureSourceRefSchema.extend({ requestId: captureIdSchema }).strict();
export const capturePermissionsSchema = z.object({ canCreate: z.boolean(), canUpdate: z.boolean(), canPause: z.boolean().optional(), canArchive: z.boolean().optional(), canActivate: z.boolean().optional() }).strict();
export const captureBusinessContextSchema = z.object({ businessName: z.string().max(200), businessEmail: z.string().max(254), businessPhone: z.string().max(100), services: z.array(z.string().max(200)).max(100), serviceArea: z.string().max(2000), timezone: z.string().max(100), gmailAccess: z.enum(['available', 'upgrade-required']), teammates: z.array(z.object({ id: z.string().min(1).max(200), name: z.string().max(200) }).strict()).max(1000) }).strict();
export const captureListViewSchema = captureSourceListResultSchema.extend({ permissions: capturePermissionsSchema, timezone: z.string().max(100), policyRevision: z.number().int().nonnegative() }).strict();
export const captureGmailHealthSchema = z.object({
  connection: z.enum(['connected', 'reconnect-required', 'not-connected']),
  email: z.email().optional(),
  sync: z.enum(['idle', 'syncing', 'waiting-for-worker', 'retrying', 'recovery-required']),
  queued: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
}).strict();
export type CaptureGmailHealth = z.infer<typeof captureGmailHealthSchema>;
export const captureDetailViewSchema = z.object({ detail: captureSourceDetailSchema, gmailHealth: captureGmailHealthSchema.optional(), installation: captureInstallationSchema.nullable().optional(), publicationReview: capturePublicationReviewSchema.optional(), lifecycleReview: captureLifecycleReviewSchema.optional(), canEdit: z.boolean(), canDuplicate: z.boolean().optional(), business: captureBusinessContextSchema, policyRevision: z.number().int().nonnegative() }).strict();
export const captureDraftStartContextSchema = z.object({ workspaceId: captureIdSchema, permissions: capturePermissionsSchema, business: captureBusinessContextSchema, policyRevision: z.number().int().nonnegative() }).strict();
export type CaptureListView = z.infer<typeof captureListViewSchema>;
export type CaptureDetailView = z.infer<typeof captureDetailViewSchema>;
export type CaptureDraftStartContext = z.infer<typeof captureDraftStartContextSchema>;
export type CaptureBusinessContext = z.infer<typeof captureBusinessContextSchema>;
