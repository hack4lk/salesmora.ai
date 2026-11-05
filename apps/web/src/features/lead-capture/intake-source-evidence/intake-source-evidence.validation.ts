export type IntakeEvidenceOrigin = { kind: 'email'; location: 'from' | 'subject' | 'body'; quote: string } | { kind: 'form'; answerId: string; quote: string };
export type IntakeFieldEvidence = { id: string; label: string; uncertain?: boolean; origin: IntakeEvidenceOrigin | null };
type Base = { intakeId: string; version: number; sourceName: string; receivedAt: string | null; fields: readonly IntakeFieldEvidence[] };
export type IntakeEvidenceSnapshot = Base & (
  { type: 'gmail'; from: string; subject: string; body: string }
  | { type: 'website'; answers: readonly { id: string; label: string; value: string }[] }
);
export function validIntakeEvidenceSnapshot(snapshot: IntakeEvidenceSnapshot | undefined): snapshot is IntakeEvidenceSnapshot {
  return !!snapshot && !!snapshot.intakeId.trim() && Number.isSafeInteger(snapshot.version) && snapshot.version > 0 && !!snapshot.sourceName.trim()
    && ['gmail', 'website'].includes(snapshot.type)
    && new Set(snapshot.fields.map(field => field.id)).size === snapshot.fields.length
    && snapshot.fields.every(field => !!field.id.trim() && !!field.label.trim())
    && (snapshot.type !== 'website' || new Set(snapshot.answers.map(answer => answer.id)).size === snapshot.answers.length && snapshot.answers.every(answer => !!answer.id.trim() && !!answer.label.trim()));
}
/** Quotes must exist verbatim in the indicated immutable source, not in reviewer corrections. */
export function verifiedIntakeEvidence(snapshot: IntakeEvidenceSnapshot, origin: IntakeEvidenceOrigin | null): boolean {
  if (!origin?.quote.trim()) return false;
  if (snapshot.type === 'gmail' && origin.kind === 'email') return ['from', 'subject', 'body'].includes(origin.location) && snapshot[origin.location].includes(origin.quote);
  if (snapshot.type === 'website' && origin.kind === 'form') return !!snapshot.answers.find(answer => answer.id === origin.answerId)?.value.includes(origin.quote);
  return false;
}
