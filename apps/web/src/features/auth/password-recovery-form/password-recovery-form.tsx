'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, SubmitButton, TextField } from '@salesmora/ui';
import { passwordRecoveryFormData as copy } from './password-recovery-form.data';
import { validateRecoveryEmail, type PasswordRecoverySubmission } from './password-recovery-form.validation';
import { useFormReady } from '../use-form-ready';

export type { PasswordRecoverySubmission } from './password-recovery-form.validation';
export type PasswordRecoveryResult = { ok: true } | { ok: false };
export interface PasswordRecoveryFormProps {
  onSubmit: (values: PasswordRecoverySubmission) => Promise<PasswordRecoveryResult>;
  disabled?: boolean;
}

export function PasswordRecoveryForm({ onSubmit, disabled: externallyDisabled = false }: PasswordRecoveryFormProps) {
  const ready = useFormReady();
  const id = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [submissionError, setSubmissionError] = useState(false);
  const submissionLocked = useRef(false);
  const disabled = !ready || externallyDisabled || status !== 'idle';

  function change(value: string) {
    setEmail(value);
    if (attempted) setError(validateRecoveryEmail(value));
    setSubmissionError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || submissionLocked.current) return;
    const nextError = validateRecoveryEmail(email);
    setAttempted(true);
    setError(nextError);
    setSubmissionError(false);
    if (nextError) {
      const field = event.currentTarget.elements.namedItem('email');
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    submissionLocked.current = true;
    setStatus('pending');
    try {
      const result = await onSubmit({ email: email.trim().toLowerCase() });
      if (result.ok) {
        setStatus('success');
        return;
      }
    } catch {
      // Transport errors use the same safe UI message as returned failures.
    }
    setSubmissionError(true);
    setStatus('idle');
    submissionLocked.current = false;
  }

  return (
    <form aria-label={copy.formLabel} aria-busy={status === 'pending'} noValidate onSubmit={submit} className="grid w-full min-w-0 gap-6">
      {submissionError && <FormFeedback kind="error" message={copy.errors.submission} />}
      {status === 'success' && <FormFeedback kind="success" title={copy.successTitle} message={copy.success} />}
      <TextField id={`${id}-email`} name="email" label={copy.emailLabel} type="email" autoComplete="username" required disabled={disabled} value={email} onChange={(event) => change(event.target.value)} error={!!error} helperText={error ?? copy.emailHelp} />
      <SubmitButton label={copy.submit} pendingLabel={copy.pending} pending={status === 'pending'} disabled={disabled} />
    </form>
  );
}
