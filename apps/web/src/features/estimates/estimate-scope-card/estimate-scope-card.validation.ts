import { estimateScopeCardData as c } from "./estimate-scope-card.data";

/** Presentation check only; authoritative contracts are added during connection. */
export function validateEstimateScope(value: string): string | undefined {
  return value.length > c.limit ? c.tooLong : undefined;
}
