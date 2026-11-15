import { describe, expect, it } from 'vitest';
import {
  businessOverviewResponse,
  businessOverviewTimezone,
  businessOverviewToday,
  defaultBusinessOverviewPeriod,
} from './business-overview.fixtures';
import {
  validBusinessOverviewResult,
  type BusinessOverviewResult,
} from './business-overview.validation';

const valid = (
  result = businessOverviewResponse(),
  period = defaultBusinessOverviewPeriod,
) => validBusinessOverviewResult(result, period, businessOverviewToday, businessOverviewTimezone);

describe('Business overview validation', () => {
  it('accepts distinct selected-period and current-snapshot metrics with explicit attention queues', () => {
    const result = businessOverviewResponse();
    expect(result.periodMetrics).toHaveLength(5);
    expect(result.currentMetrics).toHaveLength(7);
    expect(result.attention.kind).toBe('available');
    expect(valid(result)).toBe(true);
  });

  it('changes period results without changing current metrics or the attention snapshot', () => {
    const period = { preset: 'custom' as const, from: '2026-09-01', to: '2026-09-30' };
    const result = businessOverviewResponse({ period });
    expect(result.periodMetrics.find(metric => metric.id === 'new-leads')?.value)
      .toEqual({ kind: 'count', value: 1 });
    expect(result.currentMetrics.find(metric => metric.id === 'active-jobs')?.value)
      .toEqual({ kind: 'count', value: 5 });
    expect(result.attention).toEqual(businessOverviewResponse().attention);
    expect(valid(result, period)).toBe(true);
  });

  it('preserves independent amount and attention unavailability without representing it as zero', () => {
    const result = businessOverviewResponse({
      canReadEstimateValues: false,
      attentionUnavailable: true,
    });
    expect(result.periodMetrics.find(metric => metric.id === 'accepted-value')?.value.kind)
      .toBe('unavailable');
    expect(result.periodMetrics.find(metric => metric.id === 'accepted-value')?.evidenceId)
      .toBeUndefined();
    expect(result.attention.kind).toBe('unavailable');
    expect(valid(result)).toBe(true);
  });

  it('accepts a valid authorized empty attention list and period', () => {
    const period = { preset: 'custom' as const, from: '2026-08-01', to: '2026-08-30' };
    const result = businessOverviewResponse({ period });
    const emptyResult = { ...result, attention: { kind: 'available' as const, items: [] } };
    expect(valid(emptyResult, period)).toBe(true);
    expect(emptyResult.periodMetrics.filter(metric => metric.id !== 'accepted-value')
      .every(metric => metric.value.kind === 'count' && metric.value.value === 0)).toBe(true);
  });

  it('rejects period mismatch, stale dates, unknown keys and unsafe metric values', () => {
    const result = businessOverviewResponse();
    expect(valid({ ...result, from: '2026-10-07' })).toBe(false);
    expect(valid({ ...result, today: '2026-11-05' })).toBe(false);
    expect(valid({ ...result, timezone: 'UTC' })).toBe(false);
    expect(valid({ ...result, unexpected: 'private' } as never)).toBe(false);
    expect(valid({
      ...result,
      currentMetrics: result.currentMetrics.map(metric => metric.id === 'active-jobs'
        ? { ...metric, dateBasisLabel: 'Selected period' }
        : metric),
    })).toBe(false);
    expect(valid({ ...result, upcomingVisitsRangeLabel: 'Last month' })).toBe(false);

    const malformedMetric: BusinessOverviewResult = {
      ...result,
      periodMetrics: result.periodMetrics.map(metric => metric.id === 'new-leads'
        ? { ...metric, value: { kind: 'count', value: -1 } }
        : metric),
    };
    expect(valid(malformedMetric)).toBe(false);
    expect(valid({
      ...result,
      periodMetrics: result.periodMetrics.map(metric => metric.id === 'accepted-value'
        ? { ...metric, value: { kind: 'unavailable', reason: 'No price grant.' }, evidenceId: 'accepted-value' }
        : metric),
    } as never)).toBe(false);
  });

  it('rejects malformed, duplicate or unapproved attention queues', () => {
    const result = businessOverviewResponse();
    if (result.attention.kind !== 'available') throw new Error('Expected available fixture attention.');
    expect(valid({
      ...result,
      attention: { kind: 'available', items: [result.attention.items[0], result.attention.items[0]] },
    } as never)).toBe(false);
    expect(valid({
      ...result,
      attention: { kind: 'available', items: [{ ...result.attention.items[0], id: 'hidden-records' }] },
    } as never)).toBe(false);
    expect(valid({
      ...result,
      attention: { kind: 'unavailable', reason: ' ' },
    } as never)).toBe(false);
  });
});
