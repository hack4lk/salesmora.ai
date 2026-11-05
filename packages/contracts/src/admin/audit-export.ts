import { z } from 'zod';
import { auditFiltersSchema } from './audit-viewer';

export const auditExportSnapshotSchema = z.object({
  filters: auditFiltersSchema.omit({ page: true }),
  count: z.number().int().min(1).max(50_000),
  asOf: z.string().datetime(),
  throughSequence: z.string().regex(/^(0|[1-9]\d{0,18})$/),
}).strict();
export const auditExportInputSchema = z.object({
  snapshot: auditExportSnapshotSchema,
  reason: z.string().trim().min(1).max(1000),
}).strict();
export type AuditExportSnapshot = z.infer<typeof auditExportSnapshotSchema>;
export type AuditExportInput = z.infer<typeof auditExportInputSchema>;

const token = z.string().regex(/^[\w-]{43}$/);
const passkey = z.object({
  id: z.string().min(1), rawId: z.string().min(1), type: z.literal('public-key'),
  response: z.object({ clientDataJSON: z.string(), authenticatorData: z.string(), signature: z.string(), userHandle: z.string().optional() }),
  clientExtensionResults: z.object({}).passthrough(), authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
});
export const auditExportOperationSchema = z.union([
  z.object({ operation: z.literal('start'), password: z.string().min(1).max(128), input: auditExportInputSchema }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('totp'), code: z.string().regex(/^\d{6}$/) }).strict(),
  z.object({ operation: z.literal('factor'), token, method: z.literal('passkey'), response: passkey }).strict(),
  z.object({ operation: z.literal('commit'), token }).strict(),
]);
export const auditExportMethodsSchema = z.object({ methods: z.array(z.enum(['passkey', 'totp'])) }).strict();
export const auditExportStartSchema = z.object({
  token,
  options: z.object({ challenge: z.string(), rpId: z.string().optional(), userVerification: z.literal('required'),
    allowCredentials: z.array(z.object({ id: z.string(), type: z.literal('public-key') })) }),
});
export const auditExportVerifiedSchema = z.object({ verified: z.literal(true) }).strict();
