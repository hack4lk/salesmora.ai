import {
  adminWorkspaceBillingLinksResponseSchema,
  adminWorkspaceBillingResponseSchema,
  type AdminWorkspaceBillingLinksResponse,
  type AdminWorkspaceBillingResponse,
} from '@salesmora/contracts';
import type { Knex } from 'knex';
import { stripeSandbox, type Stripe } from './billing/stripe';
import { lockWorkspaceBilling } from './billing/checkout';

const providerId = (value: string | { id: string } | null | undefined) =>
  typeof value === 'string' ? value : value?.id ?? null;

function isoDate(value: Date | string | null) {
  return value === null ? null : new Date(value).toISOString();
}

function effectiveAt(change: {
  kind: string;
  basis: { end?: number } | null;
  prorationAt: number;
}) {
  const timestamp = ['downgrade', 'free'].includes(change.kind)
    ? change.basis?.end
    : change.prorationAt;
  return typeof timestamp === 'number' && Number.isFinite(timestamp)
    ? new Date(timestamp * 1000).toISOString()
    : null;
}

function invoiceSummary(invoice: Stripe.Invoice) {
  return {
    number: invoice.number,
    createdAt: new Date(invoice.created * 1000).toISOString(),
    currency: 'usd' as const,
    total: invoice.total,
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_remaining,
    status: invoice.status,
  };
}

class BillingProviderScopeError extends Error {}

export type AdminBillingWebhookReplayQueueResult =
  | { status: 'queued' }
  | { status: 'not_found' }
  | { status: 'not_eligible' }
  | { status: 'workspace_deletion_pending' };

export type AdminBillingWebhookReplayTargetResult =
  | {
    status: 'eligible';
    attempts: number;
    receivedAt: string;
    retryAt: string;
  }
  | { status: 'not_found' }
  | { status: 'not_eligible' }
  | { status: 'workspace_deletion_pending' };

export type AdminBillingWebhookReplayEvent = {
  replayKey: string;
  type: string;
  status: AdminWorkspaceBillingResponse['webhookEvents'][number]['status'];
  receivedAt: string;
  processedAt: string | null;
  attempts: number;
  retryAt: string;
};

export type AdminBillingWebhookReplayEventsResult =
  | { status: 'ready'; deletionPending: boolean; events: AdminBillingWebhookReplayEvent[] }
  | { status: 'not_found' };

function webhookEventStatus(event: {
  processedAt: Date | null;
  attempts: number;
  retryAt: Date;
}, now: number) {
  return event.processedAt
    ? 'processed' as const
    : event.attempts === 0
      ? 'pending' as const
      : new Date(event.retryAt).getTime() <= now
        ? 'retry_due' as const
        : 'retry_scheduled' as const;
}

async function adminBillingWebhookReplayTarget(
  trx: Knex.Transaction,
  workspaceId: string,
  eventId: string,
): Promise<AdminBillingWebhookReplayTargetResult> {
  await lockWorkspaceBilling(trx, workspaceId);
  const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
    .first<{ deletionRequestedAt: Date | null }>('deletionRequestedAt');
  if (!workspace) return { status: 'not_found' };
  if (workspace.deletionRequestedAt) return { status: 'workspace_deletion_pending' };

  const event = await trx('billingWebhookEvents').where({ id: eventId, workspaceId }).forUpdate()
    .first<{ attempts: number; receivedAt: Date; retryAt: Date; processedAt: Date | null }>(
      'attempts', 'receivedAt', 'retryAt', 'processedAt',
    );
  if (!event) return { status: 'not_found' };
  if (event.processedAt || event.attempts < 1) return { status: 'not_eligible' };
  return {
    status: 'eligible',
    attempts: event.attempts,
    receivedAt: isoDate(event.receivedAt)!,
    retryAt: isoDate(event.retryAt)!,
  };
}

export async function inspectAdminBillingWebhookReplay(
  trx: Knex.Transaction,
  workspaceId: string,
  eventId: string,
): Promise<AdminBillingWebhookReplayTargetResult> {
  return adminBillingWebhookReplayTarget(trx, workspaceId, eventId);
}

export async function readAdminBillingWebhookReplayEvents(
  trx: Knex.Transaction,
  workspaceId: string,
): Promise<AdminBillingWebhookReplayEventsResult> {
  await lockWorkspaceBilling(trx, workspaceId);
  const workspace = await trx('workspaces').where({ id: workspaceId }).forShare()
    .first<{ deletionRequestedAt: Date | null }>('deletionRequestedAt');
  if (!workspace) return { status: 'not_found' };
  if (workspace.deletionRequestedAt) {
    return { status: 'ready', deletionPending: true, events: [] };
  }

  const rows = await trx('billingWebhookEvents').where({ workspaceId })
    .orderBy('receivedAt', 'desc').limit(20)
    .select<{
      id: string;
      type: string;
      receivedAt: Date;
      processedAt: Date | null;
      attempts: number;
      retryAt: Date;
    }[]>('id', 'type', 'receivedAt', 'processedAt', 'attempts', 'retryAt');

  const now = Date.now();
  return {
    status: 'ready',
    deletionPending: false,
    events: rows.map(event => ({
      replayKey: event.id,
      type: event.type,
      status: webhookEventStatus(event, now),
      receivedAt: isoDate(event.receivedAt)!,
      processedAt: isoDate(event.processedAt),
      attempts: event.attempts,
      retryAt: isoDate(event.retryAt)!,
    })),
  };
}

export async function queueAdminBillingWebhookReplay(
  trx: Knex.Transaction,
  workspaceId: string,
  eventId: string,
): Promise<AdminBillingWebhookReplayQueueResult> {
  const target = await adminBillingWebhookReplayTarget(trx, workspaceId, eventId);
  if (target.status !== 'eligible') return target;
  const updated = await trx('billingWebhookEvents')
    .where({ id: eventId, workspaceId })
    .whereNull('processedAt')
    .where('attempts', '>', 0)
    .update({ retryAt: trx.fn.now() });
  return updated === 1 ? { status: 'queued' } : { status: 'not_eligible' };
}

async function verifiedStripeWorkspace(
  stripe: Stripe,
  workspaceId: string,
  customerId: string,
  subscriptionId: string | null,
) {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) {
    throw new BillingProviderScopeError('Billing customer scope mismatch.');
  }

  let subscription: Stripe.Subscription | null = null;
  if (subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.livemode || providerId(subscription.customer) !== customerId ||
        subscription.metadata.workspaceId !== workspaceId) {
      throw new BillingProviderScopeError('Billing subscription scope mismatch.');
    }
  }

  const history = await stripe.invoices.list({ customer: customerId, limit: 12 });
  if (history.data.some(invoice =>
    invoice.livemode || providerId(invoice.customer) !== customerId || invoice.currency !== 'usd')) {
    throw new BillingProviderScopeError('Billing invoice scope mismatch.');
  }
  return { customer, subscription, invoices: history.data };
}

function testDashboardUrl(resource: 'customers' | 'subscriptions' | 'invoices', id: string) {
  return `https://dashboard.stripe.com/test/${resource}/${id}`;
}

export async function readAdminWorkspaceBilling(
  trx: Knex.Transaction,
  workspaceId: string,
): Promise<AdminWorkspaceBillingResponse> {
  const row = await trx('workspaceSubscriptions').where({ workspaceId })
    .first<{
      plan: string;
      intendedPlan: string;
      status: string;
      cancelAtPeriodEnd: boolean;
      paidThrough: Date | null;
      recoveryUntil: Date | null;
      customerId: string | null;
      subscriptionId: string | null;
    }>(
      'plan',
      'intendedPlan',
      'status',
      'cancelAtPeriodEnd',
      'paidThrough',
      'recoveryUntil',
      'customerId',
      'subscriptionId',
    );

  const changes = await trx('billingPlanChanges').where({ workspaceId })
    .orderBy('createdAt', 'desc').limit(20)
    .select<{
      targetPlan: string;
      kind: string;
      state: string;
      amountDue: number;
      createdAt: Date;
      basis: { end?: number } | null;
      prorationAt: number;
    }[]>('targetPlan', 'kind', 'state', 'amountDue', 'createdAt', 'basis', 'prorationAt');

  const recoveries = await trx('billingRenewalRecoveries').where({ workspaceId })
    .orderBy('createdAt', 'desc').limit(20)
    .select<{
      state: string;
      amountDue: number;
      attempts: number;
      createdAt: Date;
      expiresAt: Date;
      retryAt: Date;
    }[]>('state', 'amountDue', 'attempts', 'createdAt', 'expiresAt', 'retryAt');

  const events = await trx('billingWebhookEvents').where({ workspaceId })
    .orderBy('receivedAt', 'desc').limit(20)
    .select<{
      type: string;
      receivedAt: Date;
      processedAt: Date | null;
      attempts: number;
      retryAt: Date;
    }[]>('type', 'receivedAt', 'processedAt', 'attempts', 'retryAt');

  const now = Date.now();
  const webhookEvents = events.map(event => ({
    type: event.type,
    status: webhookEventStatus(event, now),
    receivedAt: isoDate(event.receivedAt),
    processedAt: isoDate(event.processedAt),
    attempts: event.attempts,
    retryAt: isoDate(event.retryAt),
  }));

  let providerStatus: 'available' | 'unavailable' | 'not_linked' = 'not_linked';
  let payment: AdminWorkspaceBillingResponse['payment'] = null;
  let invoices: AdminWorkspaceBillingResponse['invoices'] = [];
  if (row?.subscriptionId && !row.customerId) {
    throw new Error('Workspace billing mapping is incomplete.');
  }
  if (row?.customerId) {
    try {
      const stripe = stripeSandbox();
      const verified = await verifiedStripeWorkspace(stripe, workspaceId, row.customerId, row.subscriptionId);
      const methodId = providerId(verified.subscription?.default_payment_method) ??
        providerId(verified.customer.invoice_settings.default_payment_method);

      if (methodId) {
        const method = await stripe.paymentMethods.retrieve(methodId);
        if (method.livemode || providerId(method.customer) !== row.customerId) {
          throw new BillingProviderScopeError('Billing payment method scope mismatch.');
        }
        if (method.card) {
          payment = {
            brand: method.card.brand,
            last4: method.card.last4,
            expMonth: method.card.exp_month,
            expYear: method.card.exp_year,
          };
        }
      }

      invoices = verified.invoices.map(invoiceSummary);
      providerStatus = 'available';
    } catch (error) {
      if (error instanceof BillingProviderScopeError) throw error;
      console.error('Admin workspace billing provider data is unavailable.');
      payment = null;
      invoices = [];
      providerStatus = 'unavailable';
    }
  }

  return adminWorkspaceBillingResponseSchema.parse({
    workspaceId,
    subscription: row ? {
      plan: row.plan,
      intendedPlan: row.intendedPlan,
      status: row.status,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      paidThrough: isoDate(row.paidThrough),
      recoveryUntil: isoDate(row.recoveryUntil),
    } : null,
    planChanges: changes.map(change => ({
      plan: change.targetPlan,
      kind: change.kind,
      status: change.state,
      amountDue: change.amountDue,
      createdAt: isoDate(change.createdAt),
      effectiveAt: effectiveAt(change),
    })),
    invoices,
    payment,
    providerStatus,
    recoveries: recoveries.map(recovery => ({
      state: recovery.state,
      amountDue: recovery.amountDue,
      attempts: recovery.attempts,
      createdAt: isoDate(recovery.createdAt),
      expiresAt: isoDate(recovery.expiresAt),
      retryAt: isoDate(recovery.retryAt),
    })),
    webhookEvents,
  });
}

export async function readAdminWorkspaceBillingLinks(
  trx: Knex.Transaction,
  workspaceId: string,
): Promise<AdminWorkspaceBillingLinksResponse> {
  const row = await trx('workspaceSubscriptions').where({ workspaceId })
    .first<{ customerId: string | null; subscriptionId: string | null }>('customerId', 'subscriptionId');

  if (row?.subscriptionId && !row.customerId) {
    throw new Error('Workspace billing mapping is incomplete.');
  }
  if (!row?.customerId) {
    return adminWorkspaceBillingLinksResponseSchema.parse({
      workspaceId,
      providerStatus: 'not_linked',
      customerUrl: null,
      subscriptionUrl: null,
      invoices: [],
    });
  }

  let verified: Awaited<ReturnType<typeof verifiedStripeWorkspace>>;
  try {
    verified = await verifiedStripeWorkspace(
      stripeSandbox(),
      workspaceId,
      row.customerId,
      row.subscriptionId,
    );
  } catch (error) {
    if (error instanceof BillingProviderScopeError) throw error;
    console.error('Admin workspace billing links are unavailable.');
    return adminWorkspaceBillingLinksResponseSchema.parse({
      workspaceId,
      providerStatus: 'unavailable',
      customerUrl: null,
      subscriptionUrl: null,
      invoices: [],
    });
  }

  return adminWorkspaceBillingLinksResponseSchema.parse({
    workspaceId,
    providerStatus: 'available',
    customerUrl: testDashboardUrl('customers', verified.customer.id),
    subscriptionUrl: verified.subscription
      ? testDashboardUrl('subscriptions', verified.subscription.id)
      : null,
    invoices: verified.invoices.map(invoice => ({
      number: invoice.number,
      createdAt: new Date(invoice.created * 1000).toISOString(),
      url: testDashboardUrl('invoices', invoice.id),
    })),
  });
}
