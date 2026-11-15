/** Bound provider read-ahead to one fragment while grouping tiny deltas for delivery. */
export async function* textBatches(source: AsyncIterable<string>, signal: AbortSignal,
  metrics?: { providerFragments: number; firstProviderTextMs: number | null }) {
  const requestedAt = performance.now();
  const iterator = source[Symbol.asyncIterator]();
  let next = iterator.next();
  let pending = '', started = 0, total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const result = pending ? await Promise.race([
        next,
        new Promise<undefined>(resolve => {
          timer = setTimeout(() => resolve(undefined), Math.max(0, 150 - (performance.now() - started)));
        }),
      ]).finally(() => clearTimeout(timer)) : await next;
      signal.throwIfAborted();
      if (!result) {
        yield pending;
        pending = '';
        continue;
      }
      if (result.done) {
        if (pending) yield pending;
        return;
      }
      total += result.value.length;
      if (result.value && metrics) {
        metrics.providerFragments++;
        metrics.firstProviderTextMs ??= performance.now() - requestedAt;
      }
      if (total > 16000 || result.value.length > 8000) throw new Error('Answer budget exceeded');
      if (result.value) {
        if (!pending) started = performance.now();
        if (pending.length + result.value.length > 8000) {
          yield pending;
          pending = '';
          started = performance.now();
        }
        pending += result.value;
      }
      next = iterator.next();
      // Observe a prefetched rejection even while the consumer is authorizing delivery.
      void next.catch(() => {});
      if (pending.length >= 1000) {
        yield pending;
        pending = '';
      }
    }
  } finally {
    void next.catch(() => {});
    await iterator.return?.();
  }
}
