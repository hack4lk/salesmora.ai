import { loadCorpus } from '@salesmora/data/knowledge-ingestion';
import { createHash } from 'node:crypto';
import { Queue, QueueEvents } from 'bullmq';
import { createDatabase, embeddingSpace, retireMissingArticles, stageArticle } from '@salesmora/data';
import { localConfiguration } from './config.js';
const config = localConfiguration();
if (!process.env.OPENAI_API_KEY?.trim()) throw Error('Configure the server-only development embedding key in .env.local');
const db = createDatabase(config.databaseURL);
const queue = new Queue(config.queueName, { connection: { ...config.connection, maxRetriesPerRequest: 1, connectTimeout: 5000 } });
const events = new QueueEvents(config.queueName, { connection: config.connection });
try {
  const articles = await loadCorpus();
  await retireMissingArticles(db, articles.map(article => article.slug));
  let queued = 0;
  for (const article of articles) {
    const staged = await stageArticle(db, article, embeddingSpace);
    if (staged.ready) continue;
    const jobId = createHash('sha256').update(`${article.slug}:${article.version}:${embeddingSpace.model}:${embeddingSpace.dimensions}`).digest('hex');
    const existing = await queue.getJob(jobId);
    if (existing && ['failed', 'completed'].includes(await existing.getState())) await existing.remove();
    const job = await queue.add('embed-help', { slug: article.slug, version: article.version, ...embeddingSpace }, { jobId, attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 50, removeOnFail: 50 });
    const result = await job.waitUntilFinished(events, 120000);
    if (!result || !['published', 'unchanged'].includes(result.status)) throw Error('Corpus changed during seed; rerun to reconcile');
    queued++;
  }
  const count = await db('helpEmbeddings').count({ count: '*' }).first();
  console.log(JSON.stringify({ articles: articles.length, chunks: articles.reduce((n, article) => n + article.sections.length, 0), embeddingRows: Number(count?.count), jobsCompleted: queued, ...embeddingSpace }));
} catch { console.error('Development help seed failed. Check local services, worker and embedding configuration.'); process.exitCode = 1; }
finally { await events.close(); await queue.close(); await db.destroy(); }
