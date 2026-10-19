import { describe, expect, it, vi } from 'vitest';
import { loadCorpus, parseArticle } from './corpus';
import { createOpenAIEmbedder, validateVectors, embeddingSpace } from './embeddings';
import type { AIUsageRecorder } from '@salesmora/contracts';
const meta = { slug: 'test-help', title: 'Test help', roles: ['field'], capabilities: [], plans: ['free'], productStatus: 'implemented' };
describe('canonical help sources', () => {
  it('loads reviewed coherent sections and explicitly marks campaign planning', async () => {
    const articles = await loadCorpus();
    expect(articles).toHaveLength(8); expect(articles.reduce((n, a) => n + a.sections.length, 0)).toBe(23);
    expect(articles.find(a => a.slug === 'campaign-planning')?.productStatus).toBe('planned');
  });
  it('hashes metadata changes as well as text and gives stable section links', () => {
    const text = '# Test help\n\n## First section\nBody';
    const article = parseArticle(meta, text);
    expect(article.sections[0].anchor).toBe('first-section');
    expect(parseArticle(meta, text).version).toBe(article.version);
    expect(parseArticle({ ...meta, roles: ['owner'] }, text).version).not.toBe(article.version);
    expect(() => parseArticle({ ...meta, slug: '../secret' }, text)).toThrow();
    expect(() => parseArticle(meta, `${text}\n## First section\nOther`)).toThrow();
    expect(() => parseArticle({ ...meta, capabilities: ['unknown'] }, text)).toThrow();
  });
});
describe('server embedding adapter', () => {
  it('accounts for provider tokens and records unknown cancelled calls without exposing input', async () => {
    const finish = vi.fn().mockResolvedValue(undefined);
    const start = vi.fn<AIUsageRecorder['start']>().mockResolvedValue(finish);
    const vector = Array.from({ length: 1536 }, (_, i) => i ? 0 : 1);
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ model: embeddingSpace.model, data: [{ index: 0, object: 'embedding', embedding: vector }], usage: { prompt_tokens: 8, total_tokens: 8 } })).mockRejectedValueOnce(Error('private detail'));
    const embedder = createOpenAIEmbedder('fictional', request, { recorder: { start }, phase: 'query_embedding' });
    await embedder.embed(['Sensitive fictional input']);
    const controller = new AbortController(); controller.abort();
    await expect(embedder.embed(['Sensitive fictional input'], controller.signal)).rejects.toThrow('Embedding request failed');
    const reservation = new TextEncoder().encode('Sensitive fictional input').byteLength + 1;
    expect(start.mock.calls).toEqual([[embeddingSpace.model, 'query_embedding', reservation], [embeddingSpace.model, 'query_embedding', reservation]]);
    expect(finish.mock.calls).toEqual([
      [{ outcome: 'completed', tokens: { inputTokens: 8, outputTokens: 0, totalTokens: 8, cachedInputTokens: 0, reasoningTokens: 0 } }],
      [{ outcome: 'cancelled', tokens: undefined }],
    ]);
  });
  it('rejects missing credentials, zero vectors, dimension mismatches and non-finite values', () => {
    expect(() => createOpenAIEmbedder('')).toThrow();
    for (const vectors of [[], [[0, 0]], [[1]], [[1, Infinity]], [[1, NaN]]]) expect(() => validateVectors(vectors, 1, 2)).toThrow();
  });
  it('pins the embedding space and restores provider index order', async () => {
    const vector = Array.from({ length: 1536 }, (_, i) => i ? 0 : 1);
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ model: embeddingSpace.model, data: [{ index: 1, object: 'embedding', embedding: vector }, { index: 0, object: 'embedding', embedding: vector }] }));
    const result = await createOpenAIEmbedder('fictional-test-key', request).embed(['First', 'Second']);
    expect(result).toHaveLength(2);
    const body = JSON.parse(request.mock.calls[0][1]!.body as string);
    expect(body).toEqual({ ...embeddingSpace, input: ['First', 'Second'], encoding_format: 'float' });
  });
  it('redacts provider failures and rejects a mixed embedding space', async () => {
    for (const response of [Response.json({ secret: 'sensitive-provider-body' }, { status: 401 }), Response.json({ model: 'wrong', data: [] })]) {
      const request = vi.fn<typeof fetch>().mockResolvedValue(response);
      await expect(createOpenAIEmbedder('fictional-test-key', request).embed(['Test'])).rejects.toThrow('Embedding request failed; check server configuration or retry later');
    }
  });
});
