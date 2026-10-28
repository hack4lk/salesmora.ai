'use client';
import { useId } from 'react';
import type { arrivalWindows } from '@salesmora/contracts';
import { calendarEventCardData as format } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { woButton } from '../work-order-ui';
import { workOrderVisitChoiceData as copy } from './work-order-visit-choice.data';
export type WorkOrderVisitChoiceValue = 'job' | 'separate' | null;
export type WorkOrderJobVisit = {
  scheduledDate: string; arrivalWindow: typeof arrivalWindows[number] | null; timezone: string;
  /** Current server capability for every affected active record; references are already permission-filtered. */
  canJoin: boolean; references: readonly string[];
};
export type WorkOrderVisitChoiceProps = {
  jobVisit: WorkOrderJobVisit | null; value: WorkOrderVisitChoiceValue; onChange: (value: Exclude<WorkOrderVisitChoiceValue, null>) => void;
  state?: 'ready' | 'loading' | 'error'; disabled?: boolean; onRetry?: () => void;
};
/** Presentation only. Creation must validate current authority, explicit choice and the reviewed visit revision on the server. */
export function WorkOrderVisitChoice({ jobVisit, value, onChange, state = 'ready', disabled = false, onRetry }: WorkOrderVisitChoiceProps) {
  const id = useId();
  if (state !== 'ready') return <section aria-labelledby={`${id}-title`} className="grid gap-3 rounded-xl border border-line bg-canvas p-4 text-ink">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{copy.title}</h3>
    <p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'loading' ? copy.loading : copy.error}</p>
    {state === 'error' && onRetry && <button type="button" className={`${woButton} justify-self-start`} disabled={disabled} onClick={onRetry}>{copy.retry}</button>}
  </section>;
  if (!jobVisit) return <p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.unscheduled}</p>;
  const selected = value === 'job' && !jobVisit.canJoin ? null : value;
  return <fieldset disabled={disabled} aria-describedby={`${id}-help ${id}-selection`} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line p-4 text-ink">
    <legend className="px-1 text-base font-semibold">{copy.title}</legend>
    <p id={`${id}-help`} className="m-0 text-sm leading-6 text-muted">{copy.description}</p>
    <dl className="m-0 grid min-w-0 gap-3 rounded-xl bg-canvas p-3 text-sm sm:grid-cols-2">
      <div><dt className="text-xs font-semibold text-muted">{copy.date}</dt><dd className="m-0 mt-1 font-semibold"><time dateTime={jobVisit.scheduledDate}>{format.date(jobVisit.scheduledDate)}</time></dd></div>
      <div><dt className="text-xs font-semibold text-muted">{copy.window}</dt><dd className="m-0 mt-1">{jobVisit.arrivalWindow ? format.window(jobVisit.arrivalWindow) : copy.noWindow}</dd></div>
      <div className="min-w-0 sm:col-span-2"><dt className="text-xs font-semibold text-muted">{copy.timezone}</dt><dd className="m-0 mt-1 wrap-anywhere">{jobVisit.timezone}</dd></div>
      {jobVisit.references.length > 0 && <div className="min-w-0 sm:col-span-2"><dt className="text-xs font-semibold text-muted">{copy.records}</dt><dd className="m-0 mt-1"><ul className="m-0 grid list-none gap-1 p-0">{[...new Set(jobVisit.references)].map(ref => <li key={ref} className="wrap-anywhere">{ref}</li>)}</ul></dd></div>}
    </dl>
    {(['job', 'separate'] as const).map(option => {
      const unavailable = option === 'job' && !jobVisit.canJoin;
      return <label key={option} className={`flex min-h-11 min-w-0 items-start gap-3 rounded-xl border p-4 ${disabled || unavailable ? 'cursor-not-allowed' : 'cursor-pointer'} ${selected === option ? 'border-primary bg-primary/5' : 'border-line bg-paper'}`}>
        <input type="radio" required name={`${id}-visit`} value={option} checked={selected === option} disabled={unavailable} aria-labelledby={`${id}-${option}-title`} aria-describedby={`${id}-${option}-help${unavailable ? ` ${id}-denied` : ''}`}
          onChange={() => { if (!disabled && !unavailable) onChange(option); }} className="mt-1 size-4 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring disabled:cursor-not-allowed"/>
        <span className="grid min-w-0 gap-1"><span id={`${id}-${option}-title`} className="text-sm font-semibold">{option === 'job' ? copy.useJob : copy.separate}</span>
          <span id={`${id}-${option}-help`} className="text-sm leading-6 text-muted">{option === 'job' ? copy.useJobHelp : copy.separateHelp}</span></span>
      </label>;
    })}
    {!jobVisit.canJoin && <p id={`${id}-denied`} role="status" className="m-0 text-sm leading-6 text-muted">{copy.denied}</p>}
    <p id={`${id}-selection`} aria-live="polite" className="m-0 text-sm leading-6 text-muted">{selected === 'job' ? copy.sharedHelp : selected === 'separate' ? copy.separateSelected : copy.required}</p>
  </fieldset>;
}
