import { validAITokenUsage, type AITokenUsage, type AIUsagePhase, type AIUsageRecorder } from '@salesmora/contracts';
export const embeddingSpace = { model: 'text-embedding-3-small', dimensions: 1536 } as const;
export interface Embedder { model: string; dimensions: number; embed(texts: string[], signal?: AbortSignal): Promise<number[][]> }
export function validateVectors(vectors: unknown, count: number, dimensions: number): asserts vectors is number[][] {
  if (!Array.isArray(vectors) || vectors.length !== count || vectors.some(vector => !Array.isArray(vector) || vector.length !== dimensions || vector.some(n => typeof n !== 'number' || !Number.isFinite(n)) || !vector.some(n => n !== 0))) throw Error('Invalid embedding response');
}
/** Server-only credential closure. No provider bodies, headers or errors are logged. */
export function createOpenAIEmbedder(apiKey: string | undefined, request: typeof fetch = fetch, accounting?: { recorder: AIUsageRecorder; phase: Extract<AIUsagePhase, 'query_embedding' | 'corpus_embedding' | 'evaluation_embedding'> }): Embedder {
  if (!apiKey?.trim()) throw Error('Embedding credentials are not configured');
  return { ...embeddingSpace, async embed(texts, signal) {
    if (!texts.length || texts.length > 30 || texts.some(text => !text.trim() || text.length > 8000)) throw Error('Invalid embedding input');
    let tokens: AITokenUsage | undefined;
    let completed = false;
    // Embedding inputs are text-only byte-pair encoded: UTF-8 bytes plus one framing token per input is a conservative bound.
    const reservation = texts.reduce((n, text) => n + new TextEncoder().encode(text).byteLength + 1, 0);
    const finish = await accounting?.recorder.start(embeddingSpace.model, accounting.phase, reservation);
    try {
      const response = await request('https://api.openai.com/v1/embeddings', {
        method: 'POST', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000),
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...embeddingSpace, input: texts, encoding_format: 'float' }),
      });
      if (!response.ok) { await response.body?.cancel(); throw Error('Embedding provider unavailable'); }
      if (Number(response.headers.get('content-length')) > 2500000) { await response.body?.cancel(); throw Error('Embedding response too large'); }
      const reader = response.body?.getReader();
      if (!reader) throw Error('Empty embedding response');
      let size = 0; const buffers: Uint8Array[] = [];
      try {
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          size += chunk.value.length; if (size > 2500000) throw Error('Embedding response too large');
          buffers.push(chunk.value);
        }
      } finally { await reader.cancel(); }
      const result = JSON.parse(Buffer.concat(buffers).toString('utf8'));
      if (result.usage) {
        const reported = { inputTokens: result.usage.prompt_tokens, totalTokens: result.usage.total_tokens, outputTokens: 0, cachedInputTokens: 0, reasoningTokens: 0 };
        if (validAITokenUsage(reported)) tokens = reported;
      }
      if (result.model !== embeddingSpace.model || !Array.isArray(result.data) || result.data.length !== texts.length) throw Error('Invalid embedding response');
      const ordered = [...result.data].sort((a, b) => a.index - b.index);
      if (ordered.some((entry, index) => entry.index !== index || entry.object !== 'embedding')) throw Error('Invalid embedding indices');
      const vectors: unknown = ordered.map(entry => entry.embedding);
      validateVectors(vectors, texts.length, embeddingSpace.dimensions);
      completed = true;
      return vectors;
    } catch { throw Error('Embedding request failed; check server configuration or retry later'); }
    finally { await finish?.({ outcome: completed ? 'completed' : signal?.aborted ? 'cancelled' : 'failed', tokens }); }
  } };
}
