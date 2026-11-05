import { recordExpiredPlanOverrides, type Knex } from '@salesmora/data';

/** Audit only. Limits stop at the end date on their own; this records each expiry for staff. */
export async function startPlanOverrideExpiry(db: Knex) {
  if (!await db.schema.hasColumn('workspaces', 'planOverrideId')) throw Error('Apply plan override migrations before starting worker.');
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = recordExpiredPlanOverrides(db).then(count => { if (count) console.log(JSON.stringify({ event: 'worker.plan_overrides_expired', count })); })
      .catch(() => console.error(JSON.stringify({ event: 'worker.plan_override_expiry_retry_pending' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 3600000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
