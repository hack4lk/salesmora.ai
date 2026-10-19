'use client';

import Autocomplete from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { FilterBar, TextField, FormFeedback, fieldClasses, SearchOutlined, AddOutlined, FileDownloadOutlined, ViewListOutlined, ViewKanbanOutlined, CheckBoxOutlined, CheckBoxOutlineBlankOutlined, type ActiveFilter } from '@salesmora/ui';
import { leadsToolbarData as copy } from './leads-toolbar.data';

type Stage = typeof copy.stages[number]['value'];
type Source = typeof copy.sources[number]['value'];
type Created = typeof copy.dates[number]['value'];
export type LeadsToolbarValues = {
  query: string; stages: readonly Stage[]; sources: readonly Source[]; ownerIds: readonly string[];
  created: Created; from: string; to: string; attention: boolean; archived: boolean; view: 'list' | 'pipeline';
};
export const emptyLeadsToolbarValues: LeadsToolbarValues = { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false, view: 'pipeline' };
export type LeadsToolbarProps = {
  values: LeadsToolbarValues;
  owners: readonly { id: string; name: string }[];
  viewerId: string;
  access: { scope: 'workspace' | 'assigned'; canCreate: boolean; canExport: boolean; canArchive: boolean };
  disabled?: boolean;
  /** Immediate draft updates. The page owns 300ms search debounce, URL state and server queries. */
  onChange: (values: LeadsToolbarValues) => void;
  onAdd: () => void;
  onExport: () => void;
};
type Option = { value: string; label: string };
const actionClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';

/** Lead-specific composition of shared filters. UI visibility never replaces server authorization. */
export function LeadsToolbar({ values, owners, viewerId, access, disabled = false, onChange, onAdd, onExport }: LeadsToolbarProps) {
  const ownerOptions: Option[] = [{ value: 'me', label: copy.me }, ...(access.scope === 'workspace' ? [{ value: 'unassigned', label: copy.unassigned }, ...owners.filter(owner => owner.id !== viewerId).map(owner => ({ value: owner.id, label: owner.name }))] : [])];
  const visible: LeadsToolbarValues = { ...values, ownerIds: [...new Set(values.ownerIds.map(value => value === viewerId ? 'me' : value))].filter(value => ownerOptions.some(option => option.value === value)), archived: access.canArchive && values.archived };
  const change = (next: Partial<LeadsToolbarValues>) => { if (!disabled) onChange({ ...visible, ...next }); };
  const invalidRange = visible.created === 'custom' && !!visible.from && !!visible.to && visible.from > visible.to;
  const chips: ActiveFilter[] = [];
  if (visible.query.trim().length >= 2) chips.push({ id: 'query', label: copy.chip(copy.search, visible.query.trim()) });
  for (const [key, label, options] of [['stages', copy.stage, copy.stages], ['sources', copy.source, copy.sources], ['ownerIds', copy.owner, ownerOptions]] as const) {
    for (const value of visible[key]) {
      const option = options.find(option => option.value === value);
      if (option) chips.push({ id: `${key}:${value}`, label: copy.chip(label, option.label) });
    }
  }
  if (visible.created !== 'any') chips.push({ id: 'created', label: copy.chip(copy.created, visible.created === 'custom' && visible.from && visible.to && !invalidRange ? `${visible.from} – ${visible.to}` : copy.dates.find(date => date.value === visible.created)!.label) });
  if (visible.attention) chips.push({ id: 'attention', label: copy.attention });
  if (visible.archived) chips.push({ id: 'archived', label: copy.archived });
  function remove(key: string) {
    if (key === 'query') change({ query: '' });
    else if (key === 'created') change({ created: 'any', from: '', to: '' });
    else if (key === 'attention' || key === 'archived') change({ [key]: false });
    else {
      const [group, ...rest] = key.split(':');
      const value = rest.join(':');
      if (group === 'stages') change({ stages: visible.stages.filter(item => item !== value) });
      if (group === 'sources') change({ sources: visible.sources.filter(item => item !== value) });
      if (group === 'ownerIds') change({ ownerIds: visible.ownerIds.filter(item => item !== value) });
    }
  }
  function multi(label: string, key: 'stages' | 'sources' | 'ownerIds', options: readonly Option[]) {
    return <Autocomplete key={key} multiple size="small" disablePortal disableCloseOnSelect disableClearable disabled={disabled}
      className="min-w-0 flex-1 basis-48" options={options} value={options.filter(option => (visible[key] as readonly string[]).includes(option.value))}
      isOptionEqualToValue={(option, value) => option.value === value.value} getOptionLabel={option => option.label}
      onChange={(_event, next) => {
        const selected = next.map(option => option.value);
        if (key === 'stages') change({ stages: selected as Stage[] });
        else if (key === 'sources') change({ sources: selected as Source[] });
        else change({ ownerIds: selected });
      }} renderValue={() => null} openText={copy.open(label)} closeText={copy.close(label)} noOptionsText={copy.noOptions}
      renderOption={(props, option, { selected }) => {
        const { key: optionKey, ...attributes } = props;
        const Icon = selected ? CheckBoxOutlined : CheckBoxOutlineBlankOutlined;
        return <li key={optionKey} {...attributes}><Icon aria-hidden="true" className={`mr-3 shrink-0 ${selected ? 'text-primary' : 'text-muted'}`}/><span className="min-w-0 wrap-anywhere">{option.label}</span></li>;
      }} renderInput={params => <MuiTextField {...params} label={label} placeholder={visible[key].length ? copy.selected(visible[key].length) : copy.any} className={fieldClasses}/>}/>;
  }
  return <section aria-label={copy.region} className="grid min-w-0 gap-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label={copy.view} className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-line bg-paper p-1">
        {(['list', 'pipeline'] as const).map(view => { const Icon = view === 'list' ? ViewListOutlined : ViewKanbanOutlined;
          return <button key={view} type="button" disabled={disabled} aria-pressed={values.view === view} onClick={() => { if (values.view !== view) change({ view }); }}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed ${values.view === view ? 'bg-primary text-paper' : 'text-muted hover:bg-canvas'}`}><Icon aria-hidden="true"/>{copy[view]}</button>;
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {access.canExport && <button type="button" disabled={disabled} className={`${actionClass} border-line bg-paper text-primary hover:bg-canvas`} onClick={() => { if (!disabled && access.canExport) onExport(); }}><FileDownloadOutlined aria-hidden="true"/>{copy.export}</button>}
        {access.canCreate && <button type="button" disabled={disabled} className={`${actionClass} border-primary bg-primary text-paper hover:bg-primary-dark disabled:border-line disabled:bg-canvas`} onClick={() => { if (!disabled && access.canCreate) onAdd(); }}><AddOutlined aria-hidden="true"/>{copy.add}</button>}
      </div>
    </div>
    <FilterBar activeFilters={chips} disabled={disabled} onRemove={remove} onClearAll={() => change({ ...emptyLeadsToolbarValues, view: values.view })}>
      <div className="w-full min-w-0"><TextField label={copy.search} value={values.query} disabled={disabled} onChange={event => change({ query: event.target.value })}
        placeholder={copy.placeholder} helperText={values.query.trim().length === 1 ? copy.searchMinimum : copy.searchHelp}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined aria-hidden="true"/></InputAdornment> } }}/></div>
      {multi(copy.stage, 'stages', copy.stages)}
      {multi(copy.source, 'sources', copy.sources)}
      {multi(copy.owner, 'ownerIds', ownerOptions)}
      <MuiTextField select size="small" label={copy.created} disabled={disabled} value={visible.created} onChange={event => change({ created: event.target.value as Created, from: '', to: '' })}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} className={`${fieldClasses} min-w-0 flex-1 basis-48`}>
        {copy.dates.map(date => <option key={date.value} value={date.value}>{date.label}</option>)}
      </MuiTextField>
      <div className="flex max-w-full flex-wrap items-center gap-3">
        <button type="button" disabled={disabled} aria-pressed={visible.attention} onClick={() => change({ attention: !visible.attention })}
          className={`${actionClass} ${visible.attention ? 'border-primary bg-primary/10 text-primary-dark hover:bg-primary/20' : 'border-line bg-paper text-primary hover:bg-canvas'}`}>{copy.attention}</button>
        {access.canArchive && <button type="button" disabled={disabled} aria-pressed={visible.archived} onClick={() => change({ archived: !visible.archived })}
          className={`${actionClass} ${visible.archived ? 'border-primary bg-primary/10 text-primary-dark hover:bg-primary/20' : 'border-line bg-paper text-primary hover:bg-canvas'}`}>{copy.archived}</button>}
      </div>
      {visible.created === 'custom' && <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
        <MuiTextField type="date" size="small" label={copy.from} disabled={disabled} value={visible.from} onChange={event => change({ from: event.target.value })} error={invalidRange} className={fieldClasses} slotProps={{ inputLabel: { shrink: true } }}/>
        <MuiTextField type="date" size="small" label={copy.to} disabled={disabled} value={visible.to} onChange={event => change({ to: event.target.value })} error={invalidRange} className={fieldClasses} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: visible.from || undefined } }}/>
        <div className="sm:col-span-2">{invalidRange ? <FormFeedback kind="error" title={copy.rangeTitle} message={copy.dateError}/> : <p className="m-0 text-sm text-muted">{copy.dateHelp}</p>}</div>
      </div>}
    </FilterBar>
  </section>;
}
