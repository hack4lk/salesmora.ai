'use client';

import { LoginScreen } from './login-screen';
import { loginScreenData as copy } from './login-screen.data';
import { loginFormData } from '../login-form/login-form.data';
import type { LoginResult, LoginSubmission } from '../login-form/login-form';

async function signIn(values: LoginSubmission, returnTo?: string): Promise<LoginResult> {
  try {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(values),
    });
    if (!response.ok) return {
      ok: false,
      message: response.status === 429 ? copy.errors.rateLimited
        : response.status === 423 ? copy.errors.accountUnavailable
        : response.status === 401 ? loginFormData.errors.submission : copy.errors.unavailable,
    };
    window.location.assign(returnTo ?? '/setup');
    return { ok: true };
  } catch {
    return { ok: false, message: copy.errors.unavailable };
  }
}

export function LoginRoute({
  accountDeletionRequested = false,
  returnTo,
}: {
  accountDeletionRequested?: boolean;
  returnTo?: string;
}) {
  return <LoginScreen accountDeletionRequested={accountDeletionRequested}
    onSubmit={values => signIn(values, returnTo)} notice={copy.localNotice} />;
}
