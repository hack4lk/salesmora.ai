/** Calendar-day ages in the supplied workspace/browser timezone, including DST boundaries. */
export function createLeadDateFormatter(now: string, timezone: string) {
  let zone = timezone;
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(); } catch { zone = 'UTC'; }
  const exact = new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short' });
  const calendar = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric' });
  const current = new Date(now);
  function day(date: Date) {
    const parts = calendar.formatToParts(date);
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
    return Date.UTC(value('year'), value('month') - 1, value('day'));
  }
  return (createdAt: string) => {
    const date = new Date(createdAt);
    if (!Number.isFinite(date.getTime()) || !Number.isFinite(current.getTime())) return null;
    return { age: Math.round((day(current) - day(date)) / 86400000), displayDate: exact.format(date), exact: `${exact.format(date)} · ${zone}` };
  };
}
