import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { billingPaymentMethodPreparationSchema } from '@salesmora/contracts';
import { lockWorkspaceBilling, ownerBilling } from './checkout';
import { stripeSandbox, type Stripe } from './stripe';
const id = (v: string | { id: string } | null | undefined) => typeof v === 'string' ? v : v?.id ?? null;

async function mapping(trx: Knex.Transaction, stripe: Stripe, userId: string, workspaceId: string) {
  await ownerBilling(trx, userId, workspaceId);
  const row = await trx('workspaceSubscriptions').where({ workspaceId }).forUpdate().first();
  if (!row?.customerId || !row.subscriptionId) throw Error('Subscription required');
  if (await trx('billingRenewalRecoveries').where({workspaceId}).whereIn('state',['applying','action','pending']).first()) throw Error('Resolve renewal payment first');
  if (await trx('billingPlanChanges').where({ workspaceId }).whereIn('state', ['applying','payment']).first()) throw Error('Resolve plan payment first');
  const customer = await stripe.customers.retrieve(row.customerId);
  const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
  if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId || sub.livemode || id(sub.customer) !== customer.id || sub.metadata.workspaceId !== workspaceId || !['active','past_due','unpaid'].includes(sub.status)) throw Error('Billing mapping changed');
  return { customer, sub };
}
async function verifiedCard(stripe: Stripe, setupId: string, row: { id: string; workspaceId: string; customerId: string }) {
  const setup = await stripe.setupIntents.retrieve(setupId);
  if (setup.livemode || id(setup.customer) !== row.customerId || setup.metadata?.workspaceId !== row.workspaceId || setup.metadata?.attemptId !== row.id || setup.usage !== 'off_session') throw Error('Setup scope mismatch');
  if (setup.status !== 'succeeded') return { setup, method: null };
  const methodId = id(setup.payment_method);
  if (!methodId) throw Error('Missing verified card');
  const method = await stripe.paymentMethods.retrieve(methodId);
  if (method.livemode || id(method.customer) !== row.customerId || method.type !== 'card' || !method.card) throw Error('Card scope mismatch');
  return { setup, method };
}
/** Commit the intent before Stripe creation. Client secrets are returned only to the authorized Owner. */
export async function prepareWorkspaceCard(db: Knex, userId: string, workspaceId: string) {
  const stripe = stripeSandbox();
  const attemptId = await db.transaction(async trx => {
    await lockWorkspaceBilling(trx, workspaceId);
    const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
    const existing = await trx('billingPaymentMethods').where({ workspaceId }).whereIn('state', ['creating','ready','applying']).orderBy('createdAt','desc').first();
    if (existing) {
      if (existing.state === 'applying') throw Error('Card update requires reconciliation');
      const stale = existing.actorId !== userId || existing.customerId !== customer.id || existing.subscriptionId !== sub.id || existing.customerDefault !== id(customer.invoice_settings.default_payment_method) || existing.subscriptionDefault !== id(sub.default_payment_method);
      if (!stale) return existing.id as string;
      if (!existing.setupIntentId) throw Error('Setup creation requires reconciliation');
      const { setup } = await verifiedCard(stripe, existing.setupIntentId, existing);
      if (!['succeeded','canceled'].includes(setup.status)) await stripe.setupIntents.cancel(setup.id);
      await trx('billingPaymentMethods').where({id:existing.id}).update({state:'cancelled'});
    }
    const attempt = randomUUID();
    await trx('billingPaymentMethods').insert({ id: attempt, workspaceId, actorId: userId, customerId: customer.id, subscriptionId: sub.id, customerDefault: id(customer.invoice_settings.default_payment_method), subscriptionDefault: id(sub.default_payment_method) });
    return attempt;
  });
  return db.transaction(async trx => {
    await lockWorkspaceBilling(trx, workspaceId);
    const current = await mapping(trx, stripe, userId, workspaceId);
    const row = await trx('billingPaymentMethods').where({ id: attemptId, workspaceId, actorId: userId }).forUpdate().first();
    if (!row || !['creating','ready'].includes(row.state) || row.customerId !== current.customer.id || row.subscriptionId !== current.sub.id) throw Error('Card update changed');
    if (!row.setupIntentId) {
      if (Date.now() - new Date(row.createdAt).getTime() > 23 * 3600000) throw Error('Setup creation requires reconciliation');
      const setup = await stripe.setupIntents.create({ customer: row.customerId, allowed_payment_method_types: ['card'], usage: 'off_session', metadata: { workspaceId, attemptId } }, { idempotencyKey: `salesmora-card-setup-${attemptId}` });
      if (setup.livemode) throw Error('Unexpected provider mode');
      row.setupIntentId = setup.id;
      await trx('billingPaymentMethods').where({ id: attemptId }).update({ setupIntentId: setup.id, state: 'ready' });
    }
    const { setup, method } = await verifiedCard(stripe, row.setupIntentId, row);
    if (setup.status === 'canceled' || !setup.client_secret) {
      await trx('billingPaymentMethods').where({ id: attemptId }).update({ state: 'cancelled' });
      return null;
    }
    return billingPaymentMethodPreparationSchema.parse({ attemptId, clientSecret: setup.client_secret, confirmed: !!method, card: method?.card ? { brand: method.card.brand, last4: method.card.last4, expMonth: method.card.exp_month, expYear: method.card.exp_year } : null });
  });
}
/** Consent and verified ownership commit before any default changes; retries cannot create charges. */
export async function saveWorkspaceCard(db: Knex, userId: string, workspaceId: string, attemptId: string) {
  const stripe = stripeSandbox();
  await db.transaction(async trx => {
    await lockWorkspaceBilling(trx, workspaceId);
    const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
    const row = await trx('billingPaymentMethods').where({ id: attemptId, workspaceId, actorId: userId }).forUpdate().first();
    if (!row || !row.setupIntentId || !['ready','applying','complete'].includes(row.state) || row.customerId !== customer.id || row.subscriptionId !== sub.id) throw Error('Card update changed');
    if (row.state !== 'ready') return;
    if (row.customerDefault !== id(customer.invoice_settings.default_payment_method) || row.subscriptionDefault !== id(sub.default_payment_method)) throw Error('Default card changed elsewhere');
    const { method } = await verifiedCard(stripe, row.setupIntentId, row);
    if (!method) throw Error('Card verification incomplete');
    await trx('billingPaymentMethods').where({ id: attemptId }).update({ state: 'applying', paymentMethodId: method.id, consentedAt: trx.fn.now() });
  });
  await applyWorkspaceCard(db, userId, workspaceId, attemptId);
  return { saved: true as const };
}
async function applyWorkspaceCard(db: Knex, userId: string, workspaceId: string, attemptId: string) {
  const stripe = stripeSandbox();
  await db.transaction(async trx => {
    await lockWorkspaceBilling(trx, workspaceId);
    const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
    const row = await trx('billingPaymentMethods').where({ id: attemptId, workspaceId, actorId: userId }).forUpdate().first();
    if (row?.state === 'complete') return;
    if (!row || row.state !== 'applying' || !row.consentedAt || !row.setupIntentId || row.customerId !== customer.id || row.subscriptionId !== sub.id) throw Error('Card update changed');
    const { method } = await verifiedCard(stripe, row.setupIntentId, row);
    if (!method || method.id !== row.paymentMethodId) throw Error('Verified card changed');
    const customerDefault = id(customer.invoice_settings.default_payment_method), subscriptionDefault = id(sub.default_payment_method);
    if (![row.customerDefault, method.id].includes(customerDefault) || ![row.subscriptionDefault, method.id].includes(subscriptionDefault)) throw Error('Default card changed elsewhere');
    if ((customerDefault !== method.id || subscriptionDefault !== method.id) && Date.now()-new Date(row.consentedAt).getTime()>23*3600000) throw Error('Card update requires reconciliation');
    if (customerDefault !== method.id) await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: method.id } }, { idempotencyKey: `salesmora-card-customer-${attemptId}` });
    if (subscriptionDefault !== method.id) await stripe.subscriptions.update(sub.id, { default_payment_method: method.id }, { idempotencyKey: `salesmora-card-subscription-${attemptId}` });
    // Confirm both defaults before the UI can claim success, including a partial-write recovery.
    const verified = await mapping(trx, stripe, userId, workspaceId);
    if (id(verified.customer.invoice_settings.default_payment_method) !== method.id || id(verified.sub.default_payment_method) !== method.id) throw Error('Default card update unverified');
    await trx('billingPaymentMethods').where({ id: attemptId }).update({ state: 'complete', completedAt: trx.fn.now() });
    await trx('billingAudit').insert({ workspaceId, actorId: userId, action: 'payment_method.updated', details: JSON.stringify({ attemptId }) });
  });
}
/** Repair only previously authorized, consented changes; no session or client secret is persisted. */
export async function reconcileWorkspaceCards(db: Knex) {
  const rows = await db('billingPaymentMethods').where({ state: 'applying' }).where('retryAt','<=',db.fn.now()).orderBy('retryAt').limit(10).select('id','workspaceId','actorId','attempts');
  for (const row of rows) {
    try { await applyWorkspaceCard(db, row.actorId, row.workspaceId, row.id); }
    catch {
      await db('billingPaymentMethods').where({id:row.id,state:'applying'}).update({attempts:db.raw('attempts + 1'),retryAt:new Date(Date.now()+Math.min(3600000,30000*2**Math.min(Number(row.attempts),7)))});
      console.error(JSON.stringify({ event: 'worker.card_update_retry_pending' }));
    }
  }
}
