import { z } from 'zod';
import { workspaceSuspensionPasskeyResponseSchema, workspaceSuspensionTokenSchema } from './workspace-management';

const reason = z.string().trim().min(10).max(500);
const workspaceId = z.uuid();
const recoveryId = z.uuid();
const isoDate = z.iso.datetime();
const nonnegative = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const adminWorkspaceRecoveryOperationSchema = z.union([
  z.object({
    operation: z.literal('preview'),
    workspaceId,
  }).strict(),
  z.object({
    operation: z.literal('start'),
    action: z.literal('retry'),
    workspaceId,
    recoveryId,
    reason,
  }).strict(),
  z.object({
    operation: z.literal('start'),
    action: z.literal('extend_grace'),
    workspaceId,
    additionalDays: z.number().int().min(1).max(7),
    reason,
  }).strict(),
  z.object({
    operation: z.literal('start'),
    action: z.literal('cancel'),
    workspaceId,
    recoveryId,
    reason,
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

export const adminWorkspaceRecoveryPreviewResponseSchema = z.object({
  workspaceId,
  providerStatus: z.enum(['available', 'unavailable', 'not_linked']),
  invoice: z.object({
    number: z.string().nullable(),
    createdAt: isoDate,
    status: z.string().min(1).max(40).nullable(),
    amountDue: nonnegative,
  }).strict().nullable(),
  paymentState: z.enum([
    'none',
    'processing',
    'requires_action',
    'succeeded',
    'requires_payment_method',
    'other',
  ]),
  recovery: z.object({
    id: recoveryId,
    state: z.enum(['quoted', 'applying', 'action', 'pending', 'paid', 'declined', 'changed', 'expired']),
    amountDue: nonnegative,
    attempts: nonnegative,
    createdAt: isoDate,
    attemptedAt: isoDate.nullable(),
    retryAt: isoDate,
    retriesCancelledAt: isoDate.nullable(),
  }).strict().nullable(),
  grace: z.object({
    currentUntil: isoDate.nullable(),
    maximumUntil: isoDate.nullable(),
    additionalDaysAvailable: z.number().int().min(0).max(7),
  }).strict(),
}).strict();

export const adminWorkspaceRecoveryResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.enum(['paid', 'already-paid', 'declined', 'changed', 'pending']),
    recoveryId,
  }).strict(),
  z.object({
    status: z.literal('owner_action_required'),
    recoveryId,
    handoff: z.literal('workspace_owner_billing'),
  }).strict(),
  z.object({
    status: z.literal('grace_extended'),
    graceUntil: isoDate,
  }).strict(),
  z.object({
    status: z.literal('retries_cancelled'),
    paymentState: z.enum(['none', 'processing', 'requires_action', 'succeeded', 'requires_payment_method', 'other']),
  }).strict(),
]);

export const adminWorkspaceRecoveryMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspaceRecoveryStartResponseSchema = z.object({
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
    }).strict()).max(100),
  }).strict(),
}).strict();

export const adminWorkspaceRecoveryVerifiedSchema = z.object({ verified: z.literal(true) }).strict();

export type AdminWorkspaceRecoveryOperation = z.infer<typeof adminWorkspaceRecoveryOperationSchema>;
export type AdminWorkspaceRecoveryPreviewResponse = z.infer<typeof adminWorkspaceRecoveryPreviewResponseSchema>;
export type AdminWorkspaceRecoveryResult = z.infer<typeof adminWorkspaceRecoveryResultSchema>;
export type AdminWorkspaceRecoveryStartResponse = z.infer<typeof adminWorkspaceRecoveryStartResponseSchema>;
