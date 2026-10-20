'use client';
import { ResetPasswordScreen } from './reset-password-screen';
import type { ResetPasswordResult } from '../reset-password-form/reset-password-form';

export function ResetPasswordRoute({ token }: { token?: string }) {
  async function submit(newPassword: string): Promise<ResetPasswordResult> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ token, newPassword }),
      });
      if (response.ok) {
        window.history.replaceState(null, '', '/reset-password');
        return { ok: true };
      }
      const body = await response.json().catch(() => null);
      return { ok: false, reason: body?.code === 'INVALID_TOKEN' ? 'invalid-link' : undefined };
    } catch { return { ok: false }; }
  }
  return <ResetPasswordScreen onSubmit={submit} invalidLink={!token} />;
}
