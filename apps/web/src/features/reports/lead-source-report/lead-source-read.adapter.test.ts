import { describe, expect, it } from 'vitest';
import { adaptLeadSourceReadResponse, leadSourceScopeKey } from './lead-source-read.adapter';
import { initialLeadSourceQuery, sourceReadResponse } from './lead-source-read.fixtures';
import { leadSourceReportRequest } from './lead-source-report.adapter';

const raw = sourceReadResponse(initialLeadSourceQuery);
const input = { request: initialLeadSourceQuery, scopeKey: leadSourceScopeKey(raw), today: raw.report.today, timezone: raw.report.timezone };
describe('Sources authority adaptation', () => {
  it('projects only native period fields from date-control bookkeeping', () => {
    const range = { ...initialLeadSourceQuery.period, count: 31 };
    const request = leadSourceReportRequest({ workspaceId: initialLeadSourceQuery.workspaceId, range,
      evidenceId: 'source-cohort', page: 1, pageSize: 25, filters: { stages: [], owners: [], sources: [] } });
    expect(request).toEqual(initialLeadSourceQuery);
    expect(request.period).not.toHaveProperty('count');
  });
  it('composes the native adapter for all evidence kinds without widening record navigation', () => {
    for (const selected of ['cohort', 'converted', 'accepted-estimates'] as const) {
      const request = { ...initialLeadSourceQuery, selected }, response = sourceReadResponse(request);
      expect(adaptLeadSourceReadResponse(response, { ...input, request }).state).toMatchObject({ kind: 'ready', result: { evidence: { kind: selected } } });
    }
  });
  it('rejects replaced identity, workspace, policy, scope, archive, clock, capabilities and echoed requests', () => {
    for (const changes of [{ viewerId: 'another-user' }, { policyRevision: 2 },
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { scope: 'assigned' },
      { archiveVisibility: 'excluded' }, { canReadConversion: false }, { canReadAcceptedValue: false },
      { query: { ...initialLeadSourceQuery, page: 2 } }]) {
      expect(() => adaptLeadSourceReadResponse({ ...raw, ...changes }, input)).toThrow();
    }
    expect(() => adaptLeadSourceReadResponse(raw, { ...input, today: '2026-11-07' })).toThrow();
    expect(() => adaptLeadSourceReadResponse(raw, { ...input, timezone: 'Europe/Warsaw' })).toThrow();
  });
  it('keeps partial source authority and invalid money distinct from readable zero', () => {
    for (const options of [{ scope: 'assigned' as const }, { canReadAcceptedValue: false }, { invalidMoney: true }]) {
      const response = sourceReadResponse(initialLeadSourceQuery, options);
      expect(adaptLeadSourceReadResponse(response, { ...input, scopeKey: leadSourceScopeKey(response) }).state)
        .toMatchObject({ kind: 'ready', result: { acceptedValue: { kind: 'unavailable' } } });
    }
    const emptyQuery = { ...initialLeadSourceQuery, period: { from: '2026-08-01', to: '2026-08-30' } };
    const empty = sourceReadResponse(emptyQuery);
    expect(adaptLeadSourceReadResponse(empty, { ...input, request: emptyQuery }).state)
      .toMatchObject({ kind: 'ready', result: { cohort: 0, acceptedValue: { kind: 'available', preTaxCents: 0 } } });
  });
});
