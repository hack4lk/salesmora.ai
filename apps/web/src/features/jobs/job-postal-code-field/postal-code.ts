/** First coverage slice supports US ZIPs. Never parse geography from an address. */
export function normalizeJobZip(value: string): string | null {
  const parsed = usPostalCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function parseWorkZipCodes(value: string): { codes: string[]; invalid: string[] } {
  const tokens = value.trim().split(/[\s,;]+/).filter(Boolean);
  return { codes: [...new Set(tokens.map(normalizeJobZip).filter((code): code is string => code !== null))],
    invalid: tokens.filter(code => normalizeJobZip(code) === null) };
}
import { usPostalCodeSchema } from '@salesmora/contracts';
