'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  adminCustomerUserPiiRevealOperationSchema,
  adminCustomerUserPiiRevealResultSchema,
  adminCustomerUserStaffActionsResponseSchema,
  type AdminCustomerUserStaffActionsResponse,
} from '@salesmora/contracts';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { adminUserPrivacyData as copy } from './admin-user-privacy-copy.data';

class PrivacyRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestJson(url: string, body?: unknown, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new PrivacyRequestError(copy.revealFailed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new PrivacyRequestError(copy.revealFailed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.revealFailed;
    throw new PrivacyRequestError(message, response.status);
  }
  return result;
}

function actionLabel(action: string) {
  const knownLabels: Record<string, string> = {
    'customer.user.profile.read': 'opened the customer profile',
    'customer.user.pii.revealed': 'revealed sensitive customer information',
    'customer.user.suspended': 'suspended the customer account',
    'customer.user.unsuspended': 'restored the customer account',
    'customer.user.sessions_revoked': 'revoked customer sessions',
    'customer.user.password_reset.requested': 'requested a password reset',
    'customer.user.email_verified': 'marked the email as verified',
    'customer.user.email_change.requested': 'requested an email change',
  };
  if (knownLabels[action]) return knownLabels[action];
  const label = action.replace(/^customer\.user\./, '').replace(/[._]/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export function AdminUserPrivacy({
  userId,
  maskedEmail,
  canReveal,
  canReadHistory,
  historyRefreshKey,
  onAccessError,
}: {
  userId: string;
  maskedEmail: string;
  canReveal: boolean;
  canReadHistory: boolean;
  historyRefreshKey: number;
  onAccessError: (status: number, message: string) => void;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const [actions, setActions] = useState<AdminCustomerUserStaffActionsResponse['actions']>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(canReadHistory);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = useCallback(async (nextCursor: string | null, signal?: AbortSignal) => {
    const query = nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : '';
    const data = adminCustomerUserStaffActionsResponseSchema.safeParse(
      await requestJson(`/api/admin/users/${encodeURIComponent(userId)}/staff-actions${query}`, undefined, signal),
    );
    if (!data.success) throw new PrivacyRequestError(copy.staffActionsFailed, 502);
    if (signal?.aborted) return;
    setActions(current => nextCursor ? [...current, ...data.data.actions] : data.data.actions);
    setCursor(data.data.nextCursor);
    setHistoryError('');
  }, [userId]);

  useEffect(() => {
    if (!canReadHistory) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadHistory(null, controller.signal).catch(failure => {
        if (controller.signal.aborted) return;
        if (failure instanceof PrivacyRequestError && [401, 403].includes(failure.status)) {
          onAccessError(failure.status, failure.message);
        }
        setHistoryError(failure instanceof Error ? failure.message : copy.staffActionsFailed);
      }).finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canReadHistory, historyRefreshKey, loadHistory, onAccessError]);

  function closeDialog() {
    setDialogOpen(false);
    setReason('');
    setError('');
  }

  async function revealEmail() {
    const input = adminCustomerUserPiiRevealOperationSchema.safeParse({ field: 'email', reason: reason.trim() });
    if (!input.success) {
      setError(copy.reasonHint);
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = adminCustomerUserPiiRevealResultSchema.safeParse(
        await requestJson(`/api/admin/users/${encodeURIComponent(userId)}/pii`, input.data),
      );
      if (!result.success || result.data.field !== 'email') throw new PrivacyRequestError(copy.revealFailed, 502);
      setEmail(result.data.value);
      setSuccess(copy.revealSuccess);
      closeDialog();
      if (canReadHistory) {
        setHistoryLoading(true);
        await loadHistory(null).catch(failure => {
          if (failure instanceof PrivacyRequestError && [401, 403].includes(failure.status)) {
            onAccessError(failure.status, failure.message);
          }
          setHistoryError(failure instanceof Error ? failure.message : copy.staffActionsFailed);
        }).finally(() => setHistoryLoading(false));
      }
    } catch (failure) {
      if (failure instanceof PrivacyRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.revealFailed);
    } finally {
      setPending(false);
    }
  }

  async function loadMore() {
    if (!cursor || historyLoadingMore) return;
    setHistoryLoadingMore(true);
    try {
      await loadHistory(cursor);
    } catch (failure) {
      if (failure instanceof PrivacyRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setHistoryError(failure instanceof Error ? failure.message : copy.staffActionsFailed);
    } finally {
      setHistoryLoadingMore(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="live-privacy-title">
        <h2 className="m-0 text-base font-semibold" id="live-privacy-title">{copy.title}</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="grid min-w-0 gap-2 rounded-lg border border-line p-3">
            <dt className="text-sm font-semibold">{copy.email}</dt>
            <dd className="m-0 break-all text-sm text-muted">{email ?? maskedEmail}</dd>
            {email ? <span className="text-xs font-medium text-success">{copy.visibleUntilLeave}</span> : canReveal ? (
              <button type="button" disabled={pending} onClick={() => { setDialogOpen(true); setError(''); }}
                className="min-h-9 w-fit cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
                {copy.revealEmail}
              </button>
            ) : null}
          </div>
          <div className="grid min-w-0 gap-2 rounded-lg border border-line p-3">
            <dt className="text-sm font-semibold">{copy.phone}</dt>
            <dd className="m-0 text-sm text-muted">{copy.phoneUnavailable}</dd>
          </div>
        </dl>
        {success && <p className="m-0 text-sm text-success" role="status">{success}</p>}
      </section>
      {canReadHistory && (
        <section className="grid gap-3 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="live-staff-actions-title">
          <h2 className="m-0 text-base font-semibold" id="live-staff-actions-title">{copy.staffActions}</h2>
          {historyLoading ? <p className="m-0 text-sm text-muted" role="status">{copy.staffActionsLoading}</p>
            : historyError ? (
              <div className="grid gap-3" role="alert">
                <p className="m-0 text-sm">{historyError}</p>
                <button type="button" onClick={() => {
                  setHistoryLoading(true);
                  void loadHistory(null).catch(failure => {
                    if (failure instanceof PrivacyRequestError && [401, 403].includes(failure.status)) {
                      onAccessError(failure.status, failure.message);
                    }
                    setHistoryError(failure instanceof Error ? failure.message : copy.staffActionsFailed);
                  }).finally(() => setHistoryLoading(false));
                }} className="min-h-9 w-fit cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-canvas focus-visible:focus-ring">
                  {copy.retry}
                </button>
              </div>
            ) : actions.length === 0 ? <p className="m-0 text-sm text-muted">{copy.staffActionsEmpty}</p> : (
              <>
                <ol className="m-0 grid list-none gap-3 p-0">
                  {actions.map(action => (
                    <li key={action.sequence} className="grid gap-1 border-b border-line pb-3 last:border-0 last:pb-0">
                      <time className="text-xs text-muted" dateTime={action.occurredAt}>{formatDate(action.occurredAt)} UTC</time>
                      <p className="m-0 text-sm">
                        <strong>{action.actorName} · {copy.actorRole[action.actorRole]}</strong>
                        {' '}{actionLabel(action.action)}
                      </p>
                      {action.reason && <p className="m-0 break-words text-sm text-muted">Reason: “{action.reason}”</p>}
                    </li>
                  ))}
                </ol>
                {cursor ? (
                  <button type="button" disabled={historyLoadingMore} onClick={() => { void loadMore(); }}
                    className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
                    {historyLoadingMore ? copy.staffActionsLoading : copy.loadMore}
                  </button>
                ) : <p className="m-0 text-xs text-muted">{copy.noMore}</p>}
              </>
            )}
        </section>
      )}
      {dialogOpen && <ConfirmDialog
        open
        title={copy.dialogTitle}
        description={copy.dialogDescription}
        confirmLabel={copy.confirm}
        confirmDisabled={pending || reason.trim().length < 10 || reason.trim().length > 500}
        pendingLabel={copy.pending}
        error={error}
        onConfirm={revealEmail}
        onClose={closeDialog}
        initialFocus="content"
        printHidden
      >
        <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
          helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
      </ConfirmDialog>}
    </div>
  );
}
