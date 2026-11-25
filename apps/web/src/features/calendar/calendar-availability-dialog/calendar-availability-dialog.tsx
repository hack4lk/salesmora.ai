'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { calendarAvailabilitySchema, calendarWeekdays, calendarWeeklyHoursSchema, calendarUnavailableDatesSchema,
  type CalendarAvailability, type CalendarWorkingHours } from '@salesmora/contracts';
import { JobDialog, type JobDialogProps } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobInput, jobLabel } from '../../jobs/job-ui';
import { calendarAvailabilityDialogData as copy, emptyCalendarWeek } from './calendar-availability-dialog.data';

export type CalendarAvailabilityDialogProps = {
  open: boolean; person: { id: string; name: string }; revision: string; timezone: string;
  value: CalendarAvailability; canEdit: boolean; pending?: boolean; error?: string; conflict?: boolean;
  onClose: () => void; onReload?: () => void;
  onSave: (input: { personId: string; revision: string; timezone: string; availability: CalendarAvailability }) => void | Promise<void>;
  /** Settings hosts compose the same form without duplicating availability fields or validation. */
  renderForm?: (form: JobDialogProps, state: { changed: boolean; valid: boolean; value: CalendarAvailability }) => ReactNode;
};
/** Local form only. The host must authorize the person and bind the revision/timezone on save. */
export function CalendarAvailabilityDialog(props: CalendarAvailabilityDialogProps) {
  return <AvailabilitySession key={JSON.stringify([props.open, props.person.id, props.revision, props.timezone, props.canEdit])} {...props}/>;
}
function AvailabilitySession(props: CalendarAvailabilityDialogProps) {
  const id = useId(), nextId = useRef(props.value.unavailableDates.length);
  const [hours, setHours] = useState(props.value.weeklyHours);
  const [dates, setDates] = useState(() => props.value.unavailableDates.map((range, index) => ({ ...range, key: index })));
  const rememberedWeek = useRef(props.value.weeklyHours);
  const rememberedDays = useRef<Partial<Record<typeof calendarWeekdays[number], CalendarWorkingHours>>>({});
  const allowed = props.canEdit && !props.pending && !props.conflict;
  const value = { weeklyHours: hours, unavailableDates: dates.map(({ startDate, endDate }) => ({ startDate, endDate })) };
  const parsed = calendarAvailabilitySchema.safeParse(value);
  const changed = JSON.stringify(value) !== JSON.stringify(props.value);
  const validHours = hours === null || calendarWeeklyHoursSchema.safeParse(hours).success;
  const validDates = dates.every(range => calendarUnavailableDatesSchema.safeParse({ startDate: range.startDate, endDate: range.endDate }).success)
    && !(!parsed.success && parsed.error.issues.some(issue => issue.path[0] === 'unavailableDates'));
  const changeHours = (day: typeof calendarWeekdays[number], next: CalendarWorkingHours | null) => {
    if (!allowed || !hours) return;
    if (hours[day]) rememberedDays.current[day] = hours[day];
    setHours({ ...hours, [day]: next });
  };
  const renderForm = props.renderForm ?? (form => <JobDialog {...form}/>);
  return renderForm({ open: props.open, title: copy.title, description: copy.description(props.person.name), confirmLabel: copy.save,
    confirmDisabled: !allowed || !changed || !parsed.success, pending: props.pending, error: props.error || (props.conflict ? copy.conflict : undefined), conflict: props.conflict, onReload: props.onReload,
    onClose: props.onClose, onSubmit: async () => {
      if (!allowed || !changed || !parsed.success) return;
      await props.onSave({ personId: props.person.id, revision: props.revision, timezone: props.timezone, availability: parsed.data });
    }, children: <>
    <p className="m-0 text-sm leading-6 text-muted">{copy.timezone(props.timezone)}</p>
    {!props.canEdit && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
    <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4">
      <legend className="px-1 text-base font-semibold">{copy.week}</legend>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold has-disabled:cursor-not-allowed">
        <input type="checkbox" className="size-5 shrink-0 accent-seafoam-dark focus-visible:focus-ring" checked={hours !== null}
          onChange={event => { if (!allowed) return; if (hours) rememberedWeek.current = hours; setHours(event.target.checked ? rememberedWeek.current ?? { ...emptyCalendarWeek } : null); }}/>{copy.setWeek}
      </label>
      {hours !== null && <div aria-hidden="true" className="hidden grid-cols-[8rem_1fr_1fr] gap-3 text-xs font-semibold text-muted sm:grid"><span/><span>{copy.start}</span><span>{copy.finish}</span></div>}
      {hours === null ? <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.unknown}</p> : <>
        {calendarWeekdays.map(day => <div key={day} className="grid min-w-0 grid-cols-2 items-center gap-3 border-t border-line pt-3 sm:grid-cols-[8rem_1fr_1fr]">
          <label className="col-span-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold has-disabled:cursor-not-allowed sm:col-span-1">
            <input type="checkbox" className="size-5 shrink-0 accent-seafoam-dark focus-visible:focus-ring" checked={hours[day] !== null}
              onChange={event => changeHours(day, event.target.checked ? rememberedDays.current[day] ?? { startTime: '', endTime: '' } : null)}/>{copy.weekdays[day]}
          </label>
          {hours[day] ? <>
            <label className={jobLabel}><span className="sr-only">{copy.start}</span><input aria-label={`${copy.weekdays[day]} ${copy.start.toLowerCase()}`} type="time" required value={hours[day].startTime}
              aria-invalid={calendarWeeklyHoursSchema.safeParse({ ...emptyCalendarWeek, [day]: hours[day] }).success ? undefined : true} aria-describedby={!validHours ? `${id}-hours-error` : undefined}
              onChange={event => changeHours(day, { ...hours[day]!, startTime: event.target.value })} className={jobInput}/></label>
            <label className={jobLabel}><span className="sr-only">{copy.finish}</span><input aria-label={`${copy.weekdays[day]} ${copy.finish.toLowerCase()}`} type="time" required value={hours[day].endTime}
              aria-invalid={calendarWeeklyHoursSchema.safeParse({ ...emptyCalendarWeek, [day]: hours[day] }).success ? undefined : true} aria-describedby={!validHours ? `${id}-hours-error` : undefined}
              onChange={event => changeHours(day, { ...hours[day]!, endTime: event.target.value })} className={jobInput}/></label>
          </> : <span className="col-span-2 text-sm text-muted">{copy.off}</span>}
        </div>)}
        {!validHours && <p id={`${id}-hours-error`} role="status" className="m-0 text-sm leading-6 text-muted">{copy.invalidHours}</p>}
        {calendarWeekdays.every(day => hours[day] === null) && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.allOff}</p>}
      </>}
    </fieldset>
    <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4">
      <legend className="px-1 text-base font-semibold">{copy.unavailable}</legend>
      <p className="m-0 text-sm leading-6 text-muted">{copy.unavailableHelp}</p>
      {!dates.length && <p className="m-0 text-sm leading-6 text-muted">{copy.noDates}</p>}
      {dates.map((range, index) => <div key={range.key} role="group" aria-label={copy.range(index)} className="grid min-w-0 gap-3 border-t border-line pt-3 sm:grid-cols-2">
        <label className={jobLabel}>{copy.from}<input type="date" required value={range.startDate} className={jobInput} aria-describedby={!validDates ? `${id}-dates-error` : undefined}
          onChange={event => setDates(previous => previous.map(row => row.key === range.key ? { ...row, startDate: event.target.value } : row))}/></label>
        <label className={jobLabel}>{copy.through}<input type="date" required value={range.endDate} className={jobInput} aria-describedby={!validDates ? `${id}-dates-error` : undefined}
          onChange={event => setDates(previous => previous.map(row => row.key === range.key ? { ...row, endDate: event.target.value } : row))}/></label>
        <button type="button" className={`${jobButton} justify-self-start sm:col-span-2`} aria-label={copy.remove(index)} onClick={() => setDates(previous => previous.filter(row => row.key !== range.key))}>{copy.removeLabel}</button>
      </div>)}
      {!validDates && <p id={`${id}-dates-error`} role="status" className="m-0 text-sm leading-6 text-muted">{copy.invalidDates}</p>}
      <button type="button" className={`${jobButton} justify-self-start`} disabled={dates.length >= 100} onClick={() => {
        const key = nextId.current++; setDates(previous => [...previous, { key, startDate: '', endDate: '' }]);
      }}>{copy.add}</button>
    </fieldset>
    <p className="m-0 text-sm leading-6 text-muted">{copy.unchanged}</p>
  </> }, { changed, valid: parsed.success, value });
}
