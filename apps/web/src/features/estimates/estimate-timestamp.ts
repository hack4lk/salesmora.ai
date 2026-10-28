export function isEstimateLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function estimateTimestamp(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    || !isEstimateLocalDate(value.slice(0, 10))
    || Number(value.slice(11, 13)) > 23
    || Number(value.slice(14, 16)) > 59
    || Number(value.slice(17, 19)) > 59) return NaN;
  return Date.parse(value);
}

export function createEstimateTimestampFormatter(timezone: string): Intl.DateTimeFormat | null {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, year: "numeric", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });
  } catch (error) {
    if (error instanceof RangeError) return null;
    throw error;
  }
}

export function formatEstimateTimestamp(value: string, formatter: Intl.DateTimeFormat | null): string | null {
  const parsed = estimateTimestamp(value);
  return formatter && Number.isFinite(parsed) ? formatter.format(parsed) : null;
}
