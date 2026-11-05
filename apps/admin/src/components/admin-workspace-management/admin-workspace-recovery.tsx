'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceRecoveryMethodsSchema,
  adminWorkspaceRecoveryOperationSchema,
  adminWorkspaceRecoveryPreviewResponseSchema,
  adminWorkspaceRecoveryResultSchema,
  adminWorkspaceRecoveryStartResponseSchema,
  adminWorkspaceRecoveryVerifiedSchema,
  type AdminWorkspaceRecoveryPreviewResponse,
  type AdminWorkspaceRecoveryResult,
  type AdminWorkspaceRecoveryStartResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceRecoveryCopy as copy } from './admin-workspace-recovery-copy.data';

type Action = 'retry' | 'cancel' | 'extend_grace';
type Method = 'passkey' | 'totp';
type Stage = 'review' | 'confirm' | 'verification';
type PreviewState =
  | { workspaceId: string; status: 'loading' }
  | { workspaceId: string; status: 'error'; message: string }
  | { workspaceId: string; status: 'ready'; preview: AdminWorkspaceRecoveryPreviewResponse };
type VerificationState = AdminWorkspaceRecoveryStartResponse & { action: Action };

class WorkspaceRecoveryRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestRecovery(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/recovery`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspaceRecoveryRequestError(copy.requestUnavailable, 0);
  }
  let payload: unknown;
  try { payload = await response.json(); }
  catch { throw new WorkspaceRecoveryRequestError(copy.responseInvalid, response.status); }
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload &&
      typeof payload.error === 'string'
      ? payload.error
      : copy.requestUnavailable;
    if (response.status === 401) throw new WorkspaceRecoveryRequestError(copy.signIn, response.status);
    if (response.status === 403) throw new WorkspaceRecoveryRequestError(copy.denied, response.status);
    throw new WorkspaceRecoveryRequestError(message, response.status);
  }
  return payload;
}

async function loadRecoveryPreview(workspaceId: string) {
  const parsed = adminWorkspaceRecoveryPreviewResponseSchema.safeParse(
    await requestRecovery(workspaceId, { operation: 'preview', workspaceId }),
  );
  if (!parsed.success || parsed.data.workspaceId !== workspaceId) {
    throw new WorkspaceRecoveryRequestError(copy.invalid, 502);
  }
  return parsed.data;
}

function activeRecovery(preview: AdminWorkspaceRecoveryPreviewResponse) {
  const recovery = preview.recovery;
  return recovery && ['applying', 'action', 'pending'].includes(recovery.state) && recovery.attemptedAt
    ? recovery
    : null;
}

function invoiceIsOpen(preview: AdminWorkspaceRecoveryPreviewResponse) {
  return preview.providerStatus === 'available' &&
    preview.invoice?.status === 'open' &&
    preview.invoice.amountDue > 0;
}

function actionIsAvailable(
  action: Action,
  preview: AdminWorkspaceRecoveryPreviewResponse,
  additionalDays: number,
) {
  if (!invoiceIsOpen(preview)) return false;
  if (action === 'extend_grace') {
    return preview.grace.currentUntil !== null &&
      additionalDays >= 1 &&
      additionalDays <= Math.min(7, preview.grace.additionalDaysAvailable);
  }
  const recovery = activeRecovery(preview);
  if (!recovery) return false;
  return action === 'retry' || recovery.retriesCancelledAt === null;
}

function actionUnavailableMessage(
  action: Action,
  preview: AdminWorkspaceRecoveryPreviewResponse,
) {
  if (preview.providerStatus === 'unavailable') return copy.providerUnavailable;
  if (preview.providerStatus === 'not_linked') return copy.notLinked;
  if (!invoiceIsOpen(preview)) return copy.unavailable;
  if (action === 'extend_grace') return copy.cannotExtend;
  if (!activeRecovery(preview)) return copy.noRecovery;
  return copy.alreadyCancelled;
}

function resultMessage(result: AdminWorkspaceRecoveryResult) {
  if (result.status === 'owner_action_required') return copy.ownerHandoff;
  if (result.status === 'grace_extended') return copy.graceExtended(copy.date(result.graceUntil));
  if (result.status === 'retries_cancelled') return copy.retriesCancelled;
  if (result.status === 'paid') return copy.retrySucceeded;
  if (result.status === 'already-paid') return copy.alreadyPaid;
  if (result.status === 'declined') return copy.declined;
  if (result.status === 'changed') return copy.changed;
  return copy.pending;
}

export function AdminWorkspaceRecovery({
  workspaceId,
  canManageRecovery,
  deletionPending = false,
  onComplete = () => {},
}: {
  workspaceId: string;
  canManageRecovery: boolean;
  deletionPending?: boolean;
  onComplete?: () => void;
}) {
  const [previewState, setPreviewState] = useState<PreviewState>({ workspaceId, status: 'loading' });
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('review');
  const [action, setAction] = useState<Action>('retry');
  const [additionalDays, setAdditionalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const verification = useRef<VerificationState | null>(null);

  useEffect(() => {
    if (!canManageRecovery || deletionPending) return;
    let active = true;
    void loadRecoveryPreview(workspaceId).then(
      preview => { if (active) setPreviewState({ workspaceId, status: 'ready', preview }); },
      failure => {
        if (active) setPreviewState({
          workspaceId,
          status: 'error',
          message: failure instanceof Error ? failure.message : copy.unavailable,
        });
      },
    );
    return () => { active = false; };
  }, [workspaceId, canManageRecovery, deletionPending]);

  useEffect(() => () => { verification.current = null; }, []);

  const currentState: PreviewState = previewState.workspaceId === workspaceId
    ? previewState
    : { workspaceId, status: 'loading' };
  const preview = currentState.status === 'ready' ? currentState.preview : null;
  const maxDays = preview ? Math.min(7, preview.grace.additionalDaysAvailable) : 0;
  const canRetry = !!preview && actionIsAvailable('retry', preview, additionalDays);
  const canCancel = !!preview && actionIsAvailable('cancel', preview, additionalDays);
  const canExtend = !!preview && actionIsAvailable('extend_grace', preview, 1);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function begin(actionToStart: Action) {
    if (!preview || !actionIsAvailable(actionToStart, preview, additionalDays)) return;
    setAction(actionToStart);
    setAdditionalDays(1);
    setReason('');
    setCode('');
    setError('');
    setSuccess('');
    setStage('review');
    verification.current = null;
    setOpen(true);
  }

  async function advance() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        const fresh = await loadRecoveryPreview(workspaceId);
        setPreviewState({ workspaceId, status: 'ready', preview: fresh });
        if (!actionIsAvailable(action, fresh, additionalDays)) {
          throw new WorkspaceRecoveryRequestError(
            actionUnavailableMessage(action, fresh), 409,
          );
        }
        setStage('confirm');
        return;
      }

      if (stage === 'confirm') {
        const available = adminWorkspaceRecoveryMethodsSchema.safeParse(await requestRecovery(workspaceId));
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspaceRecoveryRequestError(copy.methodsUnavailable, 409);
        }
        const input = {
          operation: 'start',
          action,
          workspaceId,
          reason: reason.trim(),
          ...(action === 'extend_grace'
            ? { additionalDays }
            : { recoveryId: preview?.recovery?.id }),
        };
        const parsedInput = adminWorkspaceRecoveryOperationSchema.safeParse(input);
        if (!parsedInput.success || parsedInput.data.operation !== 'start') {
          throw new WorkspaceRecoveryRequestError(copy.responseInvalid, 400);
        }
        const started = adminWorkspaceRecoveryStartResponseSchema.safeParse(
          await requestRecovery(workspaceId, parsedInput.data),
        );
        if (!started.success) throw new WorkspaceRecoveryRequestError(copy.responseInvalid, 502);
        verification.current = { ...started.data, action };
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspaceRecoveryRequestError(copy.responseInvalid, 409);
      const factorResponse = await requestRecovery(workspaceId, method === 'passkey'
        ? {
          operation: 'factor',
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(
            state.options as PublicKeyCredentialRequestOptionsJSON,
          ),
        }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspaceRecoveryVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspaceRecoveryRequestError(copy.factorFailure, 401);
      }
      const result = adminWorkspaceRecoveryResultSchema.safeParse(
        await requestRecovery(workspaceId, { operation: 'commit', token: state.token }),
      );
      if (!result.success ||
        (state.action === 'extend_grace' && result.data.status !== 'grace_extended') ||
        (state.action === 'cancel' && result.data.status !== 'retries_cancelled') ||
        (state.action === 'retry' && ['grace_extended', 'retries_cancelled'].includes(result.data.status))) {
        throw new WorkspaceRecoveryRequestError(copy.responseInvalid, 502);
      }
      verification.current = null;
      setSuccess(resultMessage(result.data));
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : copy.requestUnavailable);
    } finally {
      setPending(false);
    }
  }

  const reasonValid = reason.trim().length >= 10 && reason.trim().length <= 500;
  const confirmDisabled = pending ||
    (stage === 'review' && (
      !reasonValid || (action === 'extend_grace' &&
        (additionalDays < 1 || additionalDays > maxDays))
    )) ||
    (stage === 'confirm' && (!preview || !actionIsAvailable(action, preview, additionalDays))) ||
    (stage === 'verification' && (
      !methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
    ));
  const confirmLabel = stage === 'review'
    ? copy.reviewLatest
    : stage === 'confirm' ? copy.startVerification
      : action === 'retry' ? copy.confirmRetry
        : action === 'cancel' ? copy.confirmCancel : copy.confirmExtend;

  if (!canManageRecovery) return null;

  return (
    <section className="grid gap-3 border-t border-line pt-4" aria-labelledby="workspace-recovery-actions-title">
      <div className="grid gap-1">
        <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-muted"
          id="workspace-recovery-actions-title">{copy.title}</h3>
        <p className="m-0 text-sm text-muted">{copy.description}</p>
      </div>
      {deletionPending && <p className="m-0 text-sm text-muted" role="note">{copy.deletionPending}</p>}
      {!deletionPending && currentState.status === 'loading' && (
        <p className="m-0 text-sm text-muted" role="status">{copy.loading}</p>
      )}
      {!deletionPending && currentState.status === 'error' && (
        <p className="m-0 text-sm text-error" role="alert">{currentState.message}</p>
      )}
      {!deletionPending && preview && (
        <>
          {preview.providerStatus !== 'available' && (
            <p className="m-0 text-sm text-muted" role="status">
              {preview.providerStatus === 'unavailable' ? copy.providerUnavailable : copy.notLinked}
            </p>
          )}
          {preview.invoice && (
            <dl className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted">{copy.invoice}</dt>
              <dd className="m-0">{copy.invoiceNumber(preview.invoice.number)}</dd>
              <dt className="text-muted">{copy.invoiceStatus}</dt>
              <dd className="m-0 capitalize">{copy.status(preview.invoice.status ?? 'unknown')}</dd>
              <dt className="text-muted">{copy.amountDue}</dt>
              <dd className="m-0">{copy.amount(preview.invoice.amountDue)}</dd>
              <dt className="text-muted">{copy.paymentState}</dt>
              <dd className="m-0 capitalize">{copy.status(preview.paymentState)}</dd>
              <dt className="text-muted">{copy.graceUntil}</dt>
              <dd className="m-0">{copy.date(preview.grace.currentUntil)}</dd>
              <dt className="text-muted">{copy.maximumGraceUntil}</dt>
              <dd className="m-0">{copy.date(preview.grace.maximumUntil)}</dd>
              <dt className="text-muted">{copy.additionalDaysLabel}</dt>
              <dd className="m-0">{copy.additionalDaysAvailable(preview.grace.additionalDaysAvailable)}</dd>
              {preview.recovery && (
                <>
                  <dt className="text-muted">{copy.recoveryState}</dt>
                  <dd className="m-0 capitalize">{copy.status(preview.recovery.state)}</dd>
                  <dt className="text-muted">{copy.attempts}</dt>
                  <dd className="m-0">{preview.recovery.attempts}</dd>
                  <dt className="text-muted">{copy.attemptedAt}</dt>
                  <dd className="m-0">{copy.date(preview.recovery.attemptedAt)}</dd>
                  {preview.recovery.retriesCancelledAt && (
                    <>
                      <dt className="text-muted">{copy.workerRetriesCancelled}</dt>
                      <dd className="m-0">{copy.cancelledAt(copy.date(preview.recovery.retriesCancelledAt))}</dd>
                    </>
                  )}
                </>
              )}
            </dl>
          )}
          {preview.paymentState === 'requires_action' && (
            <p className="m-0 rounded-lg border border-warning bg-warning/10 px-3 py-2 text-sm text-ink" role="status">
              {copy.ownerAction}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {canRetry && (
              <button type="button" onClick={() => begin('retry')}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
                {copy.retry}
              </button>
            )}
            {canExtend && (
              <button type="button" onClick={() => begin('extend_grace')}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
                {copy.extendGrace}
              </button>
            )}
            {canCancel && (
              <button type="button" onClick={() => begin('cancel')}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
                {copy.cancelRetries}
              </button>
            )}
          </div>
          {!canRetry && !canExtend && !canCancel && preview.providerStatus === 'available' && (
            <p className="m-0 text-sm text-muted" role="note">
              {preview.grace.additionalDaysAvailable > 0 ? copy.noRecovery : copy.cannotExtend}
            </p>
          )}
        </>
      )}
      {success && <p className="m-0 text-sm text-success" role="status">{success}</p>}
      {open && preview && (
        <ConfirmDialog
          open
          title={stage === 'verification' ? copy.verify : copy.review}
          description={copy.confirmation}
          confirmLabel={confirmLabel}
          confirmDisabled={confirmDisabled}
          pendingLabel={stage === 'verification' ? copy.verificationPending : copy.previewPending}
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
                  {action === 'cancel' ? copy.cancellationWarning : copy.confirmation}
                </p>
                {action === 'extend_grace' && (
                  <label className="grid gap-2 text-sm font-medium">
                    {copy.additionalDays}
                    <select
                      aria-label={copy.additionalDays}
                      value={additionalDays}
                      onChange={event => {
                        setAdditionalDays(Number(event.target.value));
                        setError('');
                      }}
                      className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
                    >
                      {Array.from({ length: maxDays }, (_, index) => index + 1).map(days => (
                        <option value={days} key={days}>{copy.additionalDaysAvailable(days)}</option>
                      ))}
                    </select>
                  </label>
                )}
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
            {stage === 'confirm' && preview && (
              <>
                <section className="grid gap-2 rounded-xl border border-line p-4"
                  aria-labelledby="workspace-recovery-confirmation-title">
                  <h4 className="m-0 text-sm font-semibold" id="workspace-recovery-confirmation-title">{copy.invoice}</h4>
                  <dl className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-x-3 gap-y-2 text-sm">
                    <dt className="text-muted">{copy.invoice}</dt>
                    <dd className="m-0">{copy.invoiceNumber(preview.invoice?.number ?? null)}</dd>
                    <dt className="text-muted">{copy.invoiceStatus}</dt>
                    <dd className="m-0 capitalize">{copy.status(preview.invoice?.status ?? 'unknown')}</dd>
                    <dt className="text-muted">{copy.amountDue}</dt>
                    <dd className="m-0">{copy.amount(preview.invoice?.amountDue ?? 0)}</dd>
                    <dt className="text-muted">{copy.paymentState}</dt>
                    <dd className="m-0 capitalize">{copy.status(preview.paymentState)}</dd>
                    {action === 'extend_grace'
                      ? (
                        <>
                          <dt className="text-muted">{copy.additionalDays}</dt>
                          <dd className="m-0">{copy.additionalDaysAvailable(additionalDays)}</dd>
                        </>
                      )
                      : (
                        <>
                          <dt className="text-muted">{copy.recoveryState}</dt>
                          <dd className="m-0 capitalize">{copy.status(preview.recovery?.state ?? 'unknown')}</dd>
                        </>
                      )}
                  </dl>
                </section>
                {action === 'cancel' && (
                  <p className="m-0 rounded-xl border border-warning bg-warning/10 p-4 text-sm leading-6 text-ink"
                    role="note">{copy.cancellationWarning}</p>
                )}
                <p className="m-0 text-sm text-muted">Reason: {reason.trim()}</p>
              </>
            )}
            {stage === 'verification' && preview && (
              <>
                <p className="m-0 rounded-xl border border-line p-4 text-sm leading-6">
                  {copy.invoiceNumber(preview.invoice?.number ?? null)} · {copy.amount(preview.invoice?.amountDue ?? 0)}
                  {action === 'extend_grace' ? ` · ${copy.additionalDaysAvailable(additionalDays)}` : ''}
                </p>
                <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4">
                  <legend className="px-1 text-sm font-semibold">Verification method</legend>
                  {methods.includes('passkey') && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input type="radio" name="workspace-recovery-factor" checked={method === 'passkey'}
                        onChange={() => { setMethod('passkey'); setError(''); }}
                        className="size-4 focus-visible:focus-ring" />
                      {copy.passkey}
                    </label>
                  )}
                  {methods.includes('totp') && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input type="radio" name="workspace-recovery-factor" checked={method === 'totp'}
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
              </>
            )}
          </div>
        </ConfirmDialog>
      )}
    </section>
  );
}
