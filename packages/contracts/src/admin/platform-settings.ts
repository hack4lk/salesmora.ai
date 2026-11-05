import { z } from 'zod';

const maximumMonthlyTokens = 1_000_000_000_000;
const monthlyTokensSchema = z.number().int().min(0).max(maximumMonthlyTokens);
const nullableMonthlyTokensSchema = monthlyTokensSchema.nullable();
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
  }).strict(),
  clientExtensionResults: z.object({}).passthrough(),
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
}).strict();

export const adminPlatformSettingsResponseSchema = z.object({
  defaultMonthlyAITokens: monthlyTokensSchema,
  source: z.enum(['admin', 'environment']),
  version: z.number().int().nonnegative(),
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
  history: z.array(z.object({
    version: z.number().int().positive(),
    monthlyTokens: nullableMonthlyTokensSchema,
    reason: z.string().min(10).max(500),
    createdAt: z.string().datetime(),
    actorName: z.string().min(1).max(256),
  }).strict()).max(20),
}).strict();
export type AdminPlatformSettingsResponse = z.infer<typeof adminPlatformSettingsResponseSchema>;

export const adminPlatformSettingsMethodsSchema = z.object({
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
}).strict();

export const adminPlatformSettingsStartSchema = z.object({
  token,
  options: z.object({
    challenge: z.string(),
    rpId: z.string().optional(),
    userVerification: z.literal('required'),
    allowCredentials: z.array(z.object({ id: z.string(), type: z.literal('public-key') }).passthrough()),
  }).passthrough(),
}).strict();

export const adminPlatformSettingsOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    monthlyTokens: nullableMonthlyTokensSchema,
    expectedVersion: z.number().int().nonnegative(),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('totp'), code: z.string().regex(/^\d{6}$/) }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('passkey'), response: passkeyResponseSchema }).strict(),
  z.object({ operation: z.literal('commit'), token }).strict(),
]);

export const adminPlatformSettingsVerifiedSchema = z.object({ verified: z.literal(true) }).strict();
export const adminPlatformSettingsResultSchema = z.object({
  changed: z.literal(true),
  version: z.number().int().positive(),
  monthlyTokens: nullableMonthlyTokensSchema,
}).strict();
