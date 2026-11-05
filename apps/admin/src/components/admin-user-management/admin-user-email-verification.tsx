'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminCustomerUserEmailVerificationResendResultSchema,
  adminCustomerUserEmailVerificationResultSchema,
  adminCustomerUserEmailVerificationVerifiedSchema,
  adminUserEmailVerificationOperationSchema,
  adminUserEmailVerificationStartSchema,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminUserEmailVerificationData as copy } from './admin-user-email-verification-copy.data';

type Action = 'resend' | 'verify';
type Method = 'passkey' | 'totp';
type VerificationState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };

class EmailVerificationRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestEmailVerification(userId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/email-verification`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new EmailVerificationRequestError(copy.failed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new EmailVerificationRequestError(copy.failed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.failed;
    throw new EmailVerificationRequestError(message, response.status);
  }
  return result;
}

export function AdminUserEmailVerification({
  userId,
  name,
  maskedEmail,
  deletionPending,
  canManage,
  onComplete,
  onAccessError,
}: {
  userId: string;
  name: string;
  maskedEmail: string;
  deletionPending: boolean;
  canManage: boolean;
  onComplete: () => void;
  onAccessError: (status: number, message: string) => void;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [reason, setReason] = useState('');
  const [submittedReason, setSubmittedReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const verification = useRef<VerificationState | null>(null);

  useEffect(() => () => { verification.current = null; }, []);

  function close() {
    verification.current = null;
    setAction(null);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function openReview(nextAction: Action) {
    verification.current = null;
    setAction(nextAction);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  async function advance() {
    if (!action) return;
    setError('');
    setPending(true);
    try {
      if (action === 'resend') {
        const input = adminUserEmailVerificationOperationSchema.safeParse({
          operation: 'resend', userId, reason: reason.trim(),
        });
        if (!input.success) throw new EmailVerificationRequestError(copy.reasonHint, 400);
        if (input.data.operation !== 'resend') throw new EmailVerificationRequestError(copy.reasonHint, 400);
        const resendInput = input.data;
        const result = adminCustomerUserEmailVerificationResendResultSchema.safeParse(
          await requestEmailVerification(userId, resendInput),
        );
        if (!result.success) throw new EmailVerificationRequestError(copy.failed, 502);
        setSubmittedReason(resendInput.reason);
        setSuccess(copy.resent(maskedEmail));
        close();
        return;
      }

      if (stage === 'review') {
        const input = adminUserEmailVerificationOperationSchema.safeParse({
          operation: 'start', userId, reason: reason.trim(),
        });
        if (!input.success) throw new EmailVerificationRequestError(copy.reasonHint, 400);
        if (input.data.operation !== 'start') throw new EmailVerificationRequestError(copy.reasonHint, 400);
        const start = adminUserEmailVerificationStartSchema.safeParse(
          await requestEmailVerification(userId, input.data),
        );
        if (!start.success || start.data.methods.length === 0) {
          throw new EmailVerificationRequestError(copy.failed, 502);
        }
        verification.current = start.data;
        setMethods(start.data.methods);
        setMethod(start.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new EmailVerificationRequestError(copy.failed, 401);
      const factorInput = method === 'passkey'
        ? {
          operation: 'factor' as const,
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(state.options),
        }
        : { operation: 'factor' as const, token: state.token, method, code: code.trim() };
      const factor = adminUserEmailVerificationOperationSchema.safeParse(factorInput);
      if (!factor.success) throw new EmailVerificationRequestError(copy.failed, 400);
      const verified = adminCustomerUserEmailVerificationVerifiedSchema.safeParse(
        await requestEmailVerification(userId, factor.data),
      );
      if (!verified.success) throw new EmailVerificationRequestError(copy.failed, 502);
      const result = adminCustomerUserEmailVerificationResultSchema.safeParse(
        await requestEmailVerification(userId, { operation: 'commit', token: state.token }),
      );
      if (!result.success) throw new EmailVerificationRequestError(copy.failed, 502);
      verification.current = null;
      setSubmittedReason(reason.trim());
      setSuccess(copy.verified);
      close();
      onComplete();
    } catch (failure) {
      if (failure instanceof EmailVerificationRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      setPending(false);
    }
  }

  const title = action === 'verify'
    ? stage === 'verification' ? copy.stepUpTitle : copy.verifyTitle
    : copy.resendTitle;
  const confirmLabel = action === 'verify'
    ? stage === 'verification' ? method === 'totp' ? copy.verifyCode : copy.passkey : copy.continue
    : copy.resendConfirm;
  const confirmDisabled = pending || !action ||
    (stage === 'review' && (reason.trim().length < 10 || reason.trim().length > 500)) ||
    (action === 'verify' && stage === 'verification' &&
      (!methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))));

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="email-verification-title">
      <div className="grid gap-2">
        <h2 className="m-0 text-base font-semibold" id="email-verification-title">{copy.title}</h2>
        <p className="m-0 text-sm text-muted">{copy.status}</p>
      </div>
      {success && (
        <div className="grid gap-2 text-sm" role="status">
          <p className="m-0 text-success">{success}</p>
          <p className="m-0 text-muted">{copy.auditReason(submittedReason)}</p>
        </div>
      )}
      {deletionPending ? (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.deletionPending}</p>
      ) : canManage ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending} onClick={() => openReview('resend')}
            className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {copy.resend}
          </button>
          <button type="button" disabled={pending} onClick={() => openReview('verify')}
            className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {copy.verify}
          </button>
        </div>
      ) : (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.readOnly}</p>
      )}
      {error && !action && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
      {action && <ConfirmDialog
        open
        title={title}
        description={action === 'verify'
          ? stage === 'verification' ? copy.stepUpDescription : copy.verifyDescription(name, maskedEmail)
          : copy.resendDescription(maskedEmail)}
        confirmLabel={confirmLabel}
        confirmDisabled={confirmDisabled}
        pendingLabel={copy.pending}
        pending={pending}
        error={error}
        onConfirm={advance}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          {stage === 'verification' ? (
            <div className="grid gap-3">
              <p className="m-0 text-sm text-muted" role="note">{copy.verificationHint}</p>
              {method === 'totp' ? (
                <>
                  <TextField label={copy.totp} required value={code} onChange={event => setCode(event.target.value)}
                    autoComplete="one-time-code" slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }} />
                  {methods.includes('passkey') && (
                    <button type="button" onClick={() => { setMethod('passkey'); setCode(''); }}
                      className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">
                      {copy.usePasskey}
                    </button>
                  )}
                </>
              ) : methods.includes('totp') ? (
                <button type="button" onClick={() => setMethod('totp')}
                  className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">
                  {copy.useTotp}
                </button>
              ) : null}
            </div>
          ) : (
            <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
              helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
          )}
        </div>
      </ConfirmDialog>}
    </section>
  );
}
