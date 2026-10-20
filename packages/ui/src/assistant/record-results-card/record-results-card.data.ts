export const recordResultsCardData = {
  titles: { customers: "Customer results", leads: "Lead results" },
  open: { customers: "Open Customers list", leads: "Open Leads list" },
  empty: "No matching records.",
  count: (shown: number, total: number) =>
    `Showing ${shown} of ${total.toLocaleString("en-US")} results`,
};
