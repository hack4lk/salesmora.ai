import { loadWorkspaceAuthorization } from '../authorization/store';
import { authorize } from '@salesmora/domain';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { WorkspacePlanId } from '@salesmora/contracts';
import { getWorkspacePlan, workspacePlanCatalogVersion } from '@salesmora/domain';
import { stripeSandbox, stripePlanPrice, verifyPlanPrice } from './stripe';

export class BillingAccessError extends Error {}
export async function lockWorkspaceBilling(trx: Knex.Transaction, workspaceId: string) {
  await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`billing:${workspaceId}`]);
}
export async function ownerBilling(trx: Knex, userId: string, workspaceId: string) {
  const query = trx('workspaces as w').join('workspaceMemberships as m','w.id','m.workspaceId').join('users as u','u.id','m.userId').where({'w.id':workspaceId,'w.ownerId':userId,'m.userId':userId,'m.role':'owner'}).select('u.emailVerified','u.email');
  if (trx.isTransaction) query.forShare('w','m');
  const owner = await query.first();
  if (!owner) throw new BillingAccessError('Owner access required.');
  const context = await loadWorkspaceAuthorization(trx,{userId,workspaceId},['billing.manage']);
  if (!authorize(context,{permission:'billing.manage'}).allowed) throw new BillingAccessError('Billing management access required.');
  return owner;
}
export async function billingOnboarding(db: Knex, userId: string, workspaceId: string) {
  await ownerBilling(db,userId,workspaceId);
  const row = await db('workspaceSubscriptions').where({workspaceId}).first();
  if (!row) return null;
  const checkout = await db('billingCheckoutAttempts').where({workspaceId}).whereNotNull('sessionId').first('id');
  return { hasCheckout: !!checkout, intendedPlan: row.intendedPlan as WorkspacePlanId, plan: row.plan as WorkspacePlanId, status: row.status as string };
}
export async function createWorkspaceCheckout(db: Knex, userId: string, workspaceId: string, baseURL: string, retryExpired = true): Promise<{clientSecret:string}> {
  const stripe = stripeSandbox();
  // Commit intent before any external creation; a crash reuses the same provider keys.
  const attemptId = await db.transaction(async trx => {
    await lockWorkspaceBilling(trx,workspaceId);
    await ownerBilling(trx,userId,workspaceId);
    const billing = await trx('workspaceSubscriptions').where({workspaceId}).forUpdate().first();
    if (!billing || !['standard','premium'].includes(billing.intendedPlan) || billing.subscriptionId) throw Error('No initial purchase is available.');
    const existing = await trx('billingCheckoutAttempts').where({workspaceId}).whereIn('status',['creating','open','complete']).orderBy('createdAt','desc').first();
    if (existing) return existing.id as string;
    const id = randomUUID();
    await trx('billingCheckoutAttempts').insert({id,workspaceId,plan:billing.intendedPlan,priceId:stripePlanPrice(billing.intendedPlan)});
    if (!billing.customerId && !billing.customerCreationStartedAt) await trx('workspaceSubscriptions').where({workspaceId}).update({customerCreationStartedAt:trx.fn.now()});
    return id;
  });
  const result = await db.transaction(async trx => {
    await lockWorkspaceBilling(trx,workspaceId);
    const owner = await ownerBilling(trx,userId,workspaceId);
    const billing = await trx('workspaceSubscriptions').where({workspaceId}).forUpdate().first();
    const attempt = await trx('billingCheckoutAttempts').where({id:attemptId,workspaceId}).first();
    if (!billing || !attempt || billing.subscriptionId || billing.intendedPlan !== attempt.plan || !['creating','open','complete'].includes(attempt.status)) throw Error('Purchase state changed.');
    await verifyPlanPrice(stripe,attempt.plan);
    let customerId = billing.customerId as string | null;
    if (!customerId) {
      // Stripe keeps idempotency keys for at least 24h. Never blindly recreate after that window.
      if (!billing.customerCreationStartedAt || Date.now()-new Date(billing.customerCreationStartedAt).getTime()>23*3600000) throw Error('Customer creation requires reconciliation.');
      const customer = await stripe.customers.create({metadata:{workspaceId},email:owner.email},{idempotencyKey:`salesmora-customer-${workspaceId}`});
      if (customer.livemode) throw Error('Unexpected customer mode.');
      customerId = customer.id;
      await trx('workspaceSubscriptions').where({workspaceId}).update({customerId});
    }
    if (attempt.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
      if (session.status === 'open' && session.ui_mode === 'embedded_page' && session.client_secret) return {clientSecret:session.client_secret};
      if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
      if (session.status === 'complete') throw Error('Payment is being confirmed.');
      await trx('billingCheckoutAttempts').where({id:attempt.id}).update({status:'expired'});
      return null;
    }
    if (Date.now()-new Date(attempt.createdAt).getTime()>23*3600000) throw Error('Checkout creation requires reconciliation.');
    const session = await stripe.checkout.sessions.create({
      mode:'subscription',ui_mode:'embedded_page',redirect_on_completion:'never',allowed_payment_method_types:['card'],customer:customerId,line_items:[{price:attempt.priceId,quantity:1}],
      client_reference_id:workspaceId,metadata:{workspaceId},subscription_data:{metadata:{workspaceId}},
    },{idempotencyKey:`salesmora-checkout-${attempt.id}`});
    if (session.livemode || session.ui_mode !== 'embedded_page' || !session.client_secret) throw Error('Unexpected Checkout mode.');
    await trx('billingCheckoutAttempts').where({id:attempt.id}).update({sessionId:session.id,status:'open',expiresAt:new Date(session.expires_at*1000)});
    await trx('billingAudit').insert({workspaceId,actorId:userId,action:'checkout.created',details:JSON.stringify({plan:attempt.plan,catalogVersion:workspacePlanCatalogVersion})});
    return {clientSecret:session.client_secret};
  });
  if (!result && retryExpired) return createWorkspaceCheckout(db,userId,workspaceId,baseURL,false);
  if (!result) throw Error('Checkout expired. Try again.');
  return result;
}

export async function continueWorkspaceFree(db: Knex,userId: string,workspaceId: string) {
  const stripe = stripeSandbox();
  await db.transaction(async trx => {
    await lockWorkspaceBilling(trx,workspaceId); await ownerBilling(trx,userId,workspaceId);
    const row = await trx('workspaceSubscriptions').where({workspaceId}).forUpdate().first();
    if (!row || row.subscriptionId || row.plan !== 'free') throw Error('Manage your subscription in Billing.');
    const attempts = await trx('billingCheckoutAttempts').where({workspaceId}).whereIn('status',['open','creating']);
    for (const attempt of attempts) {
      if (!attempt.sessionId) throw Error('Checkout creation must be recovered before continuing.');
      const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
      if (session.status === 'complete') throw Error('Payment is being confirmed.');
      if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
      await trx('billingCheckoutAttempts').where({id:attempt.id}).update({status:'expired'});
    }
    await trx('workspaceSubscriptions').where({workspaceId}).update({intendedPlan:'free',pendingInvitations:JSON.stringify([]),updatedAt:trx.fn.now()});
    await trx('billingAudit').insert({workspaceId,actorId:userId,action:'onboarding.free',details:JSON.stringify({discardedInvitationDrafts:true,teammateLimit:getWorkspacePlan('free').limits.teammates})});
  });
}
