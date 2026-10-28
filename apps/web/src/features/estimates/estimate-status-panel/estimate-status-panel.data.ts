import type { EstimateStatusAction } from "../estimate-actions";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimateRowMenuData } from "../estimate-row-menu/estimate-row-menu.data";

export const estimateStatusPanelData = {
  title: "Estimate status",
  actionsLabel: "Estimate next steps",
  descriptions: {
    draft: "Not shared with the customer. Review the draft before sending or publishing.",
    sent: "Sent to the customer. Staff can record the customer's decision after hearing from them.",
    published: "Published with a shareable link, without an email. Staff can record the customer's decision.",
    accepted: "The customer's acceptance has been recorded. This estimate is locked; no job was created automatically.",
    declined: "The customer's decline has been recorded. Create a revision to prepare a new proposal.",
    expired: "This estimate has expired. Create a revision to update its validity date; the existing date cannot be extended here.",
    superseded: "This revision was replaced by a newer estimate. It remains read-only for reference.",
    void: "This estimate was withdrawn. Its customer link is no longer available.",
  } satisfies Record<EstimateStatus, string>,
  actions: {
    send: "Review and send",
    publish: "Review and publish",
    "mark-accepted": "Mark accepted",
    "mark-declined": "Mark declined",
    revise: estimateRowMenuData.actions.revise,
    "correct-decision": "Correct decision",
    convert: "Review conversion to job",
  } satisfies Record<EstimateStatusAction, string>,
  reviewHint: "Each action opens a review step. Nothing changes until you confirm there.",
  decisionHint: "Recording a decision does not notify the customer or create a job.",
  correctionHint: "Correcting a decision requires a reason. Both entries remain in history.",
  conversionHint: "Conversion needs job-creation permission and customer access. Review the job details before confirming.",
  parentJobHint: "This estimate already belongs to a job. Open that job instead of creating another.",
  openParentJob: (number: string) => `Open linked job ${number}`,
  archived: "Archived: hidden from default lists. Restore from the estimate actions menu before taking a next step.",
  converted: "Job created from this estimate",
  convertedHint: "This estimate has already been converted. Another job cannot be created from it.",
  noActions: "No next-step actions are available with your current permissions and this estimate's status.",
  noHandler: "Next-step actions are not connected in this view.",
  unavailable: "This estimate is unavailable. Your access may have changed.",
  stories: {
    notice: "Component preview: fictional status and permissions. Actions request a review flow only; nothing is saved, sent, decided or created.",
    requested: (label: string) => `Review requested: ${label}. No status changed and nothing was committed.`,
    error: "The estimate changed before the review could open. Refresh the record before trying again.",
    job: { number: "J-1208", href: "/jobs/job-1208" },
    longJobNumber: "J-1208-MONTGOMERY-WELLINGTON-RESTORATION-PARTNERSHIP-COORDINATION",
    revoke: "Remove sample access",
  },
} as const;
