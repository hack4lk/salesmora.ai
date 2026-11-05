'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspacePlanOverrideMethodsSchema,
  adminWorkspacePlanOverrideResultSchema,
  adminWorkspacePlanOverrideStartSchema,
  adminWorkspacePlanOverrideVerifiedSchema,
  type AdminWorkspaceDetailResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceDetailPreviewCopy } from './admin-workspace-detail-preview.data';
import { adminWorkspacePlanOverrideCopy as copy } from './admin-workspace-plan-override-copy.data';

type Method = 'passkey' | 'totp';
type Action = 'apply' | 'clear';
type OverridePlan = 'standard' | 'premium';
type VerificationState = {
  token: string;
  options: PublicKeyCredentialRequestOptionsJSON;
  action: Action;
};

class WorkspacePlanOverrideRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestPlanOverride(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/plan-override`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspacePlanOverrideRequestError('Plan-override verification is unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new WorkspacePlanOverrideRequestError('The plan-override response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Workspace plan override could not be changed. Refresh the workspace before trying again.';
    throw new WorkspacePlanOverrideRequestError(message, response.status);
  }
  return result;
}

function firstFutureDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function latestDate() {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + 12);
  return date.toISOString().slice(0, 10);
}

function defaultEndDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

function validEndDate(value: string) {
  const selected = new Date(`${value}T00:00:00.000Z`);
  const now = new Date();
  const maximum = new Date(now);
  maximum.setUTCMonth(maximum.getUTCMonth() + 12);
  return Number.isFinite(selected.getTime()) && selected > now && selected <= maximum;
}

function billedEffectivePlan(detail: AdminWorkspaceDetailResponse) {
  const status = detail.subscriptionStatus.toLowerCase();
  return status === 'active' || status.startsWith('past due')
    ? detail.stripePlan
    : 'free';
}

function dateLabel(value: string) {
  return adminWorkspaceDetailPreviewCopy.date(value);
}

export function AdminWorkspacePlanOverride({
  detail,
  onComplete,
}: {
  detail: AdminWorkspaceDetailResponse;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action>('apply');
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [plan, setPlan] = useState<OverridePlan>('premium');
  const [endsOn, setEndsOn] = useState(defaultEndDate);
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const verification = useRef<VerificationState | null>(null);
  const canManage = detail.permissions?.canOverridePlan === true;
  const deletionPending = detail.workspace.status === 'deleting';
  const billedPlan = billedEffectivePlan(detail);
  const activeOverride = detail.override;

  useEffect(() => () => { verification.current = null; }, []);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function openReview(nextAction: Action) {
    setAction(nextAction);
    setPlan(detail.workspace.overridePlan === 'standard' ? 'standard' : 'premium');
    setEndsOn(defaultEndDate());
    setReason('');
    setCode('');
    setStage('review');
    setError('');
    setSuccess('');
    verification.current = null;
    setOpen(true);
  }

  async function advance() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        const available = adminWorkspacePlanOverrideMethodsSchema.safeParse(
          await requestPlanOverride(detail.workspace.id),
        );
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspacePlanOverrideRequestError(copy.methodsUnavailable, 409);
        }
        const startRequest = action === 'apply'
          ? {
            operation: 'start',
            action,
            workspaceId: detail.workspace.id,
            plan,
            endsAt: new Date(`${endsOn}T00:00:00.000Z`).toISOString(),
            reason: reason.trim(),
          }
          : {
            operation: 'start',
            action,
            workspaceId: detail.workspace.id,
            reason: reason.trim(),
          };
        const started = adminWorkspacePlanOverrideStartSchema.safeParse(
          await requestPlanOverride(detail.workspace.id, startRequest),
        );
        if (!started.success) {
          throw new WorkspacePlanOverrideRequestError('The verification response was invalid.', 502);
        }
        verification.current = { ...started.data, action };
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspacePlanOverrideRequestError(copy.expired, 409);
      const factorResponse = await requestPlanOverride(detail.workspace.id, method === 'passkey'
        ? {
          operation: 'factor',
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(state.options),
        }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspacePlanOverrideVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspacePlanOverrideRequestError(copy.factorFailure, 401);
      }
      const result = adminWorkspacePlanOverrideResultSchema.safeParse(
        await requestPlanOverride(detail.workspace.id, { operation: 'commit', token: state.token }),
      );
      if (!result.success || !result.data.changed || result.data.action !== state.action) {
        throw new WorkspacePlanOverrideRequestError(
          'Workspace plan override changed unexpectedly. Refresh the workspace before trying again.',
          409,
        );
      }
      verification.current = null;
      setSuccess(state.action === 'apply' ? copy.applied : copy.cleared);
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Workspace plan override could not be changed.');
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || (stage === 'review' && (
    reason.trim().length < 10 || reason.trim().length > 500 ||
    (action === 'apply' && !validEndDate(endsOn))
  )) || (stage === 'verification' && (
    !methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
  ));
  const confirmLabel = stage === 'review'
    ? copy.continue
    : action === 'apply' ? copy.confirmApply : copy.confirmClear;
  const endDescription = activeOverride
    ? copy.endImpact(
      detail.workspace.name,
      adminWorkspaceDetailPreviewCopy.plans[billedPlan].label,
      dateLabel(activeOverride.endsAt),
    )
    : '';

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-paper p-5 text-ink" aria-labelledby="workspace-plan-override-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-base font-semibold" id="workspace-plan-override-title">{copy.actionTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.actionDescription}</p>
        </div>
        {canManage && !deletionPending && (
          <div className="flex flex-wrap gap-2">
            {activeOverride && (
              <button type="button" onClick={() => openReview('clear')}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
                {copy.end}
              </button>
            )}
            <button type="button" onClick={() => openReview('apply')}
              className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
              {activeOverride ? copy.replace : copy.apply}
            </button>
          </div>
        )}
      </div>
      <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="note">
        {copy.impact(detail.workspace.name, adminWorkspaceDetailPreviewCopy.plans[detail.stripePlan].label)}
      </p>
      {success && <p className="m-0 text-sm text-muted" role="status">{success}</p>}
      {!canManage && <p className="m-0 text-sm text-muted" role="note">{copy.denied}</p>}
      {deletionPending && canManage && (
        <p className="m-0 text-sm text-muted" role="note">{copy.deletionPending}</p>
      )}
      {open && <ConfirmDialog
        open
        title={action === 'clear' ? copy.endTitle : activeOverride ? copy.replaceTitle : copy.applyTitle}
        description={action === 'clear'
          ? endDescription
          : copy.impact(detail.workspace.name, adminWorkspaceDetailPreviewCopy.plans[detail.stripePlan].label)}
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
          <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
            {copy.verificationHint}
          </p>
          <h3 className="m-0 text-lg font-semibold">{stage === 'review' ? copy.review : copy.verification}</h3>
          {stage === 'review' ? (
            <>
              {action === 'apply' && (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    {copy.plan}
                    <select
                      aria-label={copy.plan}
                      value={plan}
                      onChange={event => {
                        const selected = event.target.value;
                        if (selected === 'standard' || selected === 'premium') setPlan(selected);
                        setError('');
                      }}
                      className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    {copy.endsOn}
                    <input
                      aria-label={copy.endsOn}
                      type="date"
                      min={firstFutureDate()}
                      max={latestDate()}
                      value={endsOn}
                      onChange={event => {
                        setEndsOn(event.target.value);
                        setError('');
                      }}
                      className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
                    />
                    <span className="text-xs font-normal text-muted">{copy.endDateHint}</span>
                  </label>
                </>
              )}
              {action === 'clear' && (
                <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
                  {endDescription}
                </p>
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
          ) : (
            <>
              <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4">
                <legend className="px-1 text-sm font-semibold">Verification method</legend>
                {methods.includes('passkey') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-plan-override-factor" checked={method === 'passkey'}
                      onChange={() => { setMethod('passkey'); setError(''); }} className="size-4 focus-visible:focus-ring" />
                    {copy.passkey}
                  </label>
                )}
                {methods.includes('totp') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-plan-override-factor" checked={method === 'totp'}
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
