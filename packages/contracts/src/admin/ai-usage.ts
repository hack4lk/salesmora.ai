import { z } from 'zod';

export const adminAIUsagePeriodSchema = z.enum(['7d', '30d', 'month']);
export type AdminAIUsagePeriod = z.infer<typeof adminAIUsagePeriodSchema>;

const nonnegativeInteger = z.number().int().nonnegative();
const usageValueSchema = z.object({
  calls: nonnegativeInteger,
  completedCalls: nonnegativeInteger,
  failedCalls: nonnegativeInteger,
  unknownUsageCalls: nonnegativeInteger,
  inputTokens: z.string().regex(/^\d+$/),
  outputTokens: z.string().regex(/^\d+$/),
  totalTokens: z.string().regex(/^\d+$/),
  estimatedCostUsd: z.string().regex(/^\d+\.\d{6}$/).nullable(),
}).strict();

export const adminAIUsageResponseSchema = z.object({
  period: adminAIUsagePeriodSchema,
  since: z.string().datetime(),
  asOf: z.string().datetime(),
  pricingConfigured: z.boolean(),
  pricingVersionCount: nonnegativeInteger,
  summary: usageValueSchema,
  byDay: z.array(z.object({ date: z.string().date() }).merge(usageValueSchema).strict()).max(31),
  byModel: z.array(z.object({ model: z.string().min(1).max(128) }).merge(usageValueSchema).strict()).max(100),
  byFeature: z.array(z.object({ feature: z.string().min(1).max(64) }).merge(usageValueSchema).strict()).max(100),
  topWorkspaces: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(256),
  }).merge(usageValueSchema).strict()).max(20),
}).strict();
export type AdminAIUsageResponse = z.infer<typeof adminAIUsageResponseSchema>;
