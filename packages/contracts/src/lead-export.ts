import { z } from 'zod';
import { leadListQuerySchema, leadSources, leadStages } from './lead-read';

export const leadExportSchema = z.object({
  workspaceId: z.uuid(),
  filters: z.object({
    query: z.string().trim().max(200), stages: z.array(z.enum(leadStages)).max(5),
    sources: z.array(z.enum(leadSources)).max(5), ownerIds: z.array(z.string().min(1).max(200)).max(50),
    created: z.enum(['any', '7days', '30days', 'custom']), from: z.union([z.literal(''), z.iso.date()]), to: z.union([z.literal(''), z.iso.date()]),
    attention: z.boolean(), archived: z.boolean(),
  }).strict(),
}).strict().refine(value => value.filters.created !== 'custom' || !!value.filters.from && !!value.filters.to && value.filters.from <= value.filters.to, { path: ['filters', 'from'], message: 'Choose a valid ordered date range.' });
export type LeadExportInput = z.infer<typeof leadExportSchema>;
export type LeadExportPreview = { count: number; rowLimit: number; scope: 'workspace' | 'assigned' };
export const leadExportPreviewSchema = z.object({ count: z.number().int().nonnegative(), rowLimit: z.number().int().positive(), scope: z.enum(['workspace', 'assigned']) }).strict();
export function leadExportQuery(input: LeadExportInput) {
  const { query, from, to, ...filters } = input.filters;
  return leadListQuerySchema.parse({ workspaceId: input.workspaceId, q: query, ...filters, ...(from ? { from } : {}), ...(to ? { to } : {}) });
}
