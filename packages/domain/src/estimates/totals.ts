import { parseEstimateDecimal, roundEstimateHalfUp } from "./decimal";
import { calculateEstimateItems, type EstimateItemInput, type EstimateItemsCalculation } from "./items";

export type EstimateAdjustment =
  | { type: "none" }
  | { type: "percent" | "amount"; value: string };
export type EstimateTotalsValues = {
  discount: EstimateAdjustment;
  taxRate: string;
};
export type EstimateTotalsError =
  | "discount-percent" | "discount-amount" | "discount-exceeds-subtotal"
  | "tax-rate"
  | "deposit-percent" | "deposit-amount" | "deposit-exceeds-total";
export type EstimateTotalsCalculation = {
  items: EstimateItemsCalculation;
  errors: Partial<Record<"discount" | "taxRate" | "deposit", EstimateTotalsError>>;
  taxRateMilliPercent: number | null;
  discountCents: number | null;
  taxableDiscountCents: number | null;
  nonTaxableDiscountCents: number | null;
  taxableAfterDiscountCents: number | null;
  taxCents: number | null;
  totalCents: number | null;
  depositCents: number | null;
  balanceCents: number | null;
};

function percent(value: string): bigint | null {
  const parsed = parseEstimateDecimal(value, 3, 3);
  return parsed !== null && parsed <= 100000n ? parsed : null;
}

function adjustmentValue(adjustment: EstimateAdjustment): bigint | null {
  if (adjustment.type === "none") return 0n;
  return adjustment.type === "percent"
    ? percent(adjustment.value)
    : parseEstimateDecimal(adjustment.value, 2, 8);
}

/** All dependent amounts remain unavailable until their inputs are valid; never clamp money. */
export function calculateEstimateTotals({
  items,
  discount,
  taxRate,
  deposit,
}: EstimateTotalsValues & { items: readonly EstimateItemInput[]; deposit: EstimateAdjustment }): EstimateTotalsCalculation {
  const lines = calculateEstimateItems(items);
  const discountValue = adjustmentValue(discount);
  const depositValue = adjustmentValue(deposit);
  const rate = percent(taxRate);
  const result: EstimateTotalsCalculation = {
    items: lines,
    errors: {},
    taxRateMilliPercent: rate === null ? null : Number(rate),
    discountCents: null, taxableDiscountCents: null, nonTaxableDiscountCents: null,
    taxableAfterDiscountCents: null, taxCents: null, totalCents: null, depositCents: null, balanceCents: null,
  };
  if (discountValue === null) result.errors.discount = discount.type === "percent" ? "discount-percent" : "discount-amount";
  if (rate === null) result.errors.taxRate = "tax-rate";
  if (depositValue === null) result.errors.deposit = deposit.type === "percent" ? "deposit-percent" : "deposit-amount";
  if (lines.subtotalCents === null || lines.taxableSubtotalCents === null || discountValue === null) return result;

  const subtotal = BigInt(lines.subtotalCents);
  const taxable = BigInt(lines.taxableSubtotalCents);
  const discountCents = discount.type === "percent" ? roundEstimateHalfUp(subtotal * discountValue, 100000n) : discountValue;
  if (discountCents > subtotal) {
    result.errors.discount = "discount-exceeds-subtotal";
    return result;
  }
  // Round only the taxable share; the remainder preserves the exact overall discount.
  const taxableDiscount = subtotal === 0n ? 0n : roundEstimateHalfUp(discountCents * taxable, subtotal);
  const taxableAfterDiscount = taxable - taxableDiscount;
  result.discountCents = Number(discountCents);
  result.taxableDiscountCents = Number(taxableDiscount);
  result.nonTaxableDiscountCents = Number(discountCents - taxableDiscount);
  result.taxableAfterDiscountCents = Number(taxableAfterDiscount);
  if (rate === null) return result;

  const tax = roundEstimateHalfUp(taxableAfterDiscount * rate, 100000n);
  const total = subtotal - discountCents + tax;
  result.taxCents = Number(tax);
  result.totalCents = Number(total);
  if (depositValue === null) return result;

  const depositCents = deposit.type === "percent" ? roundEstimateHalfUp(total * depositValue, 100000n) : depositValue;
  if (depositCents > total) {
    result.errors.deposit = "deposit-exceeds-total";
    return result;
  }
  result.depositCents = Number(depositCents);
  result.balanceCents = Number(total - depositCents);
  return result;
}
