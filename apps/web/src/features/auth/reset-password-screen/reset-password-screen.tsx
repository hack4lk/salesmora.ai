'use client';
import { AccountLayout, FormFeedback } from '@salesmora/ui';
import { ResetPasswordForm, type ResetPasswordFormProps } from '../reset-password-form/reset-password-form';
import { resetPasswordFormData as form } from '../reset-password-form/reset-password-form.data';
import { resetPasswordScreenData as copy } from './reset-password-screen.data';

export function ResetPasswordScreen({ onSubmit, invalidLink = false }: ResetPasswordFormProps & { invalidLink?: boolean }) {
  return <AccountLayout title={copy.title} description={copy.description}>
    {invalidLink ? <div className="grid gap-6"><FormFeedback kind="error" message={form.errors.invalidLink} /><a href={form.requestHref} className="inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring">{form.requestLink}</a></div> : <ResetPasswordForm onSubmit={onSubmit} />}
    <a href={copy.loginHref} className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.backToLogin}</a>
  </AccountLayout>;
}
