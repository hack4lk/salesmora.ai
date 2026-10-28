import { estimateInternalNotesCardData as c } from "./estimate-internal-notes-card.data";

/** Presentation check only; authoritative contracts are added during connection. */
export function validateEstimateInternalNotes(value: string): string | undefined {
  return value.length > c.limit ? c.tooLong : undefined;
}
