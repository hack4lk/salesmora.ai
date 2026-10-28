import { estimateCapabilitiesByRole } from "../estimate-preview.data";
import { estimatePaperFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import { estimateSendFixture, estimateSendDialogData } from "../estimate-send-dialog/estimate-send-dialog.data";
import type { EstimateSendCardContext, EstimateSendProposal } from "./estimate-send-card.types";

export const estimateSendCardData = {
  title: "Send estimate",
  description: "Review the exact customer destination and final estimate. Only Confirm and send requests one email.",
  effects: "Confirming freezes this revision and queues one email. It does not record acceptance, create a job, collect payment or change the lead stage.",
  editorHint: "To change the estimate, recipient or subject, cancel this proposal and review the saved Draft in the editor. This card never saves edits implicitly.",
  unavailable: "This estimate proposal is unavailable in your permitted scope.",
  labels: {
    number: "Estimate", name: "Estimate name", recipientName: "Prepared for", recipientEmail: "Delivery email",
    subject: "Email subject", totalCents: "Estimate total", validUntil: "Valid until",
  },
  revision: (value: number) => `Revision ${value}`,
  empty: "Unavailable",
  preview: "Final customer preview",
  previewHint: "This is the customer-facing content bound to this proposal. Opening or collapsing the preview does not send it.",
  previewLoading: "Preparing the final customer preview...",
  previewBlocked: "The final customer preview is unavailable or no longer matches this proposal. Reload and review a new proposal.",
  confirm: "Confirm and send",
  cancel: "Cancel proposal",
  expires: "Proposal expires",
  working: "Requesting the operation...",
  requested: "Request received. Waiting for the host to return the outcome. This card has not marked any email as queued or delivered.",
  noHandler: "Sending and cancellation are not connected in this view.",
  failure: "The proposal operation failed. No send outcome was confirmed. Review the current status before retrying.",
  issuesLabel: "Before sending",
  errors: {
    metadata: "The proposal reference, content hash or 15-minute review window is invalid. Request a new proposal.",
    binding: "The proposal no longer matches the authorized estimate, destination, subject, snapshot or policy. Reload and review a new proposal.",
    unsaved: "Save your changes explicitly, then request a refreshed Send proposal. Sending never saves the Draft for you.",
  },
  states: {
    pending: "Ready for your review",
    confirmed: "The host reports this Send proposal was confirmed. Check delivery status for the email outcome.",
    cancelled: "The host reports this proposal was cancelled. It did not request an email.",
    expired: "Proposal expired. Request a new proposal.",
    superseded: "Replaced by a newer proposal. Review the latest one.",
    conflict: "The estimate or proposal changed. Reload and review a new proposal.",
    forbidden: "This proposal is no longer authorized.",
  },
  stories: {
    title: "Assistant Send proposal card",
    heading: "Review before sending",
    notice: "Fictional assistant presentation only. No estimate is saved or frozen and no email, AI call or customer link is created.",
    subject: estimateSendDialogData.stories.subject,
    invalidEmail: estimateSendDialogData.stories.invalidEmail,
    profileIssue: estimateSendDialogData.stories.profileIssue,
    itemIssue: estimateSendDialogData.stories.itemsIssue,
    failure: "Sample operation rejected. No email was sent by this preview.",
    longName: estimateSendDialogData.stories.longName,
    longRecipient: estimateSendDialogData.stories.longRecipient,
    longSubject: estimateSendDialogData.stories.longSubject,
    longWord: "MontgomeryWellingtonRestorationPartnership".repeat(8),
    literal: estimateSendDialogData.stories.literalSubject,
    job: "Job J-1038",
    revoke: "Remove sample read access",
    loseParent: "Remove sample parent access",
    loseSend: "Remove sample send permission",
    version: "Simulate a newer estimate version",
    policy: "Simulate policy or membership change",
    snapshot: "Replace the sample snapshot",
    replace: "Supply a new sample proposal",
    recipient: "Change sample delivery email",
    release: "Resolve the previous sample operation",
    hostConfirm: "Supply a confirmed host status",
    yes: "yes",
  },
} as const;

export function estimateSendProposalFixture(): EstimateSendProposal {
  const now = Date.now();
  return {
    id: "estimate-send-proposal-sample", actionType: "estimate.send", inputHash: "c".repeat(64),
    authorizationVersion: "sample-policy-1:membership-1", createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 900000).toISOString(), state: "pending",
    estimate: {
      ...estimateSendFixture, id: "estimate-2048", version: 3, totalCents: 96917,
      validUntil: estimatePaperFixture.validUntil,
    },
    subject: estimateSendCardData.stories.subject, snapshotHash: "d".repeat(64),
  };
}
export function estimateSendCardContextFixture(proposal: EstimateSendProposal): EstimateSendCardContext {
  return {
    proposalId: proposal.id, inputHash: proposal.inputHash, authorizationVersion: proposal.authorizationVersion,
    estimate: structuredClone(proposal.estimate), subject: proposal.subject, snapshotHash: proposal.snapshotHash,
    today: "2026-10-23", unsavedChanges: false, readiness: { state: "ready" }, preview: null,
  };
}
export const estimateSendCardCapabilitiesFixture = estimateCapabilitiesByRole.owner;
