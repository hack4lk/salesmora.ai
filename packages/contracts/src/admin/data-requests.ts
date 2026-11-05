import { z } from 'zod';

export const adminDeletionRequestFilterSchema = z.enum(['all', 'pending', 'retry', 'completed']);
export type AdminDeletionRequestFilter = z.infer<typeof adminDeletionRequestFilterSchema>;

export const adminDeletionRequestsQuerySchema = z.object({
  filter: adminDeletionRequestFilterSchema.default('all'),
  page: z.number().int().min(0).max(1_000_000).default(0),
}).strict();
export type AdminDeletionRequestsQuery = z.infer<typeof adminDeletionRequestsQuerySchema>;

export const adminDeletionRequestSchema = z.object({
  id: z.string().uuid(),
  customerName: z.string().min(1).max(256),
  maskedEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/).or(z.literal('Unavailable after purge')),
  workspaceName: z.string().min(1).max(256).nullable(),
  requestedAt: z.string().datetime(),
  state: z.enum(['pending', 'completed']),
  attempts: z.number().int().nonnegative(),
  retryAt: z.string().datetime().nullable(),
  lastError: z.literal('retry_required').nullable(),
  completedAt: z.string().datetime().nullable(),
}).strict();
export type AdminDeletionRequestRecord = z.infer<typeof adminDeletionRequestSchema>;

export const adminDeletionRequestsPageSchema = z.object({
  filter: adminDeletionRequestFilterSchema,
  requests: z.array(adminDeletionRequestSchema).max(20),
  total: z.number().int().nonnegative(),
  allRequestsTotal: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.literal(20),
  retryScheduledTotal: z.number().int().nonnegative(),
}).strict();
export type AdminDeletionRequestsPage = z.infer<typeof adminDeletionRequestsPageSchema>;

export const adminDataRequestsResponseSchema = adminDeletionRequestsPageSchema.extend({
  role: z.enum(['super_admin', 'support']),
}).strict();
export type AdminDataRequestsResponse = z.infer<typeof adminDataRequestsResponseSchema>;

const adminActionTokenSchema = z.string().regex(/^[\w-]{43}$/);
const adminPasskeyAssertionSchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1),
  type: z.literal('public-key'),
  response: z.object({
    clientDataJSON: z.string(),
    authenticatorData: z.string(),
    signature: z.string(),
    userHandle: z.string().optional(),
  }),
  clientExtensionResults: z.object({}).passthrough(),
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
}).strict();

export const adminWorkspaceExportOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    workspaceId: z.string().uuid(),
    reason: z.string().trim().min(10).max(500),
    password: z.string().min(1).max(128),
    method: z.enum(['totp', 'passkey']),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: adminActionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: adminActionTokenSchema,
    method: z.literal('passkey'),
    response: adminPasskeyAssertionSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: adminActionTokenSchema,
  }).strict(),
]);
export type AdminWorkspaceExportOperation = z.infer<typeof adminWorkspaceExportOperationSchema>;

export const adminWorkspaceExportChallengeInputSchema = z.object({
  kind: z.literal('workspace_data_export'),
  workspaceId: z.string().uuid(),
  reason: z.string().trim().min(10).max(500),
  method: z.enum(['totp', 'passkey']),
}).strict();

export const adminWorkspaceExportMethodsResponseSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();
export type AdminWorkspaceExportMethodsResponse = z.infer<typeof adminWorkspaceExportMethodsResponseSchema>;

export const adminWorkspaceExportStartResponseSchema = z.object({
  token: adminActionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    timeout: z.number().int().positive().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()).max(100),
  }).strict().optional(),
}).strict();
export type AdminWorkspaceExportStartResponse = z.infer<typeof adminWorkspaceExportStartResponseSchema>;

export const adminWorkspaceExportVerifiedResponseSchema = z.object({ verified: z.literal(true) }).strict();

export const adminWorkspaceExportRequestRecordSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceName: z.string().min(1).max(256),
  ownerName: z.string().min(1).max(256),
  maskedOwnerEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
  requestedByName: z.string().min(1).max(256),
  requestedByRole: z.enum(['super_admin', 'support']),
  reason: z.string().min(10).max(500),
  state: z.enum(['queued', 'generating', 'ready', 'expired', 'failed']),
  notificationStatus: z.enum(['pending', 'sent', 'failed']),
  notificationAttempts: z.number().int().nonnegative(),
  notificationSentAt: z.string().datetime().nullable(),
  requestedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  csvCount: z.number().int().nonnegative().nullable(),
  fileMetadataCount: z.number().int().nonnegative().nullable(),
  downloadedAt: z.string().datetime().nullable(),
}).strict();
export type AdminWorkspaceExportRequestRecord = z.infer<typeof adminWorkspaceExportRequestRecordSchema>;

export const adminExportWorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(256),
  ownerName: z.string().min(1).max(256),
  maskedOwnerEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
}).strict();

export const adminWorkspaceExportsResponseSchema = z.object({
  role: z.enum(['super_admin', 'support']),
  enabled: z.boolean(),
  exports: z.array(adminWorkspaceExportRequestRecordSchema).max(50),
  workspaces: z.array(adminExportWorkspaceSchema).max(1000),
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();
export type AdminWorkspaceExportsResponse = z.infer<typeof adminWorkspaceExportsResponseSchema>;
