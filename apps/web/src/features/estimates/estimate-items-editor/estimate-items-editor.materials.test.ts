import { describe, expect, it } from "vitest";
import { calculateEstimateItems } from "@salesmora/domain";
import { estimateItemFromMaterial } from "./estimate-items-editor.materials";

const material = { id: "material-1", name: "Copper pipe", unit: "ft", sku: "CU-34", priceCents: 520 };

describe("estimate lines from Materials", () => {
  it("copies an editable snapshot without changing the material or adding pricing assumptions", () => {
    const source = Object.freeze({ ...material });
    const result = estimateItemFromMaterial(source, "line-1", true);
    expect(result).toEqual({
      item: {
        id: "line-1", description: "Copper pipe", quantity: "1", unitPrice: "5.20",
        included: false, taxable: false,
        catalog: { id: "material-1", name: "Copper pipe", unit: "ft", sku: "CU-34" },
      },
      error: null,
    });
    expect(calculateEstimateItems(result.item ? [result.item] : []).subtotalCents).toBe(520);
    expect(source).toEqual(material);
  });
  it("never refreshes estimate content when a catalog object changes", () => {
    const source = { ...material };
    const result = estimateItemFromMaterial(source, "line-1", true);
    source.name = "Updated pipe";
    source.unit = "box";
    source.priceCents = 10000;
    expect(result.item?.description).toBe("Copper pipe");
    expect(result.item?.unitPrice).toBe("5.20");
    expect(result.item?.catalog?.unit).toBe("ft");
  });
  it.each([true, false])("keeps missing prices blank (price access %s)", (canViewPrices) => {
    const result = estimateItemFromMaterial({ ...material, priceCents: null }, "line-1", canViewPrices);
    expect(result.item?.unitPrice).toBe("");
    expect(result.item?.included).toBe(false);
  });
  it("does not leak a restricted price into the estimate or metadata", () => {
    const result = estimateItemFromMaterial(material, "line-1", false);
    expect(result.item?.unitPrice).toBe("");
    expect(result.item?.catalog).not.toHaveProperty("priceCents");
    expect(JSON.stringify(result)).not.toContain("520");
  });
  it("requires explicit no-charge selection even for catalog zero prices", () => {
    const result = estimateItemFromMaterial({ ...material, priceCents: 0 }, "line-1", true);
    expect(result.item?.unitPrice).toBe("0.00");
    expect(calculateEstimateItems(result.item ? [result.item] : []).items[0].errors.unitPrice).toBe("zero-price");
  });
  it.each([1, 99, 100, 101, 100_000_000])("copies %i cents exactly", (priceCents) => {
    const result = estimateItemFromMaterial({ ...material, priceCents }, "line-1", true);
    expect(calculateEstimateItems(result.item ? [result.item] : []).subtotalCents).toBe(priceCents);
  });
  it.each([-1, 1.5, NaN, Infinity, 100_000_001])("reports invalid permitted price %s rather than reducing it", (priceCents) => {
    expect(estimateItemFromMaterial({ ...material, priceCents }, "line-1", true))
      .toEqual({ item: null, error: "invalid-material" });
  });
  it.each(["", " ", "x".repeat(201)])("rejects invalid catalog name %s without truncation", (name) => {
    expect(estimateItemFromMaterial({ ...material, name }, "line-1", true).error).toBe("invalid-material");
  });
});
