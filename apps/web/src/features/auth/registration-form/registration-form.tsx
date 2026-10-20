'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, PasswordField, SubmitButton, TermsAcceptance, TextField, type TermsAcceptanceProps } from '@salesmora/ui';
import { registrationFormData as copy } from './registration-form.data';
import { validateRegistration, type RegistrationErrors, type RegistrationSubmission, type RegistrationValues } from './registration-form.validation';

export type { RegistrationSubmission } from './registration-form.validation';
export type RegistrationResult = { ok: true } | { ok: false; message?: string };
export interface RegistrationFormProps extends Pick<TermsAcceptanceProps, 'termsHref' | 'privacyHref' | 'onTermsClick' | 'onPrivacyClick'> {
  initialEmail?: string;
  emailDisabled?: boolean;
  submitLabel?: string;
  pendingLabel?: string;
  onSubmit: (values: RegistrationSubmission) => Promise<RegistrationResult>;
  successMessage?: string;
  successTitle?: string;
}

export function RegistrationForm({ initialEmail = '', emailDisabled = false, submitLabel = copy.submit, pendingLabel = copy.pending, onSubmit, successMessage = copy.success, successTitle = copy.successTitle, ...documentLinks }: RegistrationFormProps) {
  const id = useId();
  const [values, setValues] = useState<RegistrationValues>({ name: '', email: initialEmail, password: '', confirmPassword: '', termsAccepted: false });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [submissionError, setSubmissionError] = useState<string>();
  const submissionLocked = useRef(false);
  const disabled = status !== 'idle';

  function change<Key extends keyof RegistrationValues>(key: Key, value: RegistrationValues[Key]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validateRegistration(next));
    setSubmissionError(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLocked.current) return;
    const form = event.currentTarget;
    const nextErrors = validateRegistration(values);
    setAttempted(true);
    setErrors(nextErrors);
    setSubmissionError(undefined);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    submissionLocked.current = true;
    setStatus('pending');
    try {
      const result = await onSubmit({ name: values.name.trim(), email: values.email.trim(), password: values.password, termsAccepted: values.termsAccepted });
      if (result.ok) {
        setStatus('success');
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }));
      } else {
        setSubmissionError(result.message?.trim() || copy.errors.submission);
        setStatus('idle');
        submissionLocked.current = false;
      }
    } catch {
      setSubmissionError(copy.errors.submission);
      setStatus('idle');
      submissionLocked.current = false;
    }
  }

  return (
    <form aria-label={copy.formLabel} aria-busy={status === 'pending'} noValidate onSubmit={submit} className="grid w-full min-w-0 gap-6">
      {submissionError && <FormFeedback kind="error" message={submissionError} />}
      {status === 'success' && <FormFeedback kind="success" title={successTitle} message={successMessage} />}
      <TextField id={`${id}-name`} name="name" label={copy.labels.name} autoComplete="name" required disabled={disabled} value={values.name} onChange={(event) => change('name', event.target.value)} error={!!errors.name} helperText={errors.name} />
      <TextField id={`${id}-email`} name="email" label={copy.labels.email} type="email" autoComplete="email" required disabled={disabled || emailDisabled} value={values.email} onChange={(event) => change('email', event.target.value)} error={!!errors.email} helperText={errors.email} />
      <PasswordField id={`${id}-password`} name="password" label={copy.labels.password} autoComplete="new-password" required disabled={disabled} value={values.password} onChange={(event) => change('password', event.target.value)} error={!!errors.password} helperText={errors.password ?? copy.passwordHelp} />
      <PasswordField id={`${id}-confirm`} name="confirmPassword" label={copy.labels.confirmPassword} autoComplete="new-password" required disabled={disabled} value={values.confirmPassword} onChange={(event) => change('confirmPassword', event.target.value)} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
      <TermsAcceptance {...documentLinks} id={`${id}-terms`} name="termsAccepted" checked={values.termsAccepted} onChange={(checked) => change('termsAccepted', checked)} disabled={disabled} error={!!errors.termsAccepted} helperText={errors.termsAccepted} />
      <SubmitButton label={submitLabel} pendingLabel={pendingLabel} pending={status === 'pending'} disabled={disabled} />
    </form>
  );
}
