import { describe, expect, it } from 'vitest';
import { jobPeriodFiltersSchema } from './job-filters';
import { jobLifecycleQuerySchema } from './job-lifecycle';
import { jobCompletionQuerySchema } from './job-completion';
import { jobWorkloadQuerySchema } from './jobs';

const filters = { statuses: ['completed', 'in-progress'], owners: ['member:owner', 'unassigned'], services: ['service:Repair', 'none'] };
const base = { workspaceId: '00000000-0000-4000-8000-000000000001', period: { from: '2026-10-01', to: '2026-10-31' } };

describe('Jobs period facets', () => {
  it('accepts all canonical current statuses and the shared owner/service tokens', () => {
    expect(jobPeriodFiltersSchema.parse(filters)).toEqual(filters);
    expect(jobLifecycleQuerySchema.parse({ ...base, view: 'lifecycle', selectedView: 'completed', filters }).filters).toEqual(filters);
    expect(jobCompletionQuerySchema.parse({ ...base, view: 'completion', filters }).filters).toEqual(filters);
  });

  it('preserves unfiltered query defaults and rejects closed workload filters', () => {
    expect(jobCompletionQuerySchema.parse({ ...base, view: 'completion' }).filters).toEqual({ statuses: [], owners: [], services: [] });
    expect(jobWorkloadQuerySchema.safeParse({
      workspaceId: base.workspaceId, view: 'workload', filters,
      selection: { kind: 'metric', metric: 'active' },
    }).success).toBe(false);
  });

  it('rejects duplicates, unknown fields, malformed tokens and oversized selections', () => {
    for (const patch of [
      { statuses: ['completed', 'completed'] },
      { statuses: ['unknown'] },
      { owners: ['member:'] },
      { owners: ['unassigned', 'unassigned'] },
      { services: ['Repair'] },
      { services: ['service:Repair', 'service:Repair'] },
      { services: Array.from({ length: 51 }, (_, i) => `service:${i}`) },
      { extra: true },
    ]) expect(jobPeriodFiltersSchema.safeParse({ ...filters, ...patch }).success).toBe(false);
  });
});
