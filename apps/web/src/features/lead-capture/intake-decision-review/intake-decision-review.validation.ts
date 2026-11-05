import type { CaptureFormFieldEditorValue } from '../capture-form-field-editor/capture-form-field-editor.validation';
import { validIntakeEditorDefinition, validateIntakeProposedAnswers, type IntakeProposedAnswers } from '../intake-proposed-lead-editor/intake-proposed-lead-editor.validation';
import { validIntakeDuplicateChoice, validIntakeDuplicateReview, type IntakeDuplicateChoice, type IntakeDuplicateMatch } from '../intake-duplicate-decision/intake-duplicate-decision.validation';
export type IntakeDecisionReviewModel = {
  intakeId: string; intakeVersion: number; revision: string; resolved: boolean;
  /** Duplicate flags require a valid explicit choice; plain create must never bypass that review. */
  duplicateRequired: boolean; decision: 'create' | 'dismiss' | IntakeDuplicateChoice;
  matches: readonly IntakeDuplicateMatch[];
  definition: CaptureFormFieldEditorValue; definitionVersion: number; answers: IntakeProposedAnswers;
  workflowVersion: number; workflow: readonly { label: string; value: string }[];
  access: 'ready' | 'checking' | 'blocked'; capacity: 'available' | 'checking' | 'exhausted' | 'error';
  canCreate: boolean; canLink: boolean; canDismiss: boolean;
};
type IntakeDecisionBase = { intakeId: string; expectedVersion: number; reviewRevision: string };
type IntakeDecisionPayload = (
  { kind: 'create' | 'separate'; definitionVersion: number; workflowVersion: number; answers: IntakeProposedAnswers }
  | { kind: 'link'; leadId: string; expectedLeadVersion: number; changeIds: readonly string[] }
  | { kind: 'dismiss' }
);
export type IntakeDecisionDraftRequest = IntakeDecisionBase & IntakeDecisionPayload;
export type IntakeDecisionRequest = IntakeDecisionDraftRequest & { requestId: string };
export const intakeDecisionKind = (review: IntakeDecisionReviewModel) => typeof review.decision === 'string' ? review.decision : review.decision.kind;
export function intakeDecisionIssue(review: IntakeDecisionReviewModel): 'invalid' | 'resolved' | 'choice' | 'fields' | 'permission' | 'checking' | 'blocked' | 'capacity' | 'capacityError' | null {
  const context = { intakeId: review.intakeId, intakeVersion: review.intakeVersion, revision: review.revision, resolved: review.resolved };
  if (!validIntakeDuplicateReview(context, review.matches)) return 'invalid';
  if (review.resolved) return 'resolved';
  if (review.access === 'checking') return 'checking';
  if (review.access !== 'ready') return 'blocked';
  if (review.duplicateRequired || typeof review.decision !== 'string') {
    if (typeof review.decision === 'string' || !validIntakeDuplicateChoice(context, review.matches, review.decision)) return 'choice';
  }
  const kind = intakeDecisionKind(review);
  if (!(kind === 'dismiss' ? review.canDismiss : kind === 'link' ? review.canLink : review.canCreate)) return 'permission';
  if (kind === 'dismiss' || kind === 'link') return null;
  if (!Number.isSafeInteger(review.definitionVersion) || review.definitionVersion < 1 || !Number.isSafeInteger(review.workflowVersion) || review.workflowVersion < 1 || !review.workflow.length || review.workflow.some(row => !row.label.trim() || !row.value.trim())) return 'invalid';
  if (!validIntakeEditorDefinition({ id: review.intakeId, version: review.intakeVersion, resolved: review.resolved }, review.definition)) return 'invalid';
  if (Object.keys(validateIntakeProposedAnswers(review.definition, review.answers)).length) return 'fields';
  if (review.capacity === 'checking') return 'checking';
  if (review.capacity === 'exhausted') return 'capacity';
  if (review.capacity !== 'available') return 'capacityError';
  return null;
}
export function intakeDecisionRequest(review: IntakeDecisionReviewModel): IntakeDecisionDraftRequest | null {
  if (intakeDecisionIssue(review)) return null;
  const base = { intakeId: review.intakeId, expectedVersion: review.intakeVersion, reviewRevision: review.revision };
  const kind = intakeDecisionKind(review);
  if (kind === 'dismiss') return { ...base, kind };
  if (kind === 'link' && typeof review.decision !== 'string' && review.decision.kind === 'link') return { ...base, kind, leadId: review.decision.leadId, expectedLeadVersion: review.decision.leadVersion, changeIds: [...review.decision.changeIds] } as IntakeDecisionDraftRequest;
  const answers = Object.fromEntries(review.definition.fields.map(field => {
    const raw = Object.hasOwn(review.answers, field.id) ? review.answers[field.id] : '';
    if (field.type === 'checkboxes') return [field.id, field.options.filter(option => Array.isArray(raw) && raw.includes(option.id)).map(option => option.id)];
    const text = typeof raw === 'string' ? raw.trim() : '';
    return [field.id, field.type === 'email' ? text.toLowerCase() : text];
  }));
  return { ...base, kind, definitionVersion: review.definitionVersion, workflowVersion: review.workflowVersion, answers } as IntakeDecisionDraftRequest;
}
