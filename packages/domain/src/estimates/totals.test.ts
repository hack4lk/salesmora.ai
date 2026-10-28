import { describe, expect, it } from "vitest";
import { calculateEstimateTotals, type EstimateAdjustment, type EstimateTotalsValues } from "./totals";
import type { EstimateItemInput } from "./items";

const taxable: EstimateItemInput = {
  description: "Materials", quantity: "1", unitPrice: "600.00", taxable: true, included: false,
};
const nonTaxable: EstimateItemInput = { ...taxable, description: "Labor", unitPrice: "400.00", taxable: false };
const base = {
  items: [taxable, nonTaxable],
  discount: { type: "none" },
  taxRate: "8.875",
  deposit: { type: "none" },
} satisfies EstimateTotalsValues & { items: EstimateItemInput[]; deposit: EstimateAdjustment };
const calculate = (patch: Partial<Parameters<typeof calculateEstimateTotals>[0]> = {}) => calculateEstimateTotals({ ...base, ...patch });

describe("estimate totals", () => {
  it("returns exact cents and the approved milli-percent representation", () => {
    const result = calculate();
    expect(result).toMatchObject({
      errors: {}, taxRateMilliPercent: 8875,
      discountCents: 0, taxableDiscountCents: 0, nonTaxableDiscountCents: 0,
      taxableAfterDiscountCents: 60000, taxCents: 5325, totalCents: 105325, depositCents: 0, balanceCents: 105325,
    });
  });
  it.each([
    { type: "amount", value: "100.00" },
    { type: "percent", value: "10" },
  ] satisfies EstimateAdjustment[])("splits a $100 discount proportionally before tax (%s)", (discount) => {
    expect(calculate({ discount, deposit: { type: "percent", value: "25" } })).toMatchObject({
      errors: {}, discountCents: 10000, taxableDiscountCents: 6000, nonTaxableDiscountCents: 4000,
      taxableAfterDiscountCents: 54000, taxCents: 4793, totalCents: 94793, depositCents: 23698, balanceCents: 71095,
    });
  });
  it("rounds a half-cent taxable discount up and assigns only the remainder to non-taxable", () => {
    const result = calculate({
      items: [{ ...taxable, unitPrice: "0.01" }, { ...nonTaxable, unitPrice: "0.01" }],
      discount: { type: "amount", value: "0.01" }, taxRate: "100",
    });
    expect(result).toMatchObject({
      discountCents: 1, taxableDiscountCents: 1, nonTaxableDiscountCents: 0,
      taxableAfterDiscountCents: 0, taxCents: 0, totalCents: 1,
    });
  });
  it("rounds a percent discount to cents before allocating it, not each category separately", () => {
    const result = calculate({
      items: [{ ...taxable, unitPrice: "0.01" }, { ...nonTaxable, unitPrice: "0.01" }],
      discount: { type: "percent", value: "25" }, taxRate: "0",
    });
    expect(result.discountCents).toBe(1);
    expect(result.taxableDiscountCents).toBe(1);
    expect(result.nonTaxableDiscountCents).toBe(0);
    expect(result.totalCents).toBe(1);
  });
  it.each([
    ["49.999", 0], ["50", 1], ["50.001", 1],
  ])("rounds tax on a cent at %s percent to %i cents", (taxRate, taxCents) => {
    expect(calculate({ items: [{ ...taxable, unitPrice: "0.01" }], taxRate }).taxCents).toBe(taxCents);
  });
  it("taxes only the discounted taxable subtotal, not individual lines", () => {
    expect(calculate({
      items: Array.from({ length: 3 }, () => ({ ...taxable, unitPrice: "0.01" })), taxRate: "10",
    }).taxCents).toBe(0);
  });
  it("allows no taxable lines without inventing taxable amounts", () => {
    expect(calculate({ items: [nonTaxable], discount: { type: "amount", value: "10" } })).toMatchObject({
      taxableDiscountCents: 0, nonTaxableDiscountCents: 1000, taxableAfterDiscountCents: 0, taxCents: 0, totalCents: 39000,
    });
  });
  it("allocates all discount to taxable when every line is taxable", () => {
    expect(calculate({ items: [taxable], discount: { type: "amount", value: "10" } })).toMatchObject({
      taxableDiscountCents: 1000, nonTaxableDiscountCents: 0, taxableAfterDiscountCents: 59000,
    });
  });
  it.each(["100", "100.000"])("permits a %s%% discount with zero total/deposit/balance", (value) => {
    expect(calculate({ discount: { type: "percent", value }, deposit: { type: "percent", value: "100" } }))
      .toMatchObject({ errors: {}, totalCents: 0, taxCents: 0, depositCents: 0, balanceCents: 0 });
  });
  it("permits a fixed discount equal to the full subtotal", () => {
    expect(calculate({ discount: { type: "amount", value: "1000" } }).totalCents).toBe(0);
  });
  it("handles all included lines without division by zero", () => {
    expect(calculate({ items: [{ ...taxable, unitPrice: "0", included: true }] })).toMatchObject({
      errors: {}, discountCents: 0, taxableDiscountCents: 0, nonTaxableDiscountCents: 0,
      totalCents: 0, depositCents: 0, balanceCents: 0,
    });
  });
  it("rejects a fixed discount one cent above the subtotal instead of clamping", () => {
    expect(calculate({ discount: { type: "amount", value: "1000.01" } })).toMatchObject({
      errors: { discount: "discount-exceeds-subtotal" }, discountCents: null, taxCents: null,
      totalCents: null, depositCents: null, balanceCents: null,
    });
  });
  it.each(["", " ", "-1", "100.001", "100.0001", "8.8751", "1e1", "NaN", "Infinity", "1,000", "+1"])(
    "rejects invalid percentage %s consistently for tax, discount and deposit", (value) => {
      expect(calculate({ taxRate: value })).toMatchObject({ errors: { taxRate: "tax-rate" }, taxCents: null, totalCents: null });
      expect(calculate({ discount: { type: "percent", value } })).toMatchObject({ errors: { discount: "discount-percent" }, totalCents: null });
      expect(calculate({ deposit: { type: "percent", value } })).toMatchObject({ errors: { deposit: "deposit-percent" }, totalCents: 105325, depositCents: null });
    },
  );
  it.each(["", " ", "-0.01", "0.001", "1e2", "NaN", "Infinity", "$10", "1,000", "100000000", "+1"])(
    "rejects malformed fixed amounts %s", (value) => {
      expect(calculate({ discount: { type: "amount", value } }).errors.discount).toBe("discount-amount");
      expect(calculate({ deposit: { type: "amount", value } }).errors.deposit).toBe("deposit-amount");
    },
  );
  it("accepts trimmed and fractional input without binary floating-point artifacts", () => {
    expect(calculate({ taxRate: " .125 ", discount: { type: "percent", value: "0.001" } })).toMatchObject({
      taxRateMilliPercent: 125, discountCents: 1, taxCents: 75, totalCents: 100074,
    });
  });
  it("uses the final tax-inclusive total as the percentage-deposit base", () => {
    expect(calculate({ deposit: { type: "percent", value: "25" } })).toMatchObject({
      totalCents: 105325, depositCents: 26331, balanceCents: 78994,
    });
  });
  it.each([["49.999", 0], ["50", 1], ["50.001", 1]])("rounds a %s%% deposit half up", (value, cents) => {
    expect(calculate({ items: [{ ...nonTaxable, unitPrice: "0.01" }], deposit: { type: "percent", value } }).depositCents).toBe(cents);
  });
  it.each([{ type: "amount", value: "1053.25" }, { type: "percent", value: "100" }] satisfies EstimateAdjustment[])(
    "allows a deposit equal to the final total (%s)", (deposit) => {
      expect(calculate({ deposit })).toMatchObject({ errors: {}, depositCents: 105325, balanceCents: 0 });
    },
  );
  it("reports an over-total fixed deposit and preserves the valid total, not a negative balance", () => {
    expect(calculate({ deposit: { type: "amount", value: "1053.26" } })).toMatchObject({
      errors: { deposit: "deposit-exceeds-total" }, totalCents: 105325, depositCents: null, balanceCents: null,
    });
  });
  it("revalidates a fixed deposit when changes reduce the final total", () => {
    expect(calculate({ deposit: { type: "amount", value: "1000" } }).errors).toEqual({});
    expect(calculate({ discount: { type: "amount", value: "100" }, deposit: { type: "amount", value: "1000" } }).errors)
      .toEqual({ deposit: "deposit-exceeds-total" });
  });
  it("calculates the maximum permitted subtotal at 100% tax without capping the final total at the subtotal limit", () => {
    expect(calculate({
      items: [{ ...taxable, quantity: "10", unitPrice: "1000000" }],
      taxRate: "100", deposit: { type: "amount", value: "20000000.00" },
    })).toMatchObject({ errors: {}, taxCents: 1_000_000_000, totalCents: 2_000_000_000, depositCents: 2_000_000_000, balanceCents: 0 });
  });
  it.each([
    { items: [] }, { items: [{ ...taxable, unitPrice: "" }] },
    { items: [{ ...taxable, quantity: "10.001", unitPrice: "1000000" }] },
    { items: [{ ...taxable, quantity: "10", unitPrice: "1000000" }, nonTaxable] },
  ])("does not turn incomplete or over-limit items into valid zero totals", ({ items }) => {
    const result = calculate({ items });
    expect(result.totalCents).toBeNull();
    expect(result.depositCents).toBeNull();
    expect(result.taxableAfterDiscountCents).toBeNull();
  });
  it("validates independent fields even when items are invalid", () => {
    expect(calculate({
      items: [], taxRate: "", discount: { type: "percent", value: "-1" }, deposit: { type: "percent", value: "101" },
    }).errors).toEqual({ discount: "discount-percent", taxRate: "tax-rate", deposit: "deposit-percent" });
  });
  it("preserves valid discount information if the tax rate is invalid", () => {
    expect(calculate({ discount: { type: "amount", value: "100" }, taxRate: "invalid" })).toMatchObject({
      discountCents: 10000, taxableAfterDiscountCents: 54000, taxCents: null, totalCents: null,
    });
  });
  it("does not mutate any source values or items", () => {
    const input = Object.freeze({
      items: Object.freeze([Object.freeze({ ...taxable }), Object.freeze({ ...nonTaxable })]),
      discount: Object.freeze({ type: "percent", value: "10.000" } as const),
      taxRate: " 8.875 ",
      deposit: Object.freeze({ type: "amount", value: "10.00" } as const),
    });
    calculateEstimateTotals(input);
    expect(input.discount.value).toBe("10.000");
    expect(input.taxRate).toBe(" 8.875 ");
    expect(input.items[0].unitPrice).toBe("600.00");
  });
  it("preserves money, allocation and order invariants across 1000 mixed-value cases", () => {
    for (let seed = 0; seed < 1000; seed++) {
      const taxableCents = seed * 37;
      const nonTaxableCents = (1000 - seed) * 29;
      const dollars = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
      const items = [
        { ...taxable, unitPrice: dollars(taxableCents), included: taxableCents === 0 },
        { ...nonTaxable, unitPrice: dollars(nonTaxableCents) },
      ];
      const input = {
        ...base, items, taxRate: `${seed % 101}`,
        discount: { type: "percent", value: `${seed % 101}` } as const,
        deposit: { type: "percent", value: `${(seed * 3) % 101}` } as const,
      };
      const result = calculateEstimateTotals(input);
      expect(result.errors).toEqual({});
      expect(result.discountCents).toBe((result.taxableDiscountCents ?? -1) + (result.nonTaxableDiscountCents ?? -1));
      expect(result.taxableDiscountCents).toBeLessThanOrEqual(taxableCents);
      expect(result.nonTaxableDiscountCents).toBeLessThanOrEqual(nonTaxableCents);
      expect(result.totalCents).toBe(taxableCents + nonTaxableCents - (result.discountCents ?? -1) + (result.taxCents ?? -1));
      expect(result.totalCents).toBe((result.depositCents ?? -1) + (result.balanceCents ?? -1));
      expect(result.balanceCents).toBeGreaterThanOrEqual(0);
      expect(calculateEstimateTotals({ ...input, items: [...items].reverse() }).totalCents).toBe(result.totalCents);
      for (const key of ["discountCents", "taxCents", "totalCents", "depositCents", "balanceCents"] as const) {
        expect(Number.isSafeInteger(result[key])).toBe(true);
      }
    }
  });
});
