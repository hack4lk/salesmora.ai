import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { captureEmbedLoader } from './embed-loader';
function fixture(key = 'a'.repeat(64)) {
  const listeners: ((event: unknown) => void)[] = [], frames: Record<string, unknown>[] = [], timers = new Set();
  const messages: unknown[] = [], child = { postMessage: (...args: unknown[]) => messages.push(args) };
  const script = { getAttribute: () => key, parentNode: { insertBefore: (frame: Record<string, unknown>) => frames.push(frame) } };
  const context = { document: { currentScript: script, createElement: () => ({ style: {}, contentWindow: child, isConnected: true, addEventListener: (_name: string, callback: () => void) => { context.load = callback; } }) }, crypto: { getRandomValues: (array: Uint8Array) => array.fill(1) }, window: { addEventListener: (_name: string, callback: (event: unknown) => void) => listeners.push(callback), removeEventListener: () => {} }, setInterval: () => { const id = {}; timers.add(id); return id; }, clearInterval: (id: unknown) => timers.delete(id), setTimeout: () => { const id = {}; timers.add(id); return id; }, clearTimeout: (id: unknown) => timers.delete(id), load: () => {} };
  runInNewContext(captureEmbedLoader('https://forms.salesmora.ai'), context);
  return { ...context, listeners, frames, messages, child, timers };
}
it('installs an isolated iframe and accepts only the bound window/origin/channel and bounded metadata', () => {
  const f = fixture(), frame = f.frames[0]; expect(frame.src).toBe(`https://forms.salesmora.ai/embed/${'a'.repeat(64)}`); expect(frame.referrerPolicy).toBe('no-referrer'); f.load();
  expect(f.messages[0]).toEqual([{ type: 'salesmora.capture.init', version: 1, channel: '01'.repeat(16) }, 'https://forms.salesmora.ai']);
  const data = { type: 'salesmora.capture.resize', version: 1, channel: '01'.repeat(16), height: 700 };
  const event = { origin: 'https://forms.salesmora.ai', source: f.child, data };
  for (const patch of [{ origin: 'https://evil.test' }, { source: {} }, ...[127, 20001, 700.5, '700', NaN].map(height => ({ data: { ...data, height } })), { data: { ...data, channel: 'other' } }, { data: { ...data, answers: {} } }, { data: null }]) { f.listeners[0]({ ...event, ...patch }); expect(frame.height).toBe('1000'); }
  f.listeners[0](event); expect(frame.height).toBe('700'); expect(f.timers.size).toBe(0);
});
it('ignores malformed keys and removed frames', () => {
  expect(fixture('../private').frames).toHaveLength(0); const f = fixture(); f.frames[0].isConnected = false; f.listeners[0]({}); expect(f.frames[0].height).toBe('1000');
});
