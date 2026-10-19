import { z } from 'zod';
export const paymentRecoveryRequestSchema = z.discriminatedUnion('action',[
  z.object({workspaceId:z.uuid(),action:z.literal('preview')}).strict(),
  z.object({workspaceId:z.uuid(),action:z.literal('status'),quoteId:z.uuid()}).strict(),
  z.object({workspaceId:z.uuid(),action:z.literal('confirm'),quoteId:z.uuid()}).strict(),
]);
export const recoveryInvoiceSchema = z.object({number:z.string(),description:z.string(),periodStart:z.iso.datetime(),periodEnd:z.iso.datetime(),total:z.number().int().nonnegative(),amountPaid:z.number().int().nonnegative(),amountDue:z.number().int().nonnegative()}).strict();
export const paymentRecoveryResultSchema = z.object({
  status:z.enum(['review','paid','already-paid','declined','changed','pending','authenticating','unavailable']),
  quoteId:z.uuid().nullable(),expiresAt:z.iso.datetime().nullable(),
  invoice:recoveryInvoiceSchema.nullable(),
  card:z.object({brand:z.string(),last4:z.string().length(4),expMonth:z.number().int(),expYear:z.number().int()}).nullable(),
  clientSecret:z.string().min(1).optional(),
}).strict();
export type PaymentRecoveryResult = z.infer<typeof paymentRecoveryResultSchema>;
