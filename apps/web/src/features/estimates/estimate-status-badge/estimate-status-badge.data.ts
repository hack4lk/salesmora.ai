import type { StatusBadgeTone } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";

export const estimateStatusBadgeData = {
  archived: "Archived",
  /** Expired, Superseded and Void share the neutral tone; the label tells them apart. */
  statuses: {
    draft: { label: "Draft", tone: "neutral" },
    sent: { label: "Sent · awaiting response", tone: "warning" },
    published: { label: "Published · not sent", tone: "info" },
    accepted: { label: "Accepted", tone: "success" },
    declined: { label: "Declined", tone: "error" },
    expired: { label: "Expired", tone: "neutral" },
    superseded: { label: "Superseded", tone: "neutral" },
    void: { label: "Void", tone: "neutral" },
  } satisfies Record<EstimateStatus, { label: string; tone: StatusBadgeTone }>,
  stories: {
    title: "Estimate statuses",
    description:
      "Estimates move from Draft to Sent or Published, then Accepted, Declined or Expired. A revision supersedes the earlier one; a worker can void it. Archived is a separate flag.",
    estimate: "EST-2047 · HVAC tune-up estimate",
    customer: "Morgan Lee",
    label: "Current status",
    next: "Valid until Nov 18",
  },
} as const;
