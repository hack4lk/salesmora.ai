'use client';

import { AccountLayout } from '@salesmora/ui';
import { RegistrationForm, type RegistrationFormProps } from '../registration-form/registration-form';
import { registrationScreenData as copy } from './registration-screen.data';

export interface RegistrationScreenProps {
  onSubmit: RegistrationFormProps['onSubmit'];
  notice?: string;
}

export function RegistrationScreen({ onSubmit, notice = copy.previewNotice }: RegistrationScreenProps) {
  return (
    <AccountLayout title={copy.title} description={copy.description} footer={copy.footer}>
      <p className="mb-6 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{notice}</p>
      <RegistrationForm
        onSubmit={onSubmit}
        termsHref={copy.termsHref}
        privacyHref={copy.privacyHref}
        successTitle={copy.successTitle}
        successMessage={copy.successMessage}
      />
      <p className="mt-6 text-center text-sm leading-6 text-muted">
        {copy.accountPrompt}{' '}
        <a href={copy.loginHref} className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.signIn}</a>
      </p>
      <div className="mt-6 grid gap-3 text-sm leading-6 text-muted">
        <details id="terms-preview" className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-primary focus-visible:focus-ring">{copy.legal.termsTitle}</summary>
          <p className="mt-2">{copy.legal.unavailable}</p>
        </details>
        <details id="privacy-preview" className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-primary focus-visible:focus-ring">{copy.legal.privacyTitle}</summary>
          <p className="mt-2">{copy.legal.unavailable}</p>
        </details>
      </div>
    </AccountLayout>
  );
}
