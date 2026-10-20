import type { MaterialPatch, MaterialUnit, MaterialView } from '@salesmora/contracts';

export type MaterialFormValues = {
  name: string; sku: string; unit: MaterialUnit; category: string; supplier: string;
  cost: string; price: string; notes: string; imageUrl: string; sourceUrl: string;
};

export const emptyMaterialForm: MaterialFormValues = { name: '', sku: '', unit: 'each', category: '', supplier: '', cost: '', price: '', notes: '', imageUrl: '', sourceUrl: '' };

const dollars = (cents: number | null) => (cents === null ? '' : (cents / 100).toFixed(2));

export function formFromMaterial(material?: MaterialView): MaterialFormValues {
  if (!material) return emptyMaterialForm;
  return { name: material.name, sku: material.sku, unit: material.unit, category: material.category, supplier: material.supplier, cost: dollars(material.costCents), price: dollars(material.priceCents), notes: material.notes, imageUrl: material.imageUrl, sourceUrl: material.sourceUrl };
}

/** Whole cents from a typed dollar amount; null when blank, NaN when not a valid non-negative amount. */
export function parseDollars(value: string): number | null {
  const text = value.trim().replace(/^\$/u, '');
  if (text === '') return null;
  if (!/^\d{1,7}(\.\d{1,2})?$/u.test(text)) return Number.NaN;
  return Math.round(Number(text) * 100);
}

export function marginFromForm(values: Pick<MaterialFormValues, 'cost' | 'price'>): number | null {
  const cost = parseDollars(values.cost), price = parseDollars(values.price);
  if (cost === null || price === null || Number.isNaN(cost) || Number.isNaN(price) || price <= 0) return null;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

/** Sets the price from cost and a markup percentage. */
export function priceFromMarkup(cost: string, markupPercent: string): string | null {
  const cents = parseDollars(cost), markup = Number(markupPercent);
  if (cents === null || Number.isNaN(cents) || markupPercent.trim() === '' || !Number.isFinite(markup) || markup < 0) return null;
  return ((cents * (1 + markup / 100)) / 100).toFixed(2);
}

export function formErrors(values: MaterialFormValues, access: { canViewCosts: boolean; canViewPrices: boolean }) {
  const errors: Partial<Record<keyof MaterialFormValues, string>> = {};
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (access.canViewCosts && Number.isNaN(parseDollars(values.cost))) errors.cost = 'Enter an amount like 12.50.';
  if (access.canViewPrices && Number.isNaN(parseDollars(values.price))) errors.price = 'Enter an amount like 12.50.';
  for (const key of ['imageUrl', 'sourceUrl'] as const) if (values[key].trim() && !/^https?:\/\/\S+$/iu.test(values[key].trim())) errors[key] = 'Use a full http or https link.';
  return errors;
}

/** Only the fields the person can see are sent; cost and price are never sent without permission. */
export function fieldsFromForm(values: MaterialFormValues, access: { canViewCosts: boolean; canViewPrices: boolean }) {
  const cost = parseDollars(values.cost), price = parseDollars(values.price);
  return {
    name: values.name.trim(), sku: values.sku.trim(), unit: values.unit, category: values.category.trim(), supplier: values.supplier.trim(),
    notes: values.notes.trim(), imageUrl: values.imageUrl.trim(), sourceUrl: values.sourceUrl.trim(),
    ...(access.canViewCosts && cost !== null ? { costCents: cost } : {}), ...(access.canViewPrices && price !== null ? { priceCents: price } : {}),
  };
}

/** The patch for an edit: only fields that differ from the saved item. */
export function patchFromForm(values: MaterialFormValues, material: MaterialView, access: { canViewCosts: boolean; canViewPrices: boolean }): MaterialPatch {
  const next = fieldsFromForm(values, access), patch: Record<string, unknown> = {};
  const saved: Record<string, unknown> = { name: material.name, sku: material.sku, unit: material.unit, category: material.category, supplier: material.supplier, notes: material.notes, imageUrl: material.imageUrl, sourceUrl: material.sourceUrl, costCents: material.costCents ?? undefined, priceCents: material.priceCents ?? undefined };
  for (const [key, value] of Object.entries(next)) if (value !== saved[key]) patch[key] = value;
  return patch as MaterialPatch;
}
