import type { EstimateRevisionSummary } from "./estimate-revisions-panel.preview";

export const estimateRevisionsPanelData = {
  title: "Revision history",
  description: "Newest first. Only revisions you can access are shown.",
  revision: (revision: number) => `Revision ${revision}`,
  viewing: "Viewing",
  total: "Total",
  totalUnavailable: "Total unavailable",
  open: "Open",
  openLabel: (number: string, revision: number) => `Open ${number} revision ${revision}`,
  cannotOpen: "Opening this revision is unavailable.",
  pending: "Pending revision",
  pendingHint: "Preparing a revision does not replace the shared estimate. The previous version is replaced only when you send or publish the new revision.",
  empty: "No revisions are available to display.",
  single: "No other revisions to show.",
  loading: "Loading revisions…",
  unavailable: "Revision history is unavailable. Your access may have changed.",
  retry: "Retry revisions",
  loadError: "Revision history could not be loaded. Try again.",
  changed: "This estimate changed. Reload its details before revising.",
  older: "Load older revisions",
  loaded: (count: number, total: number) => `${count} of ${total} accessible revisions shown`,
  moreUnavailable: "More revisions are available. Reload the estimate to try again.",
  stories: {
    notice: "Component preview: fictional, authorized revisions. Links are navigation examples; no estimate is changed or shared.",
    number: "EST-2048",
    error: "Revision history could not be loaded. Try again.",
    revoke: "Remove sample access",
    longNumber: `EST-${"2048".repeat(20)}`,
  },
} as const;

export const estimateRevisionFixtures: EstimateRevisionSummary[] = [
  { id: "revision-3", revision: 3, status: "draft", archived: false, totalCents: 104793, href: "/estimates/revision-3?workspace=workspace-demo" },
  { id: "revision-2", revision: 2, status: "published", archived: false, totalCents: 94793, href: "/estimates/revision-2?workspace=workspace-demo" },
  { id: "revision-1", revision: 1, status: "superseded", archived: false, totalCents: 84260, href: "/estimates/revision-1?workspace=workspace-demo" },
];
