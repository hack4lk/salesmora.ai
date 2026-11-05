import { z } from 'zod';
import { adminCustomerUserIdSchema } from './user-management';

const sessionId = z.string().min(1).max(128).regex(/^[^\u0000-\u001f\u007f]+$/);

export const adminCustomerUserSessionAccessSchema = z.object({
  id: sessionId,
  device: z.string().min(1).max(100),
  maskedIp: z.string().max(80).regex(
    /^(?:\d{1,3}\.\d{1,3}\.x\.x|[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}(?::xxxx){6})$/,
  ).nullable(),
  createdAt: z.string().datetime(),
  lastActivityAt: z.string().datetime(),
}).strict();

export const adminCustomerUserSessionsResponseSchema = z.object({
  sessions: z.array(adminCustomerUserSessionAccessSchema).max(20),
  totalSessions: z.number().int().nonnegative(),
}).strict();

export const adminCustomerUserSessionRevocationOperationSchema = z.discriminatedUnion('scope', [
  z.object({
    scope: z.literal('all'),
    userId: adminCustomerUserIdSchema,
    reason: z.string().trim().min(10).max(500),
  }).strict(),
  z.object({
    scope: z.literal('selected'),
    userId: adminCustomerUserIdSchema,
    sessionIds: z.array(sessionId).min(1).max(100),
    reason: z.string().trim().min(10).max(500),
  }).strict(),
]);

export const adminCustomerUserSessionRevocationResultSchema = z.object({
  revoked: z.number().int().nonnegative(),
}).strict();

export type AdminCustomerUserSessionAccess = z.infer<typeof adminCustomerUserSessionAccessSchema>;
export type AdminCustomerUserSessionsResponse = z.infer<typeof adminCustomerUserSessionsResponseSchema>;
