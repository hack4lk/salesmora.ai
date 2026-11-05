import { z } from 'zod';
import { staffRoleIdSchema } from './schemas';

export const auditCategorySchema = z.enum(['all', 'access', 'staff', 'viewas', 'operations', 'users', 'workspaces', 'other']);
export const auditRangeSchema = z.enum(['today', 'week', 'month', 'year']);
export const auditFiltersSchema = z.object({
  query: z.string().trim().max(254).default(''),
  actor: z.string().max(128).default(''),
  category: auditCategorySchema.default('all'),
  range: auditRangeSchema.default('week'),
  page: z.number().int().min(0).max(1_000_000).default(0),
}).strict();
export const auditQuerySchema = auditFiltersSchema.extend({
  asOf: z.string().datetime().optional(),
  throughSequence: z.string().regex(/^(0|[1-9]\d{0,18})$/).optional(),
}).strict();
export type AuditFilters = z.infer<typeof auditFiltersSchema>;
export type AuditQuery = z.infer<typeof auditQuerySchema>;

export const auditEventSchema = z.object({
  id: z.string(), sequence: z.string(), occurredAt: z.string().datetime(),
  actorId: z.string().nullable(), actorName: z.string(),
  actorRole: z.union([staffRoleIdSchema, z.enum(['bootstrap', 'system'])]),
  action: z.string(), category: auditCategorySchema.exclude(['all']),
  targetType: z.string(), targetId: z.string(), workspaceId: z.string().nullable(),
  reason: z.string().nullable(), requestId: z.string(), ipAddress: z.string().nullable(), userAgent: z.string().nullable(),
  before: z.record(z.string(), z.unknown()).nullable(), after: z.record(z.string(), z.unknown()).nullable(),
  hash: z.string(), prevHash: z.string().nullable(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;
export const auditPageSchema = z.object({
  events: z.array(auditEventSchema), total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(), pageSize: z.literal(5),
  asOf: z.string().datetime(), throughSequence: z.string(),
  actors: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type AuditPage = z.infer<typeof auditPageSchema>;
export const auditVerificationSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('intact'), checked: z.number().int().nonnegative(), checkedAt: z.string().datetime(),
    headHash: z.string().nullable(), throughSequence: z.string() }),
  z.object({ state: z.literal('broken'), checked: z.number().int().nonnegative(), checkedAt: z.string().datetime(),
    sequence: z.string(), throughSequence: z.string() }),
]);
