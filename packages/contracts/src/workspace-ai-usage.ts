import { z } from 'zod';
/** Owner-facing summary only; no transcripts, teammate IDs or provider credentials. */
export const workspaceAIUsageSchema = z.object({
  usedOrReservedTokens: z.string().regex(/^\d{1,30}$/),
  monthlyTokens: z.string().regex(/^\d{1,13}$/),
  resetAt: z.string().datetime(),
}).strict();
export type WorkspaceAIUsage = z.infer<typeof workspaceAIUsageSchema>;
