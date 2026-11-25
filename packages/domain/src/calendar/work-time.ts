import { calendarWorkTimeSchema } from '@salesmora/contracts';

/** Local review wording only, not a UTC reservation or a check of staff availability. */
export function calendarWorkTimeSummary(input: unknown) {
  const parsed = calendarWorkTimeSchema.safeParse(input);
  if (!parsed.success) return null;
  const { startTime, durationMinutes } = parsed.data;
  const [hour, minute] = startTime.split(':').map(Number);
  const end = hour * 60 + minute + durationMinutes;
  const format = (minutes: number) => {
    const hours = Math.floor(minutes / 60), remainder = minutes % 60;
    return `${hours % 12 || 12}:${String(remainder).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
  };
  const hours = Math.floor(durationMinutes / 60), minutes = durationMinutes % 60;
  const duration = [hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '', minutes ? `${minutes} min` : ''].filter(Boolean).join(' ');
  return { start: format(hour * 60 + minute), finish: format(end), duration, range: `${format(hour * 60 + minute)}–${format(end)}` };
}
