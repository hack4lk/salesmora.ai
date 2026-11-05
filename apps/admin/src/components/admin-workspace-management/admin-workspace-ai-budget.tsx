'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspaceAIBudgetMethodsSchema,
  adminWorkspaceAIBudgetOperationSchema,
  adminWorkspaceAIBudgetResultSchema,
  adminWorkspaceAIBudgetStartSchema,
  adminWorkspaceAIBudgetVerifiedSchema,
  type AdminWorkspaceDetailResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspaceAIBudgetCopy as copy } from './admin-workspace-ai-budget-copy.data';

type Method = 'passkey' | 'totp';
type VerificationState = {
  token: string;
  options: PublicKeyCredentialRequestOptionsJSON;
};

class WorkspaceAIBudgetRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestAIBudget(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/ai-budget`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspaceAIBudgetRequestError('AI-budget verification is unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new WorkspaceAIBudgetRequestError('The AI-budget response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Workspace AI budget could not be changed. Refresh workspace details before trying again.';
    throw new WorkspaceAIBudgetRequestError(message, response.status);
  }
  return result;
}

function formattedTokens(value: number) {
  return value.toLocaleString('en-US');
}

export function AdminWorkspaceAIBudget({
  detail,
  onComplete,
}: {
  detail: AdminWorkspaceDetailResponse;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [budget, setBudget] = useState(String(detail.limits.aiTokens));
  const [reason, setReason] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const verification = useRef<VerificationState | null>(null);
  const canManage = detail.permissions?.canAdjustAIBudget === true;
  const deletionPending = detail.workspace.status === 'deleting';
  const numericBudget = /^(0|[1-9]\d*)$/.test(budget) && Number.isSafeInteger(Number(budget))
    ? Number(budget)
    : null;
  const validBudget = numericBudget !== null && numericBudget <= copy.maxTokens;
  const budgetBelowUsage = validBudget && numericBudget < detail.usage.aiTokens;

  useEffect(() => () => { verification.current = null; }, []);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setReason('');
    setCode('');
    setError('');
  }

  function begin() {
    setBudget(String(detail.limits.aiTokens));
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
        const available = adminWorkspaceAIBudgetMethodsSchema.safeParse(
          await requestAIBudget(detail.workspace.id),
        );
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspaceAIBudgetRequestError(copy.methodsUnavailable, 409);
        }
        const startRequest = adminWorkspaceAIBudgetOperationSchema.safeParse({
          operation: 'start',
          workspaceId: detail.workspace.id,
          monthlyTokens: numericBudget,
          reason: reason.trim(),
        });
        if (!startRequest.success || startRequest.data.operation !== 'start') {
          throw new WorkspaceAIBudgetRequestError(copy.invalid, 400);
        }
        const started = adminWorkspaceAIBudgetStartSchema.safeParse(
          await requestAIBudget(detail.workspace.id, startRequest.data),
        );
        if (!started.success) {
          throw new WorkspaceAIBudgetRequestError('The verification response was invalid.', 502);
        }
        verification.current = started.data;
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspaceAIBudgetRequestError(copy.expired, 409);
      const factorResponse = await requestAIBudget(detail.workspace.id, method === 'passkey'
        ? {
          operation: 'factor',
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(state.options),
        }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspaceAIBudgetVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspaceAIBudgetRequestError(copy.factorFailure, 401);
      }
      const result = adminWorkspaceAIBudgetResultSchema.safeParse(
        await requestAIBudget(detail.workspace.id, { operation: 'commit', token: state.token }),
      );
      if (!result.success || !result.data.changed || result.data.monthlyTokens !== numericBudget) {
        throw new WorkspaceAIBudgetRequestError(
          'Workspace AI budget changed unexpectedly. Refresh workspace details before trying again.',
          409,
        );
      }
      verification.current = null;
      setSuccess(copy.adjusted(formattedTokens(result.data.monthlyTokens)));
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Workspace AI budget could not be changed.');
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || (stage === 'review' && (
    !validBudget || reason.trim().length < 10 || reason.trim().length > 500
  )) || (stage === 'verification' && (
    !methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
  ));

  const action = (
    <section className="grid gap-3 rounded-xl border border-line bg-paper p-4 text-ink" aria-labelledby="workspace-ai-budget-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-base font-semibold" id="workspace-ai-budget-title">{copy.actionTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.actionDescription}</p>
        </div>
        {canManage && !deletionPending && (
          <button type="button" onClick={begin}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
            {copy.adjust}
          </button>
        )}
      </div>
      <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="note">
        {copy.current(formattedTokens(detail.limits.aiTokens), formattedTokens(detail.usage.aiTokens))}
      </p>
      <p className="m-0 text-sm text-muted" role="note">{copy.impact}</p>
      {success && <p className="m-0 text-sm text-muted" role="status">{success}</p>}
      {!canManage && <p className="m-0 text-sm text-muted" role="note">{copy.denied}</p>}
      {deletionPending && canManage && (
        <p className="m-0 text-sm text-muted" role="note">{copy.deletionPending}</p>
      )}
    </section>
  );

  return (
    <>
      {action}
      {open && <ConfirmDialog
        open
        title={copy.actionTitle}
        description={copy.impact}
        confirmLabel={stage === 'review' ? copy.continue : copy.confirm}
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
              <TextField
                label={copy.budget}
                required
                value={budget}
                onChange={event => {
                  setBudget(event.target.value);
                  setError('');
                }}
                helperText={copy.budgetHint}
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 13 } }}
              />
              {validBudget && numericBudget === 0 && (
                <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="note">
                  {copy.zeroWarning}
                </p>
              )}
              {budgetBelowUsage && (
                <p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm text-muted" role="alert">
                  {copy.belowUsageWarning(formattedTokens(detail.usage.aiTokens))}
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
                    <input type="radio" name="workspace-ai-budget-factor" checked={method === 'passkey'}
                      onChange={() => { setMethod('passkey'); setError(''); }} className="size-4 focus-visible:focus-ring" />
                    {copy.passkey}
                  </label>
                )}
                {methods.includes('totp') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-ai-budget-factor" checked={method === 'totp'}
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
              <p className="m-0 text-sm text-muted">New monthly limit: {validBudget ? formattedTokens(numericBudget) : '—'} tokens.</p>
            </>
          )}
        </div>
      </ConfirmDialog>}
    </>
  );
}
