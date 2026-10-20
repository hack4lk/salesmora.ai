import { reconcileRenewalRecoveries, reconcileWorkspaceCards, processBillingEvents, reconcileWorkspaceSubscription, sandboxBillingEnabled, stripeSandbox, type Knex } from '@salesmora/data';

/** Durable inbox survives web/worker restarts; no Stripe calls unless explicitly enabled. */
export async function startBillingReconciliation(db: Knex) {
  if (!sandboxBillingEnabled()) return;
  stripeSandbox();
  for (const table of ['workspaceSubscriptions','billingWebhookEvents','billingPaymentMethods','billingRenewalRecoveries']) if (!await db.schema.hasTable(table)) throw Error('Apply billing migrations before enabling billing.');
  let stopped = false;
  let running: Promise<void> | undefined;
  async function tick() {
    await processBillingEvents(db);
    await reconcileWorkspaceCards(db);
    await reconcileRenewalRecoveries(db);
    // Repair missed events and expired grace periods; oldest checked workspaces rotate first.
    const rows = await db('workspaceSubscriptions').where(query => query.whereNotNull('subscriptionId').orWhereNot('intendedPlan','free')).where('updatedAt','<',new Date(Date.now()-5*60000)).orderBy('updatedAt').limit(10);
    for (const row of rows) {
      try { await reconcileWorkspaceSubscription(db,row.workspaceId); }
      catch {
        // A failing workspace must not starve the rest of the reconciliation backlog.
        await db('workspaceSubscriptions').where({workspaceId:row.workspaceId}).update({updatedAt:db.fn.now()});
        console.error(JSON.stringify({event:'worker.billing_reconciliation_retry_pending'}));
      }
    }
  }
  function start() {
    if (stopped || running) return;
    running = tick().catch(() => { console.error(JSON.stringify({event:'worker.billing_retry_pending'})); }).finally(() => {running=undefined;});
  }
  const interval = setInterval(start,5000);
  start();
  return async () => {stopped=true;clearInterval(interval);await running;};
}
