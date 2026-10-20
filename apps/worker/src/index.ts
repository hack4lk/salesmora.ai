import { startAssignmentEmails } from './assignment-emails.js';
import { startAccountDeletion } from './account-deletion.js';
import { startBillingReconciliation } from './billing.js';
import { startFileProcessing } from './file-processing-queue.js';
import { loadCorpus } from '@salesmora/data/knowledge-ingestion';
import { Worker } from 'bullmq';
import { createDatabase, createOpenAIEmbedder, embeddingSpace, ingestArticle, createAIUsageRecorder } from '@salesmora/data';
import { workerConfiguration } from './config.js';
import { startChatRetention } from './retention.js';

async function main() {
  const config = workerConfiguration();
  const db = createDatabase(config.databaseURL);
  let knowledge: Worker | undefined;
  let stopAssignment: (() => Promise<void>) | undefined;
  let stopDeletion: (() => Promise<void>) | undefined;
  let stopBilling: (() => Promise<void>) | undefined;
  let stopRetention: (() => Promise<void>) | undefined;
  let stopFileProcessing: (() => Promise<void>) | undefined;
  async function close() {
    // All resources are attempted even when one close fails.
    const results = await Promise.allSettled([stopAssignment?.(), stopDeletion?.(), stopRetention?.(), stopBilling?.(), stopFileProcessing?.(), knowledge?.close()]);
    await db.destroy();
    if (results.some(result => result.status === 'rejected')) throw Error('Worker shutdown incomplete');
  }
  try {
    await db.raw('SELECT 1');
    for (const table of ['chatThreads', 'chatTurns', 'checkpoints', 'aiUsageCalls', 'files']) {
      if (!await db.schema.hasTable(table)) throw Error('Apply database migrations before starting the worker');
    }
    if (config.tasks !== 'retention') {
      const embedder = createOpenAIEmbedder(process.env.OPENAI_API_KEY, undefined, { recorder: createAIUsageRecorder(db), phase: 'corpus_embedding' });
      knowledge = new Worker(config.queueName, async job => {
        try {
          if (job.name !== 'embed-help') return { status: 'superseded' };
          const articles = await loadCorpus();
          const article = articles.find(item => item.slug === job.data?.slug && item.version === job.data?.version);
          if (!article || job.data.model !== embeddingSpace.model || job.data.dimensions !== embeddingSpace.dimensions) return { status: 'superseded' };
          return await ingestArticle(db, article, embedder);
        } catch { throw Error('Knowledge ingestion failed'); }
      }, { connection: { ...config.connection, maxRetriesPerRequest: null }, concurrency: 1 });
      knowledge.on('error', () => console.error(JSON.stringify({ event: 'worker.queue_error', task: 'knowledge' })));
      knowledge.on('failed', () => console.error(JSON.stringify({ event: 'worker.job_failed', task: 'knowledge' })));
      await knowledge.waitUntilReady();
    }
    stopRetention = await startChatRetention(db, config);
    stopAssignment = await startAssignmentEmails(db);
    stopDeletion = await startAccountDeletion(db);
    stopBilling = await startBillingReconciliation(db);
    stopFileProcessing = await startFileProcessing(db);
    console.log(JSON.stringify({ event: 'worker.ready', tasks: config.tasks, queue: config.queueName }));
  } catch (err) {
    await close(); throw Error(`Worker startup failed: ${err?.message || String(err)}`);
  }
  let stopping = false;
  async function stop() {
    if (stopping) return; stopping = true;
    // A supervisor can restart after a bounded shutdown; BullMQ recovers stalled jobs.
    const deadline = setTimeout(() => { console.error(JSON.stringify({ event: 'worker.shutdown_timeout' })); process.exit(1); }, 30_000);
    deadline.unref();
    try { await close(); console.log(JSON.stringify({ event: 'worker.stopped' })); }
    catch { process.exitCode = 1; console.error(JSON.stringify({ event: 'worker.shutdown_failed' })); }
    finally { clearTimeout(deadline); }
  }
  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}
const startupDeadline = setTimeout(() => { console.error(JSON.stringify({ event: 'worker.startup_timeout' })); process.exit(1); }, 30_000);
void main().catch((err) => { console.error(JSON.stringify({ event: 'worker.startup_failed', error: err?.message || String(err), stack: err?.stack })); process.exitCode = 1; }).finally(() => clearTimeout(startupDeadline));
