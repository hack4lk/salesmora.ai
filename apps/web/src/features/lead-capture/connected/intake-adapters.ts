import type { IntakeDetailView, IntakePreparedReview } from '@salesmora/contracts';
import type { IntakeEvidenceSnapshot } from '../intake-source-evidence/intake-source-evidence.validation';
import type { IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
export function intakeEvidence(view: IntakeDetailView): IntakeEvidenceSnapshot {
  const evidence = view.receipt.evidence, fields = view.configuration.fields ?? [];
  const base = { intakeId: view.item.id, version: view.item.version, sourceName: view.source.name, receivedAt: view.receipt.receivedAt,
    fields: fields.map(field => { const original = evidence.fields.find(row => row.fieldId === field.id); return { id: field.id, label: field.label, uncertain: original?.uncertain, origin: original?.origin ?? null }; }) };
  return evidence.type === 'gmail' ? { ...base, type: 'gmail', from: evidence.from, subject: evidence.subject, body: evidence.body } : { ...base, type: 'website', answers: Object.entries(evidence.answers).map(([id, value]) => ({ id, label: fields.find(field => field.id === id)?.label ?? id, value: Array.isArray(value) ? value.join(', ') : value })) };
}
export function intakeReview(view: IntakeDetailView, prepared: IntakePreparedReview | null, answers: IntakeDecisionReviewModel['answers'], decision: IntakeDecisionReviewModel['decision'], revision: string): IntakeDecisionReviewModel {
  const workflow = view.configuration.workflow!;
  return { intakeId: view.item.id, intakeVersion: view.item.version, revision: prepared?.reviewId ?? revision, resolved: view.item.status !== 'awaiting', duplicateRequired: prepared?.duplicateRequired ?? view.item.flags.includes('duplicate'), decision,
    matches: prepared?.candidates.map(({ leadId, leadVersion, ...row }) => ({ ...row, id: leadId, version: leadVersion })) ?? [],
    definition: { fields: view.configuration.fields!, contactRequired: view.configuration.contactRequired ?? false }, definitionVersion: view.item.definitionVersion, answers,
    workflowVersion: view.item.workflowVersion, workflow: [{ label: 'Stage', value: workflow.stage }, { label: 'Assignment', value: workflow.assignment.kind === 'default' ? 'Workspace default' : 'Configured teammate' }, { label: 'Tags', value: workflow.tags.join(', ') || 'None' }, { label: 'Assignment notification', value: workflow.notifyAssigned ? 'Enabled' : 'Disabled' }],
    access: prepared ? 'ready' : 'checking', capacity: prepared?.capacity ?? 'checking', ...view.capabilities, canCreate: view.capabilities.canCreate && (prepared?.assignmentReady ?? false) };
}
