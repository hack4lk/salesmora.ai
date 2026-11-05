'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceSuspensionMethodsSchema,
  adminWorkspaceSuspensionResultSchema,
  adminWorkspaceSuspensionStartSchema,
  adminWorkspaceSuspensionVerifiedSchema,
  type AdminWorkspaceStatus,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceSuspensionCopy as copy } from './admin-workspace-suspension-copy.data';

type Method = 'passkey' | 'totp';
type VerificationState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };

class WorkspaceSuspensionRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestSuspension(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/suspension`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspaceSuspensionRequestError('Workspace-access verification is unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new WorkspaceSuspensionRequestError('The workspace-access response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Workspace access could not be changed. Refresh the workspace before trying again.';
    throw new WorkspaceSuspensionRequestError(message, response.status);
  }
  return result;
}

export function AdminWorkspaceSuspension({
  workspaceId,
  name,
  status,
  deletionPending,
  canManage,
  onComplete,
}: {
  workspaceId: string;
  name: string;
  status: AdminWorkspaceStatus;
  deletionPending: boolean;
  canManage: boolean;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const verification = useRef<VerificationState | null>(null);
  const suspended = status === 'suspended';

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
    setSuccess('');
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
        const available = adminWorkspaceSuspensionMethodsSchema.safeParse(await requestSuspension(workspaceId));
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspaceSuspensionRequestError(
            'Enroll a passkey or authenticator app before changing workspace access.',
            409,
          );
        }
        const started = adminWorkspaceSuspensionStartSchema.safeParse(await requestSuspension(workspaceId, {
          operation: 'start',
          workspaceId,
          action: suspended ? 'unsuspend' : 'suspend',
          reason: reason.trim(),
        }));
        if (!started.success) throw new WorkspaceSuspensionRequestError('The verification response was invalid.', 502);
        verification.current = started.data;
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspaceSuspensionRequestError('The verification expired. Start a new review.', 401);
      const factorResponse = await requestSuspension(workspaceId, method === 'passkey'
        ? { operation: 'factor', token: state.token, method, response: await getAdminPasskeyResponse(state.options) }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspaceSuspensionVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspaceSuspensionRequestError('Second-factor verification failed.', 401);
      }
      const result = adminWorkspaceSuspensionResultSchema.safeParse(
        await requestSuspension(workspaceId, { operation: 'commit', token: state.token }),
      );
      if (!result.success || !result.data.changed || result.data.action !== (suspended ? 'unsuspend' : 'suspend')) {
        throw new WorkspaceSuspensionRequestError('The workspace status changed. Refresh before trying again.', 409);
      }
      verification.current = null;
      setSuccess(result.data.action === 'suspend' ? copy.completed.suspended : copy.completed.active);
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Workspace access could not be changed.');
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
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="workspace-access-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-base font-semibold" id="workspace-access-title">{copy.actionTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.actionDescription}</p>
        </div>
        {canManage && !deletionPending && (
          <button type="button" onClick={openReview}
            className={`min-h-11 cursor-pointer rounded-xl px-4 py-2 font-semibold focus-visible:focus-ring ${
              suspended ? 'border border-line bg-paper text-ink' : 'bg-error text-paper'
            }`}>
            {suspended ? copy.unsuspend : copy.suspend}
          </button>
        )}
      </div>
      <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="note">{copy.impact}</p>
      <p className="m-0 text-sm text-muted">{copy.reasonVisibility}</p>
      {success && <p className="m-0 text-sm text-muted" role="status">{success}</p>}
      {!canManage && <p className="m-0 text-sm text-muted" role="note">{copy.denied}</p>}
      {deletionPending && <p className="m-0 text-sm text-muted" role="note">
        Workspace access cannot be changed while deletion is pending.
      </p>}
      {open && <ConfirmDialog
        open
        title={actionTitle}
        description={suspended ? copy.unsuspendDescription(name) : copy.suspendDescription(name)}
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
          <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
            {copy.impact}
          </p>
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
                  <input type="radio" name={`workspace-suspension-factor-${workspaceId}`} checked={method === available}
                    onChange={() => { setMethod(available); setCode(''); setError(''); }} className="size-4 focus-visible:focus-ring" />
                  {available === 'passkey' ? copy.passkey : copy.totp}
                </label>)}
              </fieldset>
              {method === 'totp' && <TextField label={copy.code} required value={code}
                onChange={event => setCode(event.target.value)} helperText={copy.codeHint} autoComplete="one-time-code"
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />}
              <p className="m-0 text-sm leading-6 text-muted">{copy.reasonVisibility}</p>
              <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
            </>
          )}
        </div>
      </ConfirmDialog>}
    </section>
  );
}
