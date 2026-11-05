import { z } from 'zod';

export const adminWorkspaceStatusSchema = z.enum(['active', 'past_due', 'suspended', 'deleting']);
export const adminWorkspacePlanSchema = z.enum(['free', 'standard', 'premium']);
export type AdminWorkspaceStatus = z.infer<typeof adminWorkspaceStatusSchema>;
export type AdminWorkspacePlan = z.infer<typeof adminWorkspacePlanSchema>;

export const adminWorkspaceDirectoryQuerySchema = z.object({
  query: z.string().trim().max(254).default(''),
  status: z.union([z.literal('all'), adminWorkspaceStatusSchema]).default('all'),
  plan: z.union([z.literal('all'), z.literal('override'), adminWorkspacePlanSchema]).default('all'),
  page: z.number().int().min(0).max(1_000_000).default(0),
}).strict();
export type AdminWorkspaceDirectoryQuery = z.infer<typeof adminWorkspaceDirectoryQuerySchema>;

export const adminWorkspaceDirectoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(256),
  ownerName: z.string().min(1).max(256),
  maskedOwnerEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
  plan: adminWorkspacePlanSchema,
  overridePlan: adminWorkspacePlanSchema.nullable(),
  status: adminWorkspaceStatusSchema,
  memberCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
}).strict();
export type AdminWorkspaceDirectoryItem = z.infer<typeof adminWorkspaceDirectoryItemSchema>;

export const adminWorkspaceDirectoryResponseSchema = z.object({
  workspaces: z.array(adminWorkspaceDirectoryItemSchema).max(20),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.literal(20),
}).strict();
export type AdminWorkspaceDirectoryResponse = z.infer<typeof adminWorkspaceDirectoryResponseSchema>;

export const adminWorkspaceDetailRequestSchema = z.object({
  workspaceId: z.string().uuid(),
}).strict();
export type AdminWorkspaceDetailRequest = z.infer<typeof adminWorkspaceDetailRequestSchema>;

export const adminWorkspaceDetailMemberSchema = z.object({
  id: z.string().min(1).max(128),
  userId: z.string().min(1).max(128).optional(),
  invitationId: z.string().uuid().optional(),
  name: z.string().min(1).max(256),
  maskedEmail: z.string().max(320).regex(/^[^@\s]{1,2}••••@[^@\s]+$/),
  role: z.enum(['Owner', 'Admin', 'Member', 'Office', 'Field']),
  status: z.enum(['Active', 'Invited', 'Unverified', 'Suspended']),
  lastActivity: z.string().min(1).max(256),
}).strict();

export const adminWorkspaceDetailResponseSchema = z.object({
  workspace: adminWorkspaceDirectoryItemSchema,
  ownerUserId: z.string().min(1).max(128),
  members: z.array(adminWorkspaceDetailMemberSchema).max(100),
  totalMembers: z.number().int().nonnegative(),
  limits: z.object({
    teammates: z.number().int().nonnegative(),
    leads: z.number().int().nonnegative(),
    aiTokens: z.number().int().nonnegative(),
  }).strict(),
  stripePlan: adminWorkspacePlanSchema,
  subscriptionStatus: z.string().min(1).max(128),
  billingPeriod: z.string().min(1).max(256),
  paymentMethod: z.string().min(1).max(256),
  usage: z.object({
    leads: z.number().int().nonnegative(),
    aiTokens: z.number().int().nonnegative(),
  }).strict(),
  records: z.object({
    leads: z.number().int().nonnegative(),
    customers: z.number().int().nonnegative(),
    jobs: z.number().int().nonnegative(),
    estimates: z.number().int().nonnegative(),
    workOrders: z.number().int().nonnegative(),
  }).strict(),
  onboarding: z.string().min(1).max(128),
  featureFlags: z.array(z.string().min(1).max(128)).max(100).nullable(),
  override: z.object({
    endsAt: z.string().datetime(),
    appliedBy: z.string().min(1).max(128),
    appliedAt: z.string().min(1).max(128),
    reason: z.string().min(1).max(500),
  }).strict().optional(),
  statusDetail: z.string().max(500).optional(),
  auditActions: z.array(z.object({
    occurredAt: z.string().min(1).max(128),
    actor: z.string().min(1).max(128),
    description: z.string().min(1).max(256),
    reason: z.string().min(1).max(500),
  }).strict()).max(10),
  permissions: z.object({
    canSuspend: z.boolean(),
    canTransferOwnership: z.boolean(),
    canOverridePlan: z.boolean(),
    canAdjustAIBudget: z.boolean(),
    canRemoveMembers: z.boolean(),
    canResendInvitations: z.boolean(),
    canReadBillingLinks: z.boolean(),
    canChangePlan: z.boolean(),
    canManageRecovery: z.boolean(),
    canReplayWebhooks: z.boolean().optional(),
  }).strict().optional(),
}).strict();
export type AdminWorkspaceDetailResponse = z.infer<typeof adminWorkspaceDetailResponseSchema>;

export const adminWorkspaceTeamActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('remove'),
    workspaceId: z.string().uuid(),
    userId: z.string().min(1).max(128),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    action: z.literal('resend_invitation'),
    workspaceId: z.string().uuid(),
    invitationId: z.string().uuid(),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
]);
export type AdminWorkspaceTeamAction = z.infer<typeof adminWorkspaceTeamActionSchema>;

export const adminWorkspaceTeamActionResultSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('remove'),
    changed: z.literal(true),
    unassignedLeads: z.number().int().nonnegative(),
  }).strict(),
  z.object({
    action: z.literal('resend_invitation'),
    changed: z.literal(true),
    delivery: z.enum(['sent', 'failed']),
    expiresAt: z.string().datetime(),
  }).strict(),
]);
export type AdminWorkspaceTeamActionResult = z.infer<typeof adminWorkspaceTeamActionResultSchema>;

export const workspaceSuspensionTokenSchema = z.string().regex(/^[\w-]{43}$/);
export const workspaceSuspensionPasskeyResponseSchema = z.object({
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
});

export const adminWorkspaceSuspensionMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspaceSuspensionStartSchema = z.object({
  token: workspaceSuspensionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    timeout: z.number().int().positive().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()),
  }).strict(),
}).strict();

export const adminWorkspaceSuspensionOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    workspaceId: z.string().uuid(),
    action: z.enum(['suspend', 'unsuspend']),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('passkey'),
    response: workspaceSuspensionPasskeyResponseSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: workspaceSuspensionTokenSchema,
  }).strict(),
]);
export type AdminWorkspaceSuspensionOperation = z.infer<typeof adminWorkspaceSuspensionOperationSchema>;

export const adminWorkspaceSuspensionVerifiedSchema = z.object({ verified: z.literal(true) }).strict();

export const adminWorkspaceSuspensionResultSchema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  changed: z.literal(true),
  suspendedAt: z.string().datetime().nullable(),
}).strict();

export const adminWorkspaceOwnershipTransferMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspaceOwnershipTransferStartSchema = z.object({
  token: workspaceSuspensionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    timeout: z.number().int().positive().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()),
  }).strict(),
}).strict();

export const adminWorkspaceOwnershipTransferOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    workspaceId: z.string().uuid(),
    expectedOwnerUserId: z.string().min(1).max(128),
    newOwnerUserId: z.string().min(1).max(128),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('passkey'),
    response: workspaceSuspensionPasskeyResponseSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: workspaceSuspensionTokenSchema,
  }).strict(),
]);
export type AdminWorkspaceOwnershipTransferOperation = z.infer<typeof adminWorkspaceOwnershipTransferOperationSchema>;

export const adminWorkspaceOwnershipTransferVerifiedSchema = z.object({ verified: z.literal(true) }).strict();

export const adminWorkspaceOwnershipTransferResultSchema = z.object({
  changed: z.literal(true),
  previousOwnerUserId: z.string().min(1).max(128),
  newOwnerUserId: z.string().min(1).max(128),
}).strict();

export const adminWorkspacePlanOverrideMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspacePlanOverrideStartSchema = z.object({
  token: workspaceSuspensionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    timeout: z.number().int().positive().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()),
  }).strict(),
}).strict();

export const adminWorkspacePlanOverrideOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    action: z.literal('apply'),
    workspaceId: z.string().uuid(),
    plan: z.enum(['standard', 'premium']),
    endsAt: z.string().datetime(),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('start'),
    action: z.literal('clear'),
    workspaceId: z.string().uuid(),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('passkey'),
    response: workspaceSuspensionPasskeyResponseSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: workspaceSuspensionTokenSchema,
  }).strict(),
]);
export type AdminWorkspacePlanOverrideOperation = z.infer<typeof adminWorkspacePlanOverrideOperationSchema>;

export const adminWorkspacePlanOverrideVerifiedSchema = z.object({ verified: z.literal(true) }).strict();

export const adminWorkspacePlanOverrideResultSchema = z.object({
  action: z.enum(['apply', 'clear']),
  changed: z.literal(true),
  overrideId: z.string().uuid(),
}).strict();

export const adminWorkspaceAIBudgetMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspaceAIBudgetStartSchema = z.object({
  token: workspaceSuspensionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    timeout: z.number().int().positive().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()),
  }).strict(),
}).strict();

export const adminWorkspaceAIBudgetOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    workspaceId: z.string().uuid(),
    monthlyTokens: z.number().int().min(0).max(1_000_000_000_000),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: workspaceSuspensionTokenSchema,
    method: z.literal('passkey'),
    response: workspaceSuspensionPasskeyResponseSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: workspaceSuspensionTokenSchema,
  }).strict(),
]);
export type AdminWorkspaceAIBudgetOperation = z.infer<typeof adminWorkspaceAIBudgetOperationSchema>;

export const adminWorkspaceAIBudgetVerifiedSchema = z.object({ verified: z.literal(true) }).strict();

export const adminWorkspaceAIBudgetResultSchema = z.object({
  changed: z.literal(true),
  monthlyTokens: z.number().int().min(0).max(1_000_000_000_000),
  previousMonthlyTokens: z.number().int().min(0).max(1_000_000_000_000).nullable(),
}).strict();
