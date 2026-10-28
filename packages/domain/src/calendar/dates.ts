import { jobDateSchema } from '@salesmora/contracts';
const date = (value: string) => new Date(`${jobDateSchema.parse(value)}T12:00:00Z`);
export function calendarWeekStart(value: string) {
  const day = date(value);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
export function addCalendarDays(value: string, days: number) {
  const day = date(value);
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}
