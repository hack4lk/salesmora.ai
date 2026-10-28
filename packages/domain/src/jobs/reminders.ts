/** Workspace-local date/minute comparison: DST gaps run at the first valid later minute;
 * repeated minutes share the same occurrence key in storage. Never add 24h to local instants. */
export function reminderClock(now: Date, timezone: string) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid reminder clock.');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)!.value;
  return { date: `${part('year')}-${part('month')}-${part('day')}`, time: `${part('hour')}:${part('minute')}` };
}
export function reminderDeadlineForDate(date: string, relative: 'before' | 'on' | 'after', days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + (relative === 'before' ? days : relative === 'after' ? -days : 0));
  return value.toISOString().slice(0, 10);
}
