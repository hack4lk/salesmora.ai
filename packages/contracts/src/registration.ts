import { z } from 'zod';
import { workspacePlanIdSchema } from './billing';

export const registrationPolicy = { passwordMinimum: 8, passwordMaximum: 128, nameMaximum: 100, emailMaximum: 254 } as const;

export const registrationSchema = z.object({
  name: z.string().trim().min(1).max(registrationPolicy.nameMaximum),
  email: z.string().trim().toLowerCase().max(registrationPolicy.emailMaximum).pipe(z.email()),
  password: z.string().min(registrationPolicy.passwordMinimum).max(registrationPolicy.passwordMaximum),
  termsAccepted: z.literal(true),
  plan: workspacePlanIdSchema.optional(),
});
