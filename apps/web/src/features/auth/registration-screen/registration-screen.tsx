'use client';

import { AccountLayout } from '@salesmora/ui';
import { RegistrationForm, type RegistrationFormProps } from '../registration-form/registration-form';
import { registrationScreenData as copy } from './registration-screen.data';

export interface RegistrationScreenProps {
  onSubmit: RegistrationFormProps['onSubmit'];
  notice?: string;
  layoutVariant?: 'standalone' | 'public';
}

export function RegistrationScreen({ onSubmit, notice = copy.previewNotice, layoutVariant = 'standalone' }: RegistrationScreenProps) {
  return (
    <AccountLayout title={copy.title} description={copy.description} footer={copy.footer} variant={layoutVariant}>
      <p className="mb-6 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{notice}</p>
      <p className="mb-6 text-sm leading-6 text-muted">{copy.legal.notice}</p>
      <RegistrationForm
        onSubmit={onSubmit}
        termsHref={copy.termsHref}
        privacyHref={copy.privacyHref}
        openDocumentsInNewTab
        successTitle={copy.successTitle}
        successMessage={copy.successMessage}
      />
      <p className="mt-6 text-center text-sm leading-6 text-muted">
        {copy.accountPrompt}{' '}
        <a href={copy.loginHref} className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.signIn}</a>
      </p>
    </AccountLayout>
  );
}
