import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { permissionCatalog, permissionIds, type AuthorizationContext, type PermissionDefinition, type HelpSource, type HelpSection } from '@salesmora/contracts';
import type { KnowledgeArticle } from './corpus';
import { validateVectors, type Embedder } from './embeddings';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function articleIdentity(article: KnowledgeArticle, space: Pick<Embedder, 'model' | 'dimensions'>) {
  return hash(JSON.stringify([article.slug, article.version, space.model, space.dimensions]));
}
async function retire(db: Knex.Transaction, ids: string[]) {
  if (!ids.length) return;
  await db('helpArticles').whereIn('id', ids).update({ state: 'retired' });
  await db('helpEmbeddings').whereIn('chunkId', db('helpChunks').whereIn('articleId', ids).select('id')).delete();
}
/** Invalidates changed text immediately. Failed builds remain unpublished; retries are repeat-safe. */
export async function stageArticle(db: Knex, article: KnowledgeArticle, space: Pick<Embedder, 'model' | 'dimensions'>) {
  if (!Number.isInteger(space.dimensions) || space.dimensions < 1 || space.dimensions > 2000 || !space.model) throw Error('Invalid embedding space');
  const id = articleIdentity(article, space);
  return db.transaction(async trx => {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [`help:${article.slug}`]);
    const current = await trx('helpArticles').where({ id }).first();
    if (current?.state === 'published') return { id, ready: true };
    await retire(trx, (await trx('helpArticles').where({ slug: article.slug }).whereNot({ id }).select('id')).map(row => row.id));
    await trx('helpArticles').insert({ id, slug: article.slug, version: article.version, title: article.title, sourcePath: article.sourcePath,
      roles: article.roles, capabilities: article.capabilities, plans: article.plans, productStatus: article.productStatus,
      state: 'draft', model: space.model, dimensions: space.dimensions }).onConflict('id').merge({ state: 'draft', publishedAt: null });
    await trx('helpHeads').insert({ slug: article.slug, articleId: id }).onConflict('slug').merge();
    for (const [position, section] of article.sections.entries()) {
      await trx('helpChunks').insert({ id: hash(`${id}:${section.anchor}`), articleId: id, ...section, position, contentHash: hash(section.text) }).onConflict('id').ignore();
    }
    return { id, ready: false };
  });
}
export async function publishArticle(db: Knex, id: string, vectors: number[][]) {
  return db.transaction(async trx => {
    const article = await trx('helpArticles').where({ id }).first();
    if (!article) throw Error('Help build no longer exists');
    await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [`help:${article.slug}`]);
    const head = await trx('helpHeads').where({ slug: article.slug, articleId: id }).first();
    if (!head) return false; // A newer version superseded this job.
    const chunks = await trx('helpChunks').where({ articleId: id }).orderBy('position');
    validateVectors(vectors, chunks.length, article.dimensions);
    for (const [index, chunk] of chunks.entries()) await trx('helpEmbeddings').insert({ chunkId: chunk.id, embedding: JSON.stringify(vectors[index]) }).onConflict('chunkId').merge();
    await trx('helpArticles').where({ id }).update({ state: 'published', publishedAt: trx.fn.now() });
    return true;
  });
}
export async function ingestArticle(db: Knex, article: KnowledgeArticle, embedder: Embedder) {
  const staged = await stageArticle(db, article, embedder);
  if (staged.ready) return { status: 'unchanged' as const, chunks: article.sections.length };
  const vectors = await embedder.embed(article.sections.map(section => `${article.title}\n${section.heading}\n${section.text}`));
  const published = await publishArticle(db, staged.id, vectors);
  return { status: published ? 'published' as const : 'superseded' as const, chunks: article.sections.length };
}
export async function retireMissingArticles(db: Knex, slugs: string[]) {
  if (!slugs.length) throw Error('Empty corpus requires explicit review');
  await db.transaction(async trx => {
    const missing = await trx('helpArticles').whereNotIn('slug', slugs).select('id');
    await retire(trx, missing.map(row => row.id));
    await trx('helpHeads').whereNotIn('slug', slugs).delete();
  });
}
function helpAccess(db: Knex, context: AuthorizationContext, plan: string) {
  if (!authorize(context, { permission: 'assistant.use' }).allowed || plan !== 'free') throw Error('Help access denied');
  const capabilities = permissionIds.filter(permission => {
    const definition: PermissionDefinition = permissionCatalog[permission];
    return definition.mode === 'collection' ? resolveAuthorizedCollectionScope(context, permission).allowed : authorize(context, { permission }).allowed;
  });
  // Global product help only. Current workspace auth is supplied by a locked server transaction.
  return db('helpArticles as a').join('helpHeads as h', 'h.articleId', 'a.id')
    .where('a.state', 'published').where('a.productStatus', 'implemented')
    .whereRaw('? = ANY(a.roles)', [context.membership.role]).whereRaw('? = ANY(a.plans)', [plan])
    .whereRaw('a.capabilities <@ ?::text[]', [capabilities]);
}
function source(row: { slug: string; version: string; title: string; anchor: string; heading: string }, workspaceId: string): HelpSource {
  return { slug: row.slug, version: row.version, title: row.title, anchor: row.anchor, heading: row.heading,
    href: `/help/${row.slug}?workspace=${encodeURIComponent(workspaceId)}&version=${row.version}#${row.anchor}` };
}
export type HelpMatch = { source: HelpSource; text: string; similarity: number; trust: 'untrusted-reference' };
export async function retrieveHelp(db: Knex, context: AuthorizationContext, query: number[], space: Pick<Embedder, 'model' | 'dimensions'>, plan = 'free'): Promise<HelpMatch[]> {
  validateVectors([query], 1, space.dimensions);
  const vector = JSON.stringify(query);
  // Exact search over an authorized CTE; forbidden chunks cannot consume the top-k or reach callers.
  const eligible = helpAccess(db, context, plan).where({ 'a.model': space.model, 'a.dimensions': space.dimensions }).select('a.*');
  const rows = await db.with('eligible', eligible).from('eligible as a').join('helpChunks as c', 'c.articleId', 'a.id').join('helpEmbeddings as e', 'e.chunkId', 'c.id')
    .whereRaw('vector_dims(e.embedding) = ?', [space.dimensions])
    .select('a.slug', 'a.version', 'a.title', 'c.anchor', 'c.heading', 'c.text', db.raw('1 - (e.embedding <=> ?::vector) as similarity', [vector]))
    .whereRaw('1 - (e.embedding <=> ?::vector) >= ?', [vector, 0.35]).orderByRaw('e.embedding <=> ?::vector', [vector]).limit(3);
  return rows.map(row => ({ source: source(row, context.workspaceId), text: row.text, similarity: Number(row.similarity), trust: 'untrusted-reference' }));
}
export async function readHelpArticle(db: Knex, context: AuthorizationContext, slug: string, version: string, plan = 'free'): Promise<{ title: string; sections: HelpSection[] } | null> {
  const article = await helpAccess(db, context, plan).where({ 'a.slug': slug, 'a.version': version }).select('a.id', 'a.title').first();
  if (!article) return null;
  const sections = await db('helpChunks').where({ articleId: article.id }).orderBy('position').select<HelpSection[]>('anchor', 'heading', 'text');
  return { title: article.title, sections };
}
