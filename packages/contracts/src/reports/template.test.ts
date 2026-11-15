import { describe, expect, it } from 'vitest';
import { reportTemplateConfigurationSchema, reportTemplateCreateSchema, reportTemplateUpdateSchema } from './template';

const historical = { preset: 'last30days' };
const fixed = { preset: 'custom', from: '2026-01-01', to: '2026-01-30' };
const cases = [
  { area: 'overview', query: { view: 'business-overview' }, period: historical },
  { area: 'leads', query: { view: 'intake', filters: { stages: [], owners: [], sources: [] },
    currentFilters: { stages: [], owners: [], sources: [] } }, period: historical },
  { area: 'sources', query: { view: 'lead-source', selected: 'cohort' }, period: historical },
  { area: 'calendar', query: { view: 'calendar-scheduled', selected: 'visits' }, period: { preset: 'next7days' } },
  { area: 'jobs', query: { view: 'workload', filters: { statuses: [], owners: [], services: [] },
    selection: { kind: 'metric', metric: 'active' } }, period: null },
  { area: 'team', query: { view: 'team-leads', selected: { kind: 'queue', queue: 'open' } }, period: null },
  { area: 'estimates', query: { view: 'estimate-current', selected: 'awaiting' }, period: null },
  { area: 'activity', query: { view: 'activity' }, period: historical },
  { area: 'financial', query: { view: 'financial', selected: 'accepted' }, period: historical },
];

describe('personal report template configuration', () => {
  it('accepts native configurations in every report area', () => {
    for (const value of cases) expect(reportTemplateConfigurationSchema.safeParse(value).success, value.area).toBe(true);
  });
  it('accepts fixed periods and rejects incompatible rolling or current periods', () => {
    for (const value of cases.filter(item => item.period)) {
      expect(reportTemplateConfigurationSchema.safeParse({ ...value, period: fixed }).success, value.area).toBe(true);
      expect(reportTemplateConfigurationSchema.safeParse({ ...value, period: null }).success, value.area).toBe(false);
    }
    for (const value of cases.filter(item => !item.period)) {
      expect(reportTemplateConfigurationSchema.safeParse({ ...value, period: historical }).success, value.area).toBe(false);
    }
    expect(reportTemplateConfigurationSchema.safeParse({ ...cases[3], period: historical }).success).toBe(false);
    expect(reportTemplateConfigurationSchema.safeParse({ ...cases[0], period: { preset: 'next7days' } }).success).toBe(false);
  });
  it('rejects cached identity, pagination, permissions and mismatched native views', () => {
    const value = cases[0]!;
    for (const extra of [{ workspaceId: '00000000-0000-4000-8000-000000000001' }, { page: 2 },
      { pageSize: 25 }, { period: { from: fixed.from, to: fixed.to } }, { scope: 'workspace' }]) {
      expect(reportTemplateConfigurationSchema.safeParse({ ...value, query: { ...value.query, ...extra } }).success).toBe(false);
    }
    expect(reportTemplateConfigurationSchema.safeParse({ ...value, area: 'financial' }).success).toBe(false);
    expect(reportTemplateConfigurationSchema.safeParse({ ...value, results: [] }).success).toBe(false);
  });
  it('requires fixed dates for individual-day selections', () => {
    const value = cases[1]!;
    const query = { ...value.query, trendBucket: '2026-01-10' };
    expect(reportTemplateConfigurationSchema.safeParse({ ...value, query }).success).toBe(false);
    expect(reportTemplateConfigurationSchema.safeParse({ ...value, query, period: fixed }).success).toBe(true);
  });
  it('validates names and optimistic update inputs', () => {
    const workspaceId = '00000000-0000-4000-8000-000000000001';
    expect(reportTemplateCreateSchema.parse({ workspaceId, name: '  My report  ', configuration: cases[0] }).name).toBe('My report');
    expect(reportTemplateCreateSchema.safeParse({ workspaceId, name: '', configuration: cases[0] }).success).toBe(false);
    expect(reportTemplateUpdateSchema.safeParse({ workspaceId, version: 1 }).success).toBe(false);
    expect(reportTemplateUpdateSchema.safeParse({ workspaceId, version: 0, name: 'New' }).success).toBe(false);
    expect(reportTemplateUpdateSchema.safeParse({ workspaceId, version: 1, name: 'New', ownerId: 'other' }).success).toBe(false);
  });
});
