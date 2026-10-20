import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize } from '@salesmora/domain';
import { loadWorkspaceAuthorization, AuthorizationAccessError } from './authorization/store';
import { lockWorkspaceBilling } from './billing/checkout';
import { stripeSandbox, type Stripe } from './billing/stripe';

export class AccountDeletionError extends Error {}
const providerId = (value: string | { id: string } | null) => typeof value === 'string' ? value : value?.id;

/** Only authenticated browser requests may call this, with a server password verifier. No model tool. */
export async function requestAccountDeletion(db: Knex, userId: string, workspaceId: string, confirmation: string,
  verify: (hash: string) => Promise<boolean>) {
  return db.transaction(async trx => {
    await lockWorkspaceBilling(trx, workspaceId);
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate().first();
    if (!workspace || workspace.deletionRequestedAt) throw new AuthorizationAccessError();
    const context = await loadWorkspaceAuthorization(trx, { userId, workspaceId }, ['workspace.delete']);
    const user = await trx('users').where({ id: userId }).forUpdate().first();
    if (!user || user.deletionRequestedAt) throw new AuthorizationAccessError();
    const owned = await trx('workspaces').where({ ownerId: userId }).first('id');
    const owner = workspace.ownerId === userId;
    if (owned && (!owner || owned.id !== workspaceId)) throw new AccountDeletionError('Open Account settings in the workspace you own before deleting. Ownership must be transferred before deleting only your account.');
    if (owner && !authorize(context, { permission: 'workspace.delete' }).allowed) throw new AuthorizationAccessError();
    if (confirmation !== (owner ? workspace.businessName : user.email)) throw new AccountDeletionError('The confirmation does not match.');
    const credential = await trx('accounts').where({ userId, providerId: 'credential' }).forUpdate().first('password');
    if (!credential?.password || !await verify(credential.password)) throw new AccountDeletionError('Your current password could not be verified.');
    const id = randomUUID();
    await trx('accountDeletionRequests').insert({ id, userId, workspaceId: owner ? workspaceId : null });
    await trx('users').where({ id: userId }).update({ deletionRequestedAt: trx.fn.now() });
    if (owner) {
      await trx('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: trx.fn.now() });
      await trx('workspaceInvitations').where({ workspaceId }).whereNot('status', 'accepted').update({ status: 'revoked', tokenHash: null });
      await trx('billingAudit').insert({ workspaceId, actorId: userId, action: 'workspace.deletion_requested', details: JSON.stringify({ requestId: id }) });
    }
    // Personal access ends in this commit, including every device. Workspace members are denied by the tombstone.
    await trx('sessions').where({ userId }).delete();
    await trx('chatTurns').where(query => { query.where({ userId }); if (owner) query.orWhere({ workspaceId }); })
      .whereIn('state', ['accepted', 'running']).update({ state: 'cancelled', finishedAt: trx.fn.now() });
    return { accepted: true as const };
  });
}

/** Stripe resources are discovered from the server mapping, never browser-supplied IDs. */
export async function cancelDeletedWorkspaceBilling(stripe: Stripe, row: { customerId: string | null; subscriptionId: string | null }, workspaceId: string) {
  if (!row.customerId) { if (row.subscriptionId) throw Error('Missing customer mapping'); return; }
  const customer = await stripe.customers.retrieve(row.customerId);
  if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) throw Error('Customer mapping mismatch');
  for await (const session of stripe.checkout.sessions.list({ customer: row.customerId, limit: 100 })) {
    if (session.livemode || session.metadata?.workspaceId !== workspaceId || session.client_reference_id !== workspaceId) throw Error('Checkout mapping mismatch');
    if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
  }
  // Includes a subscription purchased just before deletion but not yet reconciled by its webhook.
  for await (const sub of stripe.subscriptions.list({ customer: row.customerId, status: 'all', limit: 100 })) {
    if (sub.livemode || providerId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId) throw Error('Subscription mapping mismatch');
    if (['canceled', 'incomplete_expired'].includes(sub.status)) continue;
    if ((sub.pending_update || sub.status === 'incomplete') && sub.latest_invoice) {
      const invoice = await stripe.invoices.retrieve(providerId(sub.latest_invoice)!);
      if (invoice.livemode || providerId(invoice.customer) !== row.customerId || providerId(invoice.parent?.subscription_details?.subscription ?? null) !== sub.id) throw Error('Invoice mapping mismatch');
      if (invoice.status === 'open') {
        try { await stripe.invoices.voidInvoice(invoice.id); }
        catch { if ((await stripe.invoices.retrieve(invoice.id)).status !== 'paid') throw Error('Payment recovery cancellation unverified'); }
      }
    }
    if (sub.schedule) {
      const scheduleId = providerId(sub.schedule)!;
      const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
      if (schedule.livemode || providerId(schedule.customer) !== row.customerId || providerId(schedule.subscription) !== sub.id) throw Error('Schedule mapping mismatch');
      if (['active', 'not_started'].includes(schedule.status)) await stripe.subscriptionSchedules.cancel(scheduleId, { invoice_now: false, prorate: false });
    }
    const latest = await stripe.subscriptions.retrieve(sub.id);
    const canceled = latest.status === 'canceled' ? latest : await stripe.subscriptions.cancel(sub.id, { invoice_now: false, prorate: false });
    if (canceled.status !== 'canceled' || canceled.livemode) throw Error('Cancellation unverified');
  }
  if (row.subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
    if (sub.livemode || providerId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || !['canceled', 'incomplete_expired'].includes(sub.status)) throw Error('Cancellation unverified');
  }
}

/** Bounded durable worker queue. A crash after provider cancellation safely retries before the atomic purge. */
export async function processAccountDeletions(db: Knex, stripeFactory = stripeSandbox) {
  const requests = await db('accountDeletionRequests').where({ state: 'pending' }).where('retryAt', '<=', db.fn.now()).orderBy('requestedAt').limit(5).select('id', 'workspaceId');
  for (const candidate of requests) {
    try {
      await db.transaction(async trx => {
        // Same order as billing mutations/reconciliation, then workspace authorization locks.
        if (candidate.workspaceId) await lockWorkspaceBilling(trx, candidate.workspaceId);
        const request = await trx('accountDeletionRequests').where({ id: candidate.id, state: 'pending' }).forUpdate().skipLocked().first();
        if (!request) return;
        const memberships = await trx('workspaceMemberships').where({ userId: request.userId }).select('workspaceId');
        const ids = [...new Set<string>([...memberships.map(m => m.workspaceId), ...(request.workspaceId ? [request.workspaceId] : [])])].sort();
        if (ids.length) await trx('workspaces').whereIn('id', ids).orderBy('id').forUpdate().select('id');
        const user = await trx('users').where({ id: request.userId }).forUpdate().first();
        if (!user?.deletionRequestedAt) throw Error('Deletion identity changed');
        if (request.workspaceId) {
          const workspace = await trx('workspaces').where({ id: request.workspaceId, ownerId: request.userId }).first();
          if (!workspace?.deletionRequestedAt) throw Error('Deletion workspace changed');
          const billing = await trx('workspaceSubscriptions').where({ workspaceId: request.workspaceId }).forUpdate().first();
          if (billing) {
            if (!billing.customerId && billing.customerCreationStartedAt) {
              // Recover an uncertain customer creation only within Stripe's guaranteed idempotency window.
              if (Date.now() - new Date(billing.customerCreationStartedAt).getTime() > 23 * 3600000) throw Error('Customer recovery required');
              const customer = await stripeFactory().customers.create({ metadata: { workspaceId: request.workspaceId }, email: user.email }, { idempotencyKey: `salesmora-customer-${request.workspaceId}` });
              if (customer.livemode || customer.metadata.workspaceId !== request.workspaceId) throw Error('Customer mapping mismatch');
              billing.customerId = customer.id;
              await trx('workspaceSubscriptions').where({ workspaceId: request.workspaceId }).update({ customerId: customer.id });
            }
            if (billing.customerId) {
              const stripe = stripeFactory();
              const recoveries = await trx('billingRenewalRecoveries').where({workspaceId:request.workspaceId}).whereIn('state',['applying','action','pending']);
              for (const recovery of recoveries) {
                const invoice=await stripe.invoices.retrieve(recovery.invoiceId);
                if(invoice.livemode || providerId(invoice.customer)!==billing.customerId || providerId(invoice.parent?.subscription_details?.subscription ?? null)!==billing.subscriptionId) throw Error('Recovery invoice mapping mismatch');
                if(invoice.status==='open'){
                  try {await stripe.invoices.voidInvoice(invoice.id);}
                  catch {if((await stripe.invoices.retrieve(invoice.id)).status!=='paid')throw Error('Recovery cancellation unverified');}
                }
              }
              const attempts = await trx('billingPaymentMethods').where({ workspaceId: request.workspaceId }).whereNotNull('setupIntentId');
              for (const attempt of attempts) {
                const setup = await stripe.setupIntents.retrieve(attempt.setupIntentId);
                if (setup.livemode || providerId(setup.customer) !== billing.customerId || setup.metadata?.workspaceId !== request.workspaceId || setup.metadata?.attemptId !== attempt.id) throw Error('Setup mapping mismatch');
                if (!['succeeded','canceled'].includes(setup.status)) await stripe.setupIntents.cancel(setup.id);
              }
            }
            if (billing.customerId || billing.subscriptionId) await cancelDeletedWorkspaceBilling(stripeFactory(), billing, request.workspaceId);
          }
        }
        const threads = trx('chatThreads').where(query => { query.where({ userId: request.userId }); if (request.workspaceId) query.orWhere({ workspaceId: request.workspaceId }); }).select('id');
        const turns = trx('chatTurns').whereIn('threadId', threads.clone()).select(trx.raw('id::text'));
        for (const table of ['checkpoint_writes', 'checkpoint_blobs', 'checkpoints']) await trx(table).whereIn('thread_id', turns.clone()).delete();
        await trx('chatThreads').whereIn('id', threads.clone()).delete();
        // Shared business records survive teammate deletion; assignments must not block membership removal.
        await trx('leads').where({ ownerId: request.userId }).update({ ownerId: null });
        await trx('aiUsageCalls').where({ userId: request.userId }).update({ userId: null });
        if (request.workspaceId) {
          await trx('leads').where({ workspaceId: request.workspaceId }).delete();
          for (const table of ['billingRenewalRecoveries', 'billingPaymentMethods', 'billingPlanChanges', 'billingCheckoutAttempts', 'workspaceSubscriptions', 'workspaceAITokenBudgets']) await trx(table).where({ workspaceId: request.workspaceId }).delete();
          await trx('billingAudit').insert({ workspaceId: request.workspaceId, actorId: request.userId, action: 'workspace.deletion_completed', details: JSON.stringify({ requestId: request.id }) });
          await trx('workspaces').where({ id: request.workspaceId }).delete();
        }
        await trx('verifications').where({ value: request.userId }).delete();
        await trx('users').where({ id: request.userId }).delete();
        await trx('accountDeletionRequests').where({ id: request.id }).update({ state: 'completed', completedAt: trx.fn.now(), lastError: null });
      });
    } catch {
      // Never persist provider messages, passwords, email addresses or stack traces.
      await db('accountDeletionRequests').where({ id: candidate.id, state: 'pending' }).update({ attempts: db.raw('attempts + 1'), retryAt: new Date(Date.now() + 60000), lastError: 'retry_required' });
      console.error(JSON.stringify({ event: 'worker.account_deletion_retry_pending' }));
    }
  }
}
