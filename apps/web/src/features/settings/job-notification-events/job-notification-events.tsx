'use client';
import { useCallback, useId, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobPrimary } from '../../jobs/job-ui';
import { defaultJobEventEmails, jobNotificationEventRows as rows, jobNotificationEventsData as copy, type JobEventEmailValues } from './job-notification-events.data';
export type JobNotificationEventsProps = {
  values: JobEventEmailValues; savedValues: JobEventEmailValues; revision: string; plan: 'free' | 'standard' | 'premium'; canManage: boolean;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; error?: string; conflict?: boolean;
  onChange: (values: JobEventEmailValues) => void; onDiscard: () => void; onReload: () => void;
  onSave: (values: { emails: JobEventEmailValues; revision: string }) => void | Promise<void>;
};
const signature = (values: JobEventEmailValues) => JSON.stringify(rows.map(row => values[row.id]));
export function JobNotificationEvents(props: JobNotificationEventsProps) {
  return <EventsSession key={JSON.stringify([props.revision, props.plan, props.canManage, props.state])} {...props}/>;
}
function EventsSession({ values, savedValues, revision, plan, canManage, state = 'ready', pending = false, error, conflict = false, onChange, onDiscard, onReload, onSave }: JobNotificationEventsProps) {
  const id = useId(), reviewButton = useRef<HTMLButtonElement>(null);
  const [reviewed, setReviewed] = useState(''), [saved, setSaved] = useState(false);
  const premium = plan === 'premium', effective = premium ? values : defaultJobEventEmails;
  const current = signature(effective), dirty = premium && current !== signature(savedValues);
  const allowed = premium && canManage && state === 'ready' && !pending && !conflict;
  const reviewing = !!reviewed && reviewed === current && premium && canManage && state === 'ready' && dirty;
  const focusSummary = useCallback((node: HTMLDListElement | null) => { node?.focus(); }, []);
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
    <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
    {state !== 'ready' ? <><p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{state === 'loading' ? copy.loading : copy.loadError}</p>{state === 'error' && <button type="button" className={`${jobButton} justify-self-start`} disabled={pending} onClick={onReload}>{copy.reload}</button>}</> : <>
      {!premium && <p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6"><strong>{copy.premium}</strong><br/>{copy.fixed}</p>}
      {!canManage && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
      <table className="w-full table-fixed border-collapse text-sm"><caption className="sr-only">{copy.title}</caption><thead><tr className="border-b border-line text-left text-muted"><th scope="col" className="w-1/2 py-3 pr-3">{copy.event}</th><th scope="col" className="w-1/4 px-1 py-3 text-center">{copy.inApp}</th><th scope="col" className="w-1/4 pl-1 py-3 text-center">{copy.email}</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-line align-top">
        <th scope="row" className="py-4 pr-3 text-left font-normal"><span className="font-semibold">{row.label}</span><span className="mt-2 block text-xs leading-5 text-muted">{row.help}</span></th>
        <td className="px-1 py-4 text-center text-xs leading-6 text-muted">{copy.on}</td>
        <td className="py-3 pl-1 text-center"><label className={`inline-flex min-h-11 min-w-11 items-center justify-center ${allowed ? 'cursor-pointer' : ''}`}><input type="checkbox" checked={effective[row.id]} disabled={!allowed} aria-label={copy.emailLabel(row.label)} className="size-5 accent-primary focus-visible:focus-ring" onChange={event => { if (!allowed) return; setReviewed(''); setSaved(false); onChange({ ...values, [row.id]: event.target.checked }); }}/></label></td>
      </tr>)}</tbody></table>
      <p className="m-0 text-sm leading-6 text-muted">{copy.personal}</p><p className="m-0 text-sm leading-6 text-muted">{copy.recipients}</p>
      {(error || conflict) && <FormFeedback kind="error" message={error || copy.conflict}/>}
      {conflict && <button type="button" disabled={pending} className={`${jobButton} justify-self-start`} onClick={onReload}>{copy.reload}</button>}
      {saved && !dirty && <FormFeedback kind="success" title={copy.saved} message={copy.savedHelp}/>}
      {premium && <footer className="flex flex-wrap items-center justify-between gap-4"><p role="status" className="m-0 text-sm text-muted">{dirty ? copy.changed : copy.unchanged}</p><div className="flex flex-wrap gap-3"><button type="button" className={jobButton} disabled={!allowed || !dirty} onClick={() => { setReviewed(''); setSaved(false); onDiscard(); }}>{copy.discard}</button><button ref={reviewButton} type="button" className={jobPrimary} disabled={!allowed || !dirty} onClick={() => setReviewed(current)}>{copy.review}</button></div></footer>}
      <JobDialog open={reviewing} title={copy.reviewTitle} description={copy.reviewDescription} confirmLabel={copy.confirm} pending={pending} error={error} conflict={conflict} onReload={onReload}
        onClose={() => { setReviewed(''); requestAnimationFrame(() => reviewButton.current?.focus()); }} onSubmit={async () => { if (!allowed || !dirty || reviewed !== current) return; await onSave({ emails: { ...effective }, revision }); setSaved(true); }}>
        <dl ref={focusSummary} tabIndex={-1} aria-label={copy.summary} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring">{rows.map(row => <div key={row.id} className="flex items-start justify-between gap-4"><dt className="font-semibold text-muted">{row.label}</dt><dd className="m-0 shrink-0">{effective[row.id] ? copy.enabled : copy.disabled}</dd></div>)}</dl><p className="m-0 text-sm leading-6 text-muted">{copy.personal}</p>
      </JobDialog>
    </>}
  </section>;
}
