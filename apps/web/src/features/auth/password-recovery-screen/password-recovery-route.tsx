'use client';
import { PasswordRecoveryScreen } from './password-recovery-screen';
import type { PasswordRecoveryResult, PasswordRecoverySubmission } from '../password-recovery-form/password-recovery-form';

async function requestReset(values: PasswordRecoverySubmission): Promise<PasswordRecoveryResult> {
  try {
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      body: JSON.stringify(values),
    });
    return { ok: response.ok };
  } catch { return { ok: false }; }
}
export function PasswordRecoveryRoute() { return <PasswordRecoveryScreen onSubmit={requestReset} />; }
