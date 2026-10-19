import { leadCreationProvenanceSchema } from '@salesmora/contracts';
/** Creation history is immutable app provenance; editing a source label never changes origin. */
export function leadOrigin(changes: unknown) {
  const value = leadCreationProvenanceSchema.parse(changes);
  return value.origin ?? (value.source === 'gmail' ? 'gmail' : 'manual');
}
