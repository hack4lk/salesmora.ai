import { describe, expect, it } from 'vitest';
import { businessOverviewReadResultSchema } from './business-overview-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-10-01', to: '2026-10-31' };
const unavailable = { kind: 'unavailable', reason: 'permissions', explanation: 'Current record access unavailable.' };
const result = {
  workspaceId, viewerId: 'text-viewer', policyRevision: 0,
  query: { workspaceId, view: 'business-overview', period },
  report: { workspaceId, view: 'business-overview', ...period, today: '2026-11-06', timezone: 'Europe/Warsaw',
    reportScope: 'workspace', leads: unavailable, jobs: unavailable, estimates: unavailable, calendar: unavailable },
  authority: { reportScope: 'workspace', lead: null, job: null, estimate: null, calendar: null },
};
describe('Overview session authority envelope', () => {
  it('supports text identities, initial policy revisions and explicit unavailable native sections', () => {
    expect(businessOverviewReadResultSchema.safeParse(result).success).toBe(true);
  });
  it('rejects contradictory workspace, request, domain authority and private fields', () => {
    for (const changes of [{ workspaceId: '00000000-0000-4000-8000-000000000002' }, { viewerId: 'bad\u0000viewer' },
      { policyRevision: -1 }, { privateNotes: 'hidden' }, { query: { ...result.query, period: { ...period, from: '2026-10-02' } } },
      { authority: { ...result.authority, lead: { scope: 'workspace', archives: 'included' } } },
      { authority: { ...result.authority, reportScope: 'assigned' } }]) {
      expect(businessOverviewReadResultSchema.safeParse({ ...result, ...changes }).success).toBe(false);
    }
  });
  it('requires own Calendar authority to match the session viewer rather than another authorized-looking identifier', () => {
    const scope = { kind: 'own', viewerId: 'text-viewer' };
    const report = { ...result.report, reportScope: 'assigned', calendar: { kind: 'available', scope,
      from: '2026-11-06', to: '2026-11-12', visits: 0, read: { asOf: '2026-11-06T10:00:00Z', scopeLabel: 'Own visits.' } } };
    const envelope = { ...result, report, authority: { ...result.authority, reportScope: 'assigned', calendar: scope } };
    expect(businessOverviewReadResultSchema.safeParse(envelope).success).toBe(true);
    expect(businessOverviewReadResultSchema.safeParse({ ...envelope, viewerId: 'another-viewer' }).success).toBe(false);
  });
});
