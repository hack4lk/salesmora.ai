import { addCalendarDays } from '@salesmora/domain';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';

export type IntakeTrendBucket = { from: string; to: string; count: number; evidenceId?: string };
export type IntakeTrendRange = { from: string; to: string };
export type IntakeTrendInterval = 'daily' | 'weekly' | 'monthly';

export function intakeTrendSpans(range: IntakeTrendRange): { interval: IntakeTrendInterval; spans: IntakeTrendRange[] } | undefined {
  const resolved = resolveReportPeriod({ preset: 'custom', ...range }, range.to, 'history');
  if (!resolved.range) return undefined;
  const interval = resolved.range.count <= 31 ? 'daily' : resolved.range.count <= 93 ? 'weekly' : 'monthly';
  const spans: IntakeTrendRange[] = [];
  let from = range.from;
  while (from <= range.to) {
    let end = from;
    if (interval === 'weekly') {
      const day = new Date(`${from}T12:00:00Z`).getUTCDay();
      end = addCalendarDays(from, (7 - day) % 7);
    } else if (interval === 'monthly') {
      const nextMonth = new Date(`${from.slice(0, 7)}-01T12:00:00Z`);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      end = addCalendarDays(nextMonth.toISOString().slice(0, 10), -1);
    }
    const to = end < range.to ? end : range.to;
    spans.push({ from, to });
    from = addCalendarDays(to, 1);
  }
  return { interval, spans };
}

export function validIntakeTrend(range: IntakeTrendRange, total: number, buckets: readonly IntakeTrendBucket[]): boolean {
  const expected = intakeTrendSpans(range);
  return !!expected && expected.spans.length === buckets.length &&
    expected.spans.every((span, index) => span.from === buckets[index]?.from && span.to === buckets[index]?.to) &&
    validReportBreakdown(total, buckets.map(bucket => ({ id: bucket.from, count: bucket.count })));
}
