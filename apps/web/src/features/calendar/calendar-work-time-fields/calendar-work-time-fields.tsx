'use client';

import { useId } from 'react';
import { calendarWorkTimeSummary } from '@salesmora/domain';
import { jobInput, jobLabel } from '../../jobs/job-ui';
import { calendarWorkTimeFieldsData as copy } from './calendar-work-time-fields.data';

/** Incomplete form values remain local until the owning form validates and confirms. */
export type CalendarWorkTimeDraft = { startTime: string; durationMinutes: number | null };
export type CalendarWorkTimeFieldsProps = {
  value: CalendarWorkTimeDraft | null;
  onChange: (value: CalendarWorkTimeDraft | null) => void;
  disabled?: boolean;
};

export function CalendarWorkTimeFields({ value, onChange, disabled = false }: CalendarWorkTimeFieldsProps) {
  const id = useId();
  const summary = calendarWorkTimeSummary(value);
  return <fieldset disabled={disabled} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4 text-ink">
    <legend className="px-1 text-sm font-semibold">{copy.title}</legend>
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-not-allowed">
      <input type="checkbox" checked={value !== null} aria-describedby={`${id}-hint`} onChange={event => onChange(event.target.checked ? { startTime: '', durationMinutes: 60 } : null)}
        className="size-5 shrink-0 accent-seafoam-dark focus-visible:focus-ring"/>{copy.toggle}
    </label>
    <p id={`${id}-hint`} className="m-0 text-sm leading-6 text-muted">{copy.hint}</p>
    {value ? <>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className={jobLabel}>{copy.start}<input type="time" value={value.startTime} required aria-describedby={!summary ? `${id}-error` : undefined}
          onChange={event => onChange({ ...value, startTime: event.target.value })} className={jobInput}/></label>
        <label className={jobLabel}>{copy.duration}<input type="number" min={15} max={480} step={1} required value={value.durationMinutes ?? ''}
          aria-describedby={!summary ? `${id}-error` : undefined} onChange={event => onChange({ ...value, durationMinutes: event.target.value === '' ? null : Number(event.target.value) })} className={jobInput}/></label>
      </div>
      {summary ? <p role="status" className="m-0 text-sm leading-6"><span className="font-semibold">{copy.finish}: </span>{summary.finish} · {summary.duration}</p>
        : <p id={`${id}-error`} role="status" className="m-0 text-sm leading-6 text-muted">{copy.invalid}</p>}
    </> : <p className="m-0 text-sm leading-6 text-muted">{copy.unknown}</p>}
  </fieldset>;
}
