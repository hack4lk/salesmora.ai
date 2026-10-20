import { loadCorpus } from '@salesmora/data/knowledge-ingestion';
import { createDatabase, createOpenAIEmbedder, createAIUsageRecorder, ingestArticle, retireMissingArticles } from '@salesmora/data';
import { stagingTarget } from './staging-target.js';
import { publicationMode, publicationPlan } from './publication-plan.js';

async function main() {
  const databaseURL = stagingTarget(process.env);
  const articles = await loadCorpus();
  const plan = publicationPlan(articles);
  const mode = publicationMode(process.argv.slice(2), plan.digest);
  // Preview performs no database, Redis or provider requests.
  if (mode === 'preview') { console.log(JSON.stringify({ event: 'knowledge.preview', ...plan })); return; }
  if (!process.env.OPENAI_API_KEY?.trim()) throw Error('Staging embedding credentials are missing.');
  const db = createDatabase(databaseURL);
  const deadline = AbortSignal.timeout(10 * 60_000);
  let connection: Awaited<ReturnType<typeof db.client.acquireConnection>> | undefined;
  let locked = false;
  try {
    connection = await db.client.acquireConnection();
    const lock = await db.raw('SELECT pg_try_advisory_lock(hashtext(?)) AS locked', ['staging-help-publication']).connection(connection);
    locked = lock.rows[0]?.locked === true;
    if (!locked) throw Error('A staging publication is already running.');
    const embedder = createOpenAIEmbedder(process.env.OPENAI_API_KEY, undefined, { recorder: createAIUsageRecorder(db), phase: 'corpus_embedding' });
    const bounded = { ...embedder, embed: (texts: string[], signal?: AbortSignal) => embedder.embed(texts, signal ? AbortSignal.any([deadline, signal]) : deadline) };
    let published = 0, unchanged = 0;
    for (const article of articles) {
      deadline.throwIfAborted();
      const result = await ingestArticle(db, article, bounded);
      if (result.status === 'superseded') throw Error('Corpus changed during publication.');
      if (result.status === 'published') published++; else unchanged++;
    }
    // Retire omissions only after all reviewed articles have published successfully.
    await retireMissingArticles(db, articles.map(article => article.slug));
    console.log(JSON.stringify({ event: 'knowledge.published', ...plan, published, unchanged }));
  } finally {
    try {
      if (connection && locked) await db.raw('SELECT pg_advisory_unlock(hashtext(?))', ['staging-help-publication']).connection(connection);
    } finally {
      try { if (connection) await db.client.releaseConnection(connection); }
      finally { await db.destroy(); }
    }
  }
}
void main().catch(() => { console.error(JSON.stringify({ event: 'knowledge.publication_failed' })); process.exitCode = 1; });
