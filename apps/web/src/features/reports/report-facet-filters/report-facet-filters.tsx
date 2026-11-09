'use client';

import { useId } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { fieldClasses, FilterBar, FormFeedback, HelpTooltip } from '@salesmora/ui';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';

export type ReportFilterFacet = {
  id: string;
  label: string;
  options?: readonly ReportScopeOption[];
  selected: readonly string[];
  limit?: number;
};
export type ReportFacetFiltersProps = {
  reportLabel: string;
  facets: readonly ReportFilterFacet[];
  context: 'period' | 'current';
  contextLabel?: string;
  contextHelp?: string;
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  validOptions: boolean;
  validSelection: boolean;
  attributionHelp: string;
  onSelect: (facet: string, selected: readonly string[]) => void;
  onClear: () => void;
  onRetry: () => void;
};
const unavailable = 'Unavailable saved selection';

/** Shared dropdown/chip UI; domain wrappers validate applicable authorized facets and selections. */
export function ReportFacetFilters({ reportLabel, facets, context, contextLabel, contextHelp, canRead, state = 'ready', pending = false,
  validOptions, validSelection, attributionHelp, onSelect, onClear, onRetry }: ReportFacetFiltersProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={`Your current access does not allow these ${reportLabel} report filters.`} />;
  if (state !== 'ready') return <div className="grid justify-items-start gap-3">
    {state === 'loading' ? <p role="status">Loading authorized {reportLabel} report filters...</p> : <>
      <FormFeedback kind="error" message={`${reportLabel} report filters could not be loaded. Retry before applying filters.`} />
      <button type="button" disabled={pending} onClick={() => { if (!pending) onRetry(); }} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:opacity-50">Retry filters</button>
    </>}
  </div>;
  if (!validOptions) return <FormFeedback kind="error" message={`Authorized ${reportLabel} filter options are inconsistent. Retry filters.`} />;
  const activeFilters = facets.flatMap(facet => [...new Set(facet.selected)].map(selected => ({
    id: JSON.stringify([facet.id, selected]), label: `${facet.label}: ${facet.options?.find(option => option.value === selected)?.label ?? unavailable}`,
  })));
  function remove(key: string) {
    if (pending) return;
    for (const facet of facets) {
      const selected = facet.selected.find(selected => JSON.stringify([facet.id, selected]) === key);
      if (selected !== undefined) {
        onSelect(facet.id, facet.selected.filter(value => value !== selected));
        return;
      }
    }
  }
  return <FilterBar title={`${reportLabel} report filters`} activeFilters={activeFilters} disabled={pending} onRemove={remove}
    onClearAll={() => { if (!pending) onClear(); }}>
    <div className="grid w-full min-w-0 gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <p className="m-0 text-sm text-muted">{contextLabel ?? (context === 'current' ? 'Current-view filters / independent of period results' : 'Period-result filters / do not filter current snapshots')}</p>
        <HelpTooltip label={`About ${reportLabel} report filters`} paragraphs={[
          'Choose multiple values within each facet (OR). Different facets combine with AND. No selections means all currently authorized values, never wider access.',
          attributionHelp,
          contextHelp ?? 'The host keeps current-view and period-result filters separate and queries the matching authorized projection.',
        ]} />
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        {facets.filter(facet => facet.options !== undefined).map(facet => <Autocomplete
          key={facet.id} id={`${id}-${facet.id}`} multiple disableCloseOnSelect disabled={pending}
          options={(facet.options ?? []).map(option => option.value)}
          value={[...new Set(facet.selected)]}
          getOptionLabel={selected => facet.options?.find(option => option.value === selected)?.label ?? unavailable}
          getOptionDisabled={selected => facet.limit !== undefined && !facet.selected.includes(selected) && facet.selected.length >= facet.limit}
          onChange={(_, selected) => { if (!pending && (facet.limit === undefined || selected.length <= facet.limit)) onSelect(facet.id, selected); }}
          noOptionsText="No authorized options available."
          renderValue={selected => <span className="min-w-0 text-sm text-ink">{selected.length} selected</span>}
          renderOption={(props, selected, { selected: checked }) => {
            const { key, ...optionProps } = props;
            return <li key={key} {...optionProps}>
              <Checkbox checked={checked} tabIndex={-1} disableRipple slotProps={{ input: { 'aria-hidden': true, tabIndex: -1 } }} />
              <span className="min-w-0 wrap-anywhere">{facet.options?.find(option => option.value === selected)?.label}</span>
            </li>;
          }}
          renderInput={params => <TextField {...params} label={facet.label} size="small" className={fieldClasses}
            placeholder={facet.selected.length === 0 ? 'All authorized values' : 'Select more'}
            helperText="No selections: all authorized values."
            error={facet.selected.some(selected => !facet.options?.some(option => option.value === selected))}
          />}
          className="min-w-0"
        />)}
      </div>
      {!validSelection && <FormFeedback kind="error" message={`Saved ${reportLabel} filters are unavailable, duplicated or exceed the selection limit. Correct them explicitly before running the report.`} />}
    </div>
  </FilterBar>;
}
