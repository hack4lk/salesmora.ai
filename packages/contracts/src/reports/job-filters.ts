import { z } from 'zod';
import { jobStatuses } from '../job';
import { jobWorkloadQuerySchema } from './jobs';

export const jobPeriodFiltersSchema = jobWorkloadQuerySchema.shape.filters.extend({
  statuses: z.array(z.enum(jobStatuses)).max(jobStatuses.length)
    .refine(values => new Set(values).size === values.length).default([]),
});
export type JobPeriodFilters = z.infer<typeof jobPeriodFiltersSchema>;
