import { z } from 'zod';
import { leadStages, leadSources } from './lead-read';
/** Exact read target only. Scope, data selection, versions and navigation belong to the app. */
export const leadDetailsInputSchema = z.object({ leadRef: z.string().trim().max(64) }).strict();
export const leadDetailsResultSchema = z.object({
  id: z.uuid(), scope: z.enum(['workspace', 'assigned']), retrievedAt: z.iso.datetime(),
  lead: z.object({ id: z.uuid(), number: z.string().min(1).max(64), name: z.string().min(1).max(200), service: z.string().max(200),
    stage: z.enum(leadStages), source: z.enum(leadSources), ownerName: z.string().max(200).nullable(), archived: z.boolean(),
    email: z.string().max(254), phone: z.string().max(100), address: z.string().max(500), details: z.string().max(10000), notes: z.string().max(10000),
  }).strict(),
}).strict();
export type LeadDetailsResult = z.infer<typeof leadDetailsResultSchema>;
