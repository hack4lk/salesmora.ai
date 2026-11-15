export function validLeadConversionCounts(cohort: number, converted: number): boolean {
  return [cohort, converted].every(count => Number.isSafeInteger(count) && count >= 0) && converted <= cohort;
}

/** Call only with validated nonempty counts; the denominator is never substituted. */
export function formatLeadConversionRate(cohort: number, converted: number): string {
  if (!validLeadConversionCounts(cohort, converted) || cohort === 0) throw new RangeError('A conversion rate requires valid counts and a nonempty cohort.');
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(converted / cohort);
}
