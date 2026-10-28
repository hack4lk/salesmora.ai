'use client';
import { useCallback, useId, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { jobButton, jobInput, jobLabel, jobPrimary } from '../../jobs/job-ui';
import { deadlineReminderSettingsData as copy, reminderDayLimit, reminderLimit } from './deadline-reminder-settings.data';
export type DeadlineReminderValues = { sendTime: string; offsets: { id: string; relative: 'before' | 'on' | 'after'; days: number }[]; extraRecipientIds: string[] };
export type DeadlineReminderSettingsProps = {
  plan: 'free' | 'standard' | 'premium'; timezone: string; revision: string; canManage: boolean;
  values: DeadlineReminderValues; savedValues: DeadlineReminderValues; members: readonly { id: string; name: string }[];
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; error?: string; conflict?: boolean;
  onChange: (values: DeadlineReminderValues) => void; onDiscard: () => void; onReload: () => void;
  onSave: (values: DeadlineReminderValues & { revision: string }) => void | Promise<void>;
};
export function DeadlineReminderSettings(props: DeadlineReminderSettingsProps) {
  const key = JSON.stringify([props.plan, props.revision, props.canManage, props.timezone, props.members.map(m => m.id), props.state]);
  return <ReminderSession key={key} {...props}/>;
}
function ReminderSession({ plan, timezone, revision, canManage, values, savedValues, members, state = 'ready', pending = false, error, conflict = false, onChange, onDiscard, onReload, onSave }: DeadlineReminderSettingsProps) {
  const id = useId(), reviewButton = useRef<HTMLButtonElement>(null);
  const [reviewed, setReviewed] = useState(''), [saved, setSaved] = useState(false);
  const premium = plan === 'premium', signature = JSON.stringify(values), dirty = signature !== JSON.stringify(savedValues);
  const fixed = values.offsets.length === 1 && values.offsets[0].relative === 'on' && values.offsets[0].days === 0 && values.extraRecipientIds.length === 0;
  const entitlementValid = premium || fixed;
  const recipientsValid = new Set(values.extraRecipientIds).size === values.extraRecipientIds.length && values.extraRecipientIds.every(memberId => members.some(m => m.id === memberId));
  const rulesValid = values.offsets.length > 0 && values.offsets.length <= reminderLimit && new Set(values.offsets.map(r => `${r.relative}:${r.days}`)).size === values.offsets.length
    && new Set(values.offsets.map(r => r.id)).size === values.offsets.length && values.offsets.every(r => r.relative === 'on' ? r.days === 0 : Number.isInteger(r.days) && r.days >= 1 && r.days <= reminderDayLimit);
  const timeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test(values.sendTime);
  const allowed = canManage && state === 'ready' && !pending && !conflict;
  const valid = rulesValid && timeValid && entitlementValid && recipientsValid;
  const reviewing = !!reviewed && reviewed === signature && canManage && state === 'ready' && valid && dirty;
  const focusReview = useCallback((node: HTMLDListElement | null) => { node?.focus(); }, []);
  const update = (next: DeadlineReminderValues) => { if (allowed) { setSaved(false); setReviewed(''); onChange(next); } };
  const validation = !entitlementValid || !recipientsValid ? copy.stale : !rulesValid ? copy.invalid : !timeValid ? copy.timeError : '';
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
    <header className="min-w-0"><p className="m-0 text-xs font-bold text-primary">{copy.plan[plan]}</p><h2 id={`${id}-title`} className="mb-0 mt-2 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
    {state !== 'ready' ? <><p role={state === 'error' ? 'alert' : 'status'} className="m-0 text-sm text-muted">{state === 'loading' ? copy.loading : copy.error}</p>{state === 'error' && <button type="button" className={`${jobButton} justify-self-start`} onClick={onReload}>{copy.reload}</button>}</> : <>
      {!canManage && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
      <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{premium ? copy.premium : copy.fixed}</p>
      <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-5 border-0 p-0"><legend className="mb-3 text-base font-semibold">{copy.timing}</legend>
        {!premium ? <p className="m-0 text-sm font-semibold">{copy.on}</p> : <>
          {values.offsets.map((rule, index) => <fieldset key={rule.id} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4 sm:grid-cols-2 md:grid-cols-3"><legend className="px-1 text-sm font-semibold">{copy.rule(index)}</legend>
            <label className={jobLabel}>{copy.relative}<select className={jobInput} value={rule.relative} onChange={e => { const relative = e.target.value as 'before' | 'on' | 'after'; update({ ...values, offsets: values.offsets.map(r => r.id === rule.id ? { ...r, relative, days: relative === 'on' ? 0 : r.days || 1 } : r) }); }}>
              <option value="before">{copy.before}</option><option value="on">{copy.on}</option><option value="after">{copy.after}</option></select></label>
            {rule.relative !== 'on' && <label className={jobLabel}>{copy.days}<input type="number" min={1} max={reminderDayLimit} required className={jobInput} value={rule.days || ''} onChange={e => update({ ...values, offsets: values.offsets.map(r => r.id === rule.id ? { ...r, days: e.target.value === '' ? 0 : Number(e.target.value) } : r) })}/></label>}
            <button type="button" className={`${jobButton} justify-self-start sm:col-span-2 md:col-span-1 md:col-start-3 md:self-end md:justify-self-end`} aria-label={`${copy.remove} ${index + 1}`} onClick={() => update({ ...values, offsets: values.offsets.filter(r => r.id !== rule.id) })}>{copy.remove}</button>
          </fieldset>)}
          <p className="m-0 text-xs leading-5 text-muted">{copy.count(values.offsets.length)} · {copy.limit}</p>
          <button type="button" className={`${jobButton} justify-self-start`} disabled={values.offsets.length >= reminderLimit} onClick={() => { const candidates = Array.from({ length: reminderDayLimit }, (_, i) => i + 1); const days = candidates.find(d => !values.offsets.some(r => r.relative === 'before' && r.days === d)); if (days) update({ ...values, offsets: [...values.offsets, { id: crypto.randomUUID(), relative: 'before', days }] }); }}>{copy.add}</button>
        </>}
        <label className={jobLabel}>{copy.sendTime}<input type="time" required className={jobInput} value={values.sendTime} onChange={e => update({ ...values, sendTime: e.target.value })}/></label>
        <div className="min-w-0"><p className="m-0 text-sm font-semibold">{copy.timezone}</p><p className="mb-0 mt-1 text-sm wrap-anywhere">{timezone}</p><p className="mb-0 mt-2 text-xs leading-5 text-muted">{copy.timezoneHelp}</p></div>
      </fieldset>
      <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-3 border-0 p-0"><legend className="mb-3 text-base font-semibold">{copy.recipients}</legend>
        <p className="m-0 text-sm font-semibold">{copy.team}</p><p className="m-0 text-sm leading-6 text-muted">{copy.teamHelp}</p>
        {premium ? <><h3 className="mb-0 mt-2 text-sm font-semibold">{copy.extra}</h3><p className="m-0 text-sm leading-6 text-muted">{copy.extraHelp}</p>
          {members.length === 0 && <p className="m-0 text-sm text-muted">{copy.noMembers}</p>}
          {members.map(member => <label key={member.id} className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-4 shrink-0 accent-primary focus-visible:focus-ring" checked={values.extraRecipientIds.includes(member.id)} onChange={e => update({ ...values, extraRecipientIds: e.target.checked ? [...values.extraRecipientIds, member.id] : values.extraRecipientIds.filter(i => i !== member.id) })}/><span className="wrap-anywhere">{member.name}</span></label>)}
        </> : <p className="m-0 text-sm leading-6 text-muted">{copy.locked}</p>}
      </fieldset>
      <aside className="grid gap-2 rounded-xl border border-line bg-canvas p-4"><h3 className="m-0 text-sm font-semibold">{copy.behavior}</h3><p className="m-0 text-sm leading-6 text-muted">{copy.behaviorHelp}</p><p className="m-0 text-xs leading-5 text-muted">{copy.channels}</p></aside>
      {validation && <FormFeedback kind="error" message={validation}/>}{(error || conflict) && <FormFeedback kind="error" message={error || copy.conflict}/>}
      {conflict && <button type="button" className={`${jobButton} justify-self-start`} disabled={pending} onClick={onReload}>{copy.reload}</button>}
      {saved && !dirty && <FormFeedback kind="success" title={copy.saved} message={copy.savedHelp}/>}
      <footer className="flex flex-wrap items-center justify-between gap-4"><p role="status" className="m-0 text-sm text-muted">{dirty ? copy.changed : copy.unchanged}</p><div className="flex flex-wrap gap-3">
        <button type="button" className={jobButton} disabled={!allowed || !dirty} onClick={() => { setReviewed(''); setSaved(false); onDiscard(); }}>{copy.discard}</button>
        <button ref={reviewButton} type="button" className={jobPrimary} disabled={!allowed || !valid || !dirty} onClick={() => setReviewed(signature)}>{copy.review}</button></div></footer>
      <JobDialog open={reviewing} title={copy.reviewTitle} description={copy.reviewDescription} confirmLabel={copy.confirm} pending={pending} error={error} conflict={conflict} onReload={onReload}
        onClose={() => { setReviewed(''); requestAnimationFrame(() => reviewButton.current?.focus()); }} onSubmit={async () => { if (!allowed || !valid || !dirty || reviewed !== signature) return; await onSave({ ...values, revision }); setSaved(true); }}>
        <dl ref={focusReview} tabIndex={-1} aria-label={copy.summary} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm focus-visible:focus-ring">
          <div><dt className="font-semibold text-muted">{copy.timing}</dt><dd className="m-0 mt-1"><ul className="m-0 grid list-none gap-1 p-0">{values.offsets.map(rule => <li key={rule.id}>{copy.offsetLabel(rule.relative, rule.days)}</li>)}</ul></dd></div>
          <div><dt className="font-semibold text-muted">{copy.timeSummary}</dt><dd className="m-0 mt-1 wrap-anywhere">{values.sendTime} · {timezone}</dd></div>
          <div><dt className="font-semibold text-muted">{copy.recipientSummary}</dt><dd className="m-0 mt-1"><p className="m-0">{copy.defaultRecipients}</p>{values.extraRecipientIds.map(memberId => <p key={memberId} className="mb-0 mt-1 wrap-anywhere">{members.find(m => m.id === memberId)?.name}</p>)}</dd></div>
        </dl>
      </JobDialog>
    </>}
  </section>;
}
