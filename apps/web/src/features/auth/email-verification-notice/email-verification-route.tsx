'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EmailVerificationNotice, type VerificationResendResult } from './email-verification-notice';
export function EmailVerificationRoute({ email, verified }: { email: string; verified: boolean }) {
  const router = useRouter();
  useEffect(() => {
    // Refresh server session state when returning from a verification link in another tab.
    const refresh = () => { if (document.visibilityState === 'visible') router.refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [router]);
  async function resend(): Promise<VerificationResendResult> {
    const response = await fetch('/api/auth/send-verification-email', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429) {
      const seconds = Number(response.headers.get('retry-after'));
      return { ok: false, reason: 'rate-limited', retryAfterSeconds: seconds > 0 ? seconds : undefined };
    }
    if (response.status === 401) router.refresh();
    const result = await response.json().catch(() => null);
    if (result?.code === 'EMAIL_ALREADY_VERIFIED') router.refresh();
    return { ok: false };
  }
  return <EmailVerificationNotice email={email} verified={verified} onResend={resend} />;
}
