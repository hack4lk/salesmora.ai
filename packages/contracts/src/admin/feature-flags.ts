import { z } from 'zod';
import { workspacePlanIdSchema } from '../billing';

export const adminFeatureFlagIds = ['chat.enabled', 'estimate.sharing.enabled'] as const;
export const adminFeatureFlagIdSchema = z.enum(adminFeatureFlagIds);
export type AdminFeatureFlagId = z.infer<typeof adminFeatureFlagIdSchema>;

export const adminFeatureFlagCatalog = {
  'chat.enabled': {
    label: 'AI chat',
    description: 'Allows workspace members to use the AI assistant in the application.',
    owner: 'Product',
    environmentVariable: 'CHAT_ENABLED',
    defaultEnabled: true,
  },
  'estimate.sharing.enabled': {
    label: 'Estimate sharing',
    description: 'Allows workspaces to share estimates with customers.',
    owner: 'Product',
    environmentVariable: 'ESTIMATE_EMAIL_ENABLED',
    defaultEnabled: true,
  },
} as const satisfies Record<AdminFeatureFlagId, {
  label: string;
  description: string;
  owner: string;
  environmentVariable: string;
  defaultEnabled: boolean;
}>;

export const adminFeatureFlagTargetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('global') }).strict(),
  z.object({ type: z.literal('plan'), planId: workspacePlanIdSchema }).strict(),
  z.object({ type: z.literal('workspace'), workspaceId: z.string().uuid() }).strict(),
]);
export type AdminFeatureFlagTarget = z.infer<typeof adminFeatureFlagTargetSchema>;

const expiresAtSchema = z.string().datetime({ offset: true }).nullable();
const reasonSchema = z.string().trim().min(10).max(500);

export const adminFeatureFlagOperationSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('start'),
    flagId: adminFeatureFlagIdSchema,
    target: adminFeatureFlagTargetSchema,
    enabled: z.boolean().nullable(),
    expiresAt: expiresAtSchema,
    reason: reasonSchema,
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    token: z.string().regex(/^[\w-]{43}$/),
    method: z.enum(['totp', 'passkey']),
    code: z.string().regex(/^\d{6}$/).optional(),
    response: z.record(z.string(), z.unknown()).optional(),
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    token: z.string().regex(/^[\w-]{43}$/),
  }).strict(),
]);

export const adminFeatureFlagStartResponseSchema = z.object({
  token: z.string().regex(/^[\w-]{43}$/),
  options: z.object({
    challenge: z.string(),
    userVerification: z.literal('required'),
    allowCredentials: z.array(z.object({
      id: z.string(),
      type: z.literal('public-key'),
      transports: z.array(z.enum(['ble', 'hybrid', 'internal', 'nfc', 'usb'])).optional(),
    })),
  }),
}).strict();

export const adminFeatureFlagResponseSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])),
  flags: z.array(z.object({
    id: adminFeatureFlagIdSchema,
    label: z.string(),
    description: z.string(),
    owner: z.string(),
    environmentVariable: z.string(),
    defaultEnabled: z.boolean(),
    global: z.object({
      enabled: z.boolean(),
      expiresAt: z.string().datetime({ offset: true }).nullable(),
      updatedAt: z.string().datetime({ offset: true }).nullable(),
      updatedBy: z.string().nullable(),
    }),
    overrides: z.array(z.object({
      target: adminFeatureFlagTargetSchema,
      enabled: z.boolean(),
      expiresAt: z.string().datetime({ offset: true }).nullable(),
      updatedAt: z.string().datetime({ offset: true }),
      updatedBy: z.string(),
    })),
  })),
  history: z.array(z.object({
    id: z.string(),
    flagId: adminFeatureFlagIdSchema,
    target: adminFeatureFlagTargetSchema,
    action: z.enum(['set', 'cleared']),
    before: z.unknown().nullable(),
    after: z.unknown().nullable(),
    reason: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    actorName: z.string(),
  })),
}).strict();

export const adminFeatureFlagResultSchema = z.object({
  changed: z.boolean(),
  flagId: adminFeatureFlagIdSchema,
  target: adminFeatureFlagTargetSchema,
  enabled: z.boolean().nullable(),
}).strict();

export type AdminFeatureFlagResponse = z.infer<typeof adminFeatureFlagResponseSchema>;
