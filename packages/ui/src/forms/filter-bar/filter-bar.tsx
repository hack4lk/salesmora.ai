'use client';

import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { FilterChip } from '../filter-chip/filter-chip';
import { filterBarData as copy } from './filter-bar.data';

export type ActiveFilter = { id: string; label: string };
export type FilterBarProps = {
  title?: string;
  /** Supply labeled controls; custom controls must also honor disabled themselves. */
  children: ReactNode;
  activeFilters: readonly ActiveFilter[];
  disabled?: boolean;
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

/** Controlled presentation only. Consumers own URL state, filtering and authorization. */
export function FilterBar({ title = copy.title, children, activeFilters, disabled = false, onRemove, onClearAll }: FilterBarProps) {
  const id = useId();
  const group = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLFieldSetElement>(null);
  const intent = useRef<{ removedId?: string; preferredIds: string[]; trigger: Element | null } | null>(null);

  useLayoutEffect(() => {
    const next = intent.current;
    if (!next || disabled || (next.removedId ? activeFilters.some(filter => filter.id === next.removedId) : activeFilters.length > 0)) return;
    intent.current = null;
    const document = group.current?.ownerDocument;
    if (!document || (document.activeElement !== document.body && document.activeElement !== next.trigger)) return;
    const chips = Array.from(group.current?.querySelectorAll<HTMLDivElement>('div[data-filter-id]') ?? []);
    const target = next.preferredIds.map(key => chips.find(chip => chip.dataset.filterId === key)?.querySelector('button')).find(Boolean);
    const firstControl = controls.current?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex="0"]');
    (target ?? firstControl ?? group.current)?.focus();
  }, [activeFilters, disabled]);

  return <section aria-labelledby={`${id}-title`} className="min-w-0 rounded-2xl border border-line bg-paper p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 id={`${id}-title`} className="m-0 text-base font-semibold text-ink">{title}</h2>
      {activeFilters.length > 0 && <button type="button" disabled={disabled} onClick={event => {
        if (disabled) return;
        intent.current = { preferredIds: [], trigger: event.currentTarget };
        onClearAll();
      }} className="min-h-11 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">{copy.clear}</button>}
    </div>
    <fieldset ref={controls} disabled={disabled} className="m-0 flex min-w-0 flex-wrap gap-4 border-0 p-0">
      <legend className="sr-only">{copy.controls}</legend>
      {children}
    </fieldset>
    <div ref={group} role="group" aria-label={copy.active} tabIndex={-1} className="mt-5 flex min-w-0 flex-wrap gap-3 rounded-lg focus-visible:focus-ring">
      {activeFilters.map((filter, index) => <div key={filter.id} data-filter-id={filter.id} className="min-w-0 max-w-full">
        <FilterChip label={filter.label} disabled={disabled} onRemove={() => {
          if (disabled) return;
          intent.current = { removedId: filter.id, preferredIds: [...activeFilters.slice(index + 1), ...activeFilters.slice(0, index).reverse()].map(item => item.id), trigger: group.current?.ownerDocument.activeElement ?? null };
          onRemove(filter.id);
        }}/>
      </div>)}
    </div>
    <p role="status" aria-atomic="true" className="mb-0 mt-4 text-sm text-muted">{copy.count(activeFilters.length)}</p>
  </section>;
}
