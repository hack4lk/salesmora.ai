'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { useFormReady } from '../use-form-ready';
import { emailVerificationNoticeData as copy } from './email-verification-notice.data';
export type VerificationResendResult =
  | { ok: true; retryAfterSeconds?: number }
  | { ok: false; reason?: 'rate-limited'; retryAfterSeconds?: number };
export interface EmailVerificationNoticeProps {
  email: string;
  verified?: boolean;
  disabled?: boolean;
  /** The authenticated parent determines the recipient; no editable email is submitted. */
  onResend: () => Promise<VerificationResendResult>;
}
/** Presentation and request feedback only; email delivery belongs to the parent. */
export function EmailVerificationNotice({ email, verified = false, disabled = false, onResend }: EmailVerificationNoticeProps) {
  const id = useId();
  const ready = useFormReady();
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error' | 'limited'>('idle');
  const [remaining, setRemaining] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const locked = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const pending = status === 'pending';
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  useEffect(() => {
    if (status === 'sent' || status === 'error' || status === 'limited') feedback.current?.focus();
  }, [status]);
  function cooldown(seconds: number | undefined) {
    const duration = Number.isFinite(seconds) ? Math.min(3600, Math.max(1, Math.ceil(seconds!))) : copy.resendDelaySeconds;
    setRemaining(duration); setDeadline(Date.now() + duration * 1000);
  }
  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || disabled || verified || pending || remaining > 0 || locked.current) return;
    locked.current = true; setStatus('pending');
    try {
      const result = await onResend();
      if (result.ok) { cooldown(result.retryAfterSeconds); setStatus('sent'); }
      else if (result.reason === 'rate-limited') { cooldown(result.retryAfterSeconds); setStatus('limited'); }
      else setStatus('error');
    } catch { setStatus('error'); }
    finally { locked.current = false; }
  }
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
    <div><h2 id={`${id}-title`} className="m-0 text-xl font-semibold leading-normal text-ink">{verified ? copy.verifiedTitle : copy.title}</h2>{!verified && <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p>}</div>
    <dl className="m-0 min-w-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6"><dt className="text-muted">{copy.email}</dt><dd className="m-0 mt-1 font-semibold text-ink wrap-anywhere">{email}</dd></dl>
    {verified ? <FormFeedback kind="success" title={copy.verifiedTitle} message={copy.verified} /> : <form aria-labelledby={`${id}-title`} aria-busy={pending} onSubmit={resend} className="grid min-w-0 gap-4">
      {status !== 'idle' && !pending && <div ref={feedback} tabIndex={-1} className="rounded-xl focus-visible:focus-ring"><FormFeedback kind={status === 'sent' ? 'success' : 'error'} title={status === 'sent' ? copy.sentTitle : status === 'limited' ? copy.limitedTitle : copy.errorTitle} message={status === 'sent' ? copy.sent : status === 'limited' ? copy.limited : copy.error} /></div>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.instructions}</p>
      <SubmitButton label={copy.resend} pendingLabel={copy.sending} pending={pending} disabled={!ready || disabled || remaining > 0} aria-describedby={remaining > 0 ? `${id}-cooldown` : undefined} />
      {remaining > 0 && <p id={`${id}-cooldown`} className="m-0 text-sm text-muted">{copy.cooldown(remaining)}</p>}
    </form>}
  </section>;
}
