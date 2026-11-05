export type IntakeDuplicateChange = { id: string; label: string; existing: string; proposed: string };
export type IntakeDuplicateMatch = { id: string; version: number; name: string; contact: string; reason: string; canLink: boolean; changes: readonly IntakeDuplicateChange[] };
export type IntakeDuplicateReview = {
  intakeId: string; intakeVersion: number;
  /** Host advances this opaque revision when corrections, candidate data, access or versions change. */
  revision: string; resolved: boolean;
};
export type IntakeDuplicateChoice = { reviewRevision: string } & ({ kind: 'link'; leadId: string; leadVersion: number; changeIds: readonly string[] } | { kind: 'separate' | 'dismiss' });
export function validIntakeDuplicateReview(review: IntakeDuplicateReview, matches: readonly IntakeDuplicateMatch[]): boolean {
  return !!review.intakeId.trim() && Number.isSafeInteger(review.intakeVersion) && review.intakeVersion > 0 && !!review.revision.trim()
    && new Set(matches.map(match => match.id)).size === matches.length && matches.every(match => !!match.id.trim() && !!match.name.trim() && Number.isSafeInteger(match.version) && match.version > 0
      && new Set(match.changes.map(change => change.id)).size === match.changes.length && match.changes.every(change => !!change.id.trim() && !!change.label.trim()));
}
export function validIntakeDuplicateChoice(review: IntakeDuplicateReview, matches: readonly IntakeDuplicateMatch[], choice: IntakeDuplicateChoice | null): boolean {
  if (!choice || choice.reviewRevision !== review.revision || review.resolved) return false;
  if (choice.kind !== 'link') return choice.kind === 'separate' || choice.kind === 'dismiss';
  const match = matches.find(match => match.id === choice.leadId);
  return !!match?.canLink && choice.leadVersion === match.version && new Set(choice.changeIds).size === choice.changeIds.length
    && choice.changeIds.every(id => match.changes.some(change => change.id === id && change.existing !== change.proposed));
}
