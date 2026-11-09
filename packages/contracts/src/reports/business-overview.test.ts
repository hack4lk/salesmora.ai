import { describe, expect, it } from 'vitest';
import { businessOverviewQuerySchema, businessOverviewResultSchema } from './business-overview';
const omitted = { kind: 'unavailable', reason: 'permissions', explanation: 'Current domain authority is unavailable.' };
const base = { workspaceId: '00000000-0000-4000-8000-000000000001', view: 'business-overview', from: '2026-11-01', to: '2026-11-06',
  today: '2026-11-06', timezone: 'Europe/Warsaw', reportScope: 'workspace', leads: omitted, jobs: omitted, estimates: omitted, calendar: omitted };
describe('Business Overview contracts', () => {
  it('requires bounded historical dates and rejects unrepresented filters, pages and private projections', () => {
    const request = { workspaceId: base.workspaceId, view: base.view, period: { from: base.from, to: base.to } };
    expect(businessOverviewQuerySchema.safeParse(request).success).toBe(true);
    expect(businessOverviewQuerySchema.safeParse({ ...request, filters: {} }).success).toBe(false);
    expect(businessOverviewQuerySchema.safeParse({ ...request, page: 2 }).success).toBe(false);
    expect(businessOverviewQuerySchema.safeParse({ ...request, period: { ...request.period, count: 6 } }).success).toBe(false);
    expect(businessOverviewQuerySchema.safeParse({ workspaceId: base.workspaceId, view: base.view, period: { from: '2025-01-01', to: base.to } }).success).toBe(false);
    expect(businessOverviewResultSchema.safeParse(base).success).toBe(true);
    expect(businessOverviewResultSchema.safeParse({ ...base, rows: [] }).success).toBe(false);
    expect(businessOverviewResultSchema.safeParse({ ...base, to: '2026-11-07' }).success).toBe(false);
    expect(businessOverviewResultSchema.safeParse({ ...base, timezone: 'Not/AZone' }).success).toBe(false);
  });
  it('validates native snapshot dates, safe subset counts and assigned scope', () => {
    const read = { asOf: '2026-11-06T10:00:00Z', scopeLabel: 'Current native Job scope.' };
    const jobs = { kind: 'available', scope: 'assigned', reads: { created: read, completion: read, workload: read },
      created: 3, completed: 2, active: 4, overdue: 1, waiting: 1 };
    expect(businessOverviewResultSchema.safeParse({ ...base, jobs }).success).toBe(true);
    expect(businessOverviewResultSchema.safeParse({ ...base, reportScope: 'assigned', jobs: { ...jobs, scope: 'workspace' } }).success).toBe(false);
    expect(businessOverviewResultSchema.safeParse({ ...base, jobs: { ...jobs, overdue: 5 } }).success).toBe(false);
    expect(businessOverviewResultSchema.safeParse({ ...base, jobs: { ...jobs,
      reads: { ...jobs.reads, workload: { ...read, asOf: '2026-11-05T10:00:00Z' } } } }).success).toBe(false);
  });
});
