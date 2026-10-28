import type { EstimateSummaryResult, EstimateSummaryRow } from "./estimate-summary-card.types";

export const estimateSummaryCardData = {
  title: "Estimate summary",
  description: "Read-only estimate results for the selected question. Record and list actions open authorized pages; CSV review hands off to the existing export dialog and never downloads by itself.",
  loading: "Loading estimate summary...",
  unavailable: "Estimate summary is unavailable. Your access may have changed.",
  missingResult: "Estimate summary data is unavailable. Request a refreshed result.",
  invalid: "Estimate summary data is invalid or stale. Request a refreshed result.",
  retry: "Try again",
  query: "Question",
  scope: "Scope",
  scopeValues: { workspace: "Workspace", assigned: "Assigned jobs only" },
  filters: "Applied filters",
  noFilters: "No additional filters",
  dateRange: "Date range",
  retrieved: "Retrieved",
  count: "Matching estimates",
  total: "Matching stored total",
  totalUnavailable: "Total unavailable",
  notProvided: "Not provided",
  customer: "Customer",
  status: "Status",
  revision: (value: number) => `Revision ${value}`,
  amount: "Stored amount",
  amountUnavailable: "Amount unavailable",
  related: "Related record",
  validUntil: "Valid until",
  noDate: "No valid-until date",
  openList: "Open matching list",
  listUnavailable: "Open-list navigation is unavailable in this view.",
  reviewExport: "Review CSV export",
  exportUnavailable: "CSV export review is unavailable in this view.",
  more: (shown: number, total: number) => `Showing ${shown.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} matching estimates.`,
  empty: "No estimates matched this query.",
  snapshot: "This summary is a point-in-time snapshot. Reload to refresh totals and matching rows.",
  stories: {
    title: "Assistant Estimate summary card",
    heading: "Read-only estimate answer preview",
    notice: "Fictional assistant presentation only. No filters, records or statuses are changed, and export review never downloads by itself.",
    requested: "Sample open request received. Navigation has not been performed by this story.",
    yes: "yes",
    longFilter: "Customer name contains Alexandria Montgomery-Wellington and Riverside Community Restoration Partnership",
    longName: "Whole-home kitchen, bathroom and exterior restoration estimate for the Montgomery-Wellington residence",
    longCustomer: "Alexandria Montgomery-Wellington and the Riverside Community Restoration Partnership",
    literal: "<script>not executable</script>\nRead-only note text remains literal.",
  },
  errors: {
    resultId: "The summary result reference is missing or invalid.",
    query: "The summary query label is missing.",
    scope: "The summary scope is invalid.",
    filters: "One or more summary filter labels are invalid.",
    range: "The summary date range is invalid.",
    timezone: "The workspace timezone is invalid. Retrieved time cannot be displayed.",
    retrievedAt: "The summary retrieval timestamp is invalid.",
    totalMatches: "The summary match count is invalid.",
    totalCents: "The summary total is invalid.",
    exportAvailability: "The export-review availability is invalid.",
    rows: "Summary rows are invalid, duplicated or inconsistent with the match count.",
  },
} as const;

const allRows: readonly EstimateSummaryRow[] = [
  {
    id: "estimate-2048", number: "EST-2048", revision: 1, name: "Kitchen remodel estimate", customerName: "Jordan Lee",
    status: "sent", archived: false, totalCents: 96917, parentType: "lead", parentId: "lead-1024", parentNumber: "L-1024", validUntil: "2026-10-29",
  },
  {
    id: "estimate-2047", number: "EST-2047", revision: 1, name: "HVAC tune-up estimate", customerName: "Morgan Lee",
    status: "published", archived: false, totalCents: 136094, parentType: "lead", parentId: "lead-2084", parentNumber: "L-2084", validUntil: "2026-10-28",
  },
  {
    id: "estimate-2046", number: "EST-2046", revision: 2, name: "Deck repair estimate", customerName: "Elena Ruiz",
    status: "sent", archived: false, totalCents: 215000, parentType: "job", parentId: "job-1044", parentNumber: "J-1044", validUntil: "2026-10-27",
  },
  {
    id: "estimate-2045", number: "EST-2045", revision: 1, name: "Bathroom remodel estimate", customerName: "Chris Wu",
    status: "draft", archived: false, totalCents: null, parentType: "lead", parentId: "lead-1001", parentNumber: "L-1001", validUntil: null,
  },
  {
    id: "estimate-2044", number: "EST-2044", revision: 1, name: "Water heater replacement estimate", customerName: "Priya Shah",
    status: "accepted", archived: false, totalCents: 329674, parentType: "job", parentId: "job-1040", parentNumber: "J-1040", validUntil: "2026-10-30",
  },
  {
    id: "estimate-2043", number: "EST-2043", revision: 1, name: "Gutter replacement estimate", customerName: "Noah Patel",
    status: "declined", archived: false, totalCents: 424613, parentType: "lead", parentId: "lead-1009", parentNumber: "L-1009", validUntil: "2026-10-25",
  },
  {
    id: "estimate-2042", number: "EST-2042", revision: 1, name: "Roof repair estimate", customerName: "Dana Cruz",
    status: "expired", archived: false, totalCents: 289000, parentType: "lead", parentId: "lead-1002", parentNumber: "L-1002", validUntil: "2026-10-22",
  },
  {
    id: "estimate-2041", number: "EST-2041", revision: 1, name: "Countertop install estimate", customerName: "Ivy Park",
    status: "superseded", archived: false, totalCents: 610000, parentType: "job", parentId: "job-1038", parentNumber: "J-1038", validUntil: "2026-10-20",
  },
  {
    id: "estimate-2040", number: "EST-2040", revision: 1, name: "Drain cleaning estimate", customerName: "Omar Haddad",
    status: "void", archived: false, totalCents: 42000, parentType: "job", parentId: "job-1021", parentNumber: "J-1021", validUntil: null,
  },
  {
    id: "estimate-2039", number: "EST-2039", revision: 1, name: "Lighting retrofit estimate", customerName: "Lena Ortiz",
    status: "accepted", archived: true, totalCents: 178000, parentType: "lead", parentId: "lead-0987", parentNumber: "L-0987", validUntil: "2026-10-18",
  },
  {
    id: "estimate-2038", number: "EST-2038", revision: 3, name: "Masonry repair estimate", customerName: "Kai Nakamura",
    status: "sent", archived: false, totalCents: 745000, parentType: "lead", parentId: "lead-3001", parentNumber: "L-3001", validUntil: "2026-10-31",
  },
  {
    id: "estimate-2037", number: "EST-2037", revision: 1, name: "Garage framing estimate", customerName: "Samir Ali",
    status: "published", archived: false, totalCents: 250000, parentType: "job", parentId: "job-3002", parentNumber: "J-3002", validUntil: "2026-11-01",
  },
];

export const estimateSummaryRowsFixture = allRows;
const expiringRows = allRows.slice(0, 3);
export const estimateSummaryResultFixture: EstimateSummaryResult = {
  id: "estimate-summary-expiring",
  queryLabel: "What expires this week?",
  scope: "workspace",
  filterLabels: ["Statuses: Sent, Published", "Valid until: 2026-10-23 to 2026-10-29", "Hidden records: Excluded"],
  dateRange: { from: "2026-10-23", to: "2026-10-29" },
  retrievedAt: "2026-10-23T17:54:00.000Z",
  timezone: "America/New_York",
  totalMatches: expiringRows.length,
  totalCents: expiringRows.reduce((sum, row) => sum + (row.totalCents ?? 0), 0),
  canReviewExport: false,
  rows: expiringRows,
};
