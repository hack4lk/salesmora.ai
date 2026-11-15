import { describe, expect, it } from 'vitest';
import { activityReportQuerySchema, activityReportResultSchema } from './activity';

const uuid = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const event = { domain: 'lead', eventId: uuid(2), occurredAt: '2026-11-01T04:00:00.000000Z', action: 'created',
  actor: { kind: 'system', key: 'system', label: 'System' }, recordId: uuid(3), recordLabel: 'Lead L-1 / Inquiry' };
const result = {
  workspaceId: uuid(1), view: 'activity', from: '2026-11-01', to: '2026-11-02', today: '2026-11-07',
  asOf: '2026-11-07T17:00:00Z', timezone: 'America/New_York', scopeLabel: 'Authorized native events; partial domain coverage.',
  includedDomains: [{ domain: 'lead', scope: 'workspace', archiveVisibility: 'included' },
    { domain: 'job', scope: 'assigned', archiveVisibility: 'not-applicable' }],
  omittedDomains: ['customer', 'estimate', 'work-order'].map(domain => ({ domain, reason: 'implementation-pending' })),
  filters: { domains: [], actions: [], actors: [] },
  options: { domains: ['lead', 'job'], actions: ['created'], actors: [{ value: 'system', label: 'System' }] },
  total: 1, rows: [event], page: 1, pageSize: 25,
};
describe('Activity report contracts', () => {
  it('accepts bounded server-clock requests and deduplicates allowlisted facet selections', () => {
    const query = { workspaceId: uuid(1), view: 'activity', period: { from: result.from, to: result.to } };
    expect(activityReportQuerySchema.parse(query).pageSize).toBe(25);
    expect(activityReportQuerySchema.parse({ ...query, filters: { domains: ['lead', 'lead'], actions: [], actors: [] } }).filters.domains).toEqual(['lead']);
    for (const patch of [
      { today: result.today }, { scope: 'workspace' }, { pageSize: 1 }, { page: 0 },
      { period: { from: '2026-02-30', to: '2026-03-01' } },
      { period: { from: '2025-01-01', to: '2026-01-02' } },
      { filters: { domains: ['chat'], actions: [], actors: [] } },
      { filters: { domains: [], actions: ['note'], actors: [] } },
    ]) expect(activityReportQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });
  it('declares every included or omitted domain and reconciles counts, facets and pages', () => {
    expect(activityReportResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [
      { omittedDomains: [] }, { includedDomains: [...result.includedDomains, result.includedDomains[0]] },
      { options: { ...result.options, domains: ['lead', 'customer'] } },
      { total: 2 }, { page: 2 }, { rows: [] }, { total: Number.MAX_SAFE_INTEGER + 1 },
    ]) expect(activityReportResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, total: 0, rows: [] }).success).toBe(true);
  });
  it('requires parent-authorized domains and matching allowlisted actions and actor labels', () => {
    for (const row of [
      { ...event, domain: 'customer' }, { ...event, action: 'completed' },
      { ...event, actor: { kind: 'member', key: 'system', label: 'Unknown' } },
      { ...event, actor: { kind: 'member', key: 'someone', label: 'Hidden' } },
      { ...event, recordLabel: 'Private\npayload' }, { ...event, changes: { secret: 'private' } },
      { ...event, actor: { ...event.actor, email: 'private@example.test' } },
    ]) expect(activityReportResultSchema.safeParse({ ...result, rows: [row] }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, filters: { domains: ['job'], actions: [], actors: [] } }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, filters: { domains: [], actions: ['updated'], actors: [] } }).success).toBe(false);
  });
  it('keeps domain-qualified identities and stable timestamp/domain/event ordering', () => {
    const job = { ...event, domain: 'job' };
    expect(activityReportResultSchema.safeParse({ ...result, total: 2, rows: [job, event] }).success).toBe(true);
    expect(activityReportResultSchema.safeParse({ ...result, total: 2, rows: [event, job] }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, total: 2, rows: [event, event] }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, total: 2,
      rows: [{ ...event, occurredAt: '2026-11-02T12:00:00Z' }, { ...event, eventId: uuid(4) }] }).success).toBe(true);
    const precise = [{ ...event, occurredAt: '2026-11-02T12:00:00.000002Z' },
      { ...event, eventId: uuid(1), occurredAt: '2026-11-02T12:00:00.000001Z' }];
    expect(activityReportResultSchema.safeParse({ ...result, total: 2, rows: precise }).success).toBe(true);
    expect(activityReportResultSchema.safeParse({ ...result, total: 2, rows: [...precise].reverse() }).success).toBe(false);
  });
  it('uses event dates in the business timezone and rejects out-of-period/future rows', () => {
    for (const patch of [{ occurredAt: '2026-11-01T03:59:59.999Z' }, { occurredAt: '2026-11-03T05:00:00Z' }]) {
      expect(activityReportResultSchema.safeParse({ ...result, rows: [{ ...event, ...patch }] }).success).toBe(false);
    }
    expect(activityReportResultSchema.safeParse({ ...result, timezone: 'Invalid/Zone' }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, asOf: '2026-10-01T00:00:00Z' }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...result, today: '2026-10-31' }).success).toBe(false);
  });
  it('requires full Customer scope with explicit archive coverage and permits only safe Customer actions', () => {
    const customerResult = { ...result,
      includedDomains: [...result.includedDomains, { domain: 'customer', scope: 'workspace', archiveVisibility: 'included' }],
      omittedDomains: result.omittedDomains.filter(item => item.domain !== 'customer'),
      options: { ...result.options, domains: [...result.options.domains, 'customer'], actions: ['created', 'updated', 'archived'] },
      rows: [{ ...event, domain: 'customer' }],
    };
    expect(activityReportResultSchema.safeParse(customerResult).success).toBe(true);
    for (const patch of [
      { includedDomains: customerResult.includedDomains.map(item => item.domain === 'customer' ? { ...item, scope: 'assigned' } : item) },
      { includedDomains: customerResult.includedDomains.map(item => item.domain === 'customer' ? { ...item, archiveVisibility: 'not-applicable' } : item) },
      { rows: [{ ...event, domain: 'customer', action: 'stage-changed' }] },
      { rows: [{ ...event, domain: 'customer', body: 'Private note' }] },
    ]) expect(activityReportResultSchema.safeParse({ ...customerResult, ...patch }).success).toBe(false);
    expect(activityReportResultSchema.safeParse({ ...customerResult,
      includedDomains: customerResult.includedDomains.map(item => item.domain === 'customer' ? { ...item, archiveVisibility: 'excluded' } : item),
    }).success).toBe(true);
  });
  it('allows assigned Estimate history with explicit archives and generic actions but no raw decision or paper fields', () => {
    const estimateResult = { ...result,
      includedDomains: [...result.includedDomains, { domain: 'estimate', scope: 'assigned', archiveVisibility: 'excluded' }],
      omittedDomains: result.omittedDomains.filter(item => item.domain !== 'estimate'),
      options: { ...result.options, domains: [...result.options.domains, 'estimate'], actions: ['created', 'updated', 'sent', 'archived', 'decision-recorded'] },
    };
    for (const action of estimateResult.options.actions) {
      expect(activityReportResultSchema.safeParse({ ...estimateResult, rows: [{ ...event, domain: 'estimate', action }] }).success).toBe(true);
    }
    for (const patch of [
      { rows: [{ ...event, domain: 'estimate', action: 'completed' }] },
      { rows: [{ ...event, domain: 'estimate', content: { total: 100 } }] },
      { rows: [{ ...event, domain: 'estimate', note: 'Private decision reason' }] },
      { includedDomains: estimateResult.includedDomains.map(item => item.domain === 'estimate' ? { ...item, archiveVisibility: 'not-applicable' } : item) },
    ]) expect(activityReportResultSchema.safeParse({ ...estimateResult, ...patch }).success).toBe(false);
  });
  it('allows current assigned Work Order history and readable archives without private completion or file details', () => {
    const workOrderResult = { ...result,
      includedDomains: [...result.includedDomains, { domain: 'work-order', scope: 'assigned', archiveVisibility: 'included' }],
      omittedDomains: result.omittedDomains.filter(item => item.domain !== 'work-order'),
      options: { ...result.options, domains: [...result.options.domains, 'work-order'],
        actions: ['created', 'updated', 'archived', 'assignment-changed', 'status-changed', 'visit-changed', 'completed'] },
    };
    for (const action of workOrderResult.options.actions) {
      expect(activityReportResultSchema.safeParse({ ...workOrderResult, rows: [{ ...event, domain: 'work-order', action }] }).success).toBe(true);
    }
    for (const patch of [
      { rows: [{ ...event, domain: 'work-order', action: 'sent' }] },
      { rows: [{ ...event, domain: 'work-order', signatureImage: 'PRIVATE_SIGNATURE' }] },
      { rows: [{ ...event, domain: 'work-order', fileName: 'PRIVATE_FILENAME' }] },
      ...['excluded', 'not-applicable'].map(archiveVisibility => ({
        includedDomains: workOrderResult.includedDomains.map(item => item.domain === 'work-order' ? { ...item, archiveVisibility } : item),
      })),
    ]) expect(activityReportResultSchema.safeParse({ ...workOrderResult, ...patch }).success).toBe(false);
  });
});
