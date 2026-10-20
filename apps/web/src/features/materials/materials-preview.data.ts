import type { MaterialUnit, MaterialView } from '@salesmora/contracts';
import { defaultMaterialsFilters, type MaterialsPageFilters, type MaterialsPageSort } from './materials-page.types';

export const materialsPreviewData = { workspace: 'Northside Home Services' };

const swatch = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23${color}"/></svg>`;

const item = (n: number, name: string, sku: string, unit: MaterialUnit, category: string, supplier: string, cost: number, price: number, extra: Partial<MaterialView> = {}): MaterialView => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, name, sku, unit, category, supplier, costCents: cost, priceCents: price,
  marginPercent: price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : null, notes: '', imageUrl: '', sourceUrl: '',
  status: 'active', archived: false, version: 1, updatedAt: `2026-0${(n % 9) + 1}-1${n % 9}T15:00:00.000Z`, proposedByName: null, rejectionReason: '', duplicateOf: null, ...extra,
});

export const materialFixtures: MaterialView[] = [
  item(1, '1/2" copper pipe, 10 ft', 'CU-050-10', 'each', 'Plumbing', 'Ferguson', 2450, 3900, { imageUrl: swatch('c97b3c') }),
  item(2, '1/2" copper elbow', 'CU-050-EL', 'each', 'Plumbing', 'Ferguson', 180, 450),
  item(3, 'PVC cement, 8 oz', 'PVC-C8', 'each', 'Plumbing', 'Home Depot', 640, 1200),
  item(4, '14/2 NM-B wire, 250 ft', 'W-142-250', 'box', 'Electrical', 'Graybar', 7800, 11900),
  item(5, '15A duplex outlet', 'OUT-15D', 'each', 'Electrical', 'Graybar', 120, 350, { imageUrl: swatch('d9d9d9') }),
  item(6, 'Wire nut, yellow (100)', 'WN-Y100', 'box', 'Electrical', 'Graybar', 590, 1100),
  item(7, '2x4x8 stud', 'LBR-248', 'each', 'Lumber', 'Home Depot', 380, 650),
  item(8, '3" deck screws', 'SCR-3D', 'lb', 'Fasteners', 'Home Depot', 700, 1300),
  item(9, 'Interior latex paint, white', 'PNT-IW', 'gal', 'Paint', 'Sherwin-Williams', 2800, 4600, { imageUrl: swatch('f4f1ea') }),
  item(10, 'HVAC filter 20x25x1', 'FLT-2025', 'each', 'HVAC', 'Johnstone Supply', 450, 1100),
  item(11, 'Technician labor', '', 'hr', 'Labor', '', 4500, 9500),
  item(12, 'Discontinued thermostat', 'TH-OLD', 'each', 'HVAC', 'Johnstone Supply', 3900, 7900, { archived: true }),
  item(13, '3/4" copper pipe, 10 ft', 'CU-075-10', 'each', 'Plumbing', 'Ferguson', 3900, 6200, { status: 'proposed', proposedByName: 'Dana Office', duplicateOf: null }),
  item(14, 'PVC cement 8oz', 'PVC-C8', 'each', 'Plumbing', 'Ace', 700, 1300, { status: 'proposed', proposedByName: 'Dana Office', duplicateOf: 'PVC cement, 8 oz' }),
  item(15, 'Garbage disposal', 'GD-75', 'each', 'Plumbing', 'Ferguson', 11000, 18000, { status: 'rejected', proposedByName: 'Dana Office', rejectionReason: 'We use the 1 HP model only.' }),
];
export const materialsMany: MaterialView[] = Array.from({ length: 60 }, (_, index) => item(100 + index, `Fitting ${String(index + 1).padStart(2, '0')}`, `FIT-${index + 1}`, 'each', index % 2 ? 'Plumbing' : 'Electrical', index % 3 ? 'Ferguson' : 'Graybar', 100 + index * 10, 300 + index * 12));

export const materialOptions = (rows: MaterialView[]) => ({ categories: [...new Set(rows.map(row => row.category).filter(Boolean))].sort(), suppliers: [...new Set(rows.map(row => row.supplier).filter(Boolean))].sort() });

export function filterMaterials(rows: MaterialView[], filters: MaterialsPageFilters = defaultMaterialsFilters, sort: MaterialsPageSort = { column: 'name', direction: 'asc' }) {
  const q = filters.q.trim().toLowerCase();
  const matched = rows.filter(row => row.status === filters.status && (filters.status !== 'active' || row.archived === filters.archived || (filters.archived && !row.archived))
    && (filters.category === 'all' || row.category === filters.category) && (filters.supplier === 'all' || row.supplier === filters.supplier)
    && (!q || [row.name, row.sku, row.category, row.supplier].some(value => value.toLowerCase().includes(q))));
  const key = sort.column === 'price' ? (row: MaterialView) => row.priceCents ?? 0 : sort.column === 'updatedAt' ? (row: MaterialView) => row.updatedAt : (row: MaterialView) => (sort.column === 'category' ? row.category : row.name).toLowerCase();
  return matched.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (sort.direction === 'asc' ? 1 : -1));
}
