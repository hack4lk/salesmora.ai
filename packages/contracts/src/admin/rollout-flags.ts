import { z } from 'zod';

export const adminRolloutFlagKeySchema = z.string().regex(/^[a-z][a-z0-9._-]{0,99}$/);

export const adminRolloutFlagSchema = z.object({
  key: adminRolloutFlagKeySchema,
  description: z.string().trim().min(1).max(200),
  enabled: z.boolean(),
}).strict();

export const adminRolloutFlagsResponseSchema = z.object({
  flags: z.array(adminRolloutFlagSchema),
}).strict();

export type AdminRolloutFlag = z.infer<typeof adminRolloutFlagSchema>;

export const adminRolloutFlagMutationSchema = z.discriminatedUnion('operation', [
  z.object({ operation: z.literal('create'), flag: adminRolloutFlagSchema }).strict(),
  z.object({
    operation: z.literal('update'),
    originalKey: adminRolloutFlagKeySchema,
    flag: adminRolloutFlagSchema,
    expected: adminRolloutFlagSchema,
  }).strict(),
  z.object({
    operation: z.literal('delete'),
    key: adminRolloutFlagKeySchema,
    expected: adminRolloutFlagSchema,
  }).strict(),
]);
export type AdminRolloutFlagMutation = z.infer<typeof adminRolloutFlagMutationSchema>;
