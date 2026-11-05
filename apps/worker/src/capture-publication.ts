import { processCapturePublications, purgeCaptureSubmissionAbuse, type Knex } from '@salesmora/data';
import { captureSchedulerConfiguration, workerCaptureDelivery } from './capture-delivery.js';
/** Independent opt-in: retention mode never implicitly grants capture delivery. */
export async function startCapturePublications(db: Knex, env: NodeJS.ProcessEnv = process.env, request: typeof fetch = fetch) {
  const config = captureSchedulerConfiguration(env);
  if (!config) return async () => {};
  if (!await db.schema.hasTable('capturePublicationTransitions')) throw Error('Apply capture publication migrations before starting the worker.');
  const authority = workerCaptureDelivery(config, request), workspaces = config.workspaces;
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processCapturePublications(db, ['leadCapture.read','leadCapture.activate'], authority, 100, workspaces)
      .then(async count => { if (await db.schema.hasTable('captureSubmissionAttempts')) await purgeCaptureSubmissionAbuse(db); if (count) console.log(JSON.stringify({ event: 'worker.capture_publications_applied', count })); })
      .catch(() => console.error(JSON.stringify({ event: 'worker.capture_publications_retry_pending' })))
      .finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 30_000); tick();
  console.log(JSON.stringify({ event: 'worker.capture_scheduler_started', workspaceCount: config.workspaces.length }));
  return async () => { stopped = true; clearInterval(timer); await running; };
}
