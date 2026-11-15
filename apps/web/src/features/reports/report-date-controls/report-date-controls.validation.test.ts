import { describe, expect, it } from 'vitest';
import { resolveReportPeriod, validReportTimezone, type ReportPeriodSelection } from './report-date-controls.validation';

const today = '2026-11-05';
const custom = (from: string, to: string) => resolveReportPeriod({ preset: 'custom', from, to }, today, 'history');

describe('report date controls', () => {
  it('resolves historical and Calendar defaults with inclusive endpoints', () => {
    expect(resolveReportPeriod({ preset: 'last30days' }, today, 'history')).toEqual({ range: { from: '2026-10-07', to: today, count: 30 } });
    expect(resolveReportPeriod({ preset: 'next7days' }, today, 'calendar')).toEqual({ range: { from: today, to: '2026-11-11', count: 7 } });
  });
  it('rolls relative presets forward, but keeps custom dates fixed', () => {
    const preset: ReportPeriodSelection = { preset: 'last30days' };
    const fixed: ReportPeriodSelection = { preset: 'custom', from: '2026-10-07', to: today };
    expect(resolveReportPeriod(preset, '2026-11-06', 'history').range).toEqual({ from: '2026-10-08', to: '2026-11-06', count: 30 });
    expect(resolveReportPeriod(fixed, '2026-11-06', 'history')).toEqual(resolveReportPeriod(fixed, today, 'history'));
  });
  it('accepts 366 dates and rejects 367 dates without clipping', () => {
    expect(custom('2024-01-01', '2024-12-31').range?.count).toBe(366);
    expect(custom('2024-01-01', '2025-01-01')).toEqual({ error: 'tooLong' });
  });
  it.each(['', '2026-02-29', '2024-02-30', '0000-01-01', '2026-2-01', '10000-01-01', 'not-a-date'])('rejects invalid date %j', date => {
    expect(custom(date, '2026-11-05').error).toBe(date ? 'invalid' : 'missing');
    expect(custom('2024-01-01', date).error).toBe(date ? 'invalid' : 'missing');
  });
  it('rejects reversed dates', () => expect(custom('2026-11-06', today)).toEqual({ error: 'order' }));
  it.each([
    ['2024-02-29', '2024-02-29', 1],
    ['2026-03-28', '2026-03-30', 3],
    ['2026-10-24', '2026-10-26', 3],
    ['0001-01-01', '0001-01-01', 1],
    ['9999-12-31', '9999-12-31', 1],
  ])('counts calendar dates, including leap and DST dates: %s to %s', (from, to, count) => {
    expect(custom(from, to).range?.count).toBe(count);
  });
  it('rejects missing clock context and presets from the wrong report', () => {
    expect(resolveReportPeriod({ preset: 'last30days' }, 'invalid', 'history')).toEqual({ error: 'context' });
    expect(resolveReportPeriod({ preset: 'next7days' }, today, 'history')).toEqual({ error: 'preset' });
    expect(resolveReportPeriod({ preset: 'last30days' }, today, 'calendar')).toEqual({ error: 'preset' });
  });
  it('rejects relative ranges extending beyond supported years', () => {
    expect(resolveReportPeriod({ preset: 'last30days' }, '0001-01-01', 'history').error).toBe('invalid');
    expect(resolveReportPeriod({ preset: 'next7days' }, '9999-12-31', 'calendar').error).toBe('invalid');
  });
  it('validates workspace timezones without falling back to the browser timezone', () => {
    expect(validReportTimezone('Europe/Warsaw')).toBe(true);
    expect(validReportTimezone('America/New_York')).toBe(true);
    expect(validReportTimezone('Invalid/Timezone')).toBe(false);
    expect(validReportTimezone('')).toBe(false);
  });
});
