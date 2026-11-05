'use client';

import { useId } from 'react';
import { FilterBar, type ActiveFilter } from '@salesmora/ui';
import { captureSourceToolbarData as copy } from './capture-source-toolbar.data';

export type CaptureSourceFilters = {
  search: string;
  source: 'all' | 'website' | 'gmail';
  status: 'all' | 'draft' | 'scheduled' | 'active' | 'paused';
  view: 'current' | 'archived';
};
export const defaultCaptureSourceFilters: CaptureSourceFilters = { search: '', source: 'all', status: 'all', view: 'current' };
export type CaptureSourceToolbarProps = {
  value: CaptureSourceFilters;
  disabled?: boolean;
  onChange: (value: CaptureSourceFilters) => void;
};

const labelClass = 'grid min-w-0 gap-2 text-sm font-semibold text-ink';
const inputClass = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas';
const buttonClass = 'min-h-11 max-w-full cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Controlled filters only; the host owns authorized queries, URL state and results. */
export function CaptureSourceToolbar({ value, disabled = false, onChange }: CaptureSourceToolbarProps) {
  const id = useId();
  const archived = value.view === 'archived';
  const change = (patch: Partial<CaptureSourceFilters>) => {
    if (!disabled) onChange({ ...value, ...patch, ...(archived && !patch.view ? { status: 'all' as const } : {}) });
  };
  const active: ActiveFilter[] = [];
  if (value.search) active.push({ id: 'search', label: copy.chip(copy.search, value.search) });
  if (value.source !== 'all') active.push({ id: 'source', label: copy.chip(copy.source, copy.sources[value.source]) });
  if (!archived && value.status !== 'all') active.push({ id: 'status', label: copy.chip(copy.status, copy.statuses[value.status]) });

  return <div className="grid min-w-0 gap-4">
    <div role="group" aria-label={copy.views} className="flex flex-wrap gap-2">
      {(['current', 'archived'] as const).map(view => <button key={view} type="button" disabled={disabled} aria-pressed={value.view === view}
        className={`${buttonClass} ${value.view === view ? 'border-primary bg-primary text-paper hover:bg-primary-dark' : 'border-line bg-paper text-primary hover:bg-canvas'}`}
        onClick={() => change({ view, status: 'all' })}>{copy[view]}</button>)}
    </div>
    <FilterBar title={copy.title} activeFilters={active} disabled={disabled}
      onRemove={key => { if (key === 'search' || key === 'source' || key === 'status') change({ [key]: defaultCaptureSourceFilters[key] }); }}
      onClearAll={() => change({ ...defaultCaptureSourceFilters, view: value.view })}>
      <div className="grid min-w-0 flex-1 basis-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label htmlFor={`${id}-search`} className={labelClass}>{copy.search}
          <input id={`${id}-search`} type="search" maxLength={200} placeholder={copy.placeholder} className={inputClass} value={value.search} onChange={event => change({ search: event.target.value })} />
        </label>
        <label htmlFor={`${id}-source`} className={labelClass}>{copy.source}
          <select id={`${id}-source`} className={inputClass} value={value.source} onChange={event => change({ source: event.target.value as CaptureSourceFilters['source'] })}>
            {Object.entries(copy.sources).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-status`} className={labelClass}>{copy.status}
          <select id={`${id}-status`} className={inputClass} disabled={archived} value={archived ? 'archived' : value.status} onChange={event => change({ status: event.target.value as CaptureSourceFilters['status'] })}>
            {archived ? <option value="archived">{copy.archived}</option> : Object.entries(copy.statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>
    </FilterBar>
    {archived && <p className="m-0 text-sm leading-6 text-muted">{copy.archivedHelp}</p>}
  </div>;
}
