'use client';

import { LoginScreen } from './login-screen';
import { loginScreenData as copy } from './login-screen.data';
import { loginFormData } from '../login-form/login-form.data';
import type { LoginResult, LoginSubmission } from '../login-form/login-form';

async function signIn(values: LoginSubmission): Promise<LoginResult> {
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
        : response.status === 401 ? loginFormData.errors.submission : copy.errors.unavailable,
    };
    window.location.assign('/setup');
    return { ok: true };
  } catch {
    return { ok: false, message: copy.errors.unavailable };
  }
}

export function LoginRoute({ accountDeletionRequested = false }: { accountDeletionRequested?: boolean }) {
  return <LoginScreen accountDeletionRequested={accountDeletionRequested} onSubmit={signIn} notice={copy.localNotice} />;
}
