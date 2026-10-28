import type { EstimateStatus } from "../estimate-preview.types";

export const estimatesToolbarData = {
  title: "Filter estimates",
  search: "Search estimates",
  placeholder: "Estimate, customer or record",
  status: "Status",
  owner: "Owner",
  related: "Related record",
  allOwners: "All owners",
  me: "Me",
  unassigned: "Unassigned",
  countUnavailable: "Estimate count unavailable.",
  includeHidden: "Include archived and superseded",
  allStatuses: "All statuses",
  allRelated: "Lead and job",
  relatedOptions: {
    all: "Lead and job",
    lead: "Lead only",
    job: "Job only",
  },
  statusFilter: (label: string) => `Status: ${label}`,
  searchFilter: (value: string) => `Search: ${value}`,
  ownerFilter: (value: string) => `Owner: ${value}`,
  relatedFilter: (value: string) => `Related: ${value}`,
  count: (shown: number, total: number) =>
    `${shown.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} estimates`,
  statuses: {
    draft: "Draft",
    sent: "Sent · awaiting response",
    published: "Published · not sent",
    accepted: "Accepted",
    declined: "Declined",
    expired: "Expired",
    superseded: "Superseded",
    void: "Void",
  } satisfies Record<EstimateStatus, string>,
} as const;
