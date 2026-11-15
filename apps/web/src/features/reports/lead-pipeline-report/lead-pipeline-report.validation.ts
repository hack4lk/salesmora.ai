export type LeadAgeBand = '0-7' | '8-14' | '15-30' | '31+';

/** The host supplies business-local date differences using the response timezone and snapshot. */
export function leadAgeBand(ageDays: number): LeadAgeBand | undefined {
  if (!Number.isSafeInteger(ageDays) || ageDays < 0) return undefined;
  return ageDays <= 7 ? '0-7' : ageDays <= 14 ? '8-14' : ageDays <= 30 ? '15-30' : '31+';
}
