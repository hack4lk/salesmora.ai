'use client';

import { AccountLayout } from '@salesmora/ui';
import { PasswordRecoveryForm, type PasswordRecoveryFormProps } from '../password-recovery-form/password-recovery-form';
import { passwordRecoveryScreenData as copy } from './password-recovery-screen.data';

export function PasswordRecoveryScreen({ onSubmit }: PasswordRecoveryFormProps) {
  return (
    <AccountLayout title={copy.title} description={copy.description}>
      <PasswordRecoveryForm onSubmit={onSubmit} />
      <a href={copy.loginHref} className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.backToLogin}</a>
    </AccountLayout>
  );
}
