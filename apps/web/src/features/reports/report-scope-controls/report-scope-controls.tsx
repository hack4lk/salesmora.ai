'use client';

import { useId } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { reportScopeControlsData as copy } from './report-scope-controls.data';

export type ReportScopeOption = { value: string; label: string };
export type ReportScopeView = {
  id: string;
  label: string;
  dateBasis: string;
  current: boolean;
  assignments: readonly ReportScopeOption[];
  groupLabel: string;
  groups: readonly ReportScopeOption[];
};
export type ReportScopeValue = { viewId: string; assignment: string; group: string };
export type ReportScopeControlsProps = {
  reportLabel: string;
  value: ReportScopeValue;
  /** Host-supplied authorized options for this report area only. */
  views: readonly ReportScopeView[];
  canRead: boolean;
  state?: 'ready' | 'loading' | 'error';
  pending?: boolean;
  /** Host explicitly initializes applicable filters on view changes; never silently narrow saved filters. */
  onViewChange: (viewId: string) => void;
  onFilterChange: (filter: 'assignment' | 'group', value: string) => void;
  onRetry: () => void;
};

/** Configuration only. The host owns period composition, run validation and current authorization. */
export function ReportScopeControls({ reportLabel, value, views, canRead, state = 'ready', pending = false, onViewChange, onFilterChange, onRetry }: ReportScopeControlsProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const view = views.find(item => item.id === value.viewId);
  const unavailable = state === 'ready' && views.length > 0 && (!view ||
    !view.assignments.some(option => option.value === value.assignment) || !view.groups.some(option => option.value === value.group));
  const select = (label: string, selected: string, options: readonly ReportScopeOption[], change: (next: string) => void) =>
    <MuiTextField select label={label} value={selected} disabled={pending || options.length < 2 && options.some(option => option.value === selected)}
      error={!options.some(option => option.value === selected)} fullWidth size="small" className={fieldClasses}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true }, htmlInput: { className: 'box-border min-h-11' } }}
      onChange={event => { if (!pending && options.some(option => option.value === event.target.value)) change(event.target.value); }}>
      {!options.some(option => option.value === selected) && <option value={selected} disabled>{copy.unavailable}</option>}
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </MuiTextField>;
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading' || pending} className="grid w-full min-w-0 max-w-2xl gap-5 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6">
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1"><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><HelpTooltip label={copy.help} paragraphs={[copy.description]} /></div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{reportLabel}</p>
    </header>
    {state === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
    {state === 'error' && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={copy.failed} />
      <button type="button" disabled={pending} onClick={onRetry} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:opacity-50">{copy.retry}</button>
    </div>}
    {state === 'ready' && (views.length === 0 ? <p className="m-0 text-sm text-muted">{copy.empty}</p> : <>
      {select(copy.view, value.viewId, views.map(item => ({ value: item.id, label: item.label })), onViewChange)}
      {view && <>
        <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{view.dateBasis} {view.current ? copy.current : copy.period}</p>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {select(copy.assignment, value.assignment, view.assignments, next => onFilterChange('assignment', next))}
          {select(view.groupLabel, value.group, view.groups, next => onFilterChange('group', next))}
        </div>
      </>}
      {unavailable && <FormFeedback kind="error" message={copy.invalid} />}
    </>)}
  </section>;
}
