'use client';

import { useId } from 'react';
import { AddOutlined, SearchOutlined, ViewKanbanOutlined } from '@salesmora/ui';
import { leadsEmptyStateData as copy } from './leads-empty-state.data';

export type LeadsEmptyStateProps = {
  variant: 'first-run' | 'filtered'; scope: 'workspace' | 'assigned'; canCreate: boolean; disabled?: boolean;
  /** Requests the existing add-lead workflow; authorization and plan checks belong to its host/server. */
  onAdd?: () => void;
  /** Clears applied search/filters without widening access or changing List/Pipeline preference. */
  onClearFilters?: () => void;
};

/** Mount only after a successful authorized empty read, never for loading/error or a single empty board column. */
export function LeadsEmptyState({ variant, scope, canCreate, disabled = false, onAdd, onClearFilters }: LeadsEmptyStateProps) {
  const id = useId();
  const filtered = variant === 'filtered';
  const addAvailable = canCreate && !!onAdd;
  const title = filtered ? copy.filteredTitle : scope === 'assigned' ? copy.assignedTitle : copy.firstTitle;
  const description = filtered ? copy.filteredDescription : addAvailable ? copy.createDescription : scope === 'assigned' ? copy.assignedDescription : copy.readDescription;
  const action = filtered ? onClearFilters : addAvailable ? onAdd : undefined;
  const Icon = filtered ? SearchOutlined : ViewKanbanOutlined;
  return <section aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="grid min-w-0 justify-items-center gap-5 rounded-2xl border border-dashed border-line bg-paper px-6 py-12 text-center sm:px-8 sm:py-16">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="text-3xl"/></span>
    <div className="grid max-w-form gap-3">
      <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold text-ink wrap-anywhere">{title}</h2>
      <p id={`${id}-description`} className="m-0 text-base leading-6 text-muted wrap-anywhere">{description}</p>
    </div>
    {action && <button type="button" disabled={disabled} onClick={() => { if (!disabled) action(); }}
      className={`inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-base font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted ${filtered ? 'border-line bg-paper text-primary hover:bg-canvas' : 'border-primary bg-primary text-white hover:bg-primary-dark'}`}>
      {!filtered && <AddOutlined aria-hidden="true"/>}{filtered ? copy.clear : copy.add}
    </button>}
  </section>;
}
