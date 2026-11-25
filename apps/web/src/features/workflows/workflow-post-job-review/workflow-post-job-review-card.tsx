'use client';

import { useId, useRef, useState } from 'react';
import { PostJobReviewEmail, type PostJobCompany, type PostJobCustomer } from './post-job-review-email';

export type PostJobReviewValues = {
  name: string; calendarDays: number; localTime: string; reviewUrl: string;
  messageChoice: 'default' | 'custom' | null; thankYouMessage: string;
};
export type PostJobReviewCardProps = {
  value: PostJobReviewValues; defaultMessage: string; company: PostJobCompany; customer: PostJobCustomer;
  timezone: string; senderReady: boolean; emailSettingsHref: string; companySetupAccess?: boolean;
  canPublish: boolean; editing?: boolean; paused?: boolean;
  state?: 'draft' | 'published' | 'cancelled' | 'expired';
  onPublish: (value: PostJobReviewValues) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function publicReviewUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}

/** Canonical prototype; the future host supplies authorization, readiness and persistence. */
export function PostJobReviewCard(props: PostJobReviewCardProps) {
  return <Review key={JSON.stringify([props.value, props.editing, props.state])} {...props}/>;
}
function Review({ value: initial, defaultMessage, company, customer, timezone, senderReady, emailSettingsHref, companySetupAccess = true, canPublish, editing = false, paused = false, state = 'draft', onPublish, onCancel }: PostJobReviewCardProps) {
  const id = useId(), lock = useRef(false), heading = useRef<HTMLHeadingElement>(null), first = useRef<HTMLInputElement>(null), messageInput = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initial), [custom, setCustom] = useState(initial.messageChoice === 'custom' ? initial.thankYouMessage : ''), [settings, setSettings] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState(''), [includeReview, setIncludeReview] = useState(true);
  // Preserve the reviewed default on editing rather than silently adopting newer suggested wording.
  const suggested = initial.messageChoice === 'default' ? initial.thankYouMessage : defaultMessage;
  const message = value.messageChoice === 'custom' ? custom : suggested;
  const editable = canPublish && state === 'draft' && !pending;
  const ready = senderReady && !!company.name.trim() && !!company.phone.trim() && !!company.email.trim();
  const reviewUrl = publicReviewUrl(value.reviewUrl.trim());
  const validation = !value.name.trim() || value.name.trim().length > 120 ? 'Enter a workflow name.'
    : !Number.isInteger(value.calendarDays) || value.calendarDays < 1 || value.calendarDays > 30 ? 'Choose a delay of 1–30 calendar days.'
    : !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime) ? 'Choose a valid send time.'
    : value.reviewUrl.trim() && !reviewUrl ? 'Add a valid HTTPS review link without a username or password.'
    : value.messageChoice && (!message.trim() || message.trim().length > 2000) ? 'Enter a thank-you message of 1–2,000 characters.' : '';
  const resolved = { ...value, name: value.name.trim(), reviewUrl: value.reviewUrl.trim(), thankYouMessage: message.trim() };
  const changed = JSON.stringify(resolved) !== JSON.stringify(initial);
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime) ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`2000-01-01T${value.localTime}:00Z`)) : 'your chosen time';
  async function decide(cancel = false) {
    if (lock.current || state !== 'draft' || !cancel && (!editable || !ready || !!validation || !value.messageChoice || editing && !changed)) return;
    lock.current = true; setPending(true); setError('');
    try { if (cancel) await onCancel(); else await onPublish(resolved); }
    catch { setError(cancel ? 'The draft could not be canceled. Try again.' : 'The workflow could not be saved. Your choices are still here.'); }
    finally { lock.current = false; setPending(false); }
  }
  function choose(choice: 'default' | 'custom') {
    setValue({ ...value, messageChoice: choice });
    if (choice === 'custom') requestAnimationFrame(() => messageInput.current?.focus());
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name || 'Post-job thank-you'}</h3>
    <p className="m-0 text-sm leading-6">Automatically email the customer at {time}, {value.calendarDays || 'your chosen number of'} calendar days after the job and all linked work are finished.</p>
    {settings && <label className="grid min-w-0 gap-1 text-sm font-semibold">Workflow name<input ref={first} className={input} maxLength={120} disabled={!editable} value={value.name} onChange={event => setValue({ ...value, name: event.target.value })}/></label>}
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Calendar days after completion<input type="number" min={1} max={30} className={input} disabled={!editable} value={value.calendarDays || ''} onChange={event => setValue({ ...value, calendarDays: Number(event.target.value) })}/></label>
      <label className="grid min-w-0 gap-1 text-sm font-semibold">Send at<input type="time" className={input} disabled={!editable} value={value.localTime} onChange={event => setValue({ ...value, localTime: event.target.value })}/></label>
    </div>
    <p className="m-0 text-xs text-assistant-muted">Customer on each job · Email · {timezone}</p>
    <label className="grid min-w-0 gap-1 text-sm font-semibold">External review link (optional)<input type="url" placeholder="https://…" className={input} disabled={!editable} value={value.reviewUrl} onChange={event => setValue({ ...value, reviewUrl: event.target.value })}/></label>
    <p className="m-0 text-xs text-assistant-muted">Leave blank for a thank-you only, or link to your company’s external review page.</p>
    <fieldset disabled={!editable} className="m-0 grid min-w-0 gap-3 rounded-xl border border-assistant-border p-4">
      <legend className="px-1 text-sm font-semibold">What should your thank-you email say?</legend>
      <p className="m-0 whitespace-pre-wrap break-words text-sm leading-6">{suggested}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <label className="flex min-h-11 cursor-pointer items-center gap-2"><input type="radio" name={`${id}-message`} checked={value.messageChoice === 'default'} onChange={() => choose('default')} className="size-4 accent-seafoam focus-visible:focus-ring"/>Use default message</label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2"><input type="radio" name={`${id}-message`} checked={value.messageChoice === 'custom'} onChange={() => choose('custom')} className="size-4 accent-seafoam focus-visible:focus-ring"/>Write my own</label>
      </div>
      {value.messageChoice === 'custom' && <label className="grid min-w-0 gap-1 text-sm font-semibold">Thank-you message<textarea ref={messageInput} rows={4} maxLength={2000} className={`${input} resize-y font-normal`} value={custom} onChange={event => setCustom(event.target.value)}/></label>}
      <p className="m-0 text-xs leading-5 text-assistant-muted">We add the greeting, company contact details and any review link you provide.</p>
    </fieldset>
    <details className="min-w-0 rounded-xl border border-assistant-border p-3">
      <summary className="min-h-6 cursor-pointer text-sm font-semibold focus-visible:focus-ring">Preview customer email</summary>
      {reviewUrl && <fieldset className="my-3 flex min-w-0 flex-wrap gap-x-5 gap-y-2 border-0 p-0 text-sm">
        <legend className="sr-only">Email preview version</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-2"><input type="radio" name={`${id}-preview`} checked={includeReview} onChange={() => setIncludeReview(true)} className="size-4 accent-seafoam focus-visible:focus-ring"/>Review request</label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2"><input type="radio" name={`${id}-preview`} checked={!includeReview} onChange={() => setIncludeReview(false)} className="size-4 accent-seafoam focus-visible:focus-ring"/>Thank-you only</label>
      </fieldset>}
      <PostJobReviewEmail company={company} customer={customer} message={message} reviewUrl={reviewUrl} includeReview={!!reviewUrl && includeReview}/>
      {includeReview && reviewUrl && <p className="mb-0 break-all text-xs text-assistant-muted">Review destination: {value.reviewUrl.trim()}</p>}
      <p className="mb-0 text-xs text-assistant-muted">{reviewUrl ? 'Example customer. Only one review request per customer every 90 days; other completed jobs receive a thank-you only.' : 'Example customer. This workflow sends a thank-you only.'}</p>
    </details>
    <p className="m-0 text-sm leading-6">Publishing turns on automatic emails for future completions. Previously finished jobs aren’t included. Reopened work cancels its pending email.</p>
    {editing && paused && <p className="m-0 text-sm">This workflow stays paused after saving.</p>}
    {state !== 'draft' ? <p role="status" className="m-0 text-sm">{state === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : state === 'cancelled' ? 'Draft canceled.' : 'This draft expired. Ask for a fresh review.'}</p> : <>
      {!ready && <p role="status" className="m-0 text-sm">{!senderReady ? 'The email sender is unavailable. Ask your administrator to configure email delivery. ' : 'Set up your company phone and email before publishing. '}{companySetupAccess ? <a className="font-semibold text-seafoam-pale underline focus-visible:focus-ring" href={emailSettingsHref}>Open email settings</a> : 'Ask a workspace administrator to update the company contact details.'}</p>}
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to {editing ? 'save' : 'publish'} this workflow.</p>}
      {!value.messageChoice && <p role="status" className="m-0 text-sm">Choose the default message or write your own before publishing.</p>}
      {validation && <p role="alert" className="m-0 text-sm">{validation}</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!editable} onClick={() => { setSettings(!settings); requestAnimationFrame(() => (settings ? heading.current : first.current)?.focus()); }}>{settings ? 'Back to review' : 'Change settings'}</button>
        <button type="button" className={button} disabled={pending} onClick={() => void decide(true)}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!editable || !ready || !!validation || !value.messageChoice || editing && !changed} onClick={() => void decide()}>{pending ? 'Saving…' : editing ? 'Save changes' : 'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
