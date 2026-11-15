export { defaultReportPreset, resolveReportPeriod,
  type ReportPeriodSelection, type ReportDateContext, type ReportDateRange, type ReportPeriodError } from '@salesmora/domain';

export function validReportTimezone(timezone: string) {
  if (!timezone.trim()) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }); return true; }
  catch (error) { if (error instanceof RangeError) return false; throw error; }
}

export function formatReportDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}
