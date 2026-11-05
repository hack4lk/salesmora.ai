import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getWorkspacePlan } from '@salesmora/domain';
import { createDatabase } from './database';
import { processBillingEvents } from './billing/events';
import type { Stripe } from './billing/stripe';
import {
  queueAdminBillingWebhookReplay,
  readAdminWorkspaceBilling,
  readAdminWorkspaceBillingLinks,
} from './admin-billing-management';

const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const databaseURL = process.env.TEST_DATABASE_URL;
if (!databaseURL || databaseURL === process.env.DATABASE_URL || !new URL(databaseURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(databaseURL).hostname)) {
  throw new Error('Use an isolated local test database.');
}

const db = createDatabase(databaseURL);
const suffix = randomUUID();
const userId = `admin-billing-read-${suffix}`;
const workspaceId = randomUUID();
const eventIds = Array.from({ length: 21 }, () => `evt_${randomUUID()}`);
const unscopedEventId = `evt_${randomUUID()}`;
const changeId = randomUUID();
const recoveryId = randomUUID();
const now = new Date();

async function seed() {
  await db('users').insert({
    id: userId,
    name: 'Admin billing read rehearsal',
    email: `${userId}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'admin-billing-read-rehearsal',
    termsAcceptedAt: now,
  });
  await db.transaction(async trx => {
    await trx('workspaces').insert({
      id: workspaceId,
      ownerId: userId,
      businessName: 'Fictional admin billing workspace',
      businessType: 'test',
      postalCode: '',
      serviceRange: '',
    });
    await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
    await trx('workspacePolicies').insert({ workspaceId });
  });
  await db('workspaceSubscriptions').insert({
    workspaceId,
    plan: 'free',
    intendedPlan: 'free',
    catalogVersion: 'admin-billing-read-rehearsal',
    status: 'free',
  });
  await db('billingPlanChanges').insert({
    id: changeId,
    workspaceId,
    actorId: userId,
    targetPlan: 'standard',
    kind: 'upgrade',
    state: 'quoted',
    basis: JSON.stringify({}),
    amountDue: 1200,
    prorationAt: Math.floor(now.getTime() / 1000),
    createdAt: now,
  });
  await db('billingRenewalRecoveries').insert({
    id: recoveryId,
    workspaceId,
    actorId: userId,
    customerId: 'cus_fixture',
    subscriptionId: 'sub_fixture',
    invoiceId: 'in_fixture',
    amountDue: 1200,
    invoice: JSON.stringify({}),
    state: 'pending',
    createdAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    retryAt: now,
    attempts: 1,
  });
  await db('billingWebhookEvents').insert(eventIds.map((id, index) => ({
    id,
    type: 'invoice.payment_failed',
    objectId: 'in_fixture',
    workspaceId,
    receivedAt: new Date(now.getTime() + index * 1000),
    attempts: 1,
    retryAt: now,
  })));
  await db('billingWebhookEvents').insert({
    id: unscopedEventId,
    type: 'unmapped.fixture',
    objectId: 'in_unmapped_fixture',
    receivedAt: new Date(now.getTime() + 30_000),
  });
}

async function cleanup() {
  await db('billingWebhookEvents').whereIn('id', [...eventIds, unscopedEventId]).delete();
  await db('billingRenewalRecoveries').where({ id: recoveryId }).delete();
  await db('billingPlanChanges').where({ id: changeId }).delete();
  await db('billingAudit').where({ workspaceId }).delete();
  await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db.transaction(async trx => {
    await trx('workspacePolicies').where({ workspaceId }).delete();
    await trx('workspaceMemberships').where({ workspaceId }).delete();
    await trx('workspaces').where({ id: workspaceId }).delete();
  });
  await db('users').where({ id: userId }).delete();
}

try {
  await seed();
  const result = await db.transaction(trx => readAdminWorkspaceBilling(trx, workspaceId));
  assert.equal(result.workspaceId, workspaceId);
  assert.equal(result.subscription?.plan, 'free');
  assert.equal(result.planChanges.length, 1);
  assert.equal(result.planChanges[0]?.plan, 'standard');
  assert.equal(result.recoveries.length, 1);
  assert.equal(result.recoveries[0]?.state, 'pending');
  assert.equal(result.webhookEvents.length, 20);
  assert.equal(
    result.webhookEvents[0]?.receivedAt,
    new Date(now.getTime() + 20_000).toISOString(),
  );
  assert.equal(result.webhookEvents.some(event => event.type === 'unmapped.fixture'), false);
  assert.equal(result.webhookEvents[0]?.status, 'retry_due');
  assert.equal(result.providerStatus, 'not_linked');
  assert.deepEqual(result.invoices, []);
  assert.equal(result.payment, null);
  assert.equal('customerId' in result, false);
  assert.equal('rawPayload' in result.webhookEvents[0]!, false);

  const replayEventId = eventIds[0]!;
  const replayFirst = await db.transaction(trx =>
    queueAdminBillingWebhookReplay(trx, workspaceId, replayEventId),
  );
  const replaySecond = await db.transaction(trx =>
    queueAdminBillingWebhookReplay(trx, workspaceId, replayEventId),
  );
  const replayEvent = await db('billingWebhookEvents').where({ id: replayEventId }).first<{
    attempts: number;
    processedAt: Date | null;
    retryAt: Date;
  }>('attempts', 'processedAt', 'retryAt');
  assert.deepEqual(replayFirst, { status: 'queued' });
  assert.deepEqual(replaySecond, { status: 'queued' });
  assert.equal(replayEvent?.attempts, 1);
  assert.equal(replayEvent?.processedAt, null);
  assert.equal(new Date(replayEvent!.retryAt).getTime() <= Date.now(), true);
  assert.equal(await db('billingWebhookEvents').where({ id: replayEventId }).count('* as count').first()
    .then(row => Number(row?.count)), 1);
  assert.deepEqual(
    await db.transaction(trx => queueAdminBillingWebhookReplay(trx, randomUUID(), replayEventId)),
    { status: 'not_found' },
  );
  assert.deepEqual(
    await db.transaction(trx => queueAdminBillingWebhookReplay(trx, workspaceId, unscopedEventId)),
    { status: 'not_found' },
  );
  await db('billingWebhookEvents').where({ id: eventIds[1]! }).update({ processedAt: now });
  assert.deepEqual(
    await db.transaction(trx => queueAdminBillingWebhookReplay(trx, workspaceId, eventIds[1]!)),
    { status: 'not_eligible' },
  );

  const neverFailedEventId = `evt_${randomUUID()}`;
  await db('billingWebhookEvents').insert({
    id: neverFailedEventId,
    type: 'invoice.payment_failed',
    objectId: 'in_fixture',
    workspaceId,
    attempts: 0,
    retryAt: now,
  });
  try {
    assert.deepEqual(
      await db.transaction(trx => queueAdminBillingWebhookReplay(trx, workspaceId, neverFailedEventId)),
      { status: 'not_eligible' },
    );
  } finally {
    await db('billingWebhookEvents').where({ id: neverFailedEventId }).delete();
  }

  await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: now });
  try {
    assert.deepEqual(
      await db.transaction(trx => queueAdminBillingWebhookReplay(trx, workspaceId, eventIds[2]!)),
      { status: 'workspace_deletion_pending' },
    );
  } finally {
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  }

  const concurrentReplayResults = await Promise.all(
    Array.from({ length: 4 }, () => db.transaction(trx =>
      queueAdminBillingWebhookReplay(trx, workspaceId, replayEventId))),
  );
  assert.deepEqual(concurrentReplayResults, Array.from({ length: 4 }, () => ({ status: 'queued' })));
  const unrelatedRetryAt = new Date(Date.now() + 86_400_000);
  await db('billingWebhookEvents').whereIn('id', [...eventIds.slice(1), unscopedEventId])
    .update({ retryAt: unrelatedRetryAt });

  const subscriptionId = 'sub_adminbillingreplay';
  const customerId = 'cus_adminbillingreplay';
  const invoiceId = 'in_adminbillingreplay';
  const priceId = 'price_adminbillingreplay';
  const periodEnd = Math.floor((Date.now() + 86_400_000) / 1000);
  let invoiceRetrievals = 0;
  let subscriptionRetrievals = 0;
  const replayStripe = {
    invoices: {
      retrieve: async () => {
        invoiceRetrievals++;
        return { parent: { subscription_details: { subscription: subscriptionId } } };
      },
    },
    subscriptions: {
      retrieve: async () => {
        subscriptionRetrievals++;
        return {
          id: subscriptionId,
          livemode: false,
          customer: customerId,
          metadata: { workspaceId },
          status: 'active',
          items: {
            data: [{
              quantity: 1,
              current_period_end: periodEnd,
              price: {
                id: priceId,
                currency: 'usd',
                unit_amount: getWorkspacePlan('standard').monthlyPriceCents,
                recurring: { interval: 'month', interval_count: 1 },
              },
            }],
          },
          latest_invoice: { id: invoiceId, status: 'paid', created: Math.floor(now.getTime() / 1000) },
          schedule: null,
          cancel_at_period_end: false,
        };
      },
    },
  } as unknown as Stripe;
  const previousPriceId = process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID;
  try {
    process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID = priceId;
    await db('workspaceSubscriptions').where({ workspaceId }).update({
      customerId,
      subscriptionId,
    });
    const unrelatedDueEvents = await db('billingWebhookEvents')
      .whereNull('processedAt')
      .where('retryAt', '<=', new Date())
      .whereNot({ id: replayEventId })
      .select('id');
    assert.deepEqual(unrelatedDueEvents, [], 'worker rehearsal must not process unrelated due events');
    await processBillingEvents(db, replayStripe);
    const processedReplay = await db('billingWebhookEvents').where({ id: replayEventId }).first<{
      id: string;
      attempts: number;
      processedAt: Date | null;
    }>('id', 'attempts', 'processedAt');
    assert.equal(processedReplay?.id, replayEventId);
    assert.equal(processedReplay?.attempts, 1);
    assert.ok(processedReplay?.processedAt);
    const reconciledSubscription = await db('workspaceSubscriptions').where({ workspaceId }).first<{
      plan: string;
      status: string;
      subscriptionId: string | null;
    }>('plan', 'status', 'subscriptionId');
    assert.equal(reconciledSubscription?.plan, 'standard');
    assert.equal(reconciledSubscription?.status, 'active');
    assert.equal(reconciledSubscription?.subscriptionId, subscriptionId);
    assert.equal(await db('billingWebhookEvents').where({ id: replayEventId }).count('* as count').first()
      .then(row => Number(row?.count)), 1);
    assert.equal(invoiceRetrievals, 1);
    assert.equal(subscriptionRetrievals, 1);

    await processBillingEvents(db, replayStripe);
    assert.equal(invoiceRetrievals, 1);
    assert.equal(subscriptionRetrievals, 1);
    assert.equal(await db('billingWebhookEvents').where({ id: replayEventId }).count('* as count').first()
      .then(row => Number(row?.count)), 1);
    assert.equal((await db('billingWebhookEvents').where({ id: replayEventId })
      .first<{ attempts: number }>('attempts'))?.attempts, 1);
  } finally {
    await db('workspaceSubscriptions').where({ workspaceId }).update({
      customerId: null,
      subscriptionId: null,
      plan: 'free',
      intendedPlan: 'free',
      status: 'free',
      priceId: null,
      cancelAtPeriodEnd: false,
      paidThrough: null,
      recoveryUntil: null,
    });
    if (previousPriceId === undefined) delete process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID;
    else process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID = previousPriceId;
  }

  const linksNotLinked = await db.transaction(trx => readAdminWorkspaceBillingLinks(trx, workspaceId));
  assert.equal(linksNotLinked.providerStatus, 'not_linked');
  assert.equal(linksNotLinked.customerUrl, null);
  assert.deepEqual(linksNotLinked.invoices, []);

  const billingSandboxFlag = process.env.BILLING_SANDBOX_ENABLED;
  try {
    process.env.BILLING_SANDBOX_ENABLED = 'false';
    await db('workspaceSubscriptions').where({ workspaceId }).update({ customerId: 'cus_fixture' });
    const unavailable = await db.transaction(trx => readAdminWorkspaceBilling(trx, workspaceId));
    assert.equal(unavailable.providerStatus, 'unavailable');
    assert.deepEqual(unavailable.invoices, []);
    assert.equal(unavailable.payment, null);
    const linksUnavailable = await db.transaction(trx => readAdminWorkspaceBillingLinks(trx, workspaceId));
    assert.equal(linksUnavailable.providerStatus, 'unavailable');
    assert.equal(linksUnavailable.customerUrl, null);
    assert.equal(linksUnavailable.subscriptionUrl, null);
    assert.deepEqual(linksUnavailable.invoices, []);
  } finally {
    if (billingSandboxFlag === undefined) delete process.env.BILLING_SANDBOX_ENABLED;
    else process.env.BILLING_SANDBOX_ENABLED = billingSandboxFlag;
    await db('workspaceSubscriptions').where({ workspaceId }).update({ customerId: null });
  }

  console.log('Admin billing rehearsal passed: scoped reads, concurrent/repeated webhook scheduling, existing worker reconciliation, eligibility/scope/deletion guards and provider availability.');
} finally {
  await cleanup().catch(error => console.error('Admin billing read rehearsal cleanup failed:', error.message));
  await db.destroy();
}
