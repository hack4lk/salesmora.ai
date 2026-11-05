import { z } from 'zod';
import { adminCustomerUserIdSchema } from './user-management';

const token = z.string().regex(/^[\w-]{43}$/);
const passkeyResponseSchema = z.object({
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

export const adminUserEmailVerificationMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminUserEmailVerificationStartSchema = z.object({
  token,
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
  options: z.object({
    challenge: z.string(),
    rpId: z.string().optional(),
    userVerification: z.literal('required'),
    allowCredentials: z.array(z.object({ id: z.string(), type: z.literal('public-key') })),
  }),
}).strict();

export const adminUserEmailVerificationOperationSchema = z.union([
  z.object({
    operation: z.literal('resend'),
    userId: adminCustomerUserIdSchema,
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    operation: z.literal('start'),
    userId: adminCustomerUserIdSchema,
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('totp'), code: z.string().regex(/^\d{6}$/) }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('passkey'), response: passkeyResponseSchema }).strict(),
  z.object({ operation: z.literal('commit'), token }).strict(),
]);

export const adminCustomerUserEmailVerificationResendResultSchema = z.object({
  requested: z.literal(true),
}).strict();

export const adminCustomerUserEmailVerificationVerifiedSchema = z.object({
  verified: z.literal(true),
}).strict();

export const adminCustomerUserEmailVerificationResultSchema = z.object({
  changed: z.literal(true),
}).strict();
