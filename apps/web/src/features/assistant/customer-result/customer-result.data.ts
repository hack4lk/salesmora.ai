export const customerResultData = {
  failed:
    "This customer result or proposal changed or is no longer available. Prepare a fresh request.",
  empty: "No matching accessible records.",
  beforeConfirm: "Review the exact action before confirming.",
  exportScope: "Reviewed customer export",
  expired: "Proposal expired. Prepare another export.",
  count: (shown: number, total: number) =>
    `Showing ${shown} of ${total} accessible entries.`,
  details: "Customer details",
  downloadName: "customers.csv",
};
