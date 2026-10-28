export function parseEstimateDecimal(value: string, decimals: 2 | 3, wholeDigits: number): bigint | null {
  const text = value.trim();
  const pattern = new RegExp(`^(?:\\d{1,${wholeDigits}}(?:\\.\\d{0,${decimals}})?|\\.\\d{1,${decimals}})$`);
  if (!pattern.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole || "0") * (decimals === 3 ? 1000n : 100n) +
    BigInt(fraction.padEnd(decimals, "0"));
}

/** Nonnegative values only; avoids floating-point products and fractions. */
export function roundEstimateHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (2n * numerator + denominator) / (2n * denominator);
}
