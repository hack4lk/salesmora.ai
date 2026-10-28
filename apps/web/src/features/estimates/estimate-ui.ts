export const estimateButton =
  "min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
export const estimatePrimary =
  "min-h-11 max-w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
export const estimatePanel =
  "min-w-0 rounded-2xl border border-line bg-paper p-6 text-ink";
export const estimateInput =
  "min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas";

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** `validUntil` values are local dates (YYYY-MM-DD). Format them without timezone drift. */
export function estimateValidUntilDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) ? shortDate.format(date) : "—";
}

/** `updatedAt` values are full timestamps in UTC. */
export function estimateDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? longDate.format(date) : "—";
}

export function estimateRelativeDate(value: string, now?: string) {
  if (!now) return estimateDate(value);
  const days = Math.round((Date.parse(value) - Date.parse(now)) / 86400000);
  return Number.isFinite(days) && Math.abs(days) <= 7
    ? new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
        days,
        "day",
      )
    : estimateDate(value);
}
