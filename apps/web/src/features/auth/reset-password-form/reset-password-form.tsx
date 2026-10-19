'use client';
import { useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, PasswordField, SubmitButton } from '@salesmora/ui';
import { resetPasswordFormData as copy } from './reset-password-form.data';
import { validateResetPassword, type ResetPasswordErrors, type ResetPasswordValues } from './reset-password-form.validation';
import { useFormReady } from '../use-form-ready';

export type ResetPasswordResult = { ok: true } | { ok: false; reason?: 'invalid-link' };
export interface ResetPasswordFormProps { onSubmit: (password: string) => Promise<ResetPasswordResult> }
export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const ready = useFormReady();
  const id = useId();
  const [values, setValues] = useState<ResetPasswordValues>({ password: '', confirmation: '' });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'invalid-link'>('idle');
  const [failed, setFailed] = useState(false);
  const locked = useRef(false);
  const disabled = !ready || status !== 'idle';
  function change(key: keyof ResetPasswordValues, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validateResetPassword(next));
    setFailed(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const nextErrors = validateResetPassword(values);
    setAttempted(true); setErrors(nextErrors); setFailed(false);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      const field = event.currentTarget.elements.namedItem(first);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    locked.current = true; setStatus('pending');
    try {
      const result = await onSubmit(values.password);
      if (result.ok || result.reason === 'invalid-link') {
        setValues({ password: '', confirmation: '' });
        setStatus(result.ok ? 'success' : 'invalid-link');
        return;
      }
    } catch { /* Transport errors use the safe, retryable message. */ }
    setFailed(true); setStatus('idle'); locked.current = false;
  }
  return <form aria-label={copy.formLabel} aria-busy={status === 'pending'} noValidate onSubmit={submit} className="grid w-full min-w-0 gap-6">
    {failed && <FormFeedback kind="error" message={copy.errors.submission} />}
    {status === 'invalid-link' && <><FormFeedback kind="error" message={copy.errors.invalidLink} /><a href={copy.requestHref} className="inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring">{copy.requestLink}</a></>}
    {status === 'success' && <FormFeedback kind="success" title={copy.successTitle} message={copy.success} />}
    <PasswordField id={`${id}-password`} name="password" label={copy.password} autoComplete="new-password" required disabled={disabled} value={values.password} onChange={(event) => change('password', event.target.value)} error={!!errors.password} helperText={errors.password ?? copy.help} />
    <PasswordField id={`${id}-confirmation`} name="confirmation" label={copy.confirmation} autoComplete="new-password" required disabled={disabled} value={values.confirmation} onChange={(event) => change('confirmation', event.target.value)} error={!!errors.confirmation} helperText={errors.confirmation} />
    <SubmitButton label={copy.submit} pendingLabel={copy.pending} pending={status === 'pending'} disabled={disabled} />
  </form>;
}
