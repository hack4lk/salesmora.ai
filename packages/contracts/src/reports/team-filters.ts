import { z } from 'zod';

export const teamReportFiltersSchema = z.object({
  members: z.array(z.string().trim().min(1).max(200).refine(value => value !== 'unassigned'))
    .max(50).refine(values => new Set(values).size === values.length).default([]),
}).strict();
export type TeamReportFilters = z.infer<typeof teamReportFiltersSchema>;
