import { afterEach, describe, expect, it, vi } from 'vitest';
import { textBatches } from './text-batches';

afterEach(() => vi.useRealTimers());
async function collect(source: AsyncIterable<string>) {
  const values: string[] = [];
  for await (const text of source) values.push(text);
  return values;
}
describe('bounded provider text batches', () => {
  it('combines tiny fragments without changing the answer', async () => {
    const source = async function* () { for (let index = 0; index < 100; index++) yield 'word '; };
    expect(await collect(textBatches(source(), new AbortController().signal))).toEqual(['word '.repeat(100)]);
  });
  it('releases pending text after 150 ms while the next fragment is delayed', async () => {
    vi.useFakeTimers();
    let release!: () => void;
    const source = async function* () {
      yield 'first';
      await new Promise<void>(resolve => { release = resolve; });
      yield 'second';
    };
    const iterator = textBatches(source(), new AbortController().signal);
    const first = iterator.next();
    await vi.advanceTimersByTimeAsync(150);
    expect(await first).toEqual({ value: 'first', done: false });
    release();
    expect(await iterator.next()).toEqual({ value: 'second', done: false });
    expect((await iterator.next()).done).toBe(true);
  });
  it('does not exceed per-event bounds or the total answer budget', async () => {
    const source = async function* () { yield 'a'.repeat(7900); yield 'b'.repeat(7900); yield 'c'.repeat(201); };
    await expect(collect(textBatches(source(), new AbortController().signal))).rejects.toThrow('Answer budget exceeded');
    const oversized = async function* () { yield 'a'.repeat(8001); };
    await expect(collect(textBatches(oversized(), new AbortController().signal))).rejects.toThrow('Answer budget exceeded');
  });
  it('discards buffered text on cancellation and closes the source', async () => {
    const controller = new AbortController();
    const closed = vi.fn();
    const source = async function* () {
      try { yield 'private'; controller.abort(new Error('Stopped')); yield 'late'; }
      finally { closed(); }
    };
    await expect(collect(textBatches(source(), controller.signal))).rejects.toThrow('Stopped');
    expect(closed).toHaveBeenCalledOnce();
  });
});
