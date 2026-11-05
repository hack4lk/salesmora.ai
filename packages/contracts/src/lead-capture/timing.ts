/** Shared wall-clock resolver: reject invalid zones, calendar dates, DST gaps and folds. */
export function resolveCaptureLocalTime(local: string, timezone: string): {
  at?: string;
  error?: 'zone' | 'date' | 'ambiguous' | 'gap';
} {
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }
  catch {
    return { error: 'zone' };
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    return { error: 'date' };
  const [year, month, day, hour, minute] = local.split(/[-T:]/).map(Number), wall = Date.UTC(year, month - 1, day, hour, minute);
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== local)
    return { error: 'date' };
  const parts = (at: number) => { const values = Object.fromEntries(formatter.formatToParts(at).map(part => [part.type, part.value])); return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute)); };
  const offsets = new Set<number>();
  for (let hours = -36; hours <= 36; hours += 6) {
    const at = wall + hours * 3600000;
    offsets.add(parts(at) - at);
  }
  const candidates = [...offsets].map(offset => wall - offset).filter(at => parts(at) === wall);
  return candidates.length === 1 ? { at: new Date(candidates[0]).toISOString() } : { error: candidates.length ? 'ambiguous' : 'gap' };
}
