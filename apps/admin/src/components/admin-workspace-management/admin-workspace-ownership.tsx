'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceOwnershipTransferMethodsSchema,
  adminWorkspaceOwnershipTransferResultSchema,
  adminWorkspaceOwnershipTransferStartSchema,
  adminWorkspaceOwnershipTransferVerifiedSchema,
  type AdminWorkspaceDetailResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceOwnershipCopy as copy } from './admin-workspace-ownership-copy.data';

type Method = 'passkey' | 'totp';
type VerificationState = {
  token: string;
  options: PublicKeyCredentialRequestOptionsJSON;
  expectedOwnerUserId: string;
  newOwnerUserId: string;
};

class WorkspaceOwnershipTransferRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestOwnershipTransfer(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/ownership`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspaceOwnershipTransferRequestError('Ownership-transfer verification is unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new WorkspaceOwnershipTransferRequestError('The ownership-transfer response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Workspace ownership could not be transferred. Refresh the workspace before trying again.';
    throw new WorkspaceOwnershipTransferRequestError(message, response.status);
  }
  return result;
}

export function AdminWorkspaceOwnership({
  detail,
  onComplete,
}: {
  detail: AdminWorkspaceDetailResponse;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [memberId, setMemberId] = useState('');
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const verification = useRef<VerificationState | null>(null);
  const canManage = detail.permissions?.canTransferOwnership === true;
  const deletionPending = detail.workspace.status === 'deleting';
  const eligibleMembers = detail.members.filter(member =>
    member.id !== detail.ownerUserId && member.status === 'Active');
  const selectedMember = eligibleMembers.find(member => member.id === memberId);

  useEffect(() => () => { verification.current = null; }, []);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setMemberId('');
    setReason('');
    setCode('');
    setError('');
  }

  function openReview() {
    setError('');
    setSuccess('');
    setMemberId('');
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
        if (!selectedMember) throw new WorkspaceOwnershipTransferRequestError(copy.noEligibleMembers, 409);
        const available = adminWorkspaceOwnershipTransferMethodsSchema.safeParse(
          await requestOwnershipTransfer(detail.workspace.id),
        );
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspaceOwnershipTransferRequestError(copy.methodsUnavailable, 409);
        }
        const started = adminWorkspaceOwnershipTransferStartSchema.safeParse(
          await requestOwnershipTransfer(detail.workspace.id, {
            operation: 'start',
            workspaceId: detail.workspace.id,
            expectedOwnerUserId: detail.ownerUserId,
            newOwnerUserId: selectedMember.id,
            reason: reason.trim(),
          }),
        );
        if (!started.success) {
          throw new WorkspaceOwnershipTransferRequestError('The verification response was invalid.', 502);
        }
        verification.current = {
          ...started.data,
          expectedOwnerUserId: detail.ownerUserId,
          newOwnerUserId: selectedMember.id,
        };
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspaceOwnershipTransferRequestError(copy.expired, 409);
      const factorResponse = await requestOwnershipTransfer(detail.workspace.id, method === 'passkey'
        ? {
          operation: 'factor',
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(state.options),
        }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspaceOwnershipTransferVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspaceOwnershipTransferRequestError(copy.factorFailure, 401);
      }
      const result = adminWorkspaceOwnershipTransferResultSchema.safeParse(
        await requestOwnershipTransfer(detail.workspace.id, { operation: 'commit', token: state.token }),
      );
      if (!result.success || !result.data.changed ||
        result.data.previousOwnerUserId !== state.expectedOwnerUserId ||
        result.data.newOwnerUserId !== state.newOwnerUserId) {
        throw new WorkspaceOwnershipTransferRequestError(
          'Workspace ownership changed unexpectedly. Refresh the workspace before trying again.',
          409,
        );
      }
      verification.current = null;
      setSuccess(copy.completed);
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Workspace ownership could not be transferred.');
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || (stage === 'review' && (
    !selectedMember || reason.trim().length < 10 || reason.trim().length > 500
  )) || (stage === 'verification' && (
    !methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
  ));
  const confirmLabel = stage === 'review' ? copy.continue : copy.confirm;

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="workspace-ownership-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-base font-semibold" id="workspace-ownership-title">{copy.actionTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.actionDescription}</p>
        </div>
        {canManage && !deletionPending && (
          <button type="button" onClick={openReview} disabled={eligibleMembers.length === 0}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {copy.transfer}
          </button>
        )}
      </div>
      <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="note">{copy.impact}</p>
      {success && <p className="m-0 text-sm text-muted" role="status">{success}</p>}
      {!canManage && <p className="m-0 text-sm text-muted" role="note">{copy.denied}</p>}
      {deletionPending && canManage && <p className="m-0 text-sm text-muted" role="note">{copy.deletionPending}</p>}
      {canManage && !deletionPending && eligibleMembers.length === 0 && (
        <p className="m-0 text-sm text-muted" role="note">{copy.noEligibleMembers}</p>
      )}
      {open && <ConfirmDialog
        open
        title="Transfer workspace ownership?"
        description={selectedMember
          ? `${selectedMember.name} becomes the Owner with full control, including billing and deleting the workspace. ${detail.workspace.ownerName} becomes an Admin. Both are notified by email.`
          : `Choose an eligible member to become the Owner of ${detail.workspace.name}.`}
        confirmLabel={confirmLabel}
        confirmDisabled={disabled}
        pending={pending}
        pendingLabel={copy.pending}
        error={error}
        onConfirm={advance}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
            {copy.preview}
          </p>
          <h3 className="m-0 text-lg font-semibold">{stage === 'review' ? copy.review : copy.verification}</h3>
          {stage === 'review' ? (
            <>
              <label className="grid gap-2 text-sm font-medium">
                {copy.memberLabel}
                <select
                  aria-label={copy.memberLabel}
                  value={memberId}
                  onChange={event => {
                    setMemberId(event.target.value);
                    setError('');
                  }}
                  className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
                >
                  <option value="">{copy.chooseMember}</option>
                  {eligibleMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                  ))}
                </select>
                <span className="text-xs font-normal text-muted">{copy.memberHint}</span>
              </label>
              <TextField
                label={copy.reason}
                required
                value={reason}
                onChange={event => setReason(event.target.value)}
                helperText={copy.reasonHint}
                autoComplete="off"
                slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }}
              />
            </>
          ) : (
            <>
              <p className="m-0 text-sm leading-6 text-muted">{copy.verificationHint}</p>
              <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4">
                <legend className="px-1 text-sm font-semibold">Verification method</legend>
                {methods.includes('passkey') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-ownership-factor" checked={method === 'passkey'}
                      onChange={() => { setMethod('passkey'); setError(''); }} className="size-4 focus-visible:focus-ring" />
                    {copy.passkey}
                  </label>
                )}
                {methods.includes('totp') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-ownership-factor" checked={method === 'totp'}
                      onChange={() => { setMethod('totp'); setError(''); }} className="size-4 focus-visible:focus-ring" />
                    {copy.totp}
                  </label>
                )}
              </fieldset>
              {method === 'totp' && <TextField label={copy.code} required value={code}
                onChange={event => setCode(event.target.value)} helperText={copy.codeHint}
                autoComplete="one-time-code"
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />}
              <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
            </>
          )}
        </div>
      </ConfirmDialog>}
    </section>
  );
}
