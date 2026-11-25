import { describe, expect, it } from 'vitest';
import { findCommonCalendarSlot } from './booking';
const h = (hour: number) => hour * 3600000;
const range = (start: number, finish: number) => ({ start: h(start), finish: h(finish) });
const input = { windows: [range(8, 17)], people: [[range(8, 17)]], busy: [], durationMinutes: 60, gapMinutes: 0 };
describe('common Calendar slot selection', () => {
  it('finds the earliest intersection for every required person', () => expect(findCommonCalendarSlot({ ...input, people: [[range(8, 17)], [range(10, 16)], [range(9, 13)]] })).toEqual(range(10, 11)));
  it('never treats missing people or hours as free', () => {
    expect(findCommonCalendarSlot({ ...input, people: [] })).toBeNull();
    expect(findCommonCalendarSlot({ ...input, people: [[range(8, 17)], []] })).toBeNull();
  });
  it('moves past all intersecting occupied periods', () => expect(findCommonCalendarSlot({ ...input,
    busy: [{ ...range(8, 9), gapMinutes: 0 }, { ...range(9.5, 10.5), gapMinutes: 0 }] })).toEqual(range(10.5, 11.5)));
  it('allows adjacent work when the gap is zero', () => expect(findCommonCalendarSlot({ ...input, busy: [{ ...range(7, 8), gapMinutes: 0 }] })).toEqual(range(8, 9)));
  it('keeps the requested gap after previous work', () => expect(findCommonCalendarSlot({ ...input, gapMinutes: 30, busy: [{ ...range(7, 8), gapMinutes: 0 }] })).toEqual(range(8.5, 9.5)));
  it('preserves a larger gap stored by an earlier booking', () => expect(findCommonCalendarSlot({ ...input, busy: [{ ...range(7, 8), gapMinutes: 60 }] })).toEqual(range(9, 10)));
  it('leaves the same separation before an existing visit', () => expect(findCommonCalendarSlot({ ...input, windows: [range(10, 17)], busy: [{ ...range(11, 12), gapMinutes: 30 }] })).toEqual(range(12.5, 13.5)));
  it('requires work and its trailing gap to fit all working periods', () => expect(findCommonCalendarSlot({ ...input, windows: [range(8, 9.25)], gapMinutes: 30 })).toBeNull());
  it('skips fully blocked days and finds a later allowed interval', () => expect(findCommonCalendarSlot({ ...input, windows: [range(8, 17), range(32, 41)], people: [[range(8, 17), range(32, 41)]], busy: [{ ...range(0, 24), gapMinutes: 0 }] })).toEqual(range(32, 33)));
  it('does not shorten work to squeeze into a gap', () => expect(findCommonCalendarSlot({ ...input, windows: [range(8, 8.75)] })).toBeNull());
  it('is deterministic regardless of query ordering', () => expect(findCommonCalendarSlot({ ...input, windows: [range(32, 41), range(8, 17)], people: [[range(32, 41), range(8, 17)]] })).toEqual(range(8, 9)));
  it('rounds candidate instants up to a complete minute', () => expect(findCommonCalendarSlot({ ...input, windows: [{ start: h(8) + 1, finish: h(17) }] })).toEqual({ start: h(8) + 60000, finish: h(9) + 60000 }));
});
