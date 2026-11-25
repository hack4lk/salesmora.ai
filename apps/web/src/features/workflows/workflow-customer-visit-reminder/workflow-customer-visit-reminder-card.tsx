'use client';

import { useId, useRef, useState } from 'react';
import { CompanyContacts } from '../workflow-service-due/service-email-draft-drawer';
import { CustomerVisitReminderEmail, type VisitReminderCompany, type VisitReminderSample } from './customer-visit-reminder-email';

export type CustomerVisitReminderValues = { name: string; localTime: string };
export type CustomerVisitReminderCardProps = {
  value: CustomerVisitReminderValues; timezone: string; company: VisitReminderCompany;
  onSaveCompany?: (input:{expectedVersion:number;phone:string;email:string})=>Promise<void>; companyVersion?:number; companySetupAccess?:boolean;
  senderReady: boolean; emailSettingsHref: string; sample: VisitReminderSample;
  canPublish: boolean; editing?: boolean; paused?: boolean;
  state?: 'draft' | 'published' | 'cancelled' | 'expired';
  onPublish: (value: CustomerVisitReminderValues) => Promise<void>;
  onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Canonical review; the future host owns authorization, setup readiness and publication. */
export function CustomerVisitReminderCard(props: CustomerVisitReminderCardProps) {
  return <ReminderReview key={JSON.stringify([props.value, props.editing, props.state])} {...props}/>;
}
function ReminderReview({ value: initial, timezone, company, senderReady, emailSettingsHref, sample, canPublish, editing = false, paused = false, state = 'draft', onSaveCompany, companyVersion=0, companySetupAccess=true, onPublish, onCancel }: CustomerVisitReminderCardProps) {
  const id = useId(), lock = useRef(false), heading = useRef<HTMLHeadingElement>(null), first = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial), [settings, setSettings] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState(''), [companySettings,setCompanySettings]=useState(false);
  const editable = canPublish && state === 'draft' && !pending;
  const ready = senderReady && !!company.name.trim() && !!company.phone.trim() && !!company.email.trim();
  const validation = !value.name.trim() || value.name.trim().length > 120 ? 'Enter a workflow name.' : !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime) ? 'Choose a valid send time.' : '';
  const changed = JSON.stringify(initial) !== JSON.stringify(value);
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime) ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`2000-01-01T${value.localTime}:00Z`)) : 'your chosen time';
  async function decide(cancel = false) {
    if (lock.current || state !== 'draft' || !cancel && (!editable || !ready || !!validation || editing && !changed)) return;
    lock.current = true; setPending(true); setError('');
    try { if (cancel) await onCancel(); else await onPublish({ ...value, name: value.name.trim() }); }
    catch { setError(cancel ? 'The draft could not be canceled. Try again.' : 'The workflow could not be saved. Your choices are still here.'); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name || 'Customer visit reminder'}</h3>
    <p className="m-0 text-sm leading-6">Automatically email each customer at {time} the day before their visit.</p>
    {settings && <label className="grid min-w-0 gap-1 text-sm font-semibold">Workflow name<input ref={first} className={input} maxLength={120} disabled={!editable} value={value.name} onChange={event => setValue({ ...value, name: event.target.value })}/></label>}
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Send at<input type="time" className={input} disabled={!editable} value={value.localTime} onChange={event => setValue({ ...value, localTime: event.target.value })}/></label>
      <dl className="m-0 grid content-center gap-1 text-sm"><dt className="font-semibold">Send to</dt><dd className="m-0">Customer on each visit · Email</dd></dl>
    </div>
    <p className="m-0 text-xs text-assistant-muted">Day before, including weekends · {timezone}</p>
    <details className="min-w-0 rounded-xl border border-assistant-border p-3">
      <summary className="min-h-6 cursor-pointer text-sm font-semibold focus-visible:focus-ring">Preview customer email</summary>
      <p className="my-3 text-xs text-assistant-muted">Example only. Each email uses that customer’s current visit details.</p>
      <CustomerVisitReminderEmail company={company} visit={sample} timezone={timezone}/>
    </details>
    <p className="m-0 text-sm leading-6">Publishing turns on automatic emails for existing and new visits. Missing contact details or arrival windows are skipped, and you’re notified.</p>
    <p className="m-0 text-xs leading-5 text-assistant-muted">Rescheduling updates pending reminders. Late bookings are skipped. Changes or cancellations after an email was sent won’t send another message.</p>
    {editing && paused && <p className="m-0 text-sm">This workflow stays paused after saving.</p>}
    {state !== 'draft' ? <p role="status" className="m-0 text-sm">{state === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : state === 'cancelled' ? 'Draft canceled.' : 'This draft expired. Ask for a fresh review.'}</p> : <>
      {!ready && <p role="status" className="m-0 text-sm">{!senderReady?'The email sender is unavailable. Ask your administrator to configure email delivery. ':'Set up your company phone and email before publishing. '}{companySetupAccess?<>{onSaveCompany?<button type="button" className="cursor-pointer bg-transparent p-0 font-semibold text-seafoam-pale underline focus-visible:focus-ring" onClick={()=>setCompanySettings(!companySettings)}>Open email settings</button>:<a className="font-semibold text-seafoam-pale underline focus-visible:focus-ring" href={emailSettingsHref}>Open email settings</a>}</>:'Ask a workspace administrator to update the company contact details.'}</p>}
      {companySettings&&onSaveCompany&&<div className="rounded-xl bg-paper p-3 text-ink"><CompanyContacts company={{...company,version:companyVersion}} allowed={editable} onSave={async value=>{await onSaveCompany(value);setCompanySettings(false);}}/></div>}
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to {editing ? 'save' : 'publish'} this workflow.</p>}
      {validation && <p role="alert" className="m-0 text-sm">{validation}</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!editable} onClick={() => { setSettings(!settings); requestAnimationFrame(() => (settings ? heading.current : first.current)?.focus()); }}>{settings ? 'Back to review' : 'Change settings'}</button>
        <button type="button" className={button} disabled={pending} onClick={() => void decide(true)}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!editable || !ready || !!validation || editing && !changed} onClick={() => void decide()}>{pending ? 'Saving…' : editing ? 'Save changes' : 'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
