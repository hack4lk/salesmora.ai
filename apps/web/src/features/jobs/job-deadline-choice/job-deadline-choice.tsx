'use client';
import { useId } from 'react';
import { jobDateSchema, type JobNotificationSettingsSnapshot } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { jobButton, jobInput, jobLabel, jobDate } from '../job-ui';
import { jobDeadlineChoiceData as copy } from './job-deadline-choice.data';
export type JobDeadlineChoiceValue = { mode: 'workspace'; revision: string } | { mode: 'date'; date: string } | { mode: 'unset' };
export type JobDeadlineDefaultContext = { rule: JobNotificationSettingsSnapshot['deadline']['values']; revision: string; projectedDate: string | null; createdDate: string; timezone: string };
export type JobDeadlineChoiceProps = {
  value: JobDeadlineChoiceValue; context: JobDeadlineDefaultContext; canOverride: boolean;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; readOnly?: boolean;
  onChange: (value: JobDeadlineChoiceValue) => void; onReload: () => void;
};
/** Presentation validity only. Creation must resolve and recheck the reviewed deadline on the server. */
export function jobDeadlineChoiceValid({ value, context, canOverride, state = 'ready' }: Pick<JobDeadlineChoiceProps, 'value' | 'context' | 'canOverride' | 'state'>) {
  if (state !== 'ready' || !jobDateSchema.safeParse(context.createdDate).success || (context.rule.mode === 'unset' ? context.projectedDate !== null : !jobDateSchema.safeParse(context.projectedDate).success)) return false;
  if (value.mode === 'workspace') return value.revision === context.revision;
  return canOverride && (value.mode === 'unset' || jobDateSchema.safeParse(value.date).success);
}
export function JobDeadlineChoice({ value, context, canOverride, state = 'ready', pending = false, readOnly = false, onChange, onReload }: JobDeadlineChoiceProps) {
  const id = useId(), disabled = pending || readOnly;
  const contextValid = jobDateSchema.safeParse(context.createdDate).success && (context.rule.mode === 'unset' ? context.projectedDate === null : jobDateSchema.safeParse(context.projectedDate).success);
  const stale = value.mode === 'workspace' && value.revision !== context.revision;
  const invalidDate = value.mode === 'date' && !jobDateSchema.safeParse(value.date).success;
  const denied = value.mode !== 'workspace' && !canOverride;
  const valid = jobDeadlineChoiceValid({ value, context, canOverride, state });
  const result = value.mode === 'workspace' ? context.projectedDate : value.mode === 'date' ? value.date : null;
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 rounded-xl border border-line bg-paper p-4 sm:p-6">
    <header><h2 id={`${id}-title`} className="m-0 text-base font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></header>
    {state !== 'ready' || !contextValid ? <><p role={state === 'loading' ? 'status' : 'alert'} className="m-0 text-sm leading-6 text-muted">{state === 'loading' ? copy.loading : copy.error}</p>{state !== 'loading' && <button type="button" className={`${jobButton} justify-self-start`} disabled={disabled} onClick={onReload}>{copy.reload}</button>}</> : <>
      {readOnly && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
      {!canOverride && <p className="m-0 text-sm leading-6 text-muted">{copy.limited}</p>}
      <fieldset disabled={disabled} className="m-0 grid min-w-0 gap-3 border-0 p-0"><legend className="sr-only">{copy.title}</legend>
        {(['workspace', 'date', 'unset'] as const).map(mode => <label key={mode} className={`flex min-h-11 min-w-0 items-start gap-3 rounded-xl border p-4 ${value.mode === mode ? 'border-primary bg-primary/5' : 'border-line'} ${mode !== 'workspace' && !canOverride ? 'text-muted' : 'cursor-pointer'}`}>
          <input type="radio" name={`${id}-mode`} value={mode} checked={value.mode === mode} disabled={mode !== 'workspace' && !canOverride} aria-labelledby={`${id}-${mode}`} aria-describedby={`${id}-${mode}-help`} className="mt-1 size-4 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => onChange(mode === 'workspace' ? { mode, revision: context.revision } : mode === 'date' ? { mode, date: '' } : { mode })}/>
          <span className="grid min-w-0 gap-1"><span id={`${id}-${mode}`} className="text-sm font-semibold">{mode === 'workspace' ? copy.workspace : mode === 'date' ? copy.custom : copy.unset}</span><span id={`${id}-${mode}-help`} className="text-sm leading-6 text-muted">{mode === 'workspace' ? context.rule.mode === 'unset' ? copy.workspaceUnset : copy.relative(context.rule.days, context.rule.count) : mode === 'date' ? copy.customHelp : copy.unsetHelp}</span></span>
        </label>)}
        {value.mode === 'date' && <label className={jobLabel}>{copy.date}<input type="date" required disabled={!canOverride} aria-invalid={invalidDate} aria-describedby={invalidDate ? `${id}-date-error` : undefined} className={jobInput} value={value.date} onChange={event => onChange({ mode: 'date', date: event.target.value })}/></label>}
      </fieldset>
      {invalidDate && <p id={`${id}-date-error`} role="alert" className="m-0 text-sm text-error">{copy.needsDate}</p>}
      {stale && <><FormFeedback kind="error" message={copy.stale}/><button type="button" className={`${jobButton} justify-self-start`} disabled={disabled} onClick={() => onChange({ mode: 'workspace', revision: context.revision })}>{copy.useCurrent}</button></>}
      {denied && <FormFeedback kind="error" message={copy.denied}/>}
      {valid && <dl aria-label={copy.result} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm"><div><dt className="font-semibold text-muted">{copy.result}</dt><dd className="m-0 mt-1 font-semibold">{result ? <time dateTime={result}>{jobDate(result)}</time> : copy.noDeadline}</dd></div>
        {value.mode === 'workspace' && <div><dt className="font-semibold text-muted">{copy.created}</dt><dd className="m-0 mt-1"><time dateTime={context.createdDate}>{jobDate(context.createdDate)}</time></dd></div>}
        <div className="min-w-0"><dt className="font-semibold text-muted">{copy.timezone}</dt><dd className="m-0 mt-1 wrap-anywhere">{context.timezone}</dd></div></dl>}
      {value.mode === 'workspace' && context.rule.mode === 'relative' && <p className="m-0 text-xs leading-5 text-muted">{copy.counting}</p>}
      <p className="m-0 text-xs leading-5 text-muted">{copy.preview}</p>
    </>}
  </section>;
}
