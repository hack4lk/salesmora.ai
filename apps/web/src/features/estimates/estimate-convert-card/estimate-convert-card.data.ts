import { estimateConvertDialogData, estimateConversionFixture } from "../estimate-convert-dialog/estimate-convert-dialog.data";
import type { EstimateConvertCardContext, EstimateConvertProposal } from "./estimate-convert-card.types";

export const estimateConvertCardData = {
  title: "Prepare job from accepted estimate",
  description: "Review the source estimate and copied work details, then open the job form. This card does not create a job.",
  source: "Accepted estimate",
  number: "Estimate",
  revision: estimateConvertDialogData.revision,
  amount: estimateConvertDialogData.amount,
  amountHint: estimateConvertDialogData.amountHint,
  lead: "Source lead",
  parentJob: "Parent job",
  customer: "Customer",
  work: "Job details to review",
  fields: { title: "Job title", service: "Service type", location: "Work location", description: "Work scope" },
  defaults: "The new job starts unassigned and unscheduled. Choose any owner, team and dates in the job form; none are guessed from the estimate.",
  effects: "Opening the review creates nothing. Only the job form's separate confirmation can request one job linked to this estimate and source lead. The estimate stays Accepted; no lead stage change, work order, customer email or payment is requested.",
  customerHint: estimateConvertDialogData.customerBoundary,
  longScope: "The copied scope exceeds the job description's 4,000-character limit. Open the job form and edit it before confirming; nothing is truncated or changed on the estimate.",
  review: "Review job details",
  cancel: "Cancel proposal",
  missing: "Not provided",
  unavailable: "This estimate proposal is unavailable in your permitted scope.",
  issuesLabel: "Before reviewing the job",
  expires: "Proposal expires",
  working: "Requesting the operation...",
  requested: "Request received. Waiting for the host to open the review or return the outcome. No job creation or cancellation has been confirmed.",
  noHandler: "Job review and proposal cancellation are not connected in this view.",
  failure: "The proposal operation failed. No job was created by this card. Review the current status before retrying.",
  states: {
    pending: "Ready for your review",
    confirmed: "The host reports this proposal opened the job review. This does not mean a job was created.",
    cancelled: "The host reports this proposal was cancelled. No job creation was requested by this card.",
    expired: "Proposal expired. Request a new proposal.",
    superseded: "Replaced by a newer proposal. Review the latest one.",
    conflict: "The estimate or customer changed. Reload and review a new proposal.",
    forbidden: "This proposal is no longer authorized.",
  },
  errors: {
    metadata: "The proposal reference, content hash or 15-minute review window is invalid. Request a new proposal.",
    binding: "The proposal no longer matches the authorized estimate, customer, snapshot or policy. Reload and review a new proposal.",
  },
  stories: {
    title: "Assistant Convert proposal card",
    heading: "Review before preparing a job",
    notice: "Fictional assistant presentation only. This card opens a sample review; no customer, job, link, work order or history entry is created.",
    failure: "Sample job review could not be opened. Nothing was created.",
    jobRequested: "Sample job creation requested from the separate form. The host has not confirmed creation.",
    yes: "yes",
    longName: estimateConvertDialogData.stories.longTitle,
    longCustomer: estimateConvertDialogData.stories.longCustomer,
    literal: estimateConvertDialogData.stories.literal,
    longScope: "Review cabinet installation, access and restoration details with the customer. ".repeat(65),
    longWord: "MontgomeryWellingtonRestorationPartnership".repeat(12),
    changes: {
      read: "Remove sample read access", parent: "Remove sample parent access", grant: "Remove sample job creation permission",
      customer: "Remove sample customer access", version: "Supply a newer estimate version",
      policy: "Simulate policy or membership change", snapshot: "Replace the sample frozen snapshot",
      work: "Change the sample work scope", proposal: "Supply a new sample proposal",
    },
    release: "Resolve the previous sample operation",
    toggleDisabled: "Toggle sample disabled state",
    hostConfirm: "Supply a review-opened host status",
    customer: estimateConvertDialogData.stories.customer,
    members: [
      { id: "sam", name: estimateConvertDialogData.stories.member, role: "owner" as const },
      { id: "taylor", name: estimateConvertDialogData.stories.secondMember, role: "office" as const },
    ],
    existingJob: { id: "22222222-2222-4222-8222-222222222222", number: "J-1208", canOpen: true },
  },
} as const;

export function estimateConvertProposalFixture(): EstimateConvertProposal {
  const now = Date.now();
  return {
    id: "estimate-convert-proposal-sample", actionType: "estimate.convert",
    inputHash: "e".repeat(64), authorizationVersion: "sample-policy-1:membership-1",
    createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(), state: "pending",
    estimate: { ...structuredClone(estimateConversionFixture), id: "estimate-2048", snapshotHash: "d".repeat(64), totalCents: 96917 },
    customer: { state: "ready", id: estimateConversionFixture.customerId!, name: estimateConvertCardData.stories.customer },
  };
}
export function estimateConvertCardContextFixture(proposal: EstimateConvertProposal): EstimateConvertCardContext {
  return {
    proposalId: proposal.id, inputHash: proposal.inputHash, authorizationVersion: proposal.authorizationVersion,
    estimate: structuredClone(proposal.estimate), customer: structuredClone(proposal.customer),
  };
}
