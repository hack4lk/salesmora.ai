import type { MaterialView } from '@salesmora/contracts';
import { MaterialNameCell } from '../material-name-cell/material-name-cell';
import { formatMoney } from '../material-money';
import { copy } from './material-card.data';

export type MaterialCardProps = { material: MaterialView; canViewCosts: boolean; canViewPrices: boolean; actions?: React.ReactNode };

/** The mobile layout of one catalog row. */
export function MaterialCard({ material, canViewCosts, canViewPrices, actions }: MaterialCardProps) {
  const money = [canViewCosts && `${copy.cost} ${formatMoney(material.costCents)}`, canViewPrices && `${copy.price} ${formatMoney(material.priceCents)}`].filter(Boolean).join(' · ');
  return (
    <div className="grid gap-2">
      <MaterialNameCell name={material.name} sku={material.sku} archived={material.archived} imageUrl={material.imageUrl} />
      <span className="text-sm text-muted">{[material.category, material.supplier, copy.units[material.unit]].filter(Boolean).join(' · ')}</span>
      {money && <span className="text-sm">{money}</span>}
      {material.duplicateOf && <span className="text-xs font-semibold text-error">{copy.duplicateOf(material.duplicateOf)}</span>}
      {actions}
    </div>
  );
}
