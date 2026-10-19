import { processAccountDeletions, type Knex } from '@salesmora/data';

/** Independent of email, AI, billing flags and BullMQ help ingestion. */
export async function startAccountDeletion(db: Knex) {
  if (!await db.schema.hasTable('accountDeletionRequests')) throw Error('Apply account deletion migration before starting worker.');
  let stopped = false;
  let running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processAccountDeletions(db).catch(() => console.error(JSON.stringify({ event: 'worker.account_deletion_failed' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5000);
  tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
