import { z } from 'zod';
import { staffRoleIdSchema } from './schemas';

export const staffEmailDomain = 'karpukcreative.com';
export const staffEmailSchema = z.string().trim().toLowerCase().email().max(254)
  .refine(email => email.endsWith(`@${staffEmailDomain}`), {
    message: `Use a @${staffEmailDomain} staff email address.`,
  });

export const staffActionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('invite'), email: staffEmailSchema, role: staffRoleIdSchema }).strict(),
  z.object({ kind: z.literal('revoke'), invitationId: z.string().uuid() }).strict(),
  z.object({ kind: z.literal('approval'), requestId: z.string().uuid() }).strict(),
  z.object({ kind: z.literal('disable'), userId: z.string().min(1).max(128), expectedVersion: z.number().int().nonnegative() }).strict(),
  z.object({ kind: z.literal('enable'), userId: z.string().min(1).max(128), expectedVersion: z.number().int().nonnegative() }).strict(),
  z.object({ kind: z.literal('role_change'), userId: z.string().min(1).max(128), role: staffRoleIdSchema, expectedVersion: z.number().int().nonnegative() }).strict(),
]);
export const staffActionInputSchema = z.object({
  action: staffActionSchema,
  reason: z.string().trim().min(1).max(1000),
  decision: z.enum(['approve', 'reject']),
}).strict();
export type StaffActionInput = z.infer<typeof staffActionInputSchema>;

export const staffManagementSnapshotSchema = z.object({
  reviewer: z.object({ id: z.string(), role: staffRoleIdSchema }),
  methods: z.array(z.enum(['passkey', 'totp'])),
  staff: z.array(z.object({
    id: z.string(), name: z.string(), email: z.string(), role: staffRoleIdSchema.nullable(),
    factors: z.array(z.string()), lastActive: z.string().nullable(),
    disabled: z.boolean(), version: z.number().int().nonnegative(),
  })),
  invitations: z.array(z.object({
    id: z.string(), email: z.string(), role: staffRoleIdSchema,
    status: z.enum(['pending', 'accepted', 'expired', 'revoked']), expiresAt: z.string(),
    delivery: z.enum(['pending', 'sent', 'failed']).nullable(),
  })),
  approvals: z.array(z.object({
    id: z.string(), email: z.string(), requestedBy: z.object({ id: z.string(), name: z.string() }),
    expiresAt: z.string(), status: z.enum(['pending', 'approved', 'rejected', 'expired']),
    accountChange: z.object({
      kind: z.enum(['enable', 'role_change']), userId: z.string(), currentRole: staffRoleIdSchema,
    }).nullable(),
  })),
});
export type StaffManagementSnapshot = z.infer<typeof staffManagementSnapshotSchema>;
