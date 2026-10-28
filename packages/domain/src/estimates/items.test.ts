import { describe, expect, it } from "vitest";
import { calculateEstimateItems, estimateItemLimits, type EstimateItemInput } from "./items";

const line: EstimateItemInput = {
  description: "Installation", quantity: "1", unitPrice: "100.00", taxable: true, included: false,
};
const calculate = (patch: Partial<EstimateItemInput> = {}) => calculateEstimateItems([{ ...line, ...patch }]);

describe("estimate item calculation", () => {
  it("uses integer cents and separates taxable amounts without mutating inputs", () => {
    const items = Object.freeze([
      Object.freeze({ ...line, quantity: "2.5", unitPrice: "12.34" }),
      Object.freeze({ ...line, taxable: false, unitPrice: "100.00" }),
    ]);
    expect(calculateEstimateItems(items)).toEqual({
      items: [{ amountCents: 3085, errors: {} }, { amountCents: 10000, errors: {} }],
      subtotalCents: 13085, taxableSubtotalCents: 3085, error: null,
    });
  });

  it.each([
    ["0.499", "0.01", 0], ["0.5", "0.01", 1], ["0.501", "0.01", 1],
    ["1.005", "1.00", 101], ["0.1", "0.20", 2], [".125", "1.", 13],
    ["1", ".01", 1], [" 2.500 ", " 12.34 ", 3085],
  ])("rounds %s × %s half up to %i cents", (quantity, unitPrice, amountCents) => {
    expect(calculate({ quantity, unitPrice }).subtotalCents).toBe(amountCents);
  });

  it("sums rounded lines rather than rounding the combined product", () => {
    const result = calculateEstimateItems(Array.from({ length: 3 }, () => ({ ...line, quantity: "0.5", unitPrice: "0.01" })));
    expect(result.subtotalCents).toBe(3);
  });

  it.each(["", " ", "0", "-1", "1.0001", "1e3", "NaN", "Infinity", "1,000", "1000000000", "+1"])(
    "rejects quantity %s", (quantity) => {
      const result = calculate({ quantity });
      expect(result.items[0].errors.quantity).toBe("quantity");
      expect(result.items[0].amountCents).toBeNull();
      expect(result.subtotalCents).toBeNull();
    },
  );
  it("accepts the numeric(12,3) quantity ceiling without losing precision", () => {
    expect(calculate({ quantity: "999999999.999", unitPrice: "0", included: true }).subtotalCents).toBe(0);
  });
  it.each(["", " ", "-0.01", "1.001", "1e2", "NaN", "Infinity", "$1.00", "1,000.00", "1000000.01", "+1"])(
    "rejects unit price %s", (unitPrice) => {
      const result = calculate({ unitPrice });
      expect(result.items[0].errors.unitPrice).toBe("unit-price");
      expect(result.subtotalCents).toBeNull();
    },
  );
  it("requires explicit no-charge approval for a zero unit price", () => {
    expect(calculate({ unitPrice: "0" }).items[0].errors.unitPrice).toBe("zero-price");
    expect(calculate({ unitPrice: "0", included: true }).subtotalCents).toBe(0);
    expect(calculate({ included: true }).items[0].errors.unitPrice).toBe("included-price");
  });
  it.each(["", "  ", "x".repeat(201)])("rejects description %s without presenting a valid subtotal", (description) => {
    expect(calculate({ description }).items[0].errors.description).toBe("description");
    expect(calculate({ description }).subtotalCents).toBeNull();
  });
  it("accepts exactly 200 description characters", () => {
    expect(calculate({ description: "x".repeat(200) }).subtotalCents).toBe(10000);
  });
  it("accepts exactly $1m/unit and $10m/line but rejects one cent over the line limit", () => {
    expect(calculate({ unitPrice: "1000000", quantity: "10" }).subtotalCents).toBe(estimateItemLimits.amountCents);
    const amountOver = calculate({ unitPrice: "0.02", quantity: "500000000.5" });
    expect(amountOver.items[0].errors.amount).toBe("amount-limit");
    expect(amountOver.items[0].amountCents).toBeNull();
  });
  it("accepts the exact subtotal cap and rejects one cent above it without clamping", () => {
    const max = { ...line, unitPrice: "1000000", quantity: "10" };
    expect(calculateEstimateItems([max]).subtotalCents).toBe(1_000_000_000);
    const result = calculateEstimateItems([max, { ...line, unitPrice: "0.01" }]);
    expect(result.error).toBe("subtotal-limit");
    expect(result.subtotalCents).toBeNull();
    expect(result.taxableSubtotalCents).toBeNull();
  });
  it("detects products above Number.MAX_SAFE_INTEGER using exact arithmetic", () => {
    expect(calculate({ unitPrice: "1000000", quantity: "999999999.999" }).items[0].errors.amount).toBe("amount-limit");
  });
  it("accepts 100 lines, rejects 101 and requires at least one item", () => {
    expect(calculateEstimateItems(Array.from({ length: 100 }, () => line)).subtotalCents).toBe(1_000_000);
    expect(calculateEstimateItems(Array.from({ length: 101 }, () => line)).error).toBe("too-many-items");
    expect(calculateEstimateItems([])).toEqual({
      items: [], subtotalCents: null, taxableSubtotalCents: null, error: "empty-items",
    });
  });
  it("never includes invalid or unpriced items as zero in a partial subtotal", () => {
    const result = calculateEstimateItems([line, { ...line, unitPrice: "" }]);
    expect(result.items[0].amountCents).toBe(10000);
    expect(result.items[1].amountCents).toBeNull();
    expect(result.subtotalCents).toBeNull();
  });
  it("preserves line/subtotal invariants across decimal quantities and mixed taxable flags", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const items = Array.from({ length: 10 }, (_, index) => {
        const millis = seed * (index + 1) * 37;
        return {
          ...line, quantity: `${Math.floor(millis / 1000)}.${String(millis % 1000).padStart(3, "0")}`,
          unitPrice: "0.37", taxable: index % 2 === 0,
        };
      });
      const amounts = items.map((_, index) => Math.floor((seed * (index + 1) * 37 * 37 + 500) / 1000));
      const result = calculateEstimateItems(items);
      expect(result.subtotalCents).toBe(amounts.reduce((sum, amount) => sum + amount, 0));
      expect(result.taxableSubtotalCents).toBe(amounts.reduce((sum, amount, index) => sum + (index % 2 === 0 ? amount : 0), 0));
      expect(calculateEstimateItems([...items].reverse()).subtotalCents).toBe(result.subtotalCents);
      expect(result.items.every((item) => Number.isSafeInteger(item.amountCents))).toBe(true);
    }
  });
});
