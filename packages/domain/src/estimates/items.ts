import { parseEstimateDecimal, roundEstimateHalfUp } from "./decimal";

export const estimateItemLimits = {
  count: 100,
  descriptionLength: 200,
  unitPriceCents: 100_000_000,
  amountCents: 1_000_000_000,
  subtotalCents: 1_000_000_000,
} as const;

/** Decimal strings preserve what was typed without binary floating-point conversion. */
export type EstimateItemInput = {
  description: string;
  quantity: string;
  unitPrice: string;
  taxable: boolean;
  included: boolean;
};
export type EstimateItemError =
  | "description"
  | "quantity"
  | "unit-price"
  | "zero-price"
  | "included-price"
  | "amount-limit";
export type EstimateItemCalculation = {
  amountCents: number | null;
  errors: Partial<Record<"description" | "quantity" | "unitPrice" | "amount", EstimateItemError>>;
};
export type EstimateItemsCalculation = {
  items: EstimateItemCalculation[];
  subtotalCents: number | null;
  taxableSubtotalCents: number | null;
  error: "empty-items" | "too-many-items" | "subtotal-limit" | null;
};

function calculateItem(item: EstimateItemInput): EstimateItemCalculation {
  const errors: EstimateItemCalculation["errors"] = {};
  if (!item.description.trim() || item.description.length > estimateItemLimits.descriptionLength) {
    errors.description = "description";
  }
  const quantity = parseEstimateDecimal(item.quantity, 3, 9);
  const price = parseEstimateDecimal(item.unitPrice, 2, 7);
  if (quantity === null || quantity <= 0n) errors.quantity = "quantity";
  if (price === null || price > BigInt(estimateItemLimits.unitPriceCents)) errors.unitPrice = "unit-price";
  else if (price === 0n && !item.included) errors.unitPrice = "zero-price";
  else if (price !== 0n && item.included) errors.unitPrice = "included-price";
  let amountCents: number | null = null;
  if (!errors.quantity && !errors.unitPrice && quantity !== null && price !== null) {
    // Positive values only: round the exact product half up from thousandths of a cent.
    const rounded = roundEstimateHalfUp(quantity * price, 1000n);
    if (rounded > BigInt(estimateItemLimits.amountCents)) errors.amount = "amount-limit";
    else amountCents = Number(rounded);
  }
  return { amountCents, errors };
}

/** Shared by presentation and future server/assistant wiring; invalid totals stay unavailable. */
export function calculateEstimateItems(items: readonly EstimateItemInput[]): EstimateItemsCalculation {
  if (!items.length || items.length > estimateItemLimits.count) {
    return {
      items: [], subtotalCents: null, taxableSubtotalCents: null,
      error: items.length ? "too-many-items" : "empty-items",
    };
  }
  const calculated = items.map(calculateItem);
  if (calculated.some((item) => Object.keys(item.errors).length > 0)) {
    return { items: calculated, subtotalCents: null, taxableSubtotalCents: null, error: null };
  }
  let subtotal = 0;
  let taxableSubtotal = 0;
  calculated.forEach((item, index) => {
    if (item.amountCents !== null) {
      subtotal += item.amountCents;
      if (items[index].taxable) taxableSubtotal += item.amountCents;
    }
  });
  if (subtotal > estimateItemLimits.subtotalCents) {
    return { items: calculated, subtotalCents: null, taxableSubtotalCents: null, error: "subtotal-limit" };
  }
  return { items: calculated, subtotalCents: subtotal, taxableSubtotalCents: taxableSubtotal, error: null };
}
