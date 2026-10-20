'use client';
import { useId } from 'react';
import { FilterBar } from '@salesmora/ui';
import { woInput, woLabel } from '../../work-orders/work-order-ui';
import { defaultMaterialsFilters, type MaterialsPageFilters } from '../materials-page.types';
import { copy } from './materials-filters.data';

export type MaterialsFiltersProps = { filters: MaterialsPageFilters; options: { categories: string[]; suppliers: string[] }; canManage: boolean; disabled?: boolean; onFilters: (filters: MaterialsPageFilters) => void };

export function MaterialsFilters({ filters, options, canManage, disabled = false, onFilters }: MaterialsFiltersProps) {
  const id = useId(), patch = (next: Partial<MaterialsPageFilters>) => onFilters({ ...filters, ...next });
  const active = (['q', 'category', 'supplier'] as const).filter(key => filters[key] !== '' && filters[key] !== 'all').map(key => ({ id: key, label: `${copy.chip[key]}: ${filters[key]}` }));
  const select = (key: 'category' | 'supplier', label: string, items: string[]) => (
    <label className={woLabel}>{label}<select className={woInput} value={filters[key]} onChange={event => patch({ [key]: event.target.value })}><option value="all">{copy.all}</option>{items.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
  );
  return (
    <FilterBar title={copy.title} activeFilters={active} disabled={disabled} onRemove={key => patch({ [key]: defaultMaterialsFilters[key as 'q'] })} onClearAll={() => onFilters({ ...defaultMaterialsFilters, status: filters.status, archived: filters.archived })}>
      <div className="grid min-w-0 flex-1 basis-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={woLabel} htmlFor={id}>{copy.search}<input id={id} type="search" maxLength={200} className={woInput} placeholder={copy.placeholder} value={filters.q} onChange={event => patch({ q: event.target.value })} /></label>
        {select('category', copy.category, options.categories)}
        {select('supplier', copy.supplier, options.suppliers)}
        {canManage && filters.status === 'active' && <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end text-sm font-semibold"><input role="switch" type="checkbox" checked={filters.archived} onChange={event => patch({ archived: event.target.checked })} className="size-5 accent-primary focus-visible:focus-ring" />{copy.archived}</label>}
      </div>
    </FilterBar>
  );
}
