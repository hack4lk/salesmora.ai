'use client';

import { useState } from 'react';
import {
  adminCustomerUserPasswordResetOperationSchema,
  adminCustomerUserPasswordResetResultSchema,
} from '@salesmora/contracts';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { adminUserPasswordResetData as copy } from './admin-user-password-reset-copy.data';

class PasswordResetRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestPasswordReset(userId: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/password-reset`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PasswordResetRequestError(copy.failed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new PasswordResetRequestError(copy.failed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.failed;
    throw new PasswordResetRequestError(message, response.status);
  }
  return result;
}

export function AdminUserPasswordReset({
  userId,
  maskedEmail,
  authMethods,
  canManage,
  onAccessError,
}: {
  userId: string;
  maskedEmail: string;
  authMethods: string[];
  canManage: boolean;
  onAccessError: (status: number, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState('');
  const [submittedReason, setSubmittedReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasPassword = authMethods.includes('Password');

  function close() {
    if (pending) return;
    setOpen(false);
    setReason('');
  }

  async function confirm() {
    const input = adminCustomerUserPasswordResetOperationSchema.safeParse({ userId, reason: reason.trim() });
    if (!input.success) {
      setError(copy.reasonHint);
      return;
    }
    setPending(true);
    setError('');
    setSuccess('');
    try {
      const result = adminCustomerUserPasswordResetResultSchema.safeParse(
        await requestPasswordReset(userId, input.data),
      );
      if (!result.success) throw new PasswordResetRequestError(copy.failed, 502);
      setSubmittedReason(input.data.reason);
      setSuccess(copy.success(maskedEmail));
      setOpen(false);
      setReason('');
    } catch (failure) {
      if (failure instanceof PasswordResetRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="password-reset-title">
      <h2 className="m-0 text-base font-semibold" id="password-reset-title">{copy.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{copy.description(maskedEmail)}</p>
      {success && (
        <div className="grid gap-2 text-sm" role="status">
          <p className="m-0 text-success">{success}</p>
          <p className="m-0 text-muted">{copy.auditReason(submittedReason)}</p>
        </div>
      )}
      {!hasPassword ? (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.noPassword}</p>
      ) : canManage ? (
        <button type="button" disabled={pending} onClick={() => { setOpen(true); setReason(''); setError(''); }}
          className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
          {copy.action}
        </button>
      ) : (
        <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm text-muted" role="note">{copy.readOnly}</p>
      )}
      {error && !open && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
      {open && <ConfirmDialog
        open
        title={copy.dialogTitle}
        description={copy.dialogDescription(maskedEmail)}
        confirmLabel={copy.confirm}
        confirmDisabled={reason.trim().length < 10 || reason.trim().length > 500}
        pendingLabel={copy.pending}
        pending={pending}
        onConfirm={confirm}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          {error && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
          <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
            helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
        </div>
      </ConfirmDialog>}
    </section>
  );
}
