'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { WorkflowNotificationChannels } from '@salesmora/contracts';
import { WorkflowNotificationChoices } from '../workflow-notification-choices';

export type CancellationWorkflowValues = {
  name: string; serviceId: string; durationMinutes: number; gapMinutes: number; recipientId: string;
  notifications: WorkflowNotificationChannels;
};
export type WorkflowCancellationCardProps = {
  value: CancellationWorkflowValues; timezone: string;
  services: readonly { id: string; name: string }[]; recipients: readonly { id: string; name: string }[];
  canPublish: boolean; state?: 'draft' | 'published' | 'expired' | 'cancelled'; expiresAt?:string|null; editing?:boolean;
  onPublish: (value: CancellationWorkflowValues) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
/** Canonical assistant review; the live host supplies authorized choices and versioned publication. */
export function WorkflowCancellationCard({ value: initial, timezone, services, recipients, canPublish, state: suppliedState = 'draft', expiresAt=null, editing=false, onPublish, onCancel }: WorkflowCancellationCardProps) {
  const id = useId(), lock = useRef(false), review = useRef<HTMLHeadingElement>(null), firstField = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial), [settings, setSettings] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState('');
  const [expired,setExpired]=useState(()=>!!expiresAt&&Date.parse(expiresAt)<=Date.now());
  useEffect(()=>{if(!expiresAt||expired)return;const timer=setTimeout(()=>setExpired(true),Math.max(0,Date.parse(expiresAt)-Date.now()));return()=>clearTimeout(timer);},[expiresAt,expired]);
  const state=suppliedState==='draft'&&expired?'expired':suppliedState;
  const service = services.find(item => item.id === value.serviceId), recipient = recipients.find(item => item.id === value.recipientId);
  const valid = !!service && !!recipient && !!value.name.trim() && value.name.trim().length <= 200
    && Number.isInteger(value.durationMinutes) && value.durationMinutes >= 15 && value.durationMinutes <= 480
    && Number.isInteger(value.gapMinutes) && value.gapMinutes >= 0 && value.gapMinutes <= 120 && (value.notifications.inApp || value.notifications.email);
  const editable = state === 'draft' && canPublish && !pending;
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} ref={review} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name}</h3>
    <p className="m-0 text-sm leading-6">When a future visit frees an opening, suggest unscheduled {service?.name ?? 'selected service'} jobs to {recipient?.name ?? 'the selected contact'}. Review each replacement before booking.</p>
    {settings ? <fieldset disabled={!editable} className="m-0 grid min-w-0 gap-4 border-0 p-0 disabled:opacity-70">
      <label className="grid gap-1 text-sm font-semibold">Workflow name<input ref={firstField} className={input} value={value.name} maxLength={200} onChange={event => setValue({ ...value, name: event.target.value })}/></label>
      <label className="grid gap-1 text-sm font-semibold">Service<select className={input} value={value.serviceId} onChange={event => setValue({ ...value, serviceId: event.target.value })}>
        <option value="">Choose a service</option>{services.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2">{([['durationMinutes', 'Planned duration (minutes)', 15, 480], ['gapMinutes', 'Gap (minutes)', 0, 120]] as const).map(([key, label, min, max]) =>
        <label key={key} className="grid gap-1 text-sm font-semibold">{label}<input className={input} type="number" min={min} max={max} step={1}
          value={Number.isNaN(value[key]) ? '' : value[key]} onChange={event => setValue({ ...value, [key]: event.target.value === '' ? Number.NaN : Number(event.target.value) })}/></label>)}</div>
      <label className="grid gap-1 text-sm font-semibold">Notify<select className={input} value={value.recipientId} onChange={event => setValue({ ...value, recipientId: event.target.value })}>
        <option value="">Choose a contact</option>{recipients.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </fieldset> : <p className="m-0 text-sm">{Number.isFinite(value.durationMinutes) ? `${value.durationMinutes} minutes of work` : 'Duration not set'} · {Number.isFinite(value.gapMinutes) ? `${value.gapMinutes}-minute gap` : 'Gap not set'} · {timezone}</p>}
    <WorkflowNotificationChoices value={value.notifications} dark disabled={!editable} onChange={notifications => setValue({ ...value, notifications })}/>
    <p className="m-0 text-xs leading-5">Tomorrow or later. Up to 5 suggestions from unscheduled jobs. Existing assignments stay; unassigned jobs need a qualified worker from the released crew. No customer messages.</p>
    {state === 'published' ? <p role="status" className="m-0 text-sm">{editing?'Changes saved.':'Workflow published.'}</p> : state === 'cancelled' ? <p role="status" className="m-0 text-sm">Draft canceled.</p> : state === 'expired' ? <p role="status" className="m-0 text-sm">This draft expired. Ask the assistant for a new review.</p> : <>
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to publish this workflow.</p>}
      {!valid && <p role="alert" className="m-0 text-sm">Choose a service, contact, valid duration and gap, and at least one notification channel.</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!editable} onClick={() => { setSettings(!settings); requestAnimationFrame(() => (settings ? review.current : firstField.current)?.focus()); }}>{settings ? 'Back to review' : 'Change settings'}</button>
        <button type="button" className={button} disabled={pending} onClick={async()=>{if(lock.current)return;lock.current=true;setPending(true);setError('');try{await onCancel();}catch{setError('Could not cancel this draft. Try again.');}finally{lock.current=false;setPending(false);}}}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!editable || !valid} onClick={async () => {
          if (lock.current || !editable || !valid) return;
          lock.current = true; setPending(true); setError('');
          try { await onPublish({ ...value, name: value.name.trim() }); }
          catch { setError('The workflow could not be published. Your choices are saved here; try again.'); }
          finally { lock.current = false; setPending(false); }
        }}>{pending ? 'Saving…' : editing?'Save changes':'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
