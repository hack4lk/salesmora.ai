import { z } from 'zod';

const queueCountsSchema = z.object({
  waiting: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  delayed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
}).strict();

export const adminOperationsResponseSchema = z.object({
  queues: z.array(z.object({
    name: z.string().min(1).max(128),
    workers: z.number().int().nonnegative(),
    counts: queueCountsSchema,
  }).strict()).max(5),
  outboxes: z.array(z.object({
    name: z.string().min(1).max(64),
    statuses: z.array(z.object({
      status: z.string().min(1).max(24),
      count: z.number().int().nonnegative(),
    }).strict()).max(8),
  }).strict()).max(10),
  asOf: z.string().datetime(),
}).strict();
export type AdminOperationsResponse = z.infer<typeof adminOperationsResponseSchema>;
