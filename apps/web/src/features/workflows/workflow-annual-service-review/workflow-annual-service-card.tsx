'use client';
import { useId, useRef, useState } from 'react';
import type { WorkflowNotificationChannels } from '@salesmora/contracts';
import { ApiRequestError } from '../../api/api-request';
import { WorkflowNotificationChoices } from '../workflow-notification-choices';

export type AnnualServiceRule = {
  name: string; serviceId: string; firstReviewDate: string; localTime: string; recipientId: string;
  notifications: WorkflowNotificationChannels;
};
export type AnnualServiceCardProps = {
  value: AnnualServiceRule; services: readonly { id: string; name: string }[]; recipients: readonly { id: string; name: string }[];
  timezone: string; clock: { date: string; time: string }; canPublish: boolean; editing?: boolean; paused?: boolean;
  state?: 'draft' | 'published' | 'cancelled' | 'expired'; onPublish: (value: AnnualServiceRule) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : undefined;
}
/** Canonical annual-review card. The host owns current setup, server validation and persistence. */
export function WorkflowAnnualServiceCard({ value: initial, services, recipients, timezone, clock, canPublish, editing = false, paused = false, state = 'draft', onPublish, onCancel }: AnnualServiceCardProps) {
  const id = useId(), lock = useRef(false), heading = useRef<HTMLHeadingElement>(null), firstField = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial), [settings, setSettings] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState('');
  const service = services.find(item => item.id === value.serviceId), recipient = recipients.find(item => item.id === value.recipientId);
  let displayDate = value.firstReviewDate;
  if (editing && value.firstReviewDate === initial.firstReviewDate && calendarDate(displayDate)) {
    for (let year = Math.max(Number(displayDate.slice(0, 4)), Number(clock.date.slice(0, 4))); year <= 9999; year++) {
      const candidate = `${year}${displayDate.slice(4)}`;
      if (calendarDate(candidate) && (candidate > clock.date || candidate === clock.date && value.localTime > clock.time)) { displayDate = candidate; break; }
    }
  }
  const date = calendarDate(displayDate), timeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime);
  const future = !!date && (displayDate > clock.date || displayDate === clock.date && value.localTime > clock.time);
  const validation = !service ? 'Choose a service.' : !recipient ? 'Choose who to notify.' : !value.name.trim() || value.name.trim().length > 120 ? 'Enter a workflow name.'
    : !date ? 'Choose the first review date.' : !timeValid ? 'Choose a valid send time.' : !future ? 'Choose a future review date and time.'
      : !value.notifications.inApp && !value.notifications.email ? 'Keep at least one notification channel on.' : '';
  const allowed = canPublish && state === 'draft' && !pending;
  const anniversary = date ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date) : '';
  const leapDay = value.firstReviewDate.endsWith('-02-29');
  async function decide(cancel = false) {
    if (lock.current || pending || state !== 'draft' || !cancel && (!allowed || validation)) return;
    lock.current = true; setPending(true); setError('');
    try { if (cancel) await onCancel(); else await onPublish({ ...value, name: value.name.trim() }); }
    catch (failure) { setError(failure instanceof ApiRequestError ? failure.message : cancel ? 'The draft could not be canceled. Try again.' : 'The workflow could not be saved. Your choices are still here.'); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name || 'Annual service review'}</h3>
    <p className="m-0 text-sm leading-6">Notify {recipient?.name ?? 'your teammate'} to review past customers for {service?.name ?? 'the selected service'}.</p>
    {settings && <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-4 border-0 p-0">
      <label className="grid gap-1 text-sm font-semibold">Workflow name<input ref={firstField} className={input} maxLength={120} value={value.name} onChange={event => setValue({ ...value, name: event.target.value })}/></label>
      <label className="grid gap-1 text-sm font-semibold">Service<select className={input} value={value.serviceId} onChange={event => setValue({ ...value, serviceId: event.target.value })}><option value="">Choose a service</option>{services.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-semibold">Notify<select className={input} value={value.recipientId} onChange={event => setValue({ ...value, recipientId: event.target.value })}><option value="">Choose a teammate</option>{recipients.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </fieldset>}
    <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2">
      <label className="grid min-w-0 gap-1 text-sm font-semibold">{editing ? 'Next review date' : 'First review date'}<input type="date" className={input} min={clock.date} value={displayDate} onChange={event => setValue({ ...value, firstReviewDate: event.target.value })}/></label>
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Send at<input type="time" className={input} value={value.localTime} onChange={event => setValue({ ...value, ...(editing ? { firstReviewDate: displayDate } : {}), localTime: event.target.value })}/></label>
    </fieldset>
    <p className="m-0 text-xs text-assistant-muted">{anniversary ? `Repeats every ${anniversary}${leapDay ? ', in leap years only' : ''}. ` : 'Choose a date to repeat each year. '}{timezone}</p>
    <WorkflowNotificationChoices dark value={value.notifications} disabled={!allowed} onChange={notifications => setValue({ ...value, notifications })}/>
    <p className="m-0 text-xs leading-5 text-assistant-muted">Your team reviews past customers. Customer emails need a separate review and Send action.</p>
    {editing && paused && <p className="m-0 text-sm">This workflow stays paused after saving.</p>}
    {state !== 'draft' ? <p role="status" className="m-0 text-sm">{state === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : state === 'cancelled' ? 'Draft canceled.' : 'This draft expired. Ask for a fresh review.'}</p> : <>
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to {editing ? 'save' : 'publish'} this workflow.</p>}
      {validation && <p role="alert" className="m-0 text-sm">{validation}</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!allowed} onClick={() => { setSettings(!settings); requestAnimationFrame(() => (settings ? heading.current : firstField.current)?.focus()); }}>{settings ? 'Back to review' : 'Change settings'}</button>
        <button type="button" className={button} disabled={pending} onClick={() => void decide(true)}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!allowed || !!validation} onClick={() => void decide()}>{pending ? 'Saving…' : editing ? 'Save changes' : 'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
