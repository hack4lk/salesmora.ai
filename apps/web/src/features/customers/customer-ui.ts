export const customerButton =
  "min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
export const customerPrimary =
  "min-h-11 max-w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
export const customerPanel =
  "min-w-0 rounded-2xl border border-line bg-paper p-6 text-ink";
export const customerInput =
  "min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas";
export function customerDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "—";
}
export const customerInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => [...part][0])
    .join("")
    .toLocaleUpperCase();

export function customerRelativeDate(value: string, now?: string) {
  if (!now) return customerDate(value);
  const days = Math.round((Date.parse(value) - Date.parse(now)) / 86400000);
  return Number.isFinite(days) && Math.abs(days) <= 7
    ? new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
        days,
        "day",
      )
    : customerDate(value);
}
