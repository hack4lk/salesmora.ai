import { expireEstimates, scheduleEstimateReminders, type Knex } from "@salesmora/data";

export async function startEstimateExpiry(db: Knex) {
  for (const table of ["estimates", "estimate_activity", "estimate_deliveries", "estimateNotifications"]) {
    if (!await db.schema.hasTable(table)) {
      throw new Error("Apply estimate migrations before starting scheduled expiry.");
    }
  }
  let stopped = false;
  let running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = (async () => {
      const expiry = await expireEstimates(db);
      const reminders = await scheduleEstimateReminders(db);
      return { ...expiry, ...reminders };
    })().then(result => {
      if (result.expired || result.reminders) console.log(JSON.stringify({ event: "worker.estimate_expiry_completed", ...result }));
    }).catch(() => {
      console.error(JSON.stringify({ event: "worker.estimate_expiry_error" }));
    }).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 60_000);
  tick();
  console.log(JSON.stringify({ event: "worker.estimate_expiry_started", intervalMs: 60_000 }));
  return async () => { stopped = true; clearInterval(timer); await running; };
}
