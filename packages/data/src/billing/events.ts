import {workspaceSeatUsage} from './entitlements';
import { randomUUID } from 'node:crypto';
import { billingCheckoutRequestSchema } from '@salesmora/contracts';
import type { Knex } from 'knex';
import { loadWorkspaceAuthorization } from '../authorization/store';
import { authorize } from '@salesmora/domain';
import { getWorkspacePlan } from '@salesmora/domain';
import { stripeSandbox, stripePlanPrice, type Stripe } from './stripe';
import { lockWorkspaceBilling } from './checkout';
const supported = new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.pending_update_applied','customer.subscription.pending_update_expired','invoice.paid','invoice.payment_failed','invoice.payment_action_required']);
export async function recordBillingEvent(db: Knex, event: Stripe.Event) {
  if (event.livemode || event.account) throw Error('Unexpected event scope.');
  if (!supported.has(event.type)) return;
  const objectId = 'id' in event.data.object ? event.data.object.id : undefined;
  if (!objectId || !/^(cs_test_|sub_|in_)/.test(objectId)) throw Error('Invalid event object.');
  await db('billingWebhookEvents').insert({id:event.id,type:event.type,objectId}).onConflict('id').ignore();
}
const objectId = (value: string | {id:string} | null | undefined) => typeof value === 'string' ? value : value?.id;

/** Lock before fetching provider state: delayed events cannot apply an older snapshot. */
export async function reconcileWorkspaceSubscription(db: Knex, workspaceId: string) {
  const stripe = stripeSandbox();
  await db.transaction(async trx => {
    await lockWorkspaceBilling(trx,workspaceId);
    if (!await trx('workspaces').where({id:workspaceId}).whereNull('deletionRequestedAt').forUpdate().first('id')) return;
    const row = await trx('workspaceSubscriptions').where({workspaceId}).forUpdate().first();
    if (!row) return;
    let subscriptionId = row.subscriptionId as string | null;
    let confirmedAttempt: {id:string; plan:'standard'|'premium'; priceId:string} | undefined;
    if (!subscriptionId) {
      const attempt = await trx('billingCheckoutAttempts').where({workspaceId}).whereNotNull('sessionId').whereIn('status',['open','complete']).orderBy('createdAt','desc').first();
      if (!attempt) { await trx('workspaceSubscriptions').where({workspaceId}).update({updatedAt:trx.fn.now()}); return; }
      const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
      if (session.livemode || session.mode !== 'subscription' || objectId(session.customer) !== row.customerId || session.client_reference_id !== workspaceId || session.metadata?.workspaceId !== workspaceId) throw Error('Checkout mapping mismatch.');
      if (session.status === 'expired') { await trx('billingCheckoutAttempts').where({id:attempt.id}).update({status:'expired'}); return; }
      if (session.status !== 'complete' || session.payment_status !== 'paid') { await trx('workspaceSubscriptions').where({workspaceId}).update({updatedAt:trx.fn.now()}); return; }
      subscriptionId = objectId(session.subscription) ?? null;
      if (!subscriptionId || row.intendedPlan !== attempt.plan) throw Error('Subscription mapping mismatch.');
      confirmedAttempt = attempt;
    }
    if (!subscriptionId) return;
    const sub = await stripe.subscriptions.retrieve(subscriptionId,{expand:['latest_invoice']});
    if (sub.livemode || objectId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || sub.items.data.length !== 1 || sub.items.data[0].quantity !== 1) throw Error('Subscription scope mismatch.');
    const item = sub.items.data[0];
    const plan = (['standard','premium'] as const).find(id => stripePlanPrice(id) === item.price.id);
    if (!plan || item.price.currency !== 'usd' || item.price.unit_amount !== getWorkspacePlan(plan).monthlyPriceCents || item.price.recurring?.interval !== 'month' || item.price.recurring.interval_count !== 1) throw Error('Unrecognized subscription price.');
    if (confirmedAttempt && (confirmedAttempt.plan !== plan || confirmedAttempt.priceId !== item.price.id)) throw Error('Paid intent mismatch.');
    const invoice = typeof sub.latest_invoice === 'object' && sub.latest_invoice ? sub.latest_invoice : null;
    const paid = sub.status === 'active' && invoice?.status === 'paid';
    // Grace starts from the authoritative failed-renewal invoice, never from event delivery time.
    const recoveryUntil = sub.status === 'past_due' && invoice ? new Date(invoice.created*1000+7*86400000) : null;
    const grace = recoveryUntil !== null && recoveryUntil.getTime()>Date.now() && row.subscriptionId !== null;
    const pendingPaid = sub.status === 'active' && row.paidThrough && new Date(row.paidThrough).getTime()>Date.now();
    const effectivePlan = paid || grace ? plan : pendingPaid ? row.plan : 'free';
    await trx('workspaceSubscriptions').where({workspaceId}).update({subscriptionId:sub.id,plan:effectivePlan,status:sub.status,priceId:item.price.id,cancelAtPeriodEnd:sub.cancel_at_period_end,paidThrough:paid ? new Date(item.current_period_end*1000) : row.paidThrough,recoveryUntil,updatedAt:trx.fn.now()});
    // Resolve durable intents after verified provider transitions, including expired upgrades.
    const changes = await trx('billingPlanChanges').where({workspaceId}).whereIn('state',['applying','payment','scheduled']);
    for(const change of changes) {
      if(change.kind==='checkout' && paid && change.targetPlan===plan) await trx('billingPlanChanges').where({id:change.id}).update({state:'complete'});
      if(change.kind==='upgrade' && paid && change.targetPlan===plan) await trx('billingPlanChanges').where({id:change.id}).update({state:'complete'});
      if(change.kind==='upgrade' && change.state==='payment' && !sub.pending_update && invoice?.status==='void' && change.targetPlan!==plan) await trx('billingPlanChanges').where({id:change.id}).update({state:'expired'});
      if(change.state==='scheduled' && change.basis?.end*1000<=Date.now()) {
        if(change.kind==='free' && sub.status==='canceled') await trx('billingPlanChanges').where({id:change.id}).update({state:'complete'});
        if(change.kind==='downgrade' && change.targetPlan===plan && paid && objectId(sub.schedule)===change.scheduleId) {
          // The target phase has started; release our schedule so subsequent changes remain possible.
          await stripe.subscriptionSchedules.release(change.scheduleId,{preserve_cancel_date:false},{idempotencyKey:`salesmora-release-${change.id}`});
          await trx('billingPlanChanges').where({id:change.id}).update({state:'complete'});
        }
      }
    }
    if (confirmedAttempt) await trx('billingCheckoutAttempts').where({id:confirmedAttempt.id}).update({status:'complete'});
    if (paid && Array.isArray(row.pendingInvitations) && row.pendingInvitations.length) {
      const owner = await trx('workspaces').where({id:workspaceId}).first('ownerId');
      const invitations = row.pendingInvitations as {email:string;role:'admin'|'office'|'field'}[];
      const seats = await workspaceSeatUsage(trx,workspaceId,new Date());
      const context = await loadWorkspaceAuthorization(trx,{userId:owner.ownerId,workspaceId},['team.invite']);
      const allowed = invitations.every(invite => authorize(context,{permission:'team.invite',targetRole:invite.role}).allowed);
      const capacity = seats<=getWorkspacePlan(plan).limits.teammates;
      // A changed invitation policy/capacity must not roll back a verified paid entitlement.
      if (allowed && capacity) {
        const user = await trx('users').where({id:owner.ownerId}).first('emailVerified');
        await trx('workspaceInvitations').insert(invitations.map(invite => ({...invite,id:randomUUID(),workspaceId,inviterId:owner.ownerId,status:user.emailVerified?'queued':'pending_verification'}))).onConflict(['workspaceId','email']).ignore();
        await trx('workspaceSubscriptions').where({workspaceId}).update({pendingInvitations:JSON.stringify([])});
      }

    }
    if (row.plan !== effectivePlan || row.status !== sub.status || row.subscriptionId !== sub.id) await trx('billingAudit').insert({workspaceId,action:'subscription.reconciled',details:JSON.stringify({plan:effectivePlan,status:sub.status,subscriptionId:sub.id})});
  });
}

/** Durable DB inbox; retries retain only identifiers, never provider/customer payloads. */
export async function processBillingEvents(db: Knex) {
  const stripe = stripeSandbox();
  const events = await db('billingWebhookEvents').whereNull('processedAt').where('retryAt','<=',new Date()).orderBy('receivedAt').limit(10);
  for (const event of events) {
    try {
      let workspaceId: string | undefined;
      let providerSubscriptionId: string | undefined;
      if (event.type.startsWith('checkout.')) workspaceId = (await db('billingCheckoutAttempts').where({sessionId:event.objectId}).first('workspaceId'))?.workspaceId;
      else {
        let subId = event.objectId;
        if (event.type.startsWith('invoice.')) {
          const invoice = await stripe.invoices.retrieve(event.objectId);
          subId = objectId(invoice.parent?.subscription_details?.subscription);
        }
        providerSubscriptionId = subId;
        if (subId) workspaceId = (await db('workspaceSubscriptions').where({subscriptionId:subId}).first('workspaceId'))?.workspaceId;
      }
      if (!workspaceId) {
        // Same sandbox can also contain other projects or the isolated test database.
        // Use provider metadata only to locate an existing local mapping, never to grant access.
        const source = event.type.startsWith('checkout.')
          ? await stripe.checkout.sessions.retrieve(event.objectId)
          : providerSubscriptionId ? await stripe.subscriptions.retrieve(providerSubscriptionId) : null;
        const candidate = billingCheckoutRequestSchema.safeParse({workspaceId:source?.metadata?.workspaceId,action:'refresh'});
        const local = candidate.success ? await db('workspaceSubscriptions').where({workspaceId:candidate.data.workspaceId}).first() : null;
        if (!local || !source || objectId(source.customer) !== local.customerId) {
          await db('billingWebhookEvents').where({id:event.id}).whereNull('processedAt').update({processedAt:db.fn.now()});
          continue;
        }
        // Initial invoice/subscription events may precede checkout completion.
        workspaceId = local.workspaceId;
      }
      if (!workspaceId) throw Error('Workspace mapping is unavailable.');
      await reconcileWorkspaceSubscription(db,workspaceId);
      await db('billingWebhookEvents').where({id:event.id}).whereNull('processedAt').update({processedAt:db.fn.now()});
    } catch {
      const attempts = Number(event.attempts)+1;
      await db('billingWebhookEvents').where({id:event.id}).whereNull('processedAt').update({attempts,retryAt:new Date(Date.now()+Math.min(3600000,5000*2**Math.min(attempts,10)))});
    }
  }
}
