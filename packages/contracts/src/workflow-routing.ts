import { z } from 'zod';
import { workflowChannelChoicesSchema } from './workflow-channels';
export const routingStrategySchema = z.enum(['one_teammate', 'round_robin', 'fewest_open_leads']);
const ids = z.array(z.string().min(1).max(200)).min(1).max(100).refine(ids => new Set(ids).size === ids.length);
export const routingSelectionSchema = z.object({ strategy: routingStrategySchema, memberIds: ids, matchWorkZipCodes: z.boolean() }).strict()
  .refine(value => value.strategy !== 'one_teammate' || value.memberIds.length === 1, 'Choose one teammate.');
export const routingPolicySchema = z.object({ strategy: routingStrategySchema, matchWorkZipCodes: z.boolean(),
  members: z.array(z.object({ id: z.string().min(1).max(200), name: z.string().min(1).max(200) }).strict()).min(1).max(100),
}).strict().refine(value => new Set(value.members.map(member => member.id)).size === value.members.length && (value.strategy !== 'one_teammate' || value.members.length === 1));
export const routingPrepareSchema = z.object({ strategy: routingStrategySchema,
  members: z.array(z.string().trim().min(1).max(200)).min(1).max(100), matchWorkZipCodes: z.boolean(),
}).strict();
export const smartRoutingValuesSchema = routingSelectionSchema.safeExtend({ name: z.string().trim().min(1).max(120), sourceId: z.uuid(), notifications: workflowChannelChoicesSchema });
export type SmartRoutingValues = z.infer<typeof smartRoutingValuesSchema>;
export const routingOptionsSchema = z.object({
  sources: z.array(z.object({ id: z.uuid(), name: z.string(), collectsPostalCode: z.boolean() })),
  members: z.array(z.object({ id: z.string(), name: z.string(), workZipCodes: z.array(z.string()) })),
});
