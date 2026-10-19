'use client';

import { AccountLayout, FormFeedback } from '@salesmora/ui';
import { LoginForm, type LoginFormProps } from '../login-form/login-form';
import { loginScreenData as copy } from './login-screen.data';

export interface LoginScreenProps {
  onSubmit: LoginFormProps['onSubmit'];
  notice?: string;
  successMessage?: string;
  accountDeletionRequested?: boolean;
}

export function LoginScreen({ onSubmit, notice = copy.previewNotice, successMessage = copy.successMessage, accountDeletionRequested = false }: LoginScreenProps) {
  return (
    <AccountLayout title={copy.title} description={copy.description} footer={copy.footer}>
      {accountDeletionRequested && <div className="mb-6"><FormFeedback kind="success" title={copy.deletionTitle} message={copy.deletionMessage} /></div>}
      <p className="mb-6 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{notice}</p>
      <LoginForm onSubmit={onSubmit} forgotPasswordHref={copy.recoveryHref} successMessage={successMessage} />
      <p className="mt-6 text-center text-sm leading-6 text-muted">
        {copy.accountPrompt}{' '}
        <a href={copy.registerHref} className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.register}</a>
      </p>
    </AccountLayout>
  );
}
