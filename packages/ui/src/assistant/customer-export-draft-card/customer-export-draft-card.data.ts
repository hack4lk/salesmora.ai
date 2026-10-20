export const customerExportDraftCardData = {
  title: "Review customer export",
  count: (n: number) => `${n.toLocaleString("en-US")} customers`,
  download: "Download CSV",
  busy: "Preparing download…",
  error: "The download could not be prepared. Try again.",
  limit: "Narrow your filters to 50,000 customers or fewer.",
  hint: "Exports require current authorization. This preview does not download workspace data.",
  states: {
    pending: "Ready for review",
    forbidden: "You do not have permission to export customers.",
    expired: "Export review expired. Request a new preview.",
    confirmed: "Download requested",
  },
};
