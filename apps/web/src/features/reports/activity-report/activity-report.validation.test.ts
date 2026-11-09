import { describe, expect, it } from 'vitest';
import {
  activityEventKey,
  compareActivityEvents,
  validActivityFilterOptions,
  validActivityFilters,
  validActivityReportResult,
} from './activity-report.validation';
import {
  activityFilterOptions,
  activityReportResponse,
  activityReportTimezone,
  activityReportToday,
  authorizedActivityEvents,
  defaultActivityPeriod,
  emptyActivityFilters,
} from './activity-report.fixtures';

const ready = (overrides: Parameters<typeof activityReportResponse>[0] = {}) =>
  activityReportResponse(overrides);

describe('Activity report validation', () => {
  it('accepts a sorted five-domain projection with domain-qualified duplicate event IDs', () => {
    const result = ready();
    expect(new Set(result.rows.map(row => row.domain)).size).toBe(5);
    expect(new Set(result.rows.map(activityEventKey)).size).toBe(6);
    expect(result.total).toBe(6);
    expect(validActivityReportResult(result, defaultActivityPeriod, emptyActivityFilters, activityFilterOptions,
      activityReportToday, activityReportTimezone)).toBe(true);
    expect(activityEventKey(authorizedActivityEvents[0]!)).not.toBe(activityEventKey(authorizedActivityEvents[1]!));
  });

  it('applies selected facets before totals and pagination', () => {
    const filters = { domains: ['lead'] as const, actions: ['created'] as const, actors: [] };
    const result = ready({ filters, pageSize: 1 });
    expect(result.total).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.domain).toBe('lead');
    expect(validActivityReportResult(result, defaultActivityPeriod, filters, activityFilterOptions,
      activityReportToday, activityReportTimezone)).toBe(true);
  });

  it('orders equal timestamps deterministically by domain-qualified event identity', () => {
    const events = [...authorizedActivityEvents].sort(compareActivityEvents);
    expect(events[0]?.occurredAt).toBe(events[1]?.occurredAt);
    expect(activityEventKey(events[0]!)).toBe('customer:shared-1');
    expect(activityEventKey(events[1]!)).toBe('lead:shared-1');
    const later = { ...authorizedActivityEvents[0]!, eventId: 'z-later', occurredAt: '2026-11-06T09:00:00.000002Z' };
    const earlier = { ...later, eventId: 'a-earlier', occurredAt: '2026-11-06T09:00:00.000001Z' };
    expect(compareActivityEvents(later, earlier)).toBeLessThan(0);
    expect(compareActivityEvents(earlier, later)).toBeGreaterThan(0);
    expect(compareActivityEvents({ ...later, occurredAt: '2026-11-06T10:00:00.000002+01:00' }, later)).toBe(0);
  });

  it('rejects duplicate identity within a domain but permits the same ID in another domain', () => {
    const result = { ...ready(), total: 2, rows: [authorizedActivityEvents[0]!, authorizedActivityEvents[0]!] };
    expect(validActivityReportResult(result, defaultActivityPeriod, emptyActivityFilters, activityFilterOptions,
      activityReportToday, activityReportTimezone)).toBe(false);
  });

  it('rejects unknown shapes, extra payload fields and incompatible actions', () => {
    const base = ready();
    const original = base.rows[0]!;
    const malformedRows = [
      { ...original, privateNotes: 'do not expose' },
      { ...original, action: 'deleted' },
      { ...original, domain: 'invoice' },
      { ...original, domain: 'customer', action: 'decision-recorded' },
    ];
    for (const invalid of malformedRows) {
      const result = { ...base, rows: [invalid, ...base.rows.slice(1)] } as never;
      expect(validActivityReportResult(result, defaultActivityPeriod, emptyActivityFilters, activityFilterOptions,
        activityReportToday, activityReportTimezone)).toBe(false);
    }
    expect(validActivityReportResult({ ...base, rows: [null] } as never,
      defaultActivityPeriod, emptyActivityFilters, activityFilterOptions, activityReportToday,
      activityReportTimezone)).toBe(false);
  });

  it('requires explicit timezone-bearing timestamps and bounded safe display text', () => {
    const result = ready();
    const original = result.rows[0]!;
    const invalidRows = [
      { ...original, occurredAt: '2026-11-06T09:00:00' },
      { ...original, recordLabel: `Sensitive\ncontent` },
      { ...original, recordLabel: 'x'.repeat(161) },
    ];
    for (const event of invalidRows) {
      expect(validActivityReportResult({ ...result, rows: [event, ...result.rows.slice(1)] },
        defaultActivityPeriod, emptyActivityFilters, activityFilterOptions, activityReportToday,
        activityReportTimezone)).toBe(false);
    }
  });

  it('uses the workspace-local event date at inclusive period boundaries', () => {
    const result = ready();
    const boundaryEvent = { ...result.rows.at(-1)!, occurredAt: '2026-10-07T23:30:00.000Z' };
    const boundaryResult = { ...result, rows: [...result.rows.slice(0, -1), boundaryEvent] };
    expect(validActivityReportResult(boundaryResult, defaultActivityPeriod, emptyActivityFilters,
      activityFilterOptions, activityReportToday, activityReportTimezone)).toBe(true);
  });

  it('requires the result to match the current date, timezone and filter snapshot', () => {
    const result = ready();
    expect(validActivityReportResult({ ...result, today: '2026-11-05' }, defaultActivityPeriod,
      emptyActivityFilters, activityFilterOptions, activityReportToday, activityReportTimezone)).toBe(false);
    expect(validActivityReportResult({ ...result, timezone: 'UTC' }, defaultActivityPeriod,
      emptyActivityFilters, activityFilterOptions, activityReportToday, activityReportTimezone)).toBe(false);
    expect(validActivityReportResult(result, defaultActivityPeriod,
      { ...emptyActivityFilters, actors: ['member-ava'] }, activityFilterOptions, activityReportToday,
      activityReportTimezone)).toBe(false);
    expect(validActivityReportResult({ ...result, privatePayload: 'must not cross the projection' } as never,
      defaultActivityPeriod, emptyActivityFilters, activityFilterOptions, activityReportToday,
      activityReportTimezone)).toBe(false);
  });

  it('rejects unauthorized facet values and invalid actor options', () => {
    expect(validActivityFilters({ ...emptyActivityFilters, actors: ['member-hidden'] }, activityFilterOptions)).toBe(false);
    expect(validActivityFilterOptions({ ...activityFilterOptions,
      actors: [...activityFilterOptions.actors, { value: 'member-ava', label: 'Duplicate' }] })).toBe(false);
    expect(validActivityFilterOptions({ ...activityFilterOptions, privateOptions: [] } as never)).toBe(false);
    expect(validActivityFilters({ ...emptyActivityFilters, privateFilter: true } as never,
      activityFilterOptions)).toBe(false);
  });

  it('rejects out-of-range events and incorrect page lengths', () => {
    const result = ready();
    expect(validActivityReportResult({ ...result, rows: [{ ...result.rows[0]!, occurredAt: '2026-10-07T10:00:00Z' }] },
      defaultActivityPeriod, emptyActivityFilters, activityFilterOptions, activityReportToday,
      activityReportTimezone)).toBe(false);
    expect(validActivityReportResult({ ...result, rows: [] }, defaultActivityPeriod, emptyActivityFilters,
      activityFilterOptions, activityReportToday, activityReportTimezone)).toBe(false);
  });
});
