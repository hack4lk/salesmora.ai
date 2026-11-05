import { validIntakeEvidenceSnapshot, type IntakeEvidenceSnapshot } from '../intake-source-evidence/intake-source-evidence.validation';
import { intakeDecisionRequest, type IntakeDecisionRequest, type IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';

export function validIntakeDetailContext(review: IntakeDecisionReviewModel, evidence: IntakeEvidenceSnapshot): boolean {
  return validIntakeEvidenceSnapshot(evidence) && evidence.intakeId === review.intakeId && evidence.version === review.intakeVersion;
}
/** Intersect supplied candidate summaries with current visibility and link permissions before final review. */
export function intakeDetailReview(review: IntakeDecisionReviewModel, canReadMatches: boolean, matchesState: 'ready' | 'loading' | 'error'): IntakeDecisionReviewModel {
  return { ...review, matches: canReadMatches && matchesState === 'ready' ? review.matches.map(match => ({ ...match, canLink: match.canLink && review.canLink })) : [] };
}
/** The confirmed request must contain exactly the reviewed payload. Request IDs remain transport identifiers. */
export function validIntakeDetailRequest(review: IntakeDecisionReviewModel, request: IntakeDecisionRequest): boolean {
  const { requestId, ...payload } = request;
  return typeof requestId === 'string' && !!requestId.trim() && JSON.stringify(payload) === JSON.stringify(intakeDecisionRequest(review));
}
