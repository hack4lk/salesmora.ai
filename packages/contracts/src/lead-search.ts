import { z } from 'zod';
import { leadExportSchema } from './lead-export';
import { leadStages } from './lead-read';
/** Model intent only; SQL, identity, scope, pagination and URLs are app-owned. */
export const leadSearchInputSchema = z.object({ mode: z.enum(['filters', 'current_filters']), filters: leadExportSchema.shape.filters }).strict();
export const leadSearchResultSchema = z.object({
  id: z.uuid(), scope: z.enum(['workspace', 'assigned']), filterLabels: z.array(z.string().max(1000)).max(60),
  includeArchived: z.boolean(), total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  rows: z.array(z.object({ id: z.uuid(), number: z.string().max(64), name: z.string().max(200), service: z.string().max(200),
    stage: z.enum(leadStages), ownerName: z.string().max(200).nullable(), archived: z.boolean() }).strict()).max(10),
}).strict().refine(value => value.rows.length === Math.min(value.total, 10) && new Set(value.rows.map(row => row.id)).size === value.rows.length && (value.includeArchived || !value.rows.some(row => row.archived)), 'Invalid result window');
export const leadSearchEvidenceSchema = z.array(z.uuid()).max(8);
export const leadSearchSnapshotSchema = z.object({
  filters: leadExportSchema.shape.filters, result: leadSearchResultSchema,
  versions: z.array(z.object({ id: z.uuid(), version: z.number().int().positive() }).strict()).max(10),
}).strict();
export const leadSearchNavigationSchema = z.object({ workspaceId: z.uuid(), resultId: z.uuid(), leadId: z.uuid().optional() }).strict();
export type LeadSearchInput = z.infer<typeof leadSearchInputSchema>;
export type LeadSearchResult = z.infer<typeof leadSearchResultSchema>;
export type LeadSearchSnapshot = z.infer<typeof leadSearchSnapshotSchema>;
