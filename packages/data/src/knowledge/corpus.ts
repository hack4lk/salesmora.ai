import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { knowledgeMetadataSchema, type KnowledgeMetadata, type HelpSection } from '@salesmora/contracts';
export type KnowledgeArticle = KnowledgeMetadata & { version: string; sourcePath: string; sections: HelpSection[] };
export function parseArticle(metadata: unknown, markdown: string): KnowledgeArticle {
  const meta = knowledgeMetadataSchema.parse(metadata);
  if (markdown.length > 24000 || !markdown.startsWith(`# ${meta.title}\n`)) throw Error('Invalid help article');
  const sections = markdown.split(/^## /m).slice(1).map(block => {
    const [heading, ...body] = block.trim().split('\n');
    const anchor = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const text = body.join('\n').trim();
    if (!anchor || heading.length > 160 || !text || text.length > 4000) throw Error('Invalid help section');
    return { anchor, heading, text };
  });
  if (!sections.length || sections.length > 8 || new Set(sections.map(section => section.anchor)).size !== sections.length) throw Error('Invalid help sections');
  return { ...meta, sections, sourcePath: `knowledge/operations/${meta.slug}.md`, version: createHash('sha256').update(JSON.stringify({ meta, sections })).digest('hex') };
}
export async function loadCorpus(): Promise<KnowledgeArticle[]> {
  const directory = new URL('../../../../knowledge/operations/', import.meta.url);
  const manifest: unknown = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
  if (!Array.isArray(manifest) || !manifest.length || manifest.length > 30) throw Error('Invalid help manifest');
  const articles = await Promise.all(manifest.map(async entry => {
    const meta = knowledgeMetadataSchema.parse(entry);
    return parseArticle(meta, await readFile(fileURLToPath(new URL(`${meta.slug}.md`, directory)), 'utf8'));
  }));
  if (new Set(articles.map(article => article.slug)).size !== articles.length) throw Error('Duplicate help article');
  return articles;
}
