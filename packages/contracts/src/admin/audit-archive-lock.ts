import { z } from 'zod';

export const auditArchiveLockRulesSchema = z.array(z.object({
  id: z.string().min(1).max(1024),
  enabled: z.boolean(),
  prefix: z.string().max(1024).optional(),
  condition: z.discriminatedUnion('type', [
    z.object({ type: z.literal('Age'), maxAgeSeconds: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) }).strict(),
    z.object({ type: z.literal('Date'), date: z.string().datetime({ offset: true }) }).strict(),
    z.object({ type: z.literal('Indefinite') }).strict(),
  ]),
}).strict()).max(1000);
export type AuditArchiveLockRules = z.infer<typeof auditArchiveLockRulesSchema>;

// Cloudflare envelopes may add fields; the security-relevant rule data is strict.
export const auditArchiveLockResponseSchema = z.object({
  success: z.literal(true),
  errors: z.array(z.unknown()).length(0),
  result: z.object({ rules: auditArchiveLockRulesSchema.optional() }),
});
