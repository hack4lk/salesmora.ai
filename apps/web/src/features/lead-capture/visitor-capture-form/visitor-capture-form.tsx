'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, SubmitButton } from '@salesmora/ui';
import { visitorCaptureFormData as copy } from './visitor-capture-form.data';
import { isVisitorDefinitionValid, normalizeVisitorCapture, safePrivacyHref, validateVisitorCapture, visitorAnswer, visitorFieldLimit,
  type VisitorCaptureDefinition, type VisitorCaptureErrors, type VisitorCaptureSubmission, type VisitorCaptureValues } from './visitor-capture-form.validation';

export type VisitorCaptureResult = { ok: true } | { ok: false; fieldErrors?: Record<string, string>; consentError?: string; message?: string; unavailable?: boolean; uncertain?: boolean };
export type VisitorCaptureProtection =
  | { kind: 'challenge'; status: 'required' | 'verifying' | 'expired' | 'error' }
  | { kind: 'challenge'; status: 'verified'; token: string }
  | { kind: 'rate-limited'; retryAt: string };
export type VisitorCaptureFormProps = {
  definition: VisitorCaptureDefinition;
  value: VisitorCaptureValues;
  availability: 'active' | 'paused' | 'blocked';
  pending?: boolean;
  /** Use phone spacing inside a constrained staff preview, independently of the host viewport. */
  compact?: boolean;
  /** False until the host has real durable submission handling. Never simulate a pending request. */
  submissionAvailable?: boolean;
  /** Locks a stale/reloading form without claiming that a request is being sent. */
  interactionLocked?: boolean;
  /** UI projection from the host. The server independently enforces challenge and rate policy. */
  protection?: VisitorCaptureProtection;
  challengeContent?: ReactNode;
  onRetryChallenge?: () => void;
  onChange: (value: VisitorCaptureValues) => void;
  /** Return ok only after durable receipt. The server owns abuse checks, version binding and deduplication. */
  onSubmit: (submission: VisitorCaptureSubmission) => Promise<VisitorCaptureResult>;
};

/** A new published definition starts a fresh UI session, isolating old asynchronous responses. */
export function VisitorCaptureForm(props: VisitorCaptureFormProps) {
  return <VisitorCaptureFormSession key={`${props.definition.id}:${props.definition.version}`} {...props} />;
}
function VisitorCaptureFormSession({ definition, value, availability, pending = false, compact = false, submissionAvailable = true, interactionLocked = false, protection, challengeContent, onRetryChallenge, onChange, onSubmit }: VisitorCaptureFormProps) {
  const id = useId();
  const [submitting, setSubmitting] = useState(false);
  const [received, setReceived] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [errors, setErrors] = useState<VisitorCaptureErrors>({ fields: {} });
  const [failure, setFailure] = useState('');
  const [uncertain, setUncertain] = useState(false), [now, setNow] = useState(() => Date.now());
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const focusError = useRef(false);
  const request = useRef<{ signature: string; key: string; payload: Omit<VisitorCaptureSubmission, 'idempotencyKey'> } | null>(null);
  const busy = pending || submitting;
  const challenge = protection?.kind === 'challenge' ? protection : undefined;
  const rateDeadline = protection?.kind === 'rate-limited' ? Date.parse(protection.retryAt) : null;
  const rateBlocked = rateDeadline !== null && (!Number.isFinite(rateDeadline) || now < rateDeadline);
  const challengeBlocked = !!challenge && (challenge.status !== 'verified' || !challenge.token.trim());
  useEffect(() => {
    if (rateDeadline === null || !Number.isFinite(rateDeadline)) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [rateDeadline]);
  const validDefinition = isVisitorDefinitionValid(definition);
  const unavailable = availability !== 'active' || blocked || !validDefinition;
  useEffect(() => {
    if (received) success.current?.focus();
  }, [received]);
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    (form.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? feedback.current)?.focus();
  }, [errors, failure]);
  const change = (answers: VisitorCaptureValues['answers']) => {
    if (busy || uncertain || unavailable || received || !submissionAvailable || interactionLocked) return;
    onChange({ ...value, answers });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || inFlight.current || unavailable || received || challengeBlocked || rateBlocked || !submissionAvailable || interactionLocked) return;
    const nextErrors: VisitorCaptureErrors = uncertain ? { fields: {} } : validateVisitorCapture(definition, value);
    focusError.current = true; setErrors(nextErrors); setFailure('');
    if (Object.keys(nextErrors.fields).length || nextErrors.consent) return;
    const payload = uncertain && request.current ? request.current.payload : normalizeVisitorCapture(definition, value);
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID(), payload: structuredClone(payload) };
    inFlight.current = true; setSubmitting(true);
    try {
      const result = await onSubmit({ ...structuredClone(payload), idempotencyKey: request.current.key, ...(challenge?.status === 'verified' ? { challengeToken: challenge.token } : {}) });
      if (result.ok) { setUncertain(false); setReceived(true); }
      else {
        setUncertain(!!result.uncertain);
        focusError.current = true;
        const allowed = new Set(definition.fields.map(field => field.id));
        setErrors({ fields: Object.fromEntries(Object.entries(result.fieldErrors ?? {}).filter(([key]) => allowed.has(key))), consent: result.consentError });
        setFailure(result.message || (result.uncertain ? copy.uncertain : copy.failure));
        if (result.unavailable) setBlocked(true);
      }
    } catch { focusError.current = true; setErrors({ fields: {} }); setUncertain(true); setFailure(copy.uncertain); }
    finally { inFlight.current = false; setSubmitting(false); }
  };

  return <section aria-labelledby={`${id}-title`} className={`mx-auto grid w-full min-w-0 max-w-2xl gap-6 rounded-2xl border border-line bg-paper text-ink ${compact ? 'p-5' : 'p-5 sm:p-8'}`}>
    <header className="grid min-w-0 gap-2"><p className="m-0 text-sm font-semibold text-primary-dark wrap-anywhere">{definition.businessName}</p>
      <h1 id={`${id}-title`} className="m-0 text-heading font-semibold wrap-anywhere">{definition.title}</h1>
      {definition.intro && <p className="m-0 text-base leading-6 text-muted wrap-anywhere">{definition.intro}</p>}
    </header>
    {received ? <div ref={success} tabIndex={-1} className="grid gap-3 rounded-xl focus-visible:focus-ring"><h2 className="m-0 text-xl font-semibold">{copy.received}</h2><p role="status" className="m-0 leading-6 wrap-anywhere">{definition.thankYou || copy.thanks}</p></div>
    : unavailable ? <div className="grid gap-3"><h2 className="m-0 text-xl font-semibold">{copy.unavailableTitle}</h2><p role="status" className="m-0 leading-6 text-muted wrap-anywhere">{definition.unavailableMessage?.trim() || copy.unavailable}</p>
      {definition.showBusinessEmail !== false && definition.businessEmail && <p className="m-0 text-sm wrap-anywhere">{definition.businessEmail}</p>}{definition.showBusinessPhone !== false && definition.businessPhone && <p className="m-0 text-sm wrap-anywhere">{definition.businessPhone}</p>}
    </div> : <form ref={form} noValidate aria-labelledby={`${id}-title`} aria-busy={busy} onSubmit={event => { void submit(event); }} className="grid min-w-0 gap-5">
      {definition.contactRequired && <p className="m-0 text-sm leading-6 text-muted">{copy.contactHint}</p>}
      {!submissionAvailable && <div className="grid gap-2 rounded-xl bg-canvas p-4"><p role="status" className="m-0 text-sm leading-6 text-muted">{copy.deliveryUnavailable}</p>{definition.showBusinessEmail && definition.businessEmail && <p className="m-0 text-sm wrap-anywhere">{definition.businessEmail}</p>}{definition.showBusinessPhone && definition.businessPhone && <p className="m-0 text-sm wrap-anywhere">{definition.businessPhone}</p>}</div>}
      <fieldset disabled={busy || uncertain || !submissionAvailable || interactionLocked} className="m-0 grid min-w-0 gap-5 border-0 p-0">
        {definition.fields.map(field => {
          const answer = visitorAnswer(value, field.id), text = typeof answer === 'string' ? answer : '';
          const label = field.required ? field.label : copy.optional(field.label);
          const error = Object.hasOwn(errors.fields, field.id) ? errors.fields[field.id] : undefined;
          if (field.type === 'checkboxes') return <fieldset key={field.id} tabIndex={-1} aria-invalid={!!error} aria-describedby={error ? `${id}-${field.id}-error` : undefined} className="m-0 grid min-w-0 gap-2 rounded-xl border border-line p-4 focus-visible:focus-ring">
            <legend className="px-2 text-sm font-semibold wrap-anywhere">{label}</legend>
            {field.options.map(option => <label key={option.id} className="flex min-h-11 min-w-0 items-center gap-3 text-sm leading-6"><input type="checkbox" checked={Array.isArray(answer) && answer.includes(option.id)}
              className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => { const selected = Array.isArray(answer) ? answer : []; change({ ...value.answers, [field.id]: event.target.checked ? [...selected, option.id] : selected.filter(item => item !== option.id) }); }} /><span className="wrap-anywhere">{option.label}</span></label>)}
            {error && <p id={`${id}-${field.id}-error`} className="m-0 text-sm text-error">{error}</p>}
          </fieldset>;
          return <MuiTextField key={field.id} name={field.id} label={label} required={field.required} value={text} fullWidth variant="outlined" size="small" className={fieldClasses}
            autoComplete={field.key === 'name' ? 'name' : field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : field.key === 'address' ? 'street-address' : 'off'}
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : 'text'}
            multiline={field.type === 'long_text'} minRows={field.type === 'long_text' ? 4 : undefined} select={field.type === 'dropdown'}
            error={!!error} helperText={error} disabled={busy}
            slotProps={{ inputLabel: field.type === 'date' || field.type === 'dropdown' ? { shrink: true } : undefined,
              input: { className: 'has-focus-visible:focus-ring' },
              select: field.type === 'dropdown' ? { native: true } : undefined,
              htmlInput: { maxLength: visitorFieldLimit(field) } }}
            onChange={event => change({ ...value.answers, [field.id]: event.target.value })}>
            {field.type === 'dropdown' ? <><option value="">{copy.choose}</option>{field.options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</> : undefined}
          </MuiTextField>;
        })}
        {definition.consent && <div><label className="flex min-h-11 min-w-0 items-start gap-3 text-sm leading-6"><input type="checkbox" checked={value.consent} required={definition.consent.required}
          aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring"
          onChange={event => { if (!busy) onChange({ ...value, consent: event.target.checked }); }} /><span className="wrap-anywhere">{definition.consent.required ? definition.consent.label : copy.optional(definition.consent.label)}</span></label>
          {errors.consent && <p id={`${id}-consent-error`} className="mb-0 mt-2 text-sm text-error">{errors.consent}</p>}
        </div>}
        <div hidden aria-hidden="true"><label>{copy.honeypot}<input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={value.website} onChange={event => { if (!busy) onChange({ ...value, website: event.target.value }); }} /></label></div>
      </fieldset>
      {(failure || Object.keys(errors.fields).length > 0 || errors.consent) && <div ref={feedback} tabIndex={-1} className="rounded-xl focus-visible:focus-ring"><FormFeedback kind="error" message={failure || copy.reviewErrors} /></div>}
      {definition.privacy && <a href={safePrivacyHref(definition.privacy.href)} target="_blank" rel="noopener noreferrer" className="justify-self-start rounded-lg text-sm text-primary underline focus-visible:focus-ring">{definition.privacy.label}</a>}
      {challenge && <section aria-labelledby={`${id}-challenge-title`} className="grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4">
        <h2 id={`${id}-challenge-title`} className="m-0 text-base font-semibold">{copy.challengeTitle}</h2>
        <p role={challenge.status === 'expired' || challenge.status === 'error' ? 'alert' : 'status'} className="m-0 text-sm leading-6 text-muted">{challenge.status === 'required' || challenge.status === 'verified' && challengeBlocked ? copy.challengeRequired : challenge.status === 'verifying' ? copy.challengeVerifying : challenge.status === 'verified' ? copy.challengeVerified : challenge.status === 'expired' ? copy.challengeExpired : copy.challengeError}</p>
        <div className="min-w-0 max-w-full">{challengeContent}</div>
        {(challenge.status === 'expired' || challenge.status === 'error') && <button type="button" disabled={busy || !onRetryChallenge} onClick={() => { if (!busy) onRetryChallenge?.(); }} className="min-h-11 justify-self-start rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:opacity-50">{copy.retryChallenge}</button>}
      </section>}
      {rateDeadline !== null && <p role="status" className="m-0 rounded-xl bg-canvas p-4 text-sm leading-6 text-muted">{rateBlocked ? copy.rateLimited : copy.rateReady}</p>}
      <SubmitButton label={uncertain ? copy.retryRequest : definition.submitLabel || copy.submit} pendingLabel={copy.pending} pending={busy} disabled={challengeBlocked || rateBlocked || !submissionAvailable || interactionLocked} />
    </form>}
  </section>;
}
