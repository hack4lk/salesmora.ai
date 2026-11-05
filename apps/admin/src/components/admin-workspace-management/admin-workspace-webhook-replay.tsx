'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceWebhookReplayOperationSchema,
  adminWorkspaceWebhookReplayOverviewSchema,
  adminWorkspaceWebhookReplayResultSchema,
  adminWorkspaceWebhookReplayStartResponseSchema,
  adminWorkspaceWebhookReplayVerifiedSchema,
  type AdminWorkspaceBillingResponse,
  type AdminWorkspaceWebhookReplayOverview,
  type AdminWorkspaceWebhookReplayStartResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceBillingCopy as billingCopy } from './admin-workspace-billing-copy.data';
import { adminWorkspaceWebhookReplayCopy as copy } from './admin-workspace-webhook-replay-copy.data';

type ReplayEvent = AdminWorkspaceWebhookReplayOverview['events'][number];
type DisplayEvent = Omit<ReplayEvent, 'replayKey'> & { replayKey?: string };
type Stage = 'review' | 'verification' | 'confirm';
type OverviewState =
  | { workspaceId: string; status: 'loading' }
  | { workspaceId: string; status: 'error'; message: string }
  | { workspaceId: string; status: 'ready'; overview: AdminWorkspaceWebhookReplayOverview };

class WebhookReplayRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestReplay(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/webhooks/replay`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WebhookReplayRequestError(copy.unavailable, 0);
  }
  let payload: unknown;
  try { payload = await response.json(); }
  catch { throw new WebhookReplayRequestError(copy.invalid, response.status); }
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload &&
      typeof payload.error === 'string'
      ? payload.error
      : copy.requestUnavailable;
    if (response.status === 401) throw new WebhookReplayRequestError(copy.signIn, response.status);
    if (response.status === 403) throw new WebhookReplayRequestError(copy.denied, response.status);
    throw new WebhookReplayRequestError(message, response.status);
  }
  return payload;
}

async function loadOverview(workspaceId: string) {
  const parsed = adminWorkspaceWebhookReplayOverviewSchema.safeParse(await requestReplay(workspaceId));
  if (!parsed.success || parsed.data.workspaceId !== workspaceId) {
    throw new WebhookReplayRequestError(copy.invalid, 502);
  }
  return parsed.data;
}

export function AdminWorkspaceWebhookReplay({
  workspaceId,
  fallbackEvents,
  canReplayWebhooks,
  deletionPending = false,
  onComplete = () => {},
}: {
  workspaceId: string;
  fallbackEvents: AdminWorkspaceBillingResponse['webhookEvents'];
  canReplayWebhooks: boolean;
  deletionPending?: boolean;
  onComplete?: () => void;
}) {
  const [overviewState, setOverviewState] = useState<OverviewState>({ workspaceId, status: 'loading' });
  const [selectedEvent, setSelectedEvent] = useState<ReplayEvent | null>(null);
  const [stage, setStage] = useState<Stage>('review');
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<AdminWorkspaceWebhookReplayOverview['methods']>([]);
  const [method, setMethod] = useState<'passkey' | 'totp'>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const verification = useRef<AdminWorkspaceWebhookReplayStartResponse | null>(null);

  useEffect(() => {
    if (!canReplayWebhooks || deletionPending) return;
    let active = true;
    void loadOverview(workspaceId).then(
      overview => { if (active) setOverviewState({ workspaceId, status: 'ready', overview }); },
      failure => {
        if (active) setOverviewState({
          workspaceId,
          status: 'error',
          message: failure instanceof Error ? failure.message : copy.unavailable,
        });
      },
    );
    return () => { active = false; };
  }, [workspaceId, canReplayWebhooks, deletionPending]);

  useEffect(() => () => { verification.current = null; }, []);

  const currentState: OverviewState = overviewState.workspaceId === workspaceId
    ? overviewState
    : { workspaceId, status: 'loading' };
  const overview = canReplayWebhooks && currentState.status === 'ready'
    ? currentState.overview
    : null;
  const events: readonly DisplayEvent[] = overview && !overview.deletionPending
    ? overview.events
    : fallbackEvents;
  const unavailableForDeletion = deletionPending || overview?.deletionPending === true;

  function close() {
    verification.current = null;
    setSelectedEvent(null);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function begin(event: ReplayEvent) {
    setSelectedEvent(event);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
    setSuccess('');
    setNotice('');
    verification.current = null;
  }

  async function advance() {
    setError('');
    setPending(true);
    try {
      if (!selectedEvent) throw new WebhookReplayRequestError(copy.invalid, 409);

      if (stage === 'review') {
        const input = adminWorkspaceWebhookReplayOperationSchema.safeParse({
          operation: 'start',
          workspaceId,
          eventId: selectedEvent.replayKey,
          reason: reason.trim(),
        });
        if (!input.success || input.data.operation !== 'start') {
          throw new WebhookReplayRequestError(copy.invalid, 400);
        }
        const started = adminWorkspaceWebhookReplayStartResponseSchema.safeParse(
          await requestReplay(workspaceId, input.data),
        );
        if (!started.success) throw new WebhookReplayRequestError(copy.invalid, 502);
        verification.current = started.data;
        const available = overview?.methods ?? [];
        setMethods(available);
        setMethod(available.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WebhookReplayRequestError(copy.invalid, 409);

      if (stage === 'verification') {
        const factor = method === 'passkey'
          ? {
            operation: 'factor',
            workspaceId,
            token: state.token,
            method,
            response: await getAdminPasskeyResponse(
              state.options as PublicKeyCredentialRequestOptionsJSON,
            ),
          }
          : { operation: 'factor', workspaceId, token: state.token, method, code: code.trim() };
        const input = adminWorkspaceWebhookReplayOperationSchema.safeParse(factor);
        if (!input.success || input.data.operation !== 'factor') {
          throw new WebhookReplayRequestError(copy.invalid, 400);
        }
        const verified = adminWorkspaceWebhookReplayVerifiedSchema.safeParse(
          await requestReplay(workspaceId, input.data),
        );
        if (!verified.success) throw new WebhookReplayRequestError(copy.factorFailure, 401);
        setStage('confirm');
        return;
      }

      const input = adminWorkspaceWebhookReplayOperationSchema.safeParse({
        operation: 'commit',
        workspaceId,
        token: state.token,
      });
      if (!input.success || input.data.operation !== 'commit') {
        throw new WebhookReplayRequestError(copy.invalid, 400);
      }
      const result = adminWorkspaceWebhookReplayResultSchema.safeParse(
        await requestReplay(workspaceId, input.data),
      );
      if (!result.success) throw new WebhookReplayRequestError(copy.invalid, 502);
      verification.current = null;
      close();
      setSuccess(copy.queued);
      onComplete();
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : copy.requestUnavailable;
      if (failure instanceof WebhookReplayRequestError && failure.status === 409) {
        close();
        setNotice(message);
        void loadOverview(workspaceId).then(
          next => setOverviewState({ workspaceId, status: 'ready', overview: next }),
          () => setOverviewState({ workspaceId, status: 'error', message: copy.unavailable }),
        );
      } else {
        setError(message);
      }
    } finally {
      setPending(false);
    }
  }

  const reasonLength = reason.trim().length;
  const disabled = pending ||
    (stage === 'review' && (reasonLength < 10 || reasonLength > 500)) ||
    (stage === 'verification' &&
      (!methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))));
  const confirmLabel = stage === 'review'
    ? copy.startVerification
    : stage === 'verification' ? copy.verifyAndReview : copy.queueReplay;
  const visibleDeletionPending = unavailableForDeletion;

  return (
    <section aria-labelledby="workspace-billing-webhooks">
      <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
        id="workspace-billing-webhooks">{billingCopy.webhookEvents}</h3>
      {canReplayWebhooks && !visibleDeletionPending && currentState.status === 'loading' && (
        <p className="m-0 mb-2 text-sm text-muted" role="status">{copy.loading}</p>
      )}
      {canReplayWebhooks && currentState.status === 'error' && (
        <p className="m-0 mb-2 text-sm text-error" role="alert">{currentState.message}</p>
      )}
      {visibleDeletionPending && (
        <p className="m-0 mb-2 text-sm text-muted" role="note">{copy.deletionPending}</p>
      )}
      {canReplayWebhooks && overview && !visibleDeletionPending && overview.methods.length === 0 && (
        <p className="m-0 mb-2 text-sm text-muted" role="note">{copy.methodsUnavailable}</p>
      )}
      {success && <p className="m-0 mb-2 text-sm text-success" role="status">{success}</p>}
      {notice && <p className="m-0 mb-2 text-sm text-error" role="alert">{notice}</p>}
      {events.length > 0 ? (
        <ul className="m-0 grid list-none gap-2 p-0 text-sm">
          {events.map((event, index) => {
            const actionEvent = overview?.events.find(candidate =>
              candidate.replayKey === event.replayKey);
            const eligible = actionEvent !== undefined &&
              actionEvent.attempts > 0 &&
              actionEvent.processedAt === null &&
              !visibleDeletionPending &&
              overview?.methods.length !== 0;
            return (
              <li className="rounded-lg border border-line p-3"
                key={event.replayKey ?? `${event.receivedAt}-${index}`}>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <strong className="break-all">{event.type}</strong>
                  <span className="capitalize text-muted">{billingCopy.label(event.status)}</span>
                </div>
                <p className="mb-0 mt-1 text-muted">
                  Received {billingCopy.date(event.receivedAt)} · {billingCopy.attempts(event.attempts)}
                  {event.processedAt
                    ? ` · processed ${billingCopy.date(event.processedAt)}`
                    : ` · retry ${billingCopy.date(event.retryAt)}`}
                </p>
                {eligible && actionEvent && (
                  <button type="button" onClick={() => begin(actionEvent)}
                    className="mt-3 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
                    {copy.replay}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : <p className="m-0 text-sm text-muted">{billingCopy.noWebhookEvents}</p>}
      {selectedEvent && (
        <ConfirmDialog
          open
          title={stage === 'verification' ? copy.verification : copy.review}
          description={stage === 'review' ? copy.reviewDescription : copy.confirmation}
          confirmLabel={confirmLabel}
          confirmDisabled={disabled}
          pendingLabel={copy.pending}
          error={error}
          onConfirm={advance}
          onClose={close}
          initialFocus="content"
          printHidden
        >
          <div className="grid gap-4">
            {stage === 'review' && (
              <>
                <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
                  {copy.confirmation}
                </p>
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
            )}
            {stage === 'verification' && (
              <>
                <p className="m-0 rounded-xl border border-line p-4 text-sm leading-6">
                  {selectedEvent.type} · {copy.date(selectedEvent.receivedAt)} · {billingCopy.attempts(selectedEvent.attempts)}
                </p>
                <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4">
                  <legend className="px-1 text-sm font-semibold">Verification method</legend>
                  {methods.includes('passkey') && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input type="radio" name="webhook-replay-factor" checked={method === 'passkey'}
                        onChange={() => { setMethod('passkey'); setError(''); }}
                        className="size-4 focus-visible:focus-ring" />
                      {copy.passkey}
                    </label>
                  )}
                  {methods.includes('totp') && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input type="radio" name="webhook-replay-factor" checked={method === 'totp'}
                        onChange={() => { setMethod('totp'); setError(''); }}
                        className="size-4 focus-visible:focus-ring" />
                      {copy.totp}
                    </label>
                  )}
                </fieldset>
                {method === 'totp' && (
                  <TextField
                    label={copy.code}
                    required
                    value={code}
                    onChange={event => setCode(event.target.value)}
                    helperText={copy.codeHint}
                    autoComplete="one-time-code"
                    slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }}
                  />
                )}
                <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
                <p className="m-0 text-sm text-muted">{copy.verificationHint}</p>
              </>
            )}
            {stage === 'confirm' && (
              <>
                <dl className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted">{copy.eventType}</dt>
                  <dd className="m-0 break-all">{selectedEvent.type}</dd>
                  <dt className="text-muted">{copy.received}</dt>
                  <dd className="m-0">{copy.date(selectedEvent.receivedAt)}</dd>
                  <dt className="text-muted">{copy.attempts}</dt>
                  <dd className="m-0">{billingCopy.attempts(selectedEvent.attempts)}</dd>
                  <dt className="text-muted">{copy.retryAt}</dt>
                  <dd className="m-0">{copy.date(selectedEvent.retryAt)}</dd>
                </dl>
                <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
                <p className="m-0 rounded-xl border border-warning bg-warning/10 p-4 text-sm leading-6 text-ink" role="note">
                  {copy.confirmation}
                </p>
              </>
            )}
          </div>
        </ConfirmDialog>
      )}
    </section>
  );
}
