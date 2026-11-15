import { z } from 'zod';

const owner = z.string().trim().max(207).refine(value =>
  value === 'unassigned' || value.startsWith('member:') && value.slice(7).trim().length > 0);
export const estimateReportFiltersSchema = z.object({
  owners: z.array(owner).max(50).refine(values => new Set(values).size === values.length).default([]),
  parents: z.array(z.enum(['lead', 'job'])).max(2).refine(values => new Set(values).size === values.length).default([]),
}).strict();
export type EstimateReportFilters = z.infer<typeof estimateReportFiltersSchema>;
export const estimateReportAttributionShape = {
  ownerKey: owner, parentType: z.enum(['lead', 'job']),
};
export function estimateAttributionMatches(
  row: { ownerKey: string; parentType: string }, filters: EstimateReportFilters,
): boolean {
  return (filters.owners.length === 0 || filters.owners.includes(row.ownerKey)) &&
    (filters.parents.length === 0 || filters.parents.some(parent => parent === row.parentType));
}
