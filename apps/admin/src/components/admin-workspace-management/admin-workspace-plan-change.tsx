'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminWorkspacePlanChangeMethodsSchema,
  adminWorkspacePlanChangePreviewResponseSchema,
  adminWorkspacePlanChangeResultSchema,
  adminWorkspacePlanChangeStartResponseSchema,
  adminWorkspacePlanChangeVerifiedSchema,
  type AdminWorkspaceBillingResponse,
  type AdminWorkspacePlanChangePreviewResponse,
  type AdminWorkspacePlanChangeStartResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminWorkspacePlanChangeCopy as copy } from './admin-workspace-plan-change-copy.data';

type Method = 'passkey' | 'totp';
type Plan = 'free' | 'standard' | 'premium';
type Quote = Omit<AdminWorkspacePlanChangePreviewResponse['quote'], 'kind'> & {
  kind: 'upgrade' | 'downgrade' | 'free';
};
type VerificationState = AdminWorkspacePlanChangeStartResponse & { quote: Quote };
type Stage = 'review' | 'quote' | 'verification';
type ProviderStatus = AdminWorkspaceBillingResponse['providerStatus'];
type Subscription = AdminWorkspaceBillingResponse['subscription'];

function isAdminManagedQuote(
  quote: AdminWorkspacePlanChangePreviewResponse['quote'],
): quote is Quote {
  return quote.kind !== 'checkout';
}

class WorkspacePlanChangeRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestPlanChange(workspaceId: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/plan-change`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new WorkspacePlanChangeRequestError(copy.requestUnavailable, 0);
  }
  let payload: unknown;
  try { payload = await response.json(); }
  catch { throw new WorkspacePlanChangeRequestError(copy.responseInvalid, response.status); }
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload &&
      typeof payload.error === 'string'
      ? payload.error
      : copy.requestUnavailable;
    if (response.status === 401) throw new WorkspacePlanChangeRequestError(copy.signIn, response.status);
    throw new WorkspacePlanChangeRequestError(message, response.status);
  }
  return payload;
}

function eligible(subscription: Subscription) {
  return subscription?.status === 'active' &&
    subscription.plan !== 'free' &&
    subscription.intendedPlan === subscription.plan &&
    !subscription.cancelAtPeriodEnd;
}

export function AdminWorkspacePlanChange({
  workspaceId,
  subscription,
  providerStatus,
  canChangePlan,
  deletionPending = false,
  onComplete,
}: {
  workspaceId: string;
  subscription: Subscription;
  providerStatus: ProviderStatus;
  canChangePlan: boolean;
  deletionPending?: boolean;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('review');
  const [plan, setPlan] = useState<Plan>('premium');
  const [reason, setReason] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState<Method>('passkey');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const [now, setNow] = useState(0);
  const verification = useRef<VerificationState | null>(null);
  const canStart = canChangePlan && eligible(subscription) &&
    providerStatus === 'available' && !deletionPending;
  const quoteExpired = quote !== null && now > 0 && new Date(quote.expiresAt).getTime() <= now;

  useEffect(() => () => { verification.current = null; }, []);
  useEffect(() => {
    if (!open || !quote) return;
    const updateTime = () => setNow(Date.now());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, [open, quote]);

  function close() {
    verification.current = null;
    setOpen(false);
    setStage('review');
    setReason('');
    setCode('');
    setQuote(null);
    setError('');
  }

  function openReview() {
    setPlan(subscription?.plan === 'standard' ? 'premium' : 'standard');
    setReason('');
    setQuote(null);
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
        const preview = adminWorkspacePlanChangePreviewResponseSchema.safeParse(
          await requestPlanChange(workspaceId, { operation: 'preview', workspaceId, plan }),
        );
        if (!preview.success || preview.data.workspaceId !== workspaceId ||
          preview.data.quote.plan !== plan || !isAdminManagedQuote(preview.data.quote)) {
          throw new WorkspacePlanChangeRequestError(copy.responseInvalid, 502);
        }
        setQuote(preview.data.quote);
        setStage('quote');
        return;
      }

      if (stage === 'quote') {
        if (!quote || new Date(quote.expiresAt).getTime() <= Date.now()) {
          throw new WorkspacePlanChangeRequestError(copy.quoteExpired, 409);
        }
        const available = adminWorkspacePlanChangeMethodsSchema.safeParse(await requestPlanChange(workspaceId));
        if (!available.success || available.data.methods.length === 0) {
          throw new WorkspacePlanChangeRequestError(copy.methodsUnavailable, 409);
        }
        const started = adminWorkspacePlanChangeStartResponseSchema.safeParse(
          await requestPlanChange(workspaceId, {
            operation: 'start',
            workspaceId,
            quoteId: quote.id,
            reason: reason.trim(),
          }),
        );
        if (!started.success) throw new WorkspacePlanChangeRequestError(copy.responseInvalid, 502);
        verification.current = { ...started.data, quote };
        setMethods(available.data.methods);
        setMethod(available.data.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }

      const state = verification.current;
      if (!state) throw new WorkspacePlanChangeRequestError(copy.quoteExpired, 409);
      const factorResponse = await requestPlanChange(workspaceId, method === 'passkey'
        ? {
          operation: 'factor',
          token: state.token,
          method,
          response: await getAdminPasskeyResponse(state.options as PublicKeyCredentialRequestOptionsJSON),
        }
        : { operation: 'factor', token: state.token, method, code: code.trim() });
      if (!adminWorkspacePlanChangeVerifiedSchema.safeParse(factorResponse).success) {
        throw new WorkspacePlanChangeRequestError(copy.factorFailure, 401);
      }
      const result = adminWorkspacePlanChangeResultSchema.safeParse(
        await requestPlanChange(workspaceId, { operation: 'commit', token: state.token }),
      );
      if (!result.success || result.data.plan !== state.quote.plan ||
        result.data.effectiveAt !== state.quote.effectiveAt) {
        throw new WorkspacePlanChangeRequestError(copy.responseInvalid, 502);
      }
      verification.current = null;
      setSuccess(result.data.status === 'expired'
        ? copy.expiredResult
        : result.data.status === 'customer_action_required'
          ? copy.handoff(copy.plan(result.data.plan), copy.date(result.data.effectiveAt))
          : copy.completed(copy.plan(result.data.plan), copy.date(result.data.effectiveAt)));
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : copy.requestUnavailable);
    } finally {
      setPending(false);
    }
  }

  const confirmDisabled = pending ||
    (stage === 'review' && (
      reason.trim().length < 10 || reason.trim().length > 500 || plan === subscription?.plan
    )) ||
    (stage === 'quote' && (!quote || quoteExpired)) ||
    (stage === 'verification' && (
      !methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
    ));
  const confirmLabel = stage === 'review'
    ? copy.continue
    : stage === 'quote' ? copy.startVerification : copy.verifyAndApply;
  const unavailableMessage = deletionPending
    ? copy.deletionPending
    : providerStatus === 'unavailable'
      ? copy.unavailable
      : providerStatus === 'not_linked'
        ? copy.notLinked
        : copy.notEligible;

  if (!canChangePlan) return null;

  return (
    <section className="grid gap-3 border-t border-line pt-4" aria-labelledby="workspace-plan-change-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-muted"
            id="workspace-plan-change-title">{copy.title}</h3>
          <p className="m-0 text-sm text-muted">{copy.description}</p>
        </div>
        {canStart && (
          <button type="button" onClick={openReview}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-ink focus-visible:focus-ring">
            {copy.change}
          </button>
        )}
      </div>
      {success && <p className="m-0 text-sm text-success" role="status">{success}</p>}
      {!canStart && <p className="m-0 text-sm text-muted" role="note">{unavailableMessage}</p>}
      {open && <ConfirmDialog
        open
        title={stage === 'verification' ? copy.verification : copy.review}
        description={copy.description}
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
          <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted" role="note">
            {copy.verificationHint}
          </p>
          {stage === 'review' && (
            <>
              <label className="grid gap-2 text-sm font-medium">
                {copy.selectedPlan}
                <select
                  aria-label={copy.selectedPlan}
                  value={plan}
                  onChange={event => {
                    const selected = event.target.value;
                    if (selected === 'free' || selected === 'standard' || selected === 'premium') setPlan(selected);
                    setQuote(null);
                    setError('');
                  }}
                  className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
                >
                  {subscription && subscription.plan !== 'standard' && <option value="standard">Standard</option>}
                  {subscription && subscription.plan !== 'premium' && <option value="premium">Premium</option>}
                  <option value="free">Free</option>
                </select>
              </label>
              <p className="m-0 text-sm text-muted">
                {copy.currentPlan}: {copy.plan(subscription?.plan ?? 'free')}
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
          {stage === 'quote' && quote && (
            <section className="grid gap-2 rounded-xl border border-line p-4" aria-labelledby="plan-change-quote-title">
              <h3 className="m-0 text-sm font-semibold" id="plan-change-quote-title">{copy.quote}</h3>
              <dl className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted">{copy.selectedPlan}</dt>
                <dd className="m-0">{copy.plan(quote.plan)}</dd>
                <dt className="text-muted">Change</dt>
                <dd className="m-0">{copy.kind(quote.kind)}</dd>
                <dt className="text-muted">{copy.amountDue}</dt>
                <dd className="m-0">{copy.amount(quote.amountDue)}</dd>
                <dt className="text-muted">{copy.effectiveAt}</dt>
                <dd className="m-0">{copy.date(quote.effectiveAt)}</dd>
                <dt className="text-muted">{copy.expiresAt}</dt>
                <dd className="m-0">{copy.date(quote.expiresAt)}</dd>
              </dl>
              {quoteExpired && <p className="m-0 text-sm text-error" role="alert">{copy.quoteExpired}</p>}
            </section>
          )}
          {stage === 'verification' && quote && (
            <>
              <p className="m-0 rounded-xl border border-line p-4 text-sm leading-6">
                {copy.plan(quote.plan)} · {copy.kind(quote.kind)} · {copy.amount(quote.amountDue)} · {copy.date(quote.effectiveAt)}
              </p>
              <fieldset className="m-0 grid gap-2 rounded-xl border border-line p-4">
                <legend className="px-1 text-sm font-semibold">Verification method</legend>
                {methods.includes('passkey') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-plan-change-factor" checked={method === 'passkey'}
                      onChange={() => { setMethod('passkey'); setError(''); }}
                      className="size-4 focus-visible:focus-ring" />
                    {copy.passkey}
                  </label>
                )}
                {methods.includes('totp') && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="workspace-plan-change-factor" checked={method === 'totp'}
                      onChange={() => { setMethod('totp'); setError(''); }}
                      className="size-4 focus-visible:focus-ring" />
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
