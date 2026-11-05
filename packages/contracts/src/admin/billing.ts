import { z } from 'zod';
import { planChangeQuoteSchema, workspacePlanIdSchema } from '../billing';
import {
  workspaceSuspensionPasskeyResponseSchema,
  workspaceSuspensionTokenSchema,
} from './workspace-management';

const nonnegative = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const isoDate = z.iso.datetime();
const stripeTestCustomerUrl = z.url().max(256).regex(
  /^https:\/\/dashboard\.stripe\.com\/test\/customers\/cus_[A-Za-z0-9_]+$/,
);
const stripeTestSubscriptionUrl = z.url().max(256).regex(
  /^https:\/\/dashboard\.stripe\.com\/test\/subscriptions\/sub_[A-Za-z0-9_]+$/,
);
const stripeTestInvoiceUrl = z.url().max(256).regex(
  /^https:\/\/dashboard\.stripe\.com\/test\/invoices\/in_[A-Za-z0-9_]+$/,
);

export const adminWorkspaceBillingRequestSchema = z.object({
  workspaceId: z.uuid(),
}).strict();

export const adminWorkspaceBillingResponseSchema = z.object({
  workspaceId: z.uuid(),
  subscription: z.object({
    plan: workspacePlanIdSchema,
    intendedPlan: workspacePlanIdSchema,
    status: z.string().min(1).max(80),
    cancelAtPeriodEnd: z.boolean(),
    paidThrough: isoDate.nullable(),
    recoveryUntil: isoDate.nullable(),
  }).strict().nullable(),
  planChanges: z.array(z.object({
    plan: workspacePlanIdSchema,
    kind: z.enum(['checkout', 'upgrade', 'downgrade', 'free']),
    status: z.enum(['quoted', 'applying', 'payment', 'complete', 'scheduled', 'expired', 'cancelled']),
    amountDue: nonnegative,
    createdAt: isoDate,
    effectiveAt: isoDate.nullable(),
  }).strict()),
  invoices: z.array(z.object({
    number: z.string().nullable(),
    createdAt: isoDate,
    currency: z.literal('usd'),
    total: z.number().int(),
    amountPaid: nonnegative,
    amountDue: nonnegative,
    status: z.string().min(1).max(40).nullable(),
  }).strict()),
  payment: z.object({
    brand: z.string().min(1).max(40),
    last4: z.string().regex(/^\d{4}$/),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int(),
  }).strict().nullable(),
  providerStatus: z.enum(['available', 'unavailable', 'not_linked']),
  recoveries: z.array(z.object({
    state: z.enum(['quoted', 'applying', 'action', 'pending', 'paid', 'declined', 'changed', 'expired']),
    amountDue: nonnegative,
    attempts: nonnegative,
    createdAt: isoDate,
    expiresAt: isoDate,
    retryAt: isoDate,
  }).strict()),
  webhookEvents: z.array(z.object({
    type: z.string().min(1).max(120),
    status: z.enum(['processed', 'pending', 'retry_due', 'retry_scheduled']),
    receivedAt: isoDate,
    processedAt: isoDate.nullable(),
    attempts: nonnegative,
    retryAt: isoDate,
  }).strict()),
}).strict();

export const adminWorkspaceBillingLinksRequestSchema = z.object({
  workspaceId: z.uuid(),
}).strict();

const adminWorkspaceBillingLinksUnavailableSchema = z.object({
  workspaceId: z.uuid(),
  providerStatus: z.enum(['unavailable', 'not_linked']),
  customerUrl: z.null(),
  subscriptionUrl: z.null(),
  invoices: z.tuple([]),
}).strict();

const adminWorkspaceBillingLinksAvailableSchema = z.object({
  workspaceId: z.uuid(),
  providerStatus: z.literal('available'),
  customerUrl: stripeTestCustomerUrl,
  subscriptionUrl: stripeTestSubscriptionUrl.nullable(),
  invoices: z.array(z.object({
    number: z.string().nullable(),
    createdAt: isoDate,
    url: stripeTestInvoiceUrl,
  }).strict()).max(12),
}).strict();

export const adminWorkspaceBillingLinksResponseSchema = z.discriminatedUnion('providerStatus', [
  adminWorkspaceBillingLinksUnavailableSchema,
  adminWorkspaceBillingLinksAvailableSchema,
]);

export type AdminWorkspaceBillingRequest = z.infer<typeof adminWorkspaceBillingRequestSchema>;
export type AdminWorkspaceBillingResponse = z.infer<typeof adminWorkspaceBillingResponseSchema>;
export type AdminWorkspaceBillingLinksRequest = z.infer<typeof adminWorkspaceBillingLinksRequestSchema>;
export type AdminWorkspaceBillingLinksResponse = z.infer<typeof adminWorkspaceBillingLinksResponseSchema>;

const adminPlanChangeReason = z.string().trim().min(10).max(500);

export const adminWorkspacePlanChangeOperationSchema = z.union([
  z.object({
    operation: z.literal('preview'),
    workspaceId: z.uuid(),
    plan: z.enum(['standard', 'premium', 'free']),
  }).strict(),
  z.object({
    operation: z.literal('start'),
    workspaceId: z.uuid(),
    quoteId: z.uuid(),
    reason: adminPlanChangeReason,
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

export const adminWorkspacePlanChangePreviewResponseSchema = z.object({
  workspaceId: z.uuid(),
  quote: planChangeQuoteSchema,
}).strict();

export const adminWorkspacePlanChangeMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminWorkspacePlanChangeStartResponseSchema = z.object({
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

export const adminWorkspacePlanChangeVerifiedSchema = z.object({
  verified: z.literal(true),
}).strict();

export const adminWorkspacePlanChangeResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.enum(['complete', 'scheduled', 'expired']),
    plan: workspacePlanIdSchema,
    effectiveAt: isoDate,
  }).strict(),
  z.object({
    status: z.literal('customer_action_required'),
    plan: workspacePlanIdSchema,
    effectiveAt: isoDate,
    handoff: z.literal('workspace_owner_billing'),
  }).strict(),
]);

export type AdminWorkspacePlanChangeOperation = z.infer<typeof adminWorkspacePlanChangeOperationSchema>;
export type AdminWorkspacePlanChangePreviewResponse = z.infer<typeof adminWorkspacePlanChangePreviewResponseSchema>;
export type AdminWorkspacePlanChangeStartResponse = z.infer<typeof adminWorkspacePlanChangeStartResponseSchema>;
export type AdminWorkspacePlanChangeResult = z.infer<typeof adminWorkspacePlanChangeResultSchema>;
