import type { MaterialPickerOption } from './material-picker';

export const copy = {
  label: 'From catalog',
  placeholder: 'Search the catalog by name or SKU',
  searching: 'Searching…',
  empty: 'No matching catalog items. Add a custom item instead.',
  error: 'The catalog could not be searched. Try again, or add a custom item.',
  clear: 'Remove catalog link',
  selected: (name: string) => `Linked to catalog: ${name}`,
  results: 'Catalog results',
};

export const pickerOptions: MaterialPickerOption[] = [
  { id: 'c1', name: '50-gallon water heater', unit: 'each', sku: 'WH-50G', priceCents: 69900 },
  { id: 'c2', name: '3/4 in copper pipe', unit: 'ft', sku: 'CU-34', priceCents: 520 },
  { id: 'c3', name: 'Dielectric union', unit: 'each', sku: 'DU-34', priceCents: 1400 },
  { id: 'c4', name: 'Expansion tank', unit: 'each', sku: 'ET-2G', priceCents: 6800 },
  { id: 'c5', name: 'Pipe strap', unit: 'each', sku: 'PS-34', priceCents: 250 },
];

export const searchFixtures = (q: string): Promise<MaterialPickerOption[]> => {
  const term = q.trim().toLowerCase();
  return Promise.resolve(pickerOptions.filter(o => !term || o.name.toLowerCase().includes(term) || o.sku.toLowerCase().includes(term)));
};
