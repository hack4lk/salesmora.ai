import { describe, expect, it } from 'vitest';
import { captureReviewFixture, captureReviewResultFixture } from './capture-review-page.fixtures';
import { validCaptureReviewRequest, validCaptureReviewResult } from './capture-review-page.validation';
import type { CaptureLaunchRequest } from '../capture-setup-review/capture-setup-review.validation';
const request: CaptureLaunchRequest = { draft: captureReviewFixture(), timing: { kind: 'now' } };
const now = Date.parse('2026-10-30T14:00:00Z');
describe('review/publication composition boundary', () => {
  it('requires complete readiness and future timing before submission', () => {
    expect(validCaptureReviewRequest(request, now)).toBe(true);
    expect(validCaptureReviewRequest({ ...request, draft: { ...request.draft, checks: [] } }, now)).toBe(false);
    expect(validCaptureReviewRequest({ ...request, timing: { kind: 'scheduled', at: '2026-10-29T13:00:00.000Z', timezone: request.draft.timezone, localDateTime: '2026-10-29T09:00' } }, now)).toBe(false);
  });
  it('rejects identity, version, source and publication mismatches', () => {
    const result = captureReviewResultFixture(request);
    expect(validCaptureReviewResult(request, result)).toBe(true);
    for (const patch of [{ draftId: 'other' }, { draftVersion: 7 }, { source: 'gmail' as const }, { sourceVersion: 0 }, { publication: undefined }, { publication: { ...result.publication!, id: 'other' } }, { status: 'scheduled' as const }]) expect(validCaptureReviewResult(request, { ...result, ...patch })).toBe(false);
  });
  it('binds scheduled response and artifacts to the exact requested instant and zone', () => {
    const scheduled: CaptureLaunchRequest = { ...request, timing: { kind: 'scheduled', at: '2026-11-03T14:00:00.000Z', timezone: request.draft.timezone, localDateTime: '2026-11-03T09:00' } };
    const result = captureReviewResultFixture(scheduled);
    expect(validCaptureReviewRequest(scheduled, now)).toBe(true); expect(validCaptureReviewResult(scheduled, result)).toBe(true);
    expect(validCaptureReviewResult(scheduled, { ...result, scheduledAt: '2026-11-04T14:00:00.000Z' })).toBe(false);
    expect(validCaptureReviewResult(scheduled, { ...result, publication: { ...result.publication!, timezone: 'UTC' } })).toBe(false);
  });
  it('accepts Gmail completion without website artifacts and rejects website artifacts for Gmail', () => {
    const gmail: CaptureLaunchRequest = { ...request, draft: captureReviewFixture('gmail') }, result = captureReviewResultFixture(gmail);
    expect(validCaptureReviewResult(gmail, result)).toBe(true);
    expect(validCaptureReviewResult(gmail, { ...result, publication: captureReviewResultFixture(request).publication })).toBe(false);
  });
});
