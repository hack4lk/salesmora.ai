import { Queue } from 'bullmq';
import { createDatabase } from '@salesmora/data';
import { workerConfiguration } from './config.js';
async function status() {
  const config = workerConfiguration();
  const db = createDatabase(config.databaseURL);
  const queues = [new Queue(`${config.queueName}-chat-retention`, { connection: { ...config.connection, maxRetriesPerRequest: 1 } }),
    ...(config.tasks === 'retention' ? [] : [new Queue(config.queueName, { connection: { ...config.connection, maxRetriesPerRequest: 1 } })])];
  // Never print connection URLs, raw job failures or customer payloads.
  for (const queue of queues) queue.on('error', () => {});
  try {
    await db.raw('SELECT 1');
    const scheduler = await queues[0].getJobScheduler('daily-chat-retention');
    const reports = await Promise.all(queues.map(async queue => ({ queue: queue.name, workers: await queue.getWorkersCount(), counts: await queue.getJobCounts('waiting', 'active', 'delayed', 'failed') })));
    const assignmentDelivery = await db('assignmentEmailOutbox').select('status').count({count:'*'}).groupBy('status');
    const ready = !!scheduler && reports.every(report => report.workers > 0);
    console.log(JSON.stringify({ event: 'worker.status', ready, retentionScheduled: !!scheduler, assignmentDelivery, queues: reports }));
    if (!ready) process.exitCode = 1;
  } finally { await Promise.allSettled(queues.map(queue => queue.close())); await db.destroy(); }
}
const deadline = setTimeout(() => { console.error(JSON.stringify({ event: 'worker.status_timeout' })); process.exit(1); }, 15_000);
void status().catch(() => { console.error(JSON.stringify({ event: 'worker.status_failed' })); process.exitCode = 1; }).finally(() => clearTimeout(deadline));
