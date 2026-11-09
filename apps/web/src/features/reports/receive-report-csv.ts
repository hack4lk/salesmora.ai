export async function receiveReportCSV<G extends { count: number; limits: { bytes: number } }>(
  response: Response, columns: string[], schema: { parse: (value: unknown) => G }, validate: (metadata: G) => void,
  signal: AbortSignal, label: string,
): Promise<Blob> {
  if (!response.body) throw new Error(`${label} CSV response is incomplete.`);
  const reader = response.body.getReader();
  let readerFailed = false;
  const cancel = () => { void reader.cancel().catch(() => console.error(`${label} CSV response cancellation failed.`)); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const encoded = response.headers.get('x-report-export');
    if (!encoded || encoded.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
      throw new Error(`${label} CSV generation metadata is invalid.`);
    }
    const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), character => character.charCodeAt(0));
    const metadata = schema.parse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    validate(metadata);
    if (response.headers.get('content-type')?.toLowerCase() !== 'text/csv; charset=utf-8') {
      throw new Error(`${label} CSV response type is invalid.`);
    }
    const chunks: ArrayBuffer[] = [];
    let size = 0, lines = 0, previous = -1;
    while (true) {
      signal.throwIfAborted();
      let next: ReadableStreamReadResult<Uint8Array>;
      try { next = await reader.read(); } catch (error) { readerFailed = true; throw error; }
      if (next.done) break;
      size += next.value.byteLength;
      if (size > metadata.limits.bytes) throw new Error(`${label} CSV exceeds the byte limit. No file was saved.`);
      for (const byte of next.value) { if (previous === 13 && byte === 10) lines++; previous = byte; }
      chunks.push(Uint8Array.from(next.value).buffer);
    }
    signal.throwIfAborted();
    const blob = new Blob(chunks, { type: 'text/csv; charset=utf-8' });
    const header = new TextEncoder().encode('\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n');
    const received = new Uint8Array(await blob.slice(0, header.length).arrayBuffer());
    if (received.length !== header.length || !header.every((byte, index) => byte === received[index]) ||
      lines !== metadata.count + 1 || previous !== 10) {
      throw new Error(`${label} CSV response is incomplete or does not match the reviewed rows.`);
    }
    return blob;
  } catch (error) {
    if (!readerFailed) await reader.cancel().catch(() => console.error(`${label} CSV response cancellation failed.`));
    throw error;
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}
