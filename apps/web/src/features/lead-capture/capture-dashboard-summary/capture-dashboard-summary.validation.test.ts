import { describe, expect, it } from 'vitest';
import { validCaptureDashboardSource as sourceValid, validCaptureIntakeHref as linkValid, validCaptureSourceTotals as totalsValid } from './capture-dashboard-summary.validation';
describe('capture source summary data', () => {
  it('accepts zeros and lifetime totals including dismissed items', () => {
    expect(totalsValid({ captured: 0, awaitingReview: 0, approved: 0 })).toBe(true); expect(totalsValid({ captured: 42, awaitingReview: 7, approved: 31 })).toBe(true);
  });
  it('rejects missing, invalid and inconsistent totals instead of presenting zero', () => {
    expect(totalsValid(undefined)).toBe(false);
    for (const totals of [{ captured: 2, awaitingReview: 2, approved: 2 }, { captured: -1, awaitingReview: 0, approved: 0 }, { captured: 2.5, awaitingReview: 0, approved: 0 }, { captured: NaN, awaitingReview: 0, approved: 0 }, { captured: Number.MAX_SAFE_INTEGER + 1, awaitingReview: 0, approved: 0 }]) expect(totalsValid(totals)).toBe(false);
  });
  it('validates source identity and supported lifecycle state', () => {
    expect(sourceValid({ id: 'source', name: 'Website', type: 'website', status: 'archived' })).toBe(true); expect(sourceValid({ id: '', name: 'Website', type: 'website', status: 'active' })).toBe(false);
  });
  it('allows internal links and rejects unsafe schemes, origins and control characters', () => {
    expect(linkValid('/intake?captureSource=source')).toBe(true);
    for (const href of [undefined, '', 'javascript:alert(1)', 'https://evil.example', '//evil.example', '/\\evil.example', '/intake\n?source=one']) expect(linkValid(href)).toBe(false);
  });
});
