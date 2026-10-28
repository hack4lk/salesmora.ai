import type { RelatedEstimate } from "./related-estimates-card";

export const relatedEstimatesCardData = {
  title: "Estimates",
  description: {
    lead: "Estimates linked to this lead.",
    job: "Estimates linked to this job. Job status does not change historical estimates.",
    customer: "Estimates linked through this customer's leads and jobs.",
  },
  create: "Create estimate",
  includeHidden: "Include archived and older revisions",
  createHint: {
    lead: "Start an estimate for this lead. A Draft is created only when you save.",
    job: "Start an estimate for this job. A Draft is created only when you save.",
    customer: "Choose a related lead or job before starting an estimate. An estimate cannot belong only to a customer.",
  },
  createUnavailable: "Creating estimates is not connected in this view.",
  open: "Open estimate",
  openLabel: (number: string, revision: number) => `Open estimate ${number}, revision ${revision}`,
  identity: (number: string, revision: number) => `${number} · Revision ${revision}`,
  parent: (type: "lead" | "job", number: string) => `${type === "lead" ? "Lead" : "Job"} · ${number}`,
  total: "Estimate total",
  totalUnavailable: "Total unavailable",
  empty: "No estimates to show in your permitted scope.",
  loaded: (loaded: number, total: number) => `Showing ${loaded} of ${total} estimates in your permitted scope.`,
  more: "Load more estimates",
  moreUnavailable: "More estimates are available, but loading them is not connected in this view.",
  cannotOpen: "You cannot open this estimate from this view.",
  loading: "Loading related estimates...",
  error: "Related estimates could not be loaded. Try again.",
  retry: "Retry estimates",
  unavailable: "Related estimates are unavailable. Your access may have changed.",
  stories: {
    notice: "Related estimates preview: fictional authorized data. No estimate, lead, customer or job is created or changed.",
    revoke: "Simulate access loss",
    chosen: "Sample parent requested. No Draft was created.",
    customerChosen: "Sample related lead or job selection requested. No Draft was created.",
    failure: "Sample estimates request failed.",
    longName: "Whole-home kitchen, bathroom and exterior restoration estimate for the Montgomery-Wellington residence",
    literal: "<script>not executable</script>",
  },
} as const;

export const relatedEstimateFixtures: RelatedEstimate[] = [
  {
    id: "related-draft", number: "EST-2048", revision: 2, name: "Kitchen remodel estimate",
    status: "draft", archived: false, totalCents: 865556,
    href: "/estimates/related-draft?workspace=sample-workspace",
  },
  {
    id: "related-published", number: "EST-2047", revision: 1, name: "Kitchen plumbing estimate",
    status: "published", archived: false, totalCents: 136094,
    href: "/estimates/related-published?workspace=sample-workspace",
  },
  {
    id: "related-accepted", number: "EST-2046", revision: 1, name: "Electrical installation estimate",
    status: "accepted", archived: false, totalCents: 329674,
    href: "/estimates/related-accepted?workspace=sample-workspace",
  },
];
