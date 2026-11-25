'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { WorkflowNotificationChoices } from '../workflow-notification-choices';

export type { ColdLeadRecipient, AssignedLeadColdValues } from '@salesmora/contracts';
import type { AssignedLeadColdValues } from '@salesmora/contracts';
export type AssignedLeadColdCardProps = {
  value: AssignedLeadColdValues; recipients: readonly { id: string; name: string }[]; timezone: string;
  canPublish: boolean; editing?: boolean; paused?: boolean; expiresAt?: string | null;
  state?: 'draft' | 'published' | 'cancelled' | 'expired';
  onPublish: (value: AssignedLeadColdValues) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Canonical review. The host supplies eligible teammates and owns current authority and persistence. */
export function AssignedLeadColdCard(props: AssignedLeadColdCardProps) {
  return <ColdLeadReview key={JSON.stringify([props.value, props.editing, props.expiresAt])} {...props}/>;
}
function ColdLeadReview({ value: initial, recipients, timezone, canPublish, editing = false, paused = false, expiresAt, state: suppliedState = 'draft', onPublish, onCancel }: AssignedLeadColdCardProps) {
  const id = useId(), lock = useRef(false), heading = useRef<HTMLHeadingElement>(null), first = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial), [delay, setDelay] = useState(String(initial.businessDays));
  const [settings, setSettings] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState('');
  const [expired, setExpired] = useState(() => !!expiresAt && Date.parse(expiresAt) <= Date.now());
  useEffect(() => {
    if (!expiresAt || expired) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => { const remaining = Date.parse(expiresAt) - Date.now(); if (!Number.isFinite(remaining) || remaining <= 0) setExpired(true); else timer = setTimeout(check, Math.min(remaining, 2147483647)); };
    check(); return () => clearTimeout(timer);
  }, [expiresAt, expired]);
  const state = suppliedState === 'draft' && expired ? 'expired' : suppliedState;
  const editable = canPublish && state === 'draft' && !pending;
  const days = Number(delay), validDays = delay.trim() !== '' && Number.isInteger(days) && days >= 1 && days <= 30;
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime);
  const person = value.recipient.kind === 'teammate' ? recipients.find(person => value.recipient.kind === 'teammate' && person.id === value.recipient.id) : undefined;
  const recipientName = value.recipient.kind === 'owner' ? 'the lead owner' : person?.name ?? 'your teammate';
  const validation = !value.name.trim() || value.name.trim().length > 120 ? 'Enter a workflow name.' : !validDays ? 'Choose a delay of 1–30 business days.' : !validTime ? 'Choose a valid send time.' : value.recipient.kind === 'teammate' && !person ? 'Choose a current teammate or Lead owner.' : '';
  const chosen = { ...value, name: value.name.trim(), businessDays: days };
  const changed = JSON.stringify(chosen) !== JSON.stringify(initial);
  const time = validTime ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`2000-01-01T${value.localTime}:00Z`)) : 'the chosen time';
  async function decide(cancel = false) {
    if (lock.current || state !== 'draft' || !cancel && (!editable || !!validation || !value.notifications.inApp && !value.notifications.email || editing && !changed)) return;
    if (!cancel && expiresAt && Date.parse(expiresAt) <= Date.now()) { setExpired(true); return; }
    lock.current = true; setPending(true); setError('');
    try { if (cancel) await onCancel(); else await onPublish(chosen); }
    catch { setError(cancel ? 'The draft could not be canceled. Try again.' : 'The workflow could not be saved. Your choices are still here.'); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 ref={heading} id={`${id}-title`} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name || 'Assigned lead needs attention'}</h3>
    <p className="m-0 text-sm leading-6">Notify {recipientName} at {time} if an assigned lead has no recorded activity for {validDays ? `${days} business ${days === 1 ? 'day' : 'days'}` : 'the chosen delay'}.</p>
    {settings && <label className="grid min-w-0 gap-1 text-sm font-semibold">Workflow name<input ref={first} className={input} maxLength={120} disabled={!editable} value={value.name} onChange={event => setValue({ ...value, name: event.target.value })}/></label>}
    <fieldset disabled={!editable} className="m-0 grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2">
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Business days without activity<input type="number" min={1} max={30} step={1} inputMode="numeric" className={input} value={delay} onChange={event => setDelay(event.target.value)}/></label>
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Send at<input type="time" className={input} value={value.localTime} onChange={event => setValue({ ...value, localTime: event.target.value })}/></label>
      <label className="grid min-w-0 gap-1 text-sm font-semibold sm:col-span-2">Notify<select className={input} value={value.recipient.kind === 'owner' ? 'owner' : `member:${value.recipient.id}`} onChange={event => setValue({ ...value, recipient: event.target.value === 'owner' ? { kind: 'owner' } : { kind: 'teammate', id: event.target.value.slice(7) } })}>
        <option value="owner">Lead owner</option>
        {value.recipient.kind === 'teammate' && !person && <option disabled value={`member:${value.recipient.id}`}>Teammate unavailable</option>}
        {recipients.map(person => <option key={person.id} value={`member:${person.id}`}>{person.name}</option>)}
      </select></label>
    </fieldset>
    <p className="m-0 text-xs text-assistant-muted">Monday–Friday · {timezone}</p>
    <WorkflowNotificationChoices dark value={value.notifications} disabled={!editable} onChange={notifications => setValue({ ...value, notifications })}/>
    <p className="m-0 text-xs leading-5 text-assistant-muted">Notes and saved lead updates restart the timer. One reminder per inactive period.</p>
    {!editing && <p className="m-0 text-xs leading-5 text-assistant-muted">Existing assigned leads start their first reminder period when you publish.</p>}
    {editing && paused && <p className="m-0 text-sm">This workflow stays paused after saving.</p>}
    {state !== 'draft' ? <p role="status" className="m-0 text-sm">{state === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : state === 'cancelled' ? 'Draft canceled.' : 'This draft expired. Ask for a fresh review.'}</p> : <>
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to {editing ? 'save' : 'publish'} this workflow.</p>}
      {validation && <p role="alert" className="m-0 text-sm">{validation}</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!editable} onClick={() => { setSettings(!settings); requestAnimationFrame(() => (settings ? heading.current : first.current)?.focus()); }}>{settings ? 'Back to review' : 'Change settings'}</button>
        <button type="button" className={button} disabled={pending} onClick={() => void decide(true)}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!editable || !!validation || !value.notifications.inApp && !value.notifications.email || editing && !changed} onClick={() => void decide()}>{pending ? 'Saving…' : editing ? 'Save changes' : 'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
