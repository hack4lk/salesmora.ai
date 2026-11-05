'use client';

import { useEffect, useState } from 'react';
import {
  adminWorkspaceBillingLinksResponseSchema,
  adminWorkspaceBillingResponseSchema,
  type AdminWorkspaceBillingLinksResponse,
  type AdminWorkspaceBillingResponse,
} from '@salesmora/contracts';
import { adminWorkspaceBillingCopy as copy } from './admin-workspace-billing-copy.data';
import { AdminWorkspacePlanChange } from './admin-workspace-plan-change';
import { AdminWorkspaceRecovery } from './admin-workspace-recovery';
import { AdminWorkspaceWebhookReplay } from './admin-workspace-webhook-replay';

type LoadState =
  | { workspaceId: string; status: 'loading' }
  | { workspaceId: string; status: 'error'; message: string }
  | { workspaceId: string; status: 'ready'; billing: AdminWorkspaceBillingResponse };
type BillingLinksLoadState =
  | { workspaceId: string; status: 'loading' }
  | { workspaceId: string; status: 'error'; message: string }
  | { workspaceId: string; status: 'ready'; links: AdminWorkspaceBillingLinksResponse };
type WorkspacePlan = NonNullable<AdminWorkspaceBillingResponse['subscription']>['plan'];

function providerMessage(status: AdminWorkspaceBillingResponse['providerStatus']) {
  if (status === 'available') return copy.provider.available;
  if (status === 'unavailable') return copy.provider.unavailable;
  return copy.provider.notLinked;
}

async function loadBilling(workspaceId: string): Promise<AdminWorkspaceBillingResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new Error(copy.unavailable);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(copy.invalid);
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error(copy.signIn);
    if (response.status === 403) throw new Error(copy.denied);
    const message = payload && typeof payload === 'object' && 'error' in payload &&
      typeof payload.error === 'string'
      ? payload.error
      : copy.unavailable;
    throw new Error(message);
  }

  const parsed = adminWorkspaceBillingResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error(copy.invalid);
  return parsed.data;
}

async function loadBillingLinks(workspaceId: string): Promise<AdminWorkspaceBillingLinksResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/links`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new Error(copy.dashboardLinksError);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(copy.dashboardLinksInvalid);
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error(copy.dashboardLinksSignIn);
    if (response.status === 403) throw new Error(copy.dashboardLinksDenied);
    throw new Error(copy.dashboardLinksError);
  }

  const parsed = adminWorkspaceBillingLinksResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error(copy.dashboardLinksInvalid);
  return parsed.data;
}

function planLabel(plan: WorkspacePlan) {
  return plan === 'free' ? 'Free' : plan === 'standard' ? 'Standard' : 'Premium';
}

export function AdminWorkspaceBilling({
  workspaceId,
  canReadBillingLinks = false,
  canChangePlan = false,
  canManageRecovery = false,
  canReplayWebhooks = false,
  deletionPending = false,
  onComplete = () => {},
}: {
  workspaceId: string;
  canReadBillingLinks?: boolean;
  canChangePlan?: boolean;
  canManageRecovery?: boolean;
  canReplayWebhooks?: boolean;
  deletionPending?: boolean;
  onComplete?: () => void;
}) {
  const [state, setState] = useState<LoadState>({ workspaceId, status: 'loading' });
  const [linksState, setLinksState] = useState<BillingLinksLoadState | null>(null);

  useEffect(() => {
    let active = true;
    void loadBilling(workspaceId).then(
      billing => { if (active) setState({ workspaceId, status: 'ready', billing }); },
      error => {
        if (active) setState({
          workspaceId,
          status: 'error',
          message: error instanceof Error ? error.message : copy.unavailable,
        });
      },
    );
    return () => { active = false; };
  }, [workspaceId]);
  useEffect(() => {
    if (!canReadBillingLinks) return;

    let active = true;
    void loadBillingLinks(workspaceId).then(
      links => { if (active) setLinksState({ workspaceId, status: 'ready', links }); },
      error => {
        if (active) setLinksState({
          workspaceId,
          status: 'error',
          message: error instanceof Error ? error.message : copy.dashboardLinksError,
        });
      },
    );
    return () => { active = false; };
  }, [workspaceId, canReadBillingLinks]);
  const currentState: LoadState = state.workspaceId === workspaceId
    ? state
    : { workspaceId, status: 'loading' };
  const currentLinksState = linksState?.workspaceId === workspaceId
    ? linksState
    : { workspaceId, status: 'loading' as const };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-paper text-ink"
      aria-labelledby="workspace-billing-title">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="m-0 text-sm font-semibold" id="workspace-billing-title">{copy.title}</h2>
        <span className="rounded-full bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-muted">
          {copy.readOnly}
        </span>
      </header>
      {currentState.status === 'loading' && (
        <p className="m-0 px-4 py-4 text-sm text-muted" role="status">{copy.loading}</p>
      )}
      {currentState.status === 'error' && (
        <p className="m-0 px-4 py-4 text-sm text-error" role="alert">{currentState.message}</p>
      )}
      {currentState.status === 'ready' && (
        <div className="grid gap-4 p-4">
          <p className={`m-0 rounded-lg px-3 py-2 text-sm ${
            currentState.billing.providerStatus === 'unavailable'
              ? 'border border-warning bg-warning/10 text-ink'
              : 'border border-line bg-surface text-muted'
          }`} role="status">
            {providerMessage(currentState.billing.providerStatus)}
          </p>

          <section aria-labelledby="workspace-billing-subscription">
            <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
              id="workspace-billing-subscription">{copy.subscription}</h3>
            {currentState.billing.subscription ? (
              <dl className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted">{copy.plan}</dt>
                <dd className="m-0">{planLabel(currentState.billing.subscription.plan)}</dd>
                <dt className="text-muted">{copy.intendedPlan}</dt>
                <dd className="m-0">{planLabel(currentState.billing.subscription.intendedPlan)}</dd>
                <dt className="text-muted">{copy.status}</dt>
                <dd className="m-0 capitalize">{copy.label(currentState.billing.subscription.status)}</dd>
                <dt className="text-muted">{copy.paidThrough}</dt>
                <dd className="m-0">{copy.date(currentState.billing.subscription.paidThrough)}</dd>
                <dt className="text-muted">{copy.recoveryUntil}</dt>
                <dd className="m-0">{copy.date(currentState.billing.subscription.recoveryUntil)}</dd>
                {currentState.billing.subscription.cancelAtPeriodEnd && (
                  <>
                    <dt className="text-muted">{copy.cancellation}</dt>
                    <dd className="m-0">{copy.cancelAtPeriodEnd}</dd>
                  </>
                )}
              </dl>
            ) : <p className="m-0 text-sm text-muted">{copy.noSubscription}</p>}
          </section>

          <AdminWorkspacePlanChange
            workspaceId={workspaceId}
            subscription={currentState.billing.subscription}
            providerStatus={currentState.billing.providerStatus}
            canChangePlan={canChangePlan}
            deletionPending={deletionPending}
            onComplete={onComplete}
          />
          <AdminWorkspaceRecovery
            workspaceId={workspaceId}
            canManageRecovery={canManageRecovery}
            deletionPending={deletionPending}
            onComplete={onComplete}
          />

          <section aria-labelledby="workspace-billing-plan-changes">
            <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
              id="workspace-billing-plan-changes">{copy.planChanges}</h3>
            {currentState.billing.planChanges.length > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0 text-sm">
                {currentState.billing.planChanges.map((change, index) => (
                  <li className="rounded-lg border border-line p-3" key={`${change.createdAt}-${index}`}>
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                      <strong>{planLabel(change.plan)} · {copy.label(change.kind)}</strong>
                      <span className="capitalize text-muted">{copy.label(change.status)}</span>
                    </div>
                    <p className="mb-0 mt-1 text-muted">
                      {copy.date(change.createdAt)} · {copy.amount(change.amountDue)}
                      {change.effectiveAt ? ` · effective ${copy.date(change.effectiveAt)}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="m-0 text-sm text-muted">{copy.noPlanChanges}</p>}
          </section>

          <section aria-labelledby="workspace-billing-payment">
            <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
              id="workspace-billing-payment">{copy.paymentMethod}</h3>
            <p className="m-0 text-sm">
              {currentState.billing.payment
                ? copy.card(
                  currentState.billing.payment.brand,
                  currentState.billing.payment.last4,
                  currentState.billing.payment.expMonth,
                  currentState.billing.payment.expYear,
                )
                : <span className="text-muted">{copy.noPaymentMethod}</span>}
            </p>
          </section>

          <section aria-labelledby="workspace-billing-invoices">
            <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
              id="workspace-billing-invoices">{copy.invoices}</h3>
            {currentState.billing.invoices.length > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0 text-sm">
                {currentState.billing.invoices.map((invoice, index) => (
                  <li className="rounded-lg border border-line p-3" key={`${invoice.number ?? 'invoice'}-${index}`}>
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                      <strong>{copy.invoiceNumber(invoice.number)}</strong>
                      <span className="capitalize text-muted">{invoice.status ?? copy.label('unknown')}</span>
                    </div>
                    <p className="mb-0 mt-1 text-muted">
                      {copy.date(invoice.createdAt)} · {copy.amount(invoice.total)} · paid {copy.amount(invoice.amountPaid)} · due {copy.amount(invoice.amountDue)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="m-0 text-sm text-muted">{copy.noInvoices}</p>}
          </section>

          {canReadBillingLinks && (
            <section aria-labelledby="workspace-billing-dashboard-links">
              <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
                id="workspace-billing-dashboard-links">{copy.dashboardLinks}</h3>
              {currentLinksState.status === 'loading' && (
                <p className="m-0 text-sm text-muted" role="status">{copy.dashboardLinksLoading}</p>
              )}
              {currentLinksState.status === 'error' && (
                <p className="m-0 text-sm text-error" role="alert">{currentLinksState.message}</p>
              )}
              {currentLinksState.status === 'ready' && currentLinksState.links.providerStatus === 'not_linked' && (
                <p className="m-0 text-sm text-muted" role="status">{copy.noDashboardLinks}</p>
              )}
              {currentLinksState.status === 'ready' && currentLinksState.links.providerStatus === 'unavailable' && (
                <p className="m-0 text-sm text-muted" role="status">{copy.dashboardLinksUnavailable}</p>
              )}
              {currentLinksState.status === 'ready' && currentLinksState.links.providerStatus === 'available' && (
                <ul className="m-0 grid list-none gap-2 p-0 text-sm">
                  <li>
                    <a href={currentLinksState.links.customerUrl} target="_blank" rel="noopener noreferrer">
                      {copy.customerDashboardLink}
                    </a>
                  </li>
                  {currentLinksState.links.subscriptionUrl
                    ? (
                      <li>
                        <a href={currentLinksState.links.subscriptionUrl} target="_blank" rel="noopener noreferrer">
                          {copy.subscriptionDashboardLink}
                        </a>
                      </li>
                    )
                    : null}
                  {currentLinksState.links.invoices.map(invoice => (
                    <li key={invoice.url}>
                      <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                        {copy.invoiceDashboardLink(invoice.number)}
                      </a>
                    </li>
                  ))}
                  {currentLinksState.links.subscriptionUrl === null && (
                    <li className="text-muted">{copy.noSubscriptionDashboardLink}</li>
                  )}
                  {currentLinksState.links.invoices.length === 0 && (
                    <li className="text-muted">{copy.noInvoiceDashboardLinks}</li>
                  )}
                </ul>
              )}
            </section>
          )}

          <section aria-labelledby="workspace-billing-recoveries">
            <h3 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted"
              id="workspace-billing-recoveries">{copy.recoveries}</h3>
            {currentState.billing.recoveries.length > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0 text-sm">
                {currentState.billing.recoveries.map((recovery, index) => (
                  <li className="rounded-lg border border-line p-3" key={`${recovery.createdAt}-${index}`}>
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                      <strong className="capitalize">{copy.label(recovery.state)}</strong>
                      <span>{copy.amount(recovery.amountDue)}</span>
                    </div>
                    <p className="mb-0 mt-1 text-muted">
                      {copy.attempts(recovery.attempts)} · retry {copy.date(recovery.retryAt)} · expires {copy.date(recovery.expiresAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="m-0 text-sm text-muted">{copy.noRecoveries}</p>}
          </section>

          <AdminWorkspaceWebhookReplay
            key={`${workspaceId}:${canReplayWebhooks}:${deletionPending}`}
            workspaceId={workspaceId}
            fallbackEvents={currentState.billing.webhookEvents}
            canReplayWebhooks={canReplayWebhooks}
            deletionPending={deletionPending}
            onComplete={onComplete}
          />
        </div>
      )}
    </section>
  );
}
