import { describe, expect, it } from 'vitest';
import { intakeDetailReview, validIntakeDetailContext, validIntakeDetailRequest } from './intake-detail-page.validation';
import { intakeDecisionRequest, type IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
import type { IntakeEvidenceSnapshot } from '../intake-source-evidence/intake-source-evidence.validation';
const review: IntakeDecisionReviewModel = {
  intakeId: 'item', intakeVersion: 1, revision: 'r1', resolved: false, duplicateRequired: false, decision: 'dismiss', matches: [],
  definition: { contactRequired: true, fields: [] }, definitionVersion: 1, answers: {}, workflowVersion: 1, workflow: [],
  access: 'ready', capacity: 'exhausted', canCreate: false, canLink: true, canDismiss: true,
};
const evidence: IntakeEvidenceSnapshot = { intakeId: 'item', version: 1, sourceName: 'Source', receivedAt: null, type: 'website', answers: [], fields: [] };
describe('composed intake detail boundary', () => {
  it('requires original evidence from the same intake identity and version', () => {
    expect(validIntakeDetailContext(review, evidence)).toBe(true);
    expect(validIntakeDetailContext(review, { ...evidence, intakeId: 'other' })).toBe(false);
    expect(validIntakeDetailContext(review, { ...evidence, version: 2 })).toBe(false);
  });
  it('removes inaccessible or unavailable candidates and intersects link permission without mutating the original', () => {
    const model = { ...review, matches: [{ id: 'lead', version: 3, name: 'Jamie', contact: '', reason: '', canLink: true, changes: [] }] };
    expect(intakeDetailReview(model, false, 'ready').matches).toEqual([]);
    expect(intakeDetailReview(model, true, 'error').matches).toEqual([]);
    expect(intakeDetailReview(model, true, 'loading').matches).toEqual([]);
    expect(intakeDetailReview({ ...model, canLink: false }, true, 'ready').matches[0].canLink).toBe(false);
    expect(model.matches[0].canLink).toBe(true);
    const link: IntakeDecisionReviewModel = { ...model, duplicateRequired: true, decision: { kind: 'link', reviewRevision: 'r1', leadId: 'lead', leadVersion: 3, changeIds: [] } };
    expect(intakeDecisionRequest(link)?.kind).toBe('link');
    expect(intakeDecisionRequest(intakeDetailReview(link, false, 'ready'))).toBe(null);
    expect(intakeDecisionRequest(intakeDetailReview({ ...link, canLink: false }, true, 'ready'))).toBe(null);
  });
  it('rejects forged or stale confirmation payloads while accepting the exact reviewed request', () => {
    const payload = { ...intakeDecisionRequest(review)!, requestId: 'attempt' };
    expect(validIntakeDetailRequest(review, payload)).toBe(true);
    expect(validIntakeDetailRequest({ ...review, intakeVersion: 2 }, payload)).toBe(false);
    expect(validIntakeDetailRequest({ ...review, canDismiss: false }, payload)).toBe(false);
    expect(validIntakeDetailRequest(review, { ...payload, requestId: '' })).toBe(false);
  });
});
