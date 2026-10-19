/** Counts the exact serialized stateless Responses input before reserving paid generation. */
export function reservedResponseFetch(apiKey: string, request: typeof fetch, reserve: (tokens: number) => Promise<void>): typeof fetch {
  return async (url, options) => {
    if (new URL(url instanceof Request ? url.url : String(url)).pathname !== '/v1/responses' || typeof options?.body !== 'string') throw Error('Unsupported budgeted request');
    const body = JSON.parse(options.body);
    if (body.previous_response_id || body.conversation || !Number.isSafeInteger(body.max_output_tokens) || body.max_output_tokens <= 0) throw Error('Unsupported budgeted context');
    const countBody = Object.fromEntries(['model', 'input', 'instructions', 'tools', 'tool_choice', 'parallel_tool_calls', 'reasoning', 'text', 'truncation'].filter(key => body[key] !== undefined).map(key => [key, body[key]]));
    const response = await request('https://api.openai.com/v1/responses/input_tokens', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(countBody), signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });
    if (!response.ok) { await response.body?.cancel(); throw Error('Token count unavailable'); }
    const reader = response.body?.getReader();
    if (!reader) throw Error('Token count unavailable');
    const decoder = new TextDecoder(); let text = ''; let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        bytes += chunk.value.byteLength; if (bytes > 4096) throw Error('Invalid token count');
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } finally { await reader.cancel(); }
    const count = JSON.parse(text);
    if (count.object !== 'response.input_tokens' || !Number.isSafeInteger(count.input_tokens) || count.input_tokens < 1 || !Number.isSafeInteger(count.input_tokens + body.max_output_tokens)) throw Error('Invalid token count');
    options.signal?.throwIfAborted();
    await reserve(count.input_tokens + body.max_output_tokens);
    options.signal?.throwIfAborted();
    return request(url, options);
  };
}
