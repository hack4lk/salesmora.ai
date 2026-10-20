'use client';

import { useId, useRef, useState, type FormEvent, type MouseEventHandler } from 'react';
import { FormFeedback, PasswordField, SubmitButton, TextField } from '@salesmora/ui';
import { loginFormData as copy } from './login-form.data';
import { validateLogin, type LoginErrors, type LoginSubmission } from './login-form.validation';

export type { LoginSubmission } from './login-form.validation';
export type LoginResult = { ok: true } | { ok: false; message?: string };
export interface LoginFormProps {
  onSubmit: (values: LoginSubmission) => Promise<LoginResult>;
  forgotPasswordHref: string;
  onForgotPasswordClick?: MouseEventHandler<HTMLAnchorElement>;
  successMessage?: string;
}

export function LoginForm({ onSubmit, forgotPasswordHref, onForgotPasswordClick, successMessage = copy.success }: LoginFormProps) {
  const id = useId();
  const [values, setValues] = useState<LoginSubmission>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [submissionError, setSubmissionError] = useState<string>();
  const submissionLocked = useRef(false);
  const disabled = status !== 'idle';

  function change(key: keyof LoginSubmission, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validateLogin(next));
    setSubmissionError(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLocked.current) return;
    const nextErrors = validateLogin(values);
    setAttempted(true);
    setErrors(nextErrors);
    setSubmissionError(undefined);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      const field = event.currentTarget.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    submissionLocked.current = true;
    setStatus('pending');
    try {
      const result = await onSubmit({ email: values.email.trim().toLowerCase(), password: values.password });
      if (result.ok) {
        setStatus('success');
        setValues((current) => ({ ...current, password: '' }));
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
      {status === 'success' && <FormFeedback kind="success" title={copy.successTitle} message={successMessage} />}
      <TextField id={`${id}-email`} name="email" label={copy.labels.email} type="email" autoComplete="username" required disabled={disabled} value={values.email} onChange={(event) => change('email', event.target.value)} error={!!errors.email} helperText={errors.email} />
      <PasswordField id={`${id}-password`} name="password" label={copy.labels.password} autoComplete="current-password" required disabled={disabled} value={values.password} onChange={(event) => change('password', event.target.value)} error={!!errors.password} helperText={errors.password} />
      <a href={forgotPasswordHref} onClick={onForgotPasswordClick} className="inline-flex min-h-11 items-center justify-self-end text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.forgotPassword}</a>
      <SubmitButton label={copy.submit} pendingLabel={copy.pending} pending={status === 'pending'} disabled={disabled} />
    </form>
  );
}
