import { describe, expect, it } from 'vitest';
import { defaultJobDeadline } from './deadline';
describe('workspace default Job deadlines', () => {
  it('excludes the creation day, skips weekends only for business days and includes holidays', () => {
    expect(defaultJobDeadline('2026-10-23', { mode: 'relative', days: 1, count: 'business' })).toBe('2026-10-26');
    expect(defaultJobDeadline('2026-10-23', { mode: 'relative', days: 1, count: 'calendar' })).toBe('2026-10-24');
    expect(defaultJobDeadline('2026-12-24', { mode: 'relative', days: 1, count: 'business' })).toBe('2026-12-25');
    expect(defaultJobDeadline('2026-10-23', { mode: 'relative', days: 14, count: 'business' })).toBe('2026-11-12');
  });
  it('uses date-only arithmetic across leap days, DST weekends and year boundaries', () => {
    expect(defaultJobDeadline('2028-02-28', { mode: 'relative', days: 1, count: 'calendar' })).toBe('2028-02-29');
    expect(defaultJobDeadline('2026-03-06', { mode: 'relative', days: 1, count: 'business' })).toBe('2026-03-09');
    expect(defaultJobDeadline('2026-10-30', { mode: 'relative', days: 1, count: 'business' })).toBe('2026-11-02');
    expect(defaultJobDeadline('2026-12-31', { mode: 'relative', days: 1, count: 'business' })).toBe('2027-01-01');
  });
  it('accepts unset and rejects invalid dates and rules before calculating', () => {
    expect(defaultJobDeadline('2026-10-26', { mode: 'unset' })).toBeNull();
    expect(() => defaultJobDeadline('2026-02-30', { mode: 'unset' })).toThrow();
    expect(() => defaultJobDeadline('2026-10-26', { mode: 'relative', days: 0, count: 'calendar' })).toThrow();
    expect(() => defaultJobDeadline('2026-10-26', { mode: 'relative', days: 366, count: 'calendar' })).toThrow();
  });
});
