'use client';
import { useCallback, useId, useRef, useState } from 'react';
import { jobDateSchema } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobInput, jobLabel, jobPrimary } from '../../jobs/job-ui';
import { defaultCompletionDeadlineData as copy, defaultDeadlineDayLimit, defaultRelativeDeadlineDays, defaultDeadlineExample } from './default-completion-deadline.data';
export type DefaultDeadlineValues = { mode: 'unset' } | { mode: 'relative'; days: number; count: 'business' | 'calendar' };
export type DefaultCompletionDeadlineProps = {
  values: DefaultDeadlineValues; savedValues: DefaultDeadlineValues; revision: string; timezone: string; exampleCreatedDate: string; canManage: boolean;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; error?: string; conflict?: boolean;
  onChange: (values: DefaultDeadlineValues) => void; onDiscard: () => void; onReload: () => void;
  onSave: (values: DefaultDeadlineValues & { revision: string }) => void | Promise<void>;
};
export function DefaultCompletionDeadline(props: DefaultCompletionDeadlineProps) {
  return <DeadlineSession key={JSON.stringify([props.revision, props.timezone, props.canManage, props.state])} {...props}/>;
}
function DeadlineSession({ values, savedValues, revision, timezone, exampleCreatedDate, canManage, state = 'ready', pending = false, error, conflict = false, onChange, onDiscard, onReload, onSave }: DefaultCompletionDeadlineProps) {
  const id = useId(), reviewButton = useRef<HTMLButtonElement>(null);
  const relativeDraft = useRef<Extract<DefaultDeadlineValues, { mode: 'relative' }>>(values.mode === 'relative' ? values : { mode: 'relative', days: defaultRelativeDeadlineDays, count: 'business' });
  const [reviewed, setReviewed] = useState(''), [saved, setSaved] = useState(false);
  const signature = JSON.stringify(values), dirty = signature !== JSON.stringify(savedValues);
  const valid = values.mode === 'unset' || (Number.isInteger(values.days) && values.days >= 1 && values.days <= defaultDeadlineDayLimit);
  const allowed = canManage && state === 'ready' && !pending && !conflict;
  const reviewing = !!reviewed && reviewed === signature && canManage && state === 'ready' && valid && dirty;
  const focusSummary = useCallback((node: HTMLDListElement | null) => { node?.focus(); }, []);
  const change = (next: DefaultDeadlineValues) => {
    if (!allowed) return;
    if (values.mode === 'relative') relativeDraft.current = values;
    if (next.mode === 'relative') relativeDraft.current = next;
    setReviewed(''); setSaved(false); onChange(next);
  };
  const hasExample = valid && jobDateSchema.safeParse(exampleCreatedDate).success;
  const deadline = hasExample && values.mode === 'relative' ? defaultDeadlineExample(exampleCreatedDate, values.days, values.count) : null;
  const rule = values.mode === 'unset' ? copy.unset : copy.summaryRelative(values.days, values.count);
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
    <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
    {state !== 'ready' ? <><p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'loading' ? copy.loading : copy.loadError}</p>{state === 'error' && <button type="button" className={`${jobButton} justify-self-start`} disabled={pending} onClick={onReload}>{copy.reload}</button>}</> : <>
      {!canManage && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
      <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-4 border-0 p-0"><legend className="mb-3 text-base font-semibold">{copy.mode}</legend>
        {(['unset', 'relative'] as const).map(mode => <label key={mode} className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 ${values.mode === mode ? 'border-primary bg-primary/5' : 'border-line'}`}>
          <input type="radio" name={`${id}-mode`} value={mode} checked={values.mode === mode} onChange={() => change(mode === 'unset' ? { mode } : relativeDraft.current)} aria-labelledby={`${id}-${mode}`} aria-describedby={`${id}-${mode}-help`} className="mt-1 size-4 shrink-0 accent-primary focus-visible:focus-ring"/>
          <span className="grid min-w-0 gap-1"><span id={`${id}-${mode}`} className="text-sm font-semibold">{mode === 'unset' ? copy.unset : copy.relative}</span><span id={`${id}-${mode}-help`} className="text-sm leading-6 text-muted">{mode === 'unset' ? copy.unsetHelp : copy.relativeHelp}</span></span>
        </label>)}
        {values.mode === 'relative' && <>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2"><label className={jobLabel}>{copy.days}<input type="number" required min={1} max={defaultDeadlineDayLimit} className={jobInput} value={values.days || ''} onChange={e => change({ ...values, days: e.target.value === '' ? 0 : Number(e.target.value) })}/></label>
          <label className={jobLabel}>{copy.count}<select className={jobInput} value={values.count} onChange={e => change({ ...values, count: e.target.value === 'calendar' ? 'calendar' : 'business' })}><option value="business">{copy.business}</option><option value="calendar">{copy.calendar}</option></select></label></div>
          <p className="m-0 text-sm leading-6 text-muted">{copy.counting}</p>
        </>}
      </fieldset>
      {!valid && <FormFeedback kind="error" message={copy.invalid}/>}
      <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{copy.precedence}</p>
      {hasExample && <section aria-labelledby={`${id}-example`} className="grid min-w-0 gap-3 rounded-xl border border-line p-4"><h3 id={`${id}-example`} className="m-0 text-base font-semibold">{copy.example}</h3>
        <dl className="m-0 grid min-w-0 gap-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-muted">{copy.created}</dt><dd className="m-0 mt-1"><time dateTime={exampleCreatedDate}>{copy.date(exampleCreatedDate)}</time></dd></div><div><dt className="font-semibold text-muted">{copy.deadline}</dt><dd className="m-0 mt-1 font-semibold">{deadline ? <time dateTime={deadline}>{copy.date(deadline)}</time> : copy.noDeadline}</dd></div>
        <div className="min-w-0 sm:col-span-2"><dt className="font-semibold text-muted">{copy.timezone}</dt><dd className="m-0 mt-1 wrap-anywhere">{timezone}</dd></div></dl><p className="m-0 text-xs leading-5 text-muted">{copy.exampleHelp}</p>
      </section>}
      {(error || conflict) && <FormFeedback kind="error" message={error || copy.conflict}/>}
      {conflict && <button type="button" className={`${jobButton} justify-self-start`} disabled={pending} onClick={onReload}>{copy.reload}</button>}
      {saved && !dirty && <FormFeedback kind="success" title={copy.saved} message={copy.savedHelp}/>}
      <footer className="flex flex-wrap items-center justify-between gap-4"><p role="status" className="m-0 text-sm text-muted">{dirty ? copy.changed : copy.unchanged}</p><div className="flex flex-wrap gap-3">
        <button type="button" className={jobButton} disabled={!allowed || !dirty} onClick={() => { setReviewed(''); setSaved(false); onDiscard(); }}>{copy.discard}</button>
        <button ref={reviewButton} type="button" className={jobPrimary} disabled={!allowed || !dirty || !valid} onClick={() => setReviewed(signature)}>{copy.review}</button></div></footer>
      <JobDialog open={reviewing} title={copy.reviewTitle} description={copy.reviewDescription} confirmLabel={copy.confirm} pending={pending} error={error} conflict={conflict} onReload={onReload}
        onClose={() => { setReviewed(''); requestAnimationFrame(() => reviewButton.current?.focus()); }} onSubmit={async () => { if (!allowed || !valid || !dirty || reviewed !== signature) return; await onSave({ ...values, revision }); setSaved(true); }}>
        <dl ref={focusSummary} tabIndex={-1} aria-label={copy.summary} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring">
          <div><dt className="font-semibold text-muted">{copy.summaryMode}</dt><dd className="m-0 mt-1">{rule}</dd></div>
          <div><dt className="font-semibold text-muted">{copy.effect}</dt><dd className="m-0 mt-1">{copy.futureJobs}</dd></div>
          <div><dt className="font-semibold text-muted">{copy.timezone}</dt><dd className="m-0 mt-1 wrap-anywhere">{timezone}</dd></div>
        </dl><p className="m-0 text-sm leading-6 text-muted">{copy.precedence}</p>
      </JobDialog>
    </>}
  </section>;
}
