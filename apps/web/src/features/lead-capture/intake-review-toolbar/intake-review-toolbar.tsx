'use client';

import { useId } from 'react';
import { FilterBar, FormFeedback, type ActiveFilter } from '@salesmora/ui';
import { intakeReviewToolbarData as copy } from './intake-review-toolbar.data';

export type IntakeReviewFilters = {
  search: string; sourceId: string;
  status: 'all' | 'awaiting' | 'approved' | 'dismissed';
  flag: 'all' | 'attention' | 'duplicate' | 'missing' | 'clear';
};
export const emptyIntakeReviewFilters: IntakeReviewFilters = { search: '', sourceId: '', status: 'all', flag: 'all' };
export const defaultIntakeReviewFilters: IntakeReviewFilters = { ...emptyIntakeReviewFilters, status: 'awaiting' };
export type IntakeReviewToolbarProps = {
  value: IntakeReviewFilters;
  /** Authorized source options include paused/archived sources with accessible intake history. Empty IDs are reserved for All. */
  sources: readonly { id: string; name: string }[];
  sourcesState?: 'ready' | 'loading' | 'error';
  canRead: boolean; disabled?: boolean;
  /** Host owns authorization, URL state, search debounce, pagination reset and server queries. */
  onChange: (value: IntakeReviewFilters) => void; onRetrySources?: () => void;
};
const labelClass = 'grid min-w-0 gap-2 text-sm font-semibold text-ink';
const inputClass = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas';
export function IntakeReviewToolbar({ value, sources, sourcesState = 'ready', canRead, disabled = false, onChange, onRetrySources }: IntakeReviewToolbarProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const options = sources.filter(source => source.id.trim() && source.name.trim());
  const selected = options.find(source => source.id === value.sourceId);
  const sourceLabel = selected?.name ?? copy.unavailableSource;
  const active: ActiveFilter[] = [];
  if (value.search) active.push({ id: 'search', label: copy.chip(copy.search, value.search) });
  if (value.sourceId) active.push({ id: 'sourceId', label: copy.chip(copy.source, sourceLabel) });
  if (value.status !== 'all') active.push({ id: 'status', label: copy.chip(copy.status, copy.statuses[value.status]) });
  if (value.flag !== 'all') active.push({ id: 'flag', label: copy.chip(copy.flag, copy.flags[value.flag]) });
  const change = (patch: Partial<IntakeReviewFilters>) => { if (!disabled) onChange({ ...value, ...patch }); };
  return <div className="grid min-w-0 gap-4">
    <FilterBar title={copy.title} hideTitle activeFilters={active} disabled={disabled}
      onRemove={key => { if (key === 'search' || key === 'sourceId' || key === 'status' || key === 'flag') change({ [key]: emptyIntakeReviewFilters[key] }); }}
      onClearAll={() => change(emptyIntakeReviewFilters)}>
      <div className="grid min-w-0 flex-1 basis-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label htmlFor={`${id}-search`} className={labelClass}>{copy.search}<input id={`${id}-search`} type="search" maxLength={200} placeholder={copy.placeholder} className={inputClass} value={value.search} onChange={event => change({ search: event.target.value })} /></label>
        <label htmlFor={`${id}-source`} className={labelClass}>{copy.source}<select id={`${id}-source`} className={inputClass} disabled={sourcesState !== 'ready'} value={value.sourceId} onChange={event => change({ sourceId: event.target.value })}>
          <option value="">{sourcesState === 'loading' ? copy.loadingSources : copy.allSources}</option>
          {value.sourceId && !selected && <option value={value.sourceId}>{copy.unavailableSource}</option>}
          {options.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}
        </select></label>
        <label htmlFor={`${id}-status`} className={labelClass}>{copy.status}<select id={`${id}-status`} className={inputClass} value={value.status} onChange={event => change({ status: event.target.value as IntakeReviewFilters['status'] })}>{Object.entries(copy.statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label htmlFor={`${id}-flag`} className={labelClass}>{copy.flag}<select id={`${id}-flag`} className={inputClass} value={value.flag} onChange={event => change({ flag: event.target.value as IntakeReviewFilters['flag'] })}>{Object.entries(copy.flags).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
    </FilterBar>
    {sourcesState === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loadingSources}</p>}
    {sourcesState === 'error' && <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.sourcesError} />{onRetrySources && <button type="button" disabled={disabled} className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { if (!disabled) onRetrySources(); }}>{copy.retry}</button>}</div>}
    {sourcesState === 'ready' && value.sourceId && !selected && <p role="status" className="m-0 text-sm text-muted">{copy.unavailableHelp}</p>}
  </div>;
}
