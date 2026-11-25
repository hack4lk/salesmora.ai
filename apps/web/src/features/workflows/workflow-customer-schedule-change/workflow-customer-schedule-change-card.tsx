'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CustomerScheduleChangeEmail, type ScheduleChangeCompany, type ScheduleChangeExample } from './customer-schedule-change-email';

export type ScheduleChangeValues = { name: string };
export type ScheduleChangeCardProps = {
  value: ScheduleChangeValues; company: ScheduleChangeCompany; timezone: string;
  examples: readonly [ScheduleChangeExample, ScheduleChangeExample, ScheduleChangeExample];
  senderReady: boolean; emailSettingsHref: string; companySetupAccess?: boolean;
  canPublish: boolean; editing?: boolean; paused?: boolean; expiresAt?: string | null;
  state?: 'draft' | 'published' | 'cancelled' | 'expired';
  onPublish: (value: ScheduleChangeValues) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Canonical review; runtime integration supplies current setup, authority and publish actions. */
export function CustomerScheduleChangeCard(props: ScheduleChangeCardProps) {
  return <ScheduleChangeReview key={JSON.stringify([props.value, props.editing, props.state, props.expiresAt])} {...props}/>;
}
function ScheduleChangeReview({ value: initial, company, timezone, examples, senderReady, emailSettingsHref, companySetupAccess = true, canPublish, editing = false, paused = false, state = 'draft', expiresAt, onPublish, onCancel }: ScheduleChangeCardProps) {
  const id = useId(), lock = useRef(false), heading = useRef<HTMLHeadingElement>(null), first = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial), [settings, setSettings] = useState(false), [preview, setPreview] = useState(0), [pending, setPending] = useState(false), [error, setError] = useState('');
  const [expired, setExpired] = useState(() => !!expiresAt && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()));
  useEffect(() => {
    if (!expiresAt || expired) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => { const delay = Date.parse(expiresAt) - Date.now(); if (!Number.isFinite(delay) || delay <= 0) setExpired(true); else timer = setTimeout(check, Math.min(delay, 2147483647)); };
    check(); return () => clearTimeout(timer);
  }, [expiresAt, expired]);
  const currentState = state === 'draft' && expired ? 'expired' : state;
  const editable = canPublish && currentState === 'draft' && !pending;
  const ready = senderReady && !!company.name.trim() && !!company.phone.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email.trim());
  const validation = !value.name.trim() || value.name.trim().length > 120 ? 'Enter a workflow name of 1–120 characters.' : '';
  const changed = value.name.trim() !== initial.name;
  async function decide(cancel = false) {
    const stale = !!expiresAt && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now());
    if (stale && state === 'draft') { setExpired(true); return; }
    if (lock.current || currentState !== 'draft' || !cancel && (!editable || !ready || !!validation || editing && !changed)) return;
    lock.current = true; setPending(true); setError('');
    try { if (cancel) await onCancel(); else await onPublish({ name: value.name.trim() }); }
    catch { setError(cancel ? 'The draft could not be canceled. Try again.' : 'The workflow could not be saved. Your choices are still here.'); }
    finally { lock.current = false; setPending(false); }
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name.trim() || 'Customer schedule-change notices'}</h3>
    <p className="m-0 text-sm leading-6">Automatically email customers when their visit date or arrival window changes, or their visit is no longer scheduled.</p>
    {settings && <label className="grid min-w-0 gap-1 text-sm font-semibold">Workflow name<input ref={first} className={input} maxLength={120} disabled={!editable} value={value.name} onChange={event => setValue({ name: event.target.value })}/></label>}
    <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2">
      <div><dt className="text-sm font-semibold">Send to</dt><dd className="m-0 text-sm">Customer on each visit · Email</dd></div>
      <div><dt className="text-sm font-semibold">When</dt><dd className="m-0 text-sm">5 minutes after the latest change</dd></div>
    </dl>
    <p className="m-0 text-xs leading-5 text-assistant-muted">Quick corrections combine into one notice, within 15 minutes of the first change. Returning to the original schedule before delivery sends nothing.</p>
    <details className="min-w-0 rounded-xl border border-assistant-border p-3">
      <summary className="min-h-6 cursor-pointer text-sm font-semibold focus-visible:focus-ring">Preview customer email</summary>
      <label className="my-3 grid min-w-0 gap-1 text-sm font-semibold">Preview example<select className={input} value={preview} onChange={event => setPreview(Number(event.target.value))}>
        <option value={0}>Visit date changed</option><option value={1}>Arrival window changed</option><option value={2}>Visit no longer scheduled</option>
      </select></label>
      <CustomerScheduleChangeEmail company={company} example={examples[preview]} timezone={timezone}/>
      <p className="mb-0 mt-3 text-xs text-assistant-muted">Example customer. Each notice includes only that customer’s visit details.</p>
    </details>
    <p className="m-0 text-sm leading-6">Publishing turns on automatic emails for future changes. Initial bookings, staff assignments and internal work times don’t send a notice.</p>
    <p className="m-0 text-xs leading-5 text-assistant-muted">Missing customer contact details are skipped, and you’re notified. Clearing a visit does not mean the whole job is canceled.</p>
    {editing && paused && <p className="m-0 text-sm">This workflow stays paused after saving.</p>}
    {currentState !== 'draft' ? <p role="status" className="m-0 text-sm">{currentState === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : currentState === 'cancelled' ? 'Draft canceled.' : 'This draft expired. Ask for a fresh review.'}</p> : <>
      {!ready && <p role="status" className="m-0 text-sm">{!senderReady ? 'The email sender is unavailable. Ask your administrator to configure email delivery. ' : 'Set up your company phone and email before publishing. '}{companySetupAccess ? <a className="font-semibold text-seafoam-pale underline focus-visible:focus-ring" href={emailSettingsHref}>Open email settings</a> : 'Ask a workspace administrator to update the company contact details.'}</p>}
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
