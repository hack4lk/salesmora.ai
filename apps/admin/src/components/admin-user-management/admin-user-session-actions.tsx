'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  adminCustomerUserPiiRevealOperationSchema,
  adminCustomerUserPiiRevealResultSchema,
  adminCustomerUserSessionsResponseSchema,
  adminCustomerUserSessionRevocationOperationSchema,
  adminCustomerUserSessionRevocationResultSchema,
  type AdminCustomerUserSupplemental,
  type AdminCustomerUserSessionAccess,
} from '@salesmora/contracts';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { adminUserSessionActionsData as copy } from './admin-user-session-actions-copy.data';

class SessionRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

type SessionRow = Omit<AdminCustomerUserSessionAccess, 'id'> & { id?: string };

async function requestCustomerUserAction(
  userId: string,
  endpoint: 'sessions' | 'pii',
  body?: unknown,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/${endpoint}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new SessionRequestError(copy.failed, 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new SessionRequestError(copy.failed, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : copy.failed;
    throw new SessionRequestError(message, response.status);
  }
  return result;
}

export function AdminUserSessionActions({
  userId,
  totalSessions,
  profileSessions,
  canManage,
  canRevealPii,
  refreshKey,
  onComplete,
  onPiiReveal,
  onAccessError,
}: {
  userId: string;
  totalSessions: number;
  profileSessions: AdminCustomerUserSupplemental['sessions'];
  canManage: boolean;
  canRevealPii: boolean;
  refreshKey: number;
  onComplete: () => void;
  onPiiReveal: () => void;
  onAccessError: (status: number, message: string) => void;
}) {
  const [managedSessions, setManagedSessions] = useState<AdminCustomerUserSessionAccess[]>([]);
  const [managedTotal, setManagedTotal] = useState(totalSessions);
  const [managedLoading, setManagedLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<{ scope: 'all' } | { scope: 'selected'; session: SessionRow } | null>(null);
  const [revealedIpsState, setRevealedIpsState] = useState<{ refreshKey: number; values: string[] } | null>(null);
  const [revealDialogOpen, setRevealDialogOpen] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [revealError, setRevealError] = useState('');
  const [revealPending, setRevealPending] = useState(false);
  const sessions: SessionRow[] = canManage ? managedSessions : profileSessions;
  const reportedTotal = canManage ? managedTotal : totalSessions;
  const loading = canManage && managedLoading;
  const revealedIps = revealedIpsState?.refreshKey === refreshKey ? revealedIpsState.values : null;

  const loadSessions = useCallback(async (signal?: AbortSignal) => {
    if (!canManage) return;
    setManagedLoading(true);
    setError('');
    try {
      const parsed = adminCustomerUserSessionsResponseSchema.safeParse(
        await requestCustomerUserAction(userId, 'sessions', undefined, signal),
      );
      if (!parsed.success) throw new SessionRequestError(copy.failed, 502);
      if (!signal?.aborted) {
        setManagedSessions(parsed.data.sessions);
        setManagedTotal(parsed.data.totalSessions);
      }
    } catch (failure) {
      if (signal?.aborted) return;
      if (failure instanceof SessionRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      if (!signal?.aborted) setManagedLoading(false);
    }
  }, [canManage, onAccessError, userId]);

  useEffect(() => {
    if (!canManage) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void loadSessions(controller.signal); }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canManage, loadSessions, refreshKey]);

  function close() {
    setAction(null);
    setReason('');
  }

  function closeRevealDialog() {
    setRevealDialogOpen(false);
    setRevealReason('');
    setRevealError('');
  }

  async function revealSessionIps() {
    const input = adminCustomerUserPiiRevealOperationSchema.safeParse({
      field: 'session_ips',
      reason: revealReason.trim(),
    });
    if (!input.success) {
      setRevealError(copy.reasonHint);
      return;
    }
    setRevealPending(true);
    setRevealError('');
    try {
      const result = adminCustomerUserPiiRevealResultSchema.safeParse(
        await requestCustomerUserAction(userId, 'pii', input.data),
      );
      if (!result.success || result.data.field !== 'session_ips') throw new SessionRequestError(copy.failed, 502);
      const matchesCurrentSessions = result.data.sessions.length === sessions.length &&
        result.data.sessions.every((session, index) =>
          session.device === sessions[index].device &&
          session.createdAt === sessions[index].createdAt &&
          session.lastActivityAt === sessions[index].lastActivityAt);
      if (!matchesCurrentSessions) throw new SessionRequestError(copy.sessionListChanged, 409);
      setRevealedIpsState({
        refreshKey,
        values: result.data.sessions.map(session => session.ipAddress ?? copy.ipNotRecorded),
      });
      closeRevealDialog();
      setSuccess(copy.revealSuccess);
      onPiiReveal();
    } catch (failure) {
      if (failure instanceof SessionRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setRevealError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      setRevealPending(false);
    }
  }

  async function confirm() {
    if (!action) return;
    const input = action.scope === 'all'
      ? { scope: 'all' as const, userId, reason: reason.trim() }
      : action.session.id
        ? { scope: 'selected' as const, userId, sessionIds: [action.session.id], reason: reason.trim() }
        : null;
    if (!input) {
      setError(copy.failed);
      return;
    }
    const validated = adminCustomerUserSessionRevocationOperationSchema.safeParse(input);
    if (!validated.success) {
      setError(copy.reasonHint);
      return;
    }

    setPending(true);
    setError('');
    setSuccess('');
    try {
      const result = adminCustomerUserSessionRevocationResultSchema.safeParse(
        await requestCustomerUserAction(userId, 'sessions', validated.data),
      );
      if (!result.success) throw new SessionRequestError(copy.failed, 502);
      setSuccess(copy.revoked(result.data.revoked));
      close();
      onComplete();
    } catch (failure) {
      if (failure instanceof SessionRequestError && [401, 403].includes(failure.status)) {
        onAccessError(failure.status, failure.message);
      }
      setError(failure instanceof Error ? failure.message : copy.failed);
    } finally {
      setPending(false);
    }
  }

  const revokeAll = action?.scope === 'all';
  const dialogTitle = revokeAll ? copy.confirmAllTitle : copy.confirmOneTitle;
  const dialogDescription = revokeAll
    ? copy.confirmAllDescription(reportedTotal)
    : copy.confirmOneDescription(action?.scope === 'selected' ? action.session.device : '');

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="live-session-actions-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-base font-semibold" id="live-session-actions-title">{copy.title}</h2>
        {!loading && canManage && reportedTotal > 0 && (
          <button type="button" disabled={pending} onClick={() => { setReason(''); setAction({ scope: 'all' }); }}
            className="min-h-10 cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {copy.signOutAll}
          </button>
        )}
        {!loading && canRevealPii && sessions.length > 0 && !revealedIps && (
          <button type="button" disabled={revealPending} onClick={() => { setRevealReason(''); setRevealError(''); setRevealDialogOpen(true); }}
            className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {copy.revealIps}
          </button>
        )}
        {!loading && revealedIps && (
          <span className="text-xs font-medium text-success">{copy.ipsVisibleUntilLeave}</span>
        )}
      </div>
      {loading ? <p className="m-0 text-sm text-muted" role="status">{copy.loading}</p>
        : error ? (
          <div className="grid gap-3" role="alert">
            <p className="m-0 text-sm">{error}</p>
            <button type="button" disabled={pending} onClick={() => { void loadSessions(); }}
              className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:opacity-50">
              {copy.retry}
            </button>
          </div>
        ) : (
          <>
            {success && <p className="m-0 text-sm text-success" role="status">{success}</p>}
            {sessions.length === 0 ? <p className="m-0 text-sm text-muted">{copy.noSessions}</p> : (
              <ul className="m-0 grid list-none gap-3 p-0">
                {sessions.map((session, index) => (
                  <li key={session.id ?? `${session.createdAt}:${session.lastActivityAt}:${index}`} className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                    <div className="grid min-w-0 gap-1">
                      <strong className="text-sm">{session.device}</strong>
                      <span className="text-xs text-muted">
                        {revealedIps?.[index] ?? session.maskedIp ?? copy.ipNotRecorded} · Last active {session.lastActivityAt}
                      </span>
                    </div>
                    {canManage && session.id && (
                      <button type="button" disabled={pending} onClick={() => { setReason(''); setAction({ scope: 'selected', session }); }}
                        className="min-h-10 w-fit cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
                        {copy.revoke}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {reportedTotal > sessions.length && (
              <p className="m-0 text-sm text-muted">
                Showing {sessions.length} of {reportedTotal} recent sessions.
                {canManage && ' Sign out all affects every active session.'}
              </p>
            )}
          </>
        )}
      {action && <ConfirmDialog
        open
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={revokeAll ? copy.confirmAll : copy.confirmOne}
        confirmDisabled={reason.trim().length < 10 || reason.trim().length > 500}
        pending={pending}
        pendingLabel={copy.pending}
        error={error}
        onConfirm={confirm}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          <TextField label={copy.reason} required value={reason} onChange={event => setReason(event.target.value)}
            helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
        </div>
      </ConfirmDialog>}
      {revealDialogOpen && <ConfirmDialog
        open
        title={copy.revealTitle}
        description={copy.revealDescription}
        confirmLabel={copy.revealConfirm}
        confirmDisabled={revealPending || revealReason.trim().length < 10 || revealReason.trim().length > 500}
        pendingLabel={copy.revealPending}
        error={revealError}
        onConfirm={revealSessionIps}
        onClose={closeRevealDialog}
        initialFocus="content"
        printHidden
      >
        <TextField label={copy.reason} required value={revealReason} onChange={event => setRevealReason(event.target.value)}
          helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }} />
      </ConfirmDialog>}
    </section>
  );
}
