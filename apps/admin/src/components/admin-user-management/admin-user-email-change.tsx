'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminCustomerUserEmailChangeResultSchema,
  adminCustomerUserEmailChangeVerifiedSchema,
  adminUserEmailChangeOperationSchema,
  adminUserEmailChangeStartSchema,
  type AdminCustomerUserPendingEmailChange,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminUserEmailChangeData as copy } from './admin-user-email-change-copy.data';

type Method = 'passkey' | 'totp';
type ChangeState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };

class EmailChangeRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestEmailChange(userId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/email-change`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new EmailChangeRequestError(copy.failed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new EmailChangeRequestError(copy.failed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.failed;
    throw new EmailChangeRequestError(message, response.status);
  }
  return result;
}

function maskEmail(value: string) {
  const [local, domain = ''] = value.split('@');
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}••••@${domain}`;
}

function expiryLabel(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}

export function AdminUserEmailChange({
  userId,
  maskedEmail,
  pendingEmailChange,
  deletionPending,
  canManage,
  onComplete,
  onAccessError,
}: {
  userId: string;
  maskedEmail: string;
  pendingEmailChange: AdminCustomerUserPendingEmailChange | null | undefined;
  deletionPending: boolean;
  canManage: boolean;
  onComplete: () => void;
  onAccessError: (status: number, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const change = useRef<ChangeState | null>(null);

  useEffect(() => () => { change.current = null; }, []);

  function close() {
    change.current = null;
    setOpen(false);
    setStage('review');
    setEmail('');
    setReason('');
    setCode('');
    setError('');
  }

  async function advance() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        const input = adminUserEmailChangeOperationSchema.safeParse({
          operation: 'start', userId, email: email.trim(), reason: reason.trim(),
        });
        if (!input.success || input.data.operation !== 'start') {
          throw new EmailChangeRequestError(copy.failed, 400);
        }
        const result = adminUserEmailChangeStartSchema.safeParse(await requestEmailChange(userId, input.data));
        if (!result.success || !result.data.methods.length) throw new EmailChangeRequestError(copy.failed, 502);
        change.current = result.data;
        setMethods(result.data.methods);
        setMethod(result.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = change.current;
      if (!state) throw new EmailChangeRequestError(copy.failed, 401);
      const factorInput = method === 'passkey'
        ? { operation: 'factor' as const, token: state.token, method, response: await getAdminPasskeyResponse(state.options) }
        : { operation: 'factor' as const, token: state.token, method, code: code.trim() };
      const factor = adminUserEmailChangeOperationSchema.safeParse(factorInput);
      if (!factor.success) throw new EmailChangeRequestError(copy.failed, 400);
      const verified = adminCustomerUserEmailChangeVerifiedSchema.safeParse(
        await requestEmailChange(userId, factor.data),
      );
      if (!verified.success) throw new EmailChangeRequestError(copy.failed, 502);
      const result = adminCustomerUserEmailChangeResultSchema.safeParse(
        await requestEmailChange(userId, { operation: 'commit', token: state.token }),
      );
      if (!result.success) throw new EmailChangeRequestError(copy.failed, 502);
      setSuccess(copy.requestSent(result.data.maskedNewEmail));
      close();
      onComplete();
    } catch (failure) {
      if (failure instanceof EmailChangeRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      setPending(false);
    }
  }

  const emailValue = email.trim().toLowerCase();
  const review = adminUserEmailChangeOperationSchema.safeParse({
    operation: 'start', userId, email: emailValue, reason: reason.trim(),
  });
  const validReview = review.success && review.data.operation === 'start';
  const confirmDisabled = pending || (stage === 'review' && !validReview) ||
    (stage === 'verification' && (!methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))));
  const confirmLabel = stage === 'review'
    ? copy.continue
    : method === 'totp' ? copy.verifyCode : copy.passkey;

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="email-change-title">
      <div className="grid gap-2">
        <h2 className="m-0 text-base font-semibold" id="email-change-title">{copy.title}</h2>
        <p className="m-0 text-sm text-muted">{pendingEmailChange ? copy.pendingStatus : copy.status}</p>
      </div>
      {pendingEmailChange && (
        <p className="m-0 text-sm text-muted" role="status">
          {copy.pendingRequest(pendingEmailChange.maskedNewEmail, expiryLabel(pendingEmailChange.expiresAt))}
        </p>
      )}
      {success && <p className="m-0 text-sm text-success" role="status">{success}</p>}
      {deletionPending ? (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.deletionPending}</p>
      ) : canManage ? (
        <button type="button" disabled={pending} onClick={() => { setOpen(true); setError(''); }}
          className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
          {copy.action}
        </button>
      ) : (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.readOnly}</p>
      )}
      {error && !open && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
      {open && <ConfirmDialog
        open
        title={stage === 'verification' ? copy.stepUpTitle : copy.dialogTitle}
        description={stage === 'verification'
          ? copy.stepUpDescription(maskedEmail, maskEmail(emailValue))
          : copy.dialogDescription(maskedEmail)}
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
          {stage === 'review' ? (
            <>
              <TextField label={copy.newEmail} required value={email} onChange={event => setEmail(event.target.value)}
                helperText={copy.newEmailHint} autoComplete="off"
                slotProps={{ htmlInput: { type: 'email', maxLength: 254, spellCheck: false } }} />
              {email && !validReview && <p className="m-0 text-sm text-danger" role="alert">{copy.invalidEmail}</p>}
              <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
                helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
            </>
          ) : (
            <div className="grid gap-3">
              <p className="m-0 text-sm text-muted" role="note">{copy.sessionNotice} {copy.replacementNotice}</p>
              {method === 'totp' ? (
                <>
                  {methods.includes('passkey') && <button type="button" onClick={() => { setMethod('passkey'); setCode(''); }}
                    className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">{copy.usePasskey}</button>}
                  <TextField label={copy.totp} required value={code} onChange={event => setCode(event.target.value)}
                    autoComplete="one-time-code" slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }} />
                </>
              ) : methods.includes('totp') ? (
                <button type="button" onClick={() => { setMethod('totp'); setCode(''); }}
                  className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">{copy.useTotp}</button>
              ) : null}
            </div>
          )}
        </div>
      </ConfirmDialog>}
    </section>
  );
}
