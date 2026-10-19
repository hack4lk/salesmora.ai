import { describe, expect, it } from 'vitest';
import { readChatStream } from './chat-stream';
const id = '00000000-0000-4000-8000-000000000001';
const event = (sequence: number, data: object) => ({ version: 1, runId: id, turnId: id, sequence, ...data });
const accepted = event(1, { type: 'turn.accepted', threadId: id, messageId: id });
const delta = event(2, { type: 'message.delta', messageId: id, text: 'Hello 🌍' });
const done = event(3, { type: 'turn.completed', messageId: id });
const frame = (data: object) => `data: ${JSON.stringify(data)}\r\n\r\n`;
async function consume(text: string, byteSize = 1) {
  const bytes = new TextEncoder().encode(text);
  let position = 0;
  const stream = new ReadableStream<Uint8Array>({ pull(controller) {
    if (position === bytes.length) { controller.close(); return; }
    controller.enqueue(bytes.slice(position, position + byteSize));
    position = Math.min(position + byteSize, bytes.length);
  } });
  const events = [];
  for await (const item of readChatStream(stream)) events.push(item);
  return events;
}
describe('chat stream transport', () => {
  it('handles fragmented UTF-8 and CRLF frames, comments, multiple frames and replay', async () => {
    const text = ': heartbeat\r\n\r\n' + [accepted, delta, delta, done].map(frame).join('');
    for (const size of [1, 7, 4096]) expect(await consume(text, size)).toEqual([accepted, delta, done]);
  });
  it('requires an accepted run and explicit terminal event', async () => {
    await expect(consume(frame(accepted) + frame(delta))).rejects.toThrow('Interrupted');
    await expect(consume(frame(delta))).rejects.toThrow();
    await expect(consume(frame(accepted) + frame(done))).rejects.toThrow('sequence');
  });
  it('rejects mixed runs/messages, invalid payloads, trailing data and oversized frames', async () => {
    for (const invalid of [
      { ...delta, runId: '00000000-0000-4000-8000-000000000002' },
      { ...delta, messageId: '00000000-0000-4000-8000-000000000002' },
      { ...delta, type: 'response.output_text.delta' },
      { ...delta, reasoning: 'private' },
    ]) await expect(consume(frame(accepted) + frame(invalid))).rejects.toThrow();
    await expect(consume(frame(accepted) + frame(delta) + frame(done) + 'data: partial')).rejects.toThrow('Truncated');
    await expect(consume('data: ' + 'x'.repeat(64001), 4096)).rejects.toThrow('frame');
    await expect(consume(frame(accepted) + frame(delta) + frame(done) + frame({ ...delta, sequence: 4 }))).rejects.toThrow();
  });
});
