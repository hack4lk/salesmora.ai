import { createHash } from 'node:crypto';
import type { KnowledgeArticle } from '@salesmora/data/knowledge-ingestion';
import { embeddingSpace } from '@salesmora/data';

export function publicationPlan(articles: KnowledgeArticle[]) {
  if (!articles.length || articles.length > 30 || new Set(articles.map(article => article.slug)).size !== articles.length) throw Error('Invalid publication corpus.');
  const inputs = articles.flatMap(article => article.sections.map(section => `${article.title}\n${section.heading}\n${section.text}`));
  const tokenUpperBound = inputs.reduce((total, input) => total + Buffer.byteLength(input, 'utf8') + 1, 0);
  if (!inputs.length || inputs.some(input => !input.trim() || input.length > 8000) || tokenUpperBound > 100_000) throw Error('Publication exceeds the reviewed embedding bound.');
  const digest = createHash('sha256').update(JSON.stringify({ articles: articles.map(article => [article.slug, article.version]).sort(), ...embeddingSpace })).digest('hex');
  return { digest, articles: articles.length, chunks: inputs.length, tokenUpperBound, ...embeddingSpace };
}

export function publicationMode(args: readonly string[], digest: string) {
  if (args.length === 0) return 'preview' as const;
  if (args.length === 2 && args[0] === '--publish' && /^[a-f0-9]{64}$/.test(args[1]) && args[1] === digest) return 'publish' as const;
  throw Error('Preview the corpus and provide its exact digest with --publish.');
}
