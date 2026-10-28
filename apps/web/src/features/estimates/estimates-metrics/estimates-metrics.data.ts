export const estimatesMetricsData = {
  title: "Estimate metrics",
  description:
    "Authorized workspace totals. They do not depend on current table paging.",
  errorTitle: "Estimate metrics are unavailable",
  error:
    "We could not load estimate metrics. You can retry now or keep working in the list.",
  retry: "Retry",
  awaiting: {
    label: "Awaiting response",
    description: "Sent and published estimates waiting for a recorded decision.",
  },
  openValue: {
    label: "Open value",
    description: "Draft, sent and published totals (archived excluded).",
  },
  accepted: {
    label: "Accepted this month",
    description: "Count and total accepted in the current month.",
    value: (count: number, total: string) => `${count.toLocaleString("en-US")} · ${total}`,
  },
  expiring: {
    label: "Expiring in 7 days",
    description: "Sent and published estimates with valid-until in the next 7 days.",
  },
} as const;

