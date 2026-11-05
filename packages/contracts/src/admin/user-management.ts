import { z } from 'zod';

export const adminCustomerUserStatusSchema = z.enum(['active', 'unverified', 'suspended', 'deletion_pending']);
export type AdminCustomerUserStatus = z.infer<typeof adminCustomerUserStatusSchema>;

export const adminCustomerUserIdSchema = z.string().min(1).max(128).regex(/^[^\u0000-\u001f\u007f]+$/);

export const adminUserDirectoryQuerySchema = z.object({
  query: z.string().trim().max(254).default(''),
  status: z.union([z.literal('all'), adminCustomerUserStatusSchema]).default('all'),
  page: z.number().int().min(0).max(1_000_000).default(0),
}).strict();
export type AdminUserDirectoryQuery = z.infer<typeof adminUserDirectoryQuerySchema>;

export const adminCustomerMembershipSchema = z.object({
  workspaceId: z.string().min(1).max(128),
  workspaceName: z.string().min(1).max(256),
  role: z.enum(['Owner', 'Admin', 'Member']),
}).strict();
export type AdminCustomerMembership = z.infer<typeof adminCustomerMembershipSchema>;

export const adminCustomerUserSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(256),
  maskedEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
  emailVerified: z.boolean(),
  suspendedAt: z.string().datetime().nullable(),
  deletionRequestedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  memberships: z.array(adminCustomerMembershipSchema).max(1000),
}).strict();
export type AdminCustomerUser = z.infer<typeof adminCustomerUserSchema>;

export const adminCustomerUserNotificationPreferencesSchema = z.object({
  leadAssignedEmail: z.boolean(),
  visitChangedEmail: z.boolean(),
  estimateEmail: z.boolean(),
  deadlineReminderEmail: z.boolean(),
  jobActivityEmail: z.boolean(),
}).strict();

export const adminCustomerUserSessionSchema = z.object({
  device: z.string().min(1).max(100),
  maskedIp: z.string().max(80).regex(
    /^(?:\d{1,3}\.\d{1,3}\.x\.x|[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}(?::xxxx){6})$/,
  ).nullable(),
  createdAt: z.string().datetime(),
  lastActivityAt: z.string().datetime(),
}).strict();

export const adminCustomerUserSupplementalSchema = z.object({
  authMethods: z.array(z.string().min(1).max(40)).max(10),
  sessions: z.array(adminCustomerUserSessionSchema).max(20),
  totalSessions: z.number().int().nonnegative(),
  notificationPreferencesRecorded: z.boolean(),
  notificationPreferences: adminCustomerUserNotificationPreferencesSchema,
}).strict();
export type AdminCustomerUserSupplemental = z.infer<typeof adminCustomerUserSupplementalSchema>;

export const adminCustomerUserDetailSchema = z.object({
  user: adminCustomerUserSchema,
  supplemental: adminCustomerUserSupplementalSchema,
  pendingEmailChange: z.object({
    maskedNewEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
    expiresAt: z.string().datetime(),
  }).strict().nullable().optional(),
  permissions: z.object({
    canSuspend: z.boolean(),
    canRevokeSessions: z.boolean().optional(),
    canRequestPasswordReset: z.boolean().optional(),
    canManageEmailVerification: z.boolean().optional(),
    canChangeEmail: z.boolean().optional(),
    canRevealPii: z.boolean().optional(),
    canReadRelatedAudit: z.boolean().optional(),
  }).strict().optional(),
}).strict();
export type AdminCustomerUserDetail = z.infer<typeof adminCustomerUserDetailSchema>;

export const adminCustomerUserPiiRevealOperationSchema = z.object({
  field: z.enum(['email', 'session_ips']),
  reason: z.string().trim().min(10).max(500),
}).strict();
export type AdminCustomerUserPiiRevealOperation = z.infer<typeof adminCustomerUserPiiRevealOperationSchema>;

const adminCustomerUserRevealedSessionIpSchema = z.object({
  device: z.string().min(1).max(100),
  ipAddress: z.string().max(80).nullable(),
  createdAt: z.string().datetime(),
  lastActivityAt: z.string().datetime(),
}).strict();

export const adminCustomerUserPiiRevealResultSchema = z.discriminatedUnion('field', [
  z.object({ field: z.literal('email'), value: z.string().email().max(320) }).strict(),
  z.object({
    field: z.literal('session_ips'),
    sessions: z.array(adminCustomerUserRevealedSessionIpSchema).max(20),
  }).strict(),
]);
export type AdminCustomerUserPiiRevealResult = z.infer<typeof adminCustomerUserPiiRevealResultSchema>;

export const adminCustomerUserStaffActionsQuerySchema = z.object({
  cursor: z.string().regex(/^[1-9]\d{0,18}$/).nullable().default(null),
}).strict();
export type AdminCustomerUserStaffActionsQuery = z.infer<typeof adminCustomerUserStaffActionsQuerySchema>;

export const adminCustomerUserStaffActionSchema = z.object({
  sequence: z.string().regex(/^[1-9]\d{0,18}$/),
  occurredAt: z.string().datetime(),
  actorName: z.string().min(1).max(256),
  actorRole: z.enum(['super_admin', 'support', 'billing', 'bootstrap', 'system']),
  action: z.string().min(1).max(120),
  reason: z.string().max(500).nullable(),
}).strict();

export const adminCustomerUserStaffActionsResponseSchema = z.object({
  actions: z.array(adminCustomerUserStaffActionSchema).max(50),
  nextCursor: z.string().regex(/^[1-9]\d{0,18}$/).nullable(),
}).strict();
export type AdminCustomerUserStaffActionsResponse = z.infer<typeof adminCustomerUserStaffActionsResponseSchema>;

export const adminUserDirectoryResponseSchema = z.object({
  users: z.array(adminCustomerUserSchema).max(20),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.literal(20),
}).strict();
export type AdminUserDirectoryResponse = z.infer<typeof adminUserDirectoryResponseSchema>;
