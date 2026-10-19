import { chatStreamEventSchema, type ChatStreamEvent } from '@salesmora/contracts';

/** POST/fetch stream decoder. EOF is never completion; provider events are not accepted. */
export async function* readChatStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let buffer = '';
  let runId: string | undefined;
  let turnId: string | undefined;
  let messageId: string | undefined;
  let sequence = 0;
  let terminal = false;
  let pendingCR = false;
  function normalize(text: string, final: boolean) {
    // A CRLF pair can straddle network chunks. Normalize only once the LF arrives.
    if (pendingCR) { text = '\r' + text; pendingCR = false; }
    if (!final && text.endsWith('\r')) { text = text.slice(0, -1); pendingCR = true; }
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  function parse(frame: string): ChatStreamEvent | undefined {
    if (frame.length > 64000) throw new Error('Invalid chat frame');
    const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
    if (!data) return;
    const event = chatStreamEventSchema.parse(JSON.parse(data));
    if (runId && (event.runId !== runId || event.turnId !== turnId)) throw new Error('Unexpected chat run');
    if (event.sequence <= sequence) return; // Replay of already delivered events.
    if (terminal || event.sequence !== sequence + 1) throw new Error('Unexpected chat sequence');
    if (!runId) {
      if (event.type !== 'turn.accepted') throw new Error('Chat was not accepted');
      runId = event.runId; turnId = event.turnId; messageId = event.messageId;
    } else if (event.type === 'turn.accepted') throw new Error('Duplicate chat acceptance');
    if ('messageId' in event && event.messageId !== messageId) throw new Error('Unexpected chat message');
    sequence = event.sequence;
    terminal = event.type === 'turn.completed' || event.type === 'turn.failed' || event.type === 'turn.cancelled';
    return event;
  }
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += normalize(chunk.done ? decoder.decode() : decoder.decode(chunk.value, { stream: true }), chunk.done);
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = parse(frame);
        if (event) yield event;
      }
      if (buffer.length > 64000) throw new Error('Invalid chat frame');
      if (chunk.done) break;
    }
    if (buffer.split('\n').some(line => line.trim() && !line.startsWith(':'))) throw new Error('Truncated chat frame');
    if (!terminal) throw new Error('Interrupted chat stream');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
