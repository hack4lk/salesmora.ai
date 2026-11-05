import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { createDatabase } from '../database';
import {
  cancelAdminRenewalRecovery,
  extendAdminRecoveryGrace,
  previewAdminRenewalRecovery,
  previewRenewalRecovery,
  reconcileRenewalRecoveries,
  retryAdminRenewalRecovery,
} from './payment-recovery';
import { initialRecoveryGraceUntil, maximumRecoveryGraceUntil, nextRecoveryGraceUntil } from './recovery-grace';
import type { Stripe } from './stripe';
import defaults from '../authorization/defaults-v1.json' with { type: 'json' };

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const databaseURL = process.env.TEST_DATABASE_URL;
if (!databaseURL || databaseURL === process.env.DATABASE_URL || !new URL(databaseURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(databaseURL).hostname)) {
  throw new Error('Use an isolated local test database.');
}

const db = createDatabase(databaseURL);
const suffix = randomUUID();
const userId = `admin-recovery-${suffix}`;
const workspaceId = randomUUID();
const recoveryId = randomUUID();
const invoiceId = `in_${randomUUID().replaceAll('-', '')}`;
const customerId = `cus_${randomUUID().replaceAll('-', '')}`;
const subscriptionId = `sub_${randomUUID().replaceAll('-', '')}`;
const paymentMethodId = `pm_${randomUUID().replaceAll('-', '')}`;
const invoiceCreatedAt = new Date(Math.floor((Date.now() - 60_000) / 1000) * 1000);
const invoice = {
  id: invoiceId,
  livemode: false,
  customer: customerId,
  parent: { subscription_details: { subscription: subscriptionId } },
  billing_reason: 'subscription_cycle',
  currency: 'usd',
  collection_method: 'charge_automatically',
  status: 'open',
  created: Math.floor(invoiceCreatedAt.getTime() / 1000),
  number: 'SM-RECOVERY',
  amount_remaining: 2900,
  total: 2900,
  amount_paid: 0,
  period_start: Math.floor(invoiceCreatedAt.getTime() / 1000),
  period_end: Math.floor(invoiceCreatedAt.getTime() / 1000) + 30 * 86400,
  lines: { data: [] },
};
let paymentIntent: Record<string, unknown> | null = null;
const idempotencyKeys: (string | undefined)[] = [];
const priceId = 'price_adminrecoveryrehearsal';
const subscription = {
  id: subscriptionId,
  livemode: false,
  customer: customerId,
  metadata: { workspaceId },
  status: 'past_due',
  pending_update: null,
  default_payment_method: paymentMethodId,
  cancel_at_period_end: false,
  current_period_end: Math.floor(invoiceCreatedAt.getTime() / 1000) + 30 * 86400,
  latest_invoice: invoice,
  items: {
    data: [{
      quantity: 1,
      price: {
        id: priceId,
        currency: 'usd',
        unit_amount: 2900,
        recurring: { interval: 'month', interval_count: 1 },
      },
    }],
  },
};
const fakeStripe = {
  customers: {
    retrieve: async () => ({
      id: customerId,
      deleted: false,
      livemode: false,
      metadata: { workspaceId },
      invoice_settings: { default_payment_method: paymentMethodId },
    }),
  },
  subscriptions: { retrieve: async () => subscription },
  invoices: {
    retrieve: async () => invoice,
    pay: async (_id: string, _params: unknown, options?: { idempotencyKey?: string }) => {
      idempotencyKeys.push(options?.idempotencyKey);
      paymentIntent = {
        id: `pi_${randomUUID().replaceAll('-', '')}`,
        livemode: false,
        customer: customerId,
        currency: 'usd',
        amount: invoice.amount_remaining,
        status: 'requires_action',
        payment_method: paymentMethodId,
        client_secret: 'pi_secret_rehearsal_only',
      };
      return invoice;
    },
  },
  paymentMethods: {
    retrieve: async () => ({
      id: paymentMethodId,
      livemode: false,
      customer: customerId,
      type: 'card',
      card: { brand: 'visa', last4: '4242', exp_month: 8, exp_year: 2028 },
    }),
  },
  invoicePayments: {
    list: async () => ({
      has_more: false,
      data: paymentIntent ? [{
        livemode: false,
        invoice: invoiceId,
        currency: 'usd',
        is_default: true,
        payment: { type: 'payment_intent', payment_intent: paymentIntent },
      }] : [],
    }),
  },
  paymentIntents: { retrieve: async () => paymentIntent },
} as unknown as Stripe;

async function seed(trx: Knex.Transaction) {
  const now = new Date();
  await trx('users').insert({
    id: userId,
    name: 'Admin recovery rehearsal',
    email: `${userId}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'admin-recovery-rehearsal',
    termsAcceptedAt: now,
  });
  await trx('workspaces').insert({
    id: workspaceId,
    ownerId: userId,
    businessName: 'Fictional admin recovery workspace',
    businessType: 'test',
    postalCode: '',
    serviceRange: '',
  });
  await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
  await trx('workspacePolicies').insert({ workspaceId, revision: 0, templateVersion: 1 });
  await trx('workspaceRolePolicies').insert(defaults
    .filter(grant => !(grant.role === 'owner' && grant.permission === 'billing.manage'))
    .map(grant => ({ workspaceId, ...grant })));
  await trx('workspaceSubscriptions').insert({
    workspaceId,
    plan: 'standard',
    intendedPlan: 'standard',
    catalogVersion: 'admin-recovery-rehearsal',
    status: 'past_due',
    customerId,
    subscriptionId,
    recoveryUntil: initialRecoveryGraceUntil(invoiceCreatedAt),
  });
}

const trx = await db.transaction();
try {
  const priorPrice = process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID;
  process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID = priceId;
  await seed(trx);

  assert.equal(
    initialRecoveryGraceUntil(invoiceCreatedAt).toISOString(),
    new Date(invoiceCreatedAt.getTime() + 7 * 86400000).toISOString(),
  );
  assert.equal(
    nextRecoveryGraceUntil(invoiceCreatedAt, null, 7).toISOString(),
    maximumRecoveryGraceUntil(invoiceCreatedAt).toISOString(),
  );
  assert.throws(() => nextRecoveryGraceUntil(invoiceCreatedAt, maximumRecoveryGraceUntil(invoiceCreatedAt), 1),
    /14-day recovery limit/);

  const extension = await extendAdminRecoveryGrace(trx, workspaceId, 7, fakeStripe);
  assert.equal(extension.status, 'grace_extended');
  if (extension.status !== 'grace_extended') throw Error('Grace extension result mismatch.');
  assert.equal(extension.graceUntil, maximumRecoveryGraceUntil(invoiceCreatedAt).toISOString());
  const persistedUntil = await trx('workspaceSubscriptions').where({ workspaceId }).first('recoveryUntil');
  assert.equal(new Date(persistedUntil.recoveryUntil).toISOString(), extension.graceUntil);
  await assert.rejects(extendAdminRecoveryGrace(trx, workspaceId, 1, fakeStripe), /14-day recovery limit/);
  assert.equal(await trx('billingRecoveryGraceExtensions').where({ workspaceId }).count('* as count').first()
    .then(row => Number(row?.count)), 1);

  const now = new Date();
  await trx('billingRenewalRecoveries').insert({
    id: recoveryId,
    workspaceId,
    actorId: userId,
    customerId,
    subscriptionId,
    invoiceId,
    paymentMethodId,
    amountDue: invoice.amount_remaining,
    invoice: JSON.stringify({ number: invoice.number }),
    state: 'pending',
    createdAt: now,
    expiresAt: new Date(now.getTime() + 600_000),
    attemptedAt: new Date(now.getTime() - 60_000),
    retryAt: now,
    attempts: 0,
  });
  const retryResult = await retryAdminRenewalRecovery(trx, workspaceId, recoveryId, fakeStripe);
  assert.deepEqual(retryResult, {
    status: 'owner_action_required',
    recoveryId,
    handoff: 'workspace_owner_billing',
  });
  assert.equal('clientSecret' in retryResult, false);
  assert.deepEqual(idempotencyKeys, [`salesmora-renewal-${recoveryId}`]);

  const cancelResult = await cancelAdminRenewalRecovery(trx, workspaceId, recoveryId, fakeStripe);
  assert.deepEqual(cancelResult, { status: 'retries_cancelled', paymentState: 'requires_action' });
  const storedRecovery = await trx('billingRenewalRecoveries').where({ id: recoveryId }).first();
  assert.ok(storedRecovery.retryCancelledAt);
  assert.equal(storedRecovery.state, 'action');
  const preview = await previewAdminRenewalRecovery(trx, workspaceId, fakeStripe);
  assert.equal(preview.recovery?.retriesCancelledAt !== null, true);
  assert.equal(preview.paymentState, 'requires_action');
  assert.equal(invoice.status, 'open');
  assert.equal(subscription.status, 'past_due');
  await trx('workspaceRolePolicies').insert({
    workspaceId,
    role: 'owner',
    permission: 'billing.manage',
    scope: 'enabled',
  });
  const ownerPreview = await previewRenewalRecovery(trx, userId, workspaceId, fakeStripe);
  assert.equal(ownerPreview.status, 'review');
  assert.notEqual(ownerPreview.quoteId, recoveryId, 'the Owner can obtain a fresh consent quote after worker retries are cancelled');
  await reconcileRenewalRecoveries(trx, fakeStripe);
  assert.deepEqual(idempotencyKeys, [`salesmora-renewal-${recoveryId}`]);

  console.log('Admin billing recovery rehearsal passed: invoice-bound grace cap/reconciliation, stable Owner-consent retry key, secret-free Owner handoff, retry cancellation and preserved in-flight provider state.');
  if (priorPrice === undefined) delete process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID;
  else process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID = priorPrice;
} finally {
  await trx.rollback();
  await db.destroy();
}
