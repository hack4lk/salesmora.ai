import { z } from 'zod';
export const billingPaymentMethodRequestSchema = z.discriminatedUnion('action', [
  z.object({ workspaceId: z.uuid(), action: z.literal('prepare') }).strict(),
  z.object({ workspaceId: z.uuid(), action: z.literal('save'), attemptId: z.uuid(), consent: z.literal(true) }).strict(),
]);
export const billingPaymentMethodPreparationSchema = z.object({
  attemptId: z.uuid(), clientSecret: z.string().min(1), confirmed: z.boolean(),
  card: z.object({ brand: z.string(), last4: z.string().length(4), expMonth: z.number().int().min(1).max(12), expYear: z.number().int() }).nullable(),
}).strict();
