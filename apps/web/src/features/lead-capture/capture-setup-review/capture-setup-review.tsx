'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback } from '@salesmora/ui';
import { CaptureReadinessChecks } from './capture-readiness-checks';
import { captureSetupReviewData as copy } from './capture-setup-review.data';
import { captureLaunchReadiness, captureLaunchTiming, type CaptureLaunchRequest, type CaptureLaunchValue, type CaptureReviewSection, type CaptureSetupReviewDraft } from './capture-setup-review.validation';

export type CaptureSetupReviewProps = {
  draft: CaptureSetupReviewDraft; value: CaptureLaunchValue; canRead: boolean; canEdit: boolean; canLaunch: boolean; pending?: boolean;
  onChange: (value: CaptureLaunchValue) => void; onEdit: (section: CaptureReviewSection) => void;
  /** Reauthorize, check the exact draft version/readiness, and reserve capacity atomically. */
  onLaunch: (request: CaptureLaunchRequest) => Promise<void>;
  now?: () => number;
  /** A saved assistant proposal binds its timing; changing it requires a new review. */
  timingReadOnly?: boolean;
};
const button = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring enabled:hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50';
function ReviewApproval({ disabled, onApprove, label }: { disabled: boolean; onApprove: () => void; label: string }) {
  const [checked, setChecked] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (checked && !disabled) onApprove(); };
  return <form className="grid gap-4" onSubmit={submit}>
    <label className="flex min-h-11 items-start gap-3 text-sm leading-6"><input type="checkbox" checked={checked} disabled={disabled} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => setChecked(event.target.checked)} /><span>{copy.confirm}</span></label>
    <button type="submit" disabled={disabled || !checked} className="min-h-11 max-w-full cursor-pointer justify-self-start rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere focus-visible:focus-ring enabled:hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">{label}</button>
  </form>;
}
export function CaptureSetupReview({ draft, value, canRead, canEdit, canLaunch, pending = false, onChange, onEdit, onLaunch, now = Date.now, timingReadOnly = false }: CaptureSetupReviewProps) {
  const id = useId(), lock = useRef(false);
  const [working, setWorking] = useState(false), [clock, setClock] = useState(now);
  const [failed, setFailed] = useState<string | null>(null), [submitted, setSubmitted] = useState<string | null>(null);
  useEffect(() => { const timer = setInterval(() => setClock(now()), 30000); return () => clearInterval(timer); }, [now]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = pending || working, signature = JSON.stringify([draft, value]);
  const ready = captureLaunchReadiness(draft), timing = captureLaunchTiming(value, draft.timezone, clock);
  const completed = submitted === signature, disabled = busy || !canLaunch || !ready || !timing.timing || completed;
  const approve = async () => {
    const current = captureLaunchTiming(value, draft.timezone, now());
    if (disabled || lock.current || !current.timing) { setClock(now()); return; }
    lock.current = true; setWorking(true); setFailed(null);
    try { await onLaunch(structuredClone({ draft, timing: current.timing })); setSubmitted(signature); }
    catch { setFailed(signature); }
    finally { lock.current = false; setWorking(false); }
  };
  return <section className="grid min-w-0 gap-6 text-ink">
    <header><h2 className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p><p className="mb-0 mt-3 text-base font-semibold wrap-anywhere">{draft.name}</p></header>
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <div className="grid min-w-0 gap-4">
        {draft.sections.map(section => <section key={section.id} aria-labelledby={`${id}-${section.id}`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3"><h3 id={`${id}-${section.id}`} className="m-0 text-base font-semibold">{copy.sections[section.id]}</h3>{canEdit && <button type="button" disabled={busy} className={button} onClick={() => { if (!busy && !lock.current) onEdit(section.id); }}>{copy.edit(copy.sections[section.id])}</button>}</header>
          <dl className="m-0 grid min-w-0 gap-4">{section.rows.map((row, index) => <div key={index} className="grid min-w-0 gap-1"><dt className="text-xs font-semibold text-muted">{row.label}</dt><dd className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{row.value}</dd></div>)}</dl>
        </section>)}
      </div>
      <div className="grid min-w-0 gap-4">
        <CaptureReadinessChecks checks={draft.checks.map(check => ({ ...check, label: copy.checks[check.id] }))} ready={ready} />
        <section aria-labelledby={`${id}-launch`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
          <h3 id={`${id}-launch`} className="m-0 text-base font-semibold">{copy.activate}</h3>
          <p className="m-0 text-sm leading-6 text-muted">{draft.source === 'gmail' ? copy.gmail : copy.website}</p>
          <fieldset disabled={busy || !canLaunch || completed || timingReadOnly} className="m-0 grid min-w-0 gap-3 border-0 p-0" aria-label={copy.activate}>
            {(['now', 'scheduled'] as const).map(mode => <label key={mode} className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${value.mode === mode ? 'border-primary bg-primary/10 text-primary-dark' : 'border-line'}`}><input type="radio" name={`${id}-timing`} checked={value.mode === mode} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => { if (!busy && canLaunch && !completed && !timingReadOnly) onChange({ ...value, mode }); }} />{mode === 'now' ? copy.now : copy.scheduled}</label>)}
            {value.mode === 'scheduled' && <MuiTextField label={copy.date} type="datetime-local" required value={value.localDateTime} fullWidth size="small" className={fieldClasses} disabled={busy || !canLaunch || completed || timingReadOnly} error={!!value.localDateTime && !!timing.error} helperText={value.localDateTime ? timing.error : undefined} slotProps={{ inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => { if (!busy && canLaunch && !completed && !timingReadOnly) onChange({ ...value, localDateTime: event.target.value }); }} />}
          </fieldset>
          <p className="m-0 text-sm font-semibold text-muted wrap-anywhere">{copy.zone(draft.timezone)}</p>
          {timing.timing?.kind === 'scheduled' && <p className="m-0 text-sm font-semibold text-primary-dark"><time dateTime={timing.timing.at}>{new Intl.DateTimeFormat('en-US', { timeZone: draft.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(timing.timing.at))}</time></p>}
          {!canLaunch && <p className="m-0 text-sm text-muted">{copy.noLaunch}</p>}
          {value.mode === 'now' && timing.error && <FormFeedback kind="error" message={timing.error} />}
          {failed === signature && <FormFeedback kind="error" message={copy.failed} />}
          {completed && <FormFeedback kind="success" message={value.mode === 'scheduled' ? copy.submittedSchedule : copy.submitted} />}
          <ReviewApproval key={signature} disabled={disabled} label={busy ? copy.pending : value.mode === 'scheduled' ? copy.schedule : copy.launch} onApprove={() => { void approve(); }} />
        </section>
      </div>
    </div>
  </section>;
}
