import { estimateItemLimits } from "@salesmora/domain";
import type { MaterialPickerOption } from "../../materials/material-picker/material-picker";
import type { EstimateEditorItem } from "./estimate-items-editor";

/** Copy only permitted catalog data; estimates never track subsequent catalog changes. */
export function estimateItemFromMaterial(
  material: MaterialPickerOption,
  id: string,
  canViewPrices: boolean,
): { item: EstimateEditorItem; error: null } | { item: null; error: "invalid-material" } {
  const price = canViewPrices ? material.priceCents : null;
  if (!material.name.trim() || material.name.length > estimateItemLimits.descriptionLength ||
    (price !== null && (!Number.isSafeInteger(price) || price < 0 || price > estimateItemLimits.unitPriceCents))) {
    return { item: null, error: "invalid-material" };
  }
  return {
    item: {
      id,
      description: material.name,
      quantity: "1",
      unitPrice: price === null ? "" : `${Math.floor(price / 100)}.${String(price % 100).padStart(2, "0")}`,
      included: false,
      taxable: false,
      catalog: { id: material.id, name: material.name, unit: material.unit, sku: material.sku },
    },
    error: null,
  };
}
