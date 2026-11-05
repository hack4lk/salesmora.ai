import { z } from 'zod';

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

export const adminUserSuspensionMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminUserSuspensionStartSchema = z.object({
  token,
  options: z.object({
    challenge: z.string(),
    rpId: z.string().optional(),
    userVerification: z.literal('required'),
    allowCredentials: z.array(z.object({ id: z.string(), type: z.literal('public-key') })),
  }),
});

export const adminUserSuspensionOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    userId: z.string().min(1).max(128).regex(/^[^\u0000-\u001f\u007f]+$/),
    action: z.enum(['suspend', 'unsuspend']),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('totp'), code: z.string().regex(/^\d{6}$/) }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('passkey'), response: passkeyResponseSchema }).strict(),
  z.object({ operation: z.literal('commit'), token }).strict(),
]);

export const adminUserSuspensionResultSchema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  changed: z.boolean(),
  suspendedAt: z.string().datetime().nullable(),
}).strict();

export const adminUserSuspensionVerifiedSchema = z.object({ verified: z.literal(true) }).strict();
