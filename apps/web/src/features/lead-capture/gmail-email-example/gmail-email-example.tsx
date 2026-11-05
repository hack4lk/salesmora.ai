'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, HelpTooltip, SubmitButton, TextField } from '@salesmora/ui';
import { gmailEmailExampleData as copy } from './gmail-email-example.data';
import { validateGmailEmailExample, type GmailEmailExampleValue } from './gmail-email-example.validation';
import { GmailFieldSetupProgress } from '../gmail-field-setup-progress/gmail-field-setup-progress';
import { GmailSamplePicker, type GmailSamplePickerProps } from '../gmail-sample-picker/gmail-sample-picker';
export type GmailEmailExampleProps = {
  value: GmailEmailExampleValue;
  canRead: boolean; canEdit: boolean; pending?: boolean;
  canExtract?: boolean;
  onReviewFindings?: () => void;
  onChange: (value: GmailEmailExampleValue) => void;
  /** The host binds extraction/findings to this exact snapshot and owns the screen transition. Reject on failure. */
  onExtract: (sample: GmailEmailExampleValue) => Promise<void>;
  /** Optional mailbox path; the host applies the selected text and retains its provenance. */
  mailbox?: Omit<GmailSamplePickerProps, 'canRead' | 'canEdit' | 'pending'>;
};
export function GmailEmailExample({ value, canRead, canEdit, pending = false, canExtract = true, onChange, onExtract, onReviewFindings, mailbox }: GmailEmailExampleProps) {
  const id = useId();
  const [extracting, setExtracting] = useState(false), [failure, setFailure] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof GmailEmailExampleValue, string>>>({});
  const inFlight = useRef(false), focusError = useRef(false);
  const form = useRef<HTMLFormElement>(null), feedback = useRef<HTMLDivElement>(null);
  const busy = pending || extracting;
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    (form.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? feedback.current)?.focus();
  }, [errors, failure]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const disabled = !canEdit || busy;
  const change = (key: keyof GmailEmailExampleValue, text: string) => {
    if (disabled) return;
    setFailure(false); setErrors(current => ({ ...current, [key]: undefined })); onChange({ ...value, [key]: text });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || !canExtract || inFlight.current) return;
    const nextErrors = validateGmailEmailExample(value);
    focusError.current = true; setErrors(nextErrors); setFailure(false);
    if (Object.keys(nextErrors).length) return;
    // Preserve original text/line breaks for evidence rather than silently truncating or rewriting the email.
    const snapshot = { ...value };
    inFlight.current = true; setExtracting(true);
    try { await onExtract(snapshot); }
    catch { focusError.current = true; setFailure(true); }
    finally { inFlight.current = false; setExtracting(false); }
  };
  return <section aria-labelledby={`${id}-title`} className="mx-auto grid w-full min-w-0 max-w-3xl gap-6 text-ink">
    <GmailFieldSetupProgress step="example" pending={busy} onReviewFindings={onReviewFindings} />
    {mailbox && <GmailSamplePicker {...mailbox} canRead={canRead} canEdit={canEdit} pending={busy} />}
    <form ref={form} noValidate aria-labelledby={`${id}-title`} aria-busy={busy} onSubmit={event => { void submit(event); }} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <header>
        <div className="flex min-w-0 items-center gap-1">
          <h2 id={`${id}-title`} className="m-0 min-w-0 text-xl font-semibold wrap-anywhere">{mailbox ? copy.mailboxTitle : copy.title}</h2>
          {mailbox && <HelpTooltip label={copy.mailboxHelpLabel} paragraphs={[copy.mailboxDescription]} />}
        </div>
        {!mailbox && <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p>}
      </header>
      {!canEdit && <p className="m-0 text-sm text-muted">{copy.readOnly}</p>}
      <TextField label={copy.subject} value={value.subject} disabled={disabled} error={!!errors.subject} helperText={errors.subject || copy.subjectHint}
        slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => change('subject', event.target.value)} />
      <MuiTextField label={copy.body} value={value.body} disabled={disabled} multiline minRows={10} required fullWidth size="small" variant="outlined" className={fieldClasses}
        error={!!errors.body} helperText={errors.body || copy.bodyHint} slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }}
        onChange={event => change('body', event.target.value)} />
      {failure && <div ref={feedback} tabIndex={-1} className="rounded-xl focus-visible:focus-ring"><FormFeedback kind="error" message={copy.failure} /></div>}
      {busy && <div role="status" aria-live="polite" className="grid min-w-0 gap-2 rounded-xl border border-primary/20 bg-primary/10 p-4"><p className="m-0 text-sm font-semibold text-primary-dark">{copy.extracting}</p><p className="m-0 text-sm leading-6 text-muted">{copy.working}</p></div>}
      {canEdit && <div className="justify-self-start"><SubmitButton label={copy.extract} pendingLabel={copy.extracting} pending={busy} disabled={!canExtract} /></div>}
      {canEdit && !canExtract && <p role="status" className="m-0 text-sm text-muted">{copy.assistantUnavailable}</p>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.next}</p>
    </form>
  </section>;
}
