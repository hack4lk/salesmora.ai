import { z } from 'zod';
import { adminCustomerUserIdSchema } from './user-management';

export const adminCustomerUserPasswordResetOperationSchema = z.object({
  userId: adminCustomerUserIdSchema,
  reason: z.string().trim().min(10).max(500),
}).strict();

export const adminCustomerUserPasswordResetResultSchema = z.object({
  requested: z.literal(true),
}).strict();

export type AdminCustomerUserPasswordResetOperation = z.infer<typeof adminCustomerUserPasswordResetOperationSchema>;
export type AdminCustomerUserPasswordResetResult = z.infer<typeof adminCustomerUserPasswordResetResultSchema>;
