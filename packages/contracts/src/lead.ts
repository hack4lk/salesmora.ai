import { z } from 'zod';
const optionalText = (max: number) => z.string().trim().max(max);
export const leadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(254).pipe(z.union([z.literal(''), z.email()])).transform(value => value.toLowerCase()),
  phone: optionalText(100), service: z.string().trim().min(1).max(200),
  address: optionalText(500), details: optionalText(10000), notes: optionalText(10000),
  source: z.enum(['website', 'referral', 'phone', 'gmail', 'other']),
  stage: z.enum(['new', 'contacted', 'estimate-sent', 'won', 'lost']),
  ownerId: z.string().max(200),
}).strict();
export const createLeadSchema = z.object({ workspaceId: z.uuid(), submissionId: z.uuid(), lead: leadSchema }).strict();
export type LeadInput = z.infer<typeof leadSchema>;
