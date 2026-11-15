import { describe, expect, it } from 'vitest';
import { activityReportQuerySchema } from './activity';
import { activityReportReadResultSchema } from './activity-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const query = activityReportQuerySchema.parse({ workspaceId, view: 'activity', period: { from: '2026-10-07', to: '2026-11-05' } });
const report = {
  workspaceId, view: 'activity', from: query.period.from, to: query.period.to, today: '2026-11-05',
  asOf: '2026-11-06T01:00:00Z', timezone: 'America/New_York', scopeLabel: 'Authorized native history.',
  includedDomains: [{ domain: 'lead', scope: 'assigned', archiveVisibility: 'excluded' }],
  omittedDomains: ['job', 'customer', 'estimate', 'work-order'].map(domain => ({ domain, reason: 'permissions' })),
  filters: query.filters, options: { domains: ['lead'], actions: [], actors: [] },
  total: 0, rows: [], page: 1, pageSize: 25,
};
const envelope = { workspaceId, viewerId: 'session-user', policyRevision: 2,
  authority: { scope: 'assigned' }, exportScopes: [], query, report };
describe('Activity authority envelope', () => {
  it('binds an empty native projection and local clock without inventing workspace domain access', () => {
    expect(activityReportReadResultSchema.safeParse(envelope).success).toBe(true);
    expect(activityReportReadResultSchema.safeParse({ ...envelope, authority: { scope: 'workspace' } }).success).toBe(true);
  });
  it('rejects mismatched workspace, request, page, policy and extra private fields', () => {
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { viewerId: '' }, { policyRevision: -1 },
      { query: { ...query, pageSize: 100 } }, { query: { ...query, period: { ...query.period, from: '2026-10-08' } } },
      { query: { ...query, filters: { ...query.filters, actors: ['system'] } } }, { role: 'owner' },
      { report: { ...report, rows: [], changes: { private: true } } },
    ]) expect(activityReportReadResultSchema.safeParse({ ...envelope, ...patch }).success).toBe(false);
  });
  it('rejects widened assigned coverage, unfinished domain implementation and inconsistent local today', () => {
    for (const patch of [
      { includedDomains: [{ ...report.includedDomains[0], scope: 'workspace' }] },
      { omittedDomains: report.omittedDomains.map(item => ({ ...item, reason: 'implementation-pending' })) },
      { today: '2026-11-06' },
    ]) expect(activityReportReadResultSchema.safeParse({ ...envelope, report: { ...report, ...patch } }).success).toBe(false);
  });
  it('accepts native past-end clamping but rejects nonmatching query pages', () => {
    expect(activityReportReadResultSchema.safeParse({ ...envelope, query: { ...query, page: 100 } }).success).toBe(true);
    expect(activityReportReadResultSchema.safeParse({ ...envelope, report: { ...report, page: 2 } }).success).toBe(false);
  });
  it('only exposes export scopes within readable domains', () => {
    expect(activityReportReadResultSchema.safeParse({ ...envelope, exportScopes: [{ domain: 'lead', scope: 'assigned' }] }).success).toBe(true);
    for (const exportScopes of [[{ domain: 'lead', scope: 'workspace' }], [{ domain: 'customer', scope: 'workspace' }],
      [{ domain: 'lead', scope: 'assigned' }, { domain: 'lead', scope: 'assigned' }]]) {
      expect(activityReportReadResultSchema.safeParse({ ...envelope, exportScopes }).success).toBe(false);
    }
  });
});
