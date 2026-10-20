import { Queue, Worker } from 'bullmq';
import { cleanupExpiredChat, type Knex } from '@salesmora/data';
import type { WorkerConfiguration } from './config.js';

/** Shared local/production lifecycle with environment-specific durable scheduling. */
export async function startChatRetention(db: Knex, config: WorkerConfiguration) {
  const name = `${config.queueName}-chat-retention`;
  const connection = { ...config.connection, maxRetriesPerRequest: null };
  const queue = new Queue(name, { connection });
  queue.on('error', () => console.error(JSON.stringify({ event: 'worker.queue_error', task: 'retention' })));
  const worker = new Worker(name, async job => {
    if (job.name !== 'expire-chat') throw Error('Unknown chat maintenance job');
    // Bound each run to 1,000 threads. A backlog drains on subsequent daily runs.
    try {
      let deletedThreads = 0;
      let backlogPossible = false;
      for (let batch = 0; batch < 10; batch++) {
        const result = await cleanupExpiredChat(db);
        deletedThreads += result.deletedThreads;
        backlogPossible = batch === 9 && result.scannedThreads === 100;
        if (result.scannedThreads < 100 || result.deletedThreads === 0) break;
      }
      console.log(JSON.stringify({ event: 'worker.retention_completed', deletedThreads, backlogPossible }));
      return { deletedThreads };
    } catch { throw Error('Chat retention failed'); }
  }, { connection, concurrency: 1 });
  worker.on('error', () => console.error(JSON.stringify({ event: 'worker.queue_error', task: 'retention' })));
  worker.on('failed', () => console.error(JSON.stringify({ event: 'worker.job_failed', task: 'retention' })));
  try {
    await worker.waitUntilReady();
    await queue.upsertJobScheduler('daily-chat-retention', { pattern: '0 3 * * *', tz: 'UTC' }, {
      name: 'expire-chat', data: {}, opts: { attempts: 3, backoff: { type: 'exponential', delay: 60_000 }, removeOnComplete: 10, removeOnFail: 10 },
    });
  } catch (error) { await Promise.allSettled([worker.close(), queue.close()]); throw error; }
  return async () => { const results = await Promise.allSettled([worker.close(), queue.close()]); if (results.some(result => result.status === 'rejected')) throw Error('Retention shutdown incomplete'); };
}
