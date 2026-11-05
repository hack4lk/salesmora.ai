'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminUserSuspensionMethodsSchema,
  adminUserSuspensionResultSchema,
  adminUserSuspensionStartSchema,
  adminUserSuspensionVerifiedSchema,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminUserSuspensionData as copy } from './admin-user-suspension-copy.data';

type Method = 'passkey' | 'totp';
type VerificationState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };

class SuspensionRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestSuspension(userId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/suspension`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new SuspensionRequestError('Account-access verification is unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new SuspensionRequestError('The account-access response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : 'Account access could not be changed. Refresh the profile before trying again.';
    throw new SuspensionRequestError(message, response.status);
  }
  return result;
}

export function AdminUserSuspension({
  userId,
  name,
  maskedEmail,
  suspended,
  deletionPending,
  activeSessions,
  ownsWorkspace,
  canManage,
  onComplete,
  onAccessError,
}: {
  userId: string;
  name: string;
  maskedEmail: string;
  suspended: boolean;
  deletionPending: boolean;
  activeSessions: number;
  ownsWorkspace: boolean;
  canManage: boolean;
  onComplete: () => void;
  onAccessError: (status: number, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const verification = useRef<VerificationState | null>(null);

  useEffect(() => () => { verification.current = null; }, []);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function openReview() {
    setError('');
    setReason('');
    setCode('');
    setStage('review');
    verification.current = null;
    setOpen(true);
  }

  async function advance() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        const available = adminUserSuspensionMethodsSchema.safeParse(await requestSuspension(userId));
        if (!available.success || available.data.methods.length === 0) {
          throw new SuspensionRequestError('Enroll a passkey or authenticator app before changing customer access.', 409);
        }
        const parsed = adminUserSuspensionStartSchema.safeParse(await requestSuspension(userId, {
          operation: 'start',
          userId,
          action: suspended ? 'unsuspend' : 'suspend',
          reason: reason.trim(),
        }));
        if (!parsed.success) throw new SuspensionRequestError('The verification response was invalid.', 502);
        verification.current = parsed.data;
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new SuspensionRequestError('The verification expired. Start a new review.', 401);
      const factorResponse = await requestSuspension(userId, method === 'passkey'
        ? { operation: 'factor', token: state.token, method, response: await getAdminPasskeyResponse(state.options) }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminUserSuspensionVerifiedSchema.safeParse(factorResponse).success) {
        throw new SuspensionRequestError('Second-factor verification failed.', 401);
      }
      const result = adminUserSuspensionResultSchema.safeParse(
        await requestSuspension(userId, { operation: 'commit', token: state.token }),
      );
      if (!result.success || !result.data.changed) {
        throw new SuspensionRequestError('The account status changed. Refresh the profile before trying again.', 409);
      }
      verification.current = null;
      close();
      onComplete();
    } catch (failure) {
      if (failure instanceof SuspensionRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : 'Account access could not be changed.');
    } finally {
      setPending(false);
    }
  }

  const actionTitle = suspended ? copy.unsuspendTitle : copy.suspendTitle;
  const confirmLabel = stage === 'review' ? copy.continue
    : suspended ? copy.verifyUnsuspend : copy.verifySuspend;
  const disabled = pending || (stage === 'review' && (reason.trim().length < 10 || reason.trim().length > 500)) ||
    (stage === 'verification' && (!methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))));

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-base font-semibold">{copy.title}</h2>
          <p className="m-0 text-sm text-muted">{name} · {maskedEmail}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${suspended ? 'bg-error text-paper' : 'bg-success text-paper'}`}>
          {suspended ? copy.suspended : copy.active}
        </span>
      </div>
      <p className="m-0 text-sm text-muted" role="status">{copy.statusLabel(suspended)}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>{copy.activeSessions(activeSessions)}</span>
        {ownsWorkspace && <span className="rounded-full bg-canvas px-3 py-1">{copy.workspaceOwner}</span>}
      </div>
      {!deletionPending ? (
        canManage ? <div>
          <button type="button" onClick={openReview}
            className={`min-h-11 cursor-pointer rounded-xl px-4 py-2 font-semibold focus-visible:focus-ring ${
              suspended ? 'border border-line bg-paper text-ink' : 'bg-error px-5 text-paper'
            }`}>
            {suspended ? copy.unsuspend : copy.suspend}
          </button>
          <p className="mt-2 text-sm text-muted">{copy.supportRole}</p>
        </div> : <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.denied}</p>
      ) : <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted">
        Account access cannot be changed while deletion is pending.
      </p>}
      {open && <ConfirmDialog
        open
        title={actionTitle}
        description={suspended ? copy.unsuspendDescription(name) : copy.suspendDescription(name, activeSessions, ownsWorkspace)}
        confirmLabel={confirmLabel}
        confirmDisabled={disabled}
        pending={pending}
        pendingLabel={copy.pending}
        error={error}
        destructive={!suspended}
        onConfirm={advance}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          <h3 className="m-0 text-lg font-semibold">{stage === 'review' ? copy.review : copy.verification}</h3>
          {stage === 'review' ? (
            <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
              helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
          ) : (
            <>
              <p className="m-0 text-sm leading-6 text-muted">{copy.verificationHint}</p>
              <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4" disabled={pending}>
                <legend className="px-1 text-sm font-semibold">Verification method</legend>
                {methods.map(available => <label key={available} className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input type="radio" name={`user-suspension-factor-${userId}`} checked={method === available}
                    onChange={() => { setMethod(available); setCode(''); setError(''); }} className="size-4 focus-visible:focus-ring" />
                  {available === 'passkey' ? copy.passkey : copy.totp}
                </label>)}
              </fieldset>
              {method === 'totp' && <TextField label={copy.code} required value={code}
                onChange={event => setCode(event.target.value)} helperText={copy.codeHint} autoComplete="one-time-code"
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />}
              <p className="m-0 text-sm leading-6 text-muted">
                {suspended ? copy.completedUnsuspend(name) : copy.completedSuspend(name, activeSessions)}
              </p>
              <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
            </>
          )}
        </div>
      </ConfirmDialog>}
    </section>
  );
}
