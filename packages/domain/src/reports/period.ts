import { jobDateSchema, type ReportTemplatePeriod } from '@salesmora/contracts';
import { addCalendarDays } from '../calendar/dates';

export type ReportPeriodSelection = ReportTemplatePeriod;
export type ReportDateContext = 'history' | 'calendar';
export type ReportDateRange = { from: string; to: string; count: number };
export type ReportPeriodError = 'missing' | 'invalid' | 'order' | 'tooLong' | 'context' | 'preset';
type Result = { range: ReportDateRange; error?: never } | { error: ReportPeriodError; range?: never };

const isDate = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;
export const defaultReportPreset = (context: ReportDateContext) => context === 'calendar' ? 'next7days' : 'last30days';

export function resolveReportPeriod(selection: ReportPeriodSelection, today: string, context: ReportDateContext): Result {
  if (!isDate(today)) return { error: 'context' };
  if (selection.preset !== 'custom' && selection.preset !== defaultReportPreset(context)) return { error: 'preset' };
  const from = selection.preset === 'custom' ? selection.from : selection.preset === 'last30days' ? addCalendarDays(today, -29) : today;
  const to = selection.preset === 'custom' ? selection.to : selection.preset === 'next7days' ? addCalendarDays(today, 6) : today;
  if (!from || !to) return { error: 'missing' };
  if (!isDate(from) || !isDate(to)) return { error: 'invalid' };
  if (to < from) return { error: 'order' };
  // Count date labels, not elapsed workspace hours across DST transitions.
  const count = (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000 + 1;
  if (count > 366) return { error: 'tooLong' };
  return { range: { from, to, count } };
}
