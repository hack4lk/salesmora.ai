/** Authorize the first text release; honor cancellation throughout and persist only on success. */
export function createTranscriptDelivery(options: {
  signal: AbortSignal;
  authorize: () => Promise<void>;
  persist: (text: string) => Promise<void>;
  send: (text: string) => void;
  onFailure: (error: unknown) => void;
}) {
  let pending = '', chain = Promise.resolve(), stopped = false;
  let failure: { error: unknown } | undefined;
  let authorized = false;
  const startedAt = performance.now();
  const metrics: { deliveredBatches: number; completionWrites: number; validationMs: number;
    persistenceMs: number; firstTextMs: number | null } = {
    deliveredBatches: 0, completionWrites: 0, validationMs: 0, persistenceMs: 0, firstTextMs: null,
  };
  const enqueue = (work: () => Promise<void>) => {
    const result = chain.then(async () => {
      if (failure) throw failure.error;
      await work();
    });
    chain = result.catch(error => {
      if (!failure) { failure = { error }; options.onFailure(error); }
    });
    return result;
  };
  return {
    metrics,
    push(text: string) {
      if (stopped) return Promise.reject(new Error('Transcript delivery is closed.'));
      return enqueue(async () => {
        options.signal.throwIfAborted();
        if (!text || text.length > 8000) throw new Error('Invalid delivery batch.');
        if (pending.length + text.length > 32000) throw new Error('Answer text limit exceeded.');
        if (!authorized) {
          const started = performance.now();
          await options.authorize();
          metrics.validationMs += performance.now() - started;
          authorized = true;
        }
        options.signal.throwIfAborted();
        options.send(text);
        metrics.firstTextMs ??= performance.now() - startedAt;
        pending += text;
        metrics.deliveredBatches++;
      });
    },
    async finish() {
      if (stopped) throw new Error('Transcript delivery is closed.');
      stopped = true;
      await enqueue(async () => {
        options.signal.throwIfAborted();
        const started = performance.now();
        await options.persist(pending);
        metrics.persistenceMs += performance.now() - started;
        metrics.completionWrites++;
        pending = '';
      });
    },
    async stop() {
      stopped = true;
      await chain;
      pending = '';
      if (failure) throw failure.error;
    },
  };
}
